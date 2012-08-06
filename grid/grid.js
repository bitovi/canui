steal('jquery', 'can/control', 'canui/list', 'can/view/ejs', 'canui/table_scroll', function($) {
	var appendIf = function(el, tag) {
		if(el.is(tag) || !tag) {
			return el;
		}
		var res = el.find(tag);
		if(res && res.length) {
			return res;
		}
		return el.append(can.$('<' + tag + '>')).find(tag);
	};

	can.view.ejs('canui_grid_header', '<tr>' +
		'<% can.each(this, function(col) { %>' +
			'<th <%= (el) -> can.data(el, \'column\', col) %>>' +
			'<%= col.attr(\'header\') %>' +
			'</th>' +
		'<% }) %>' +
	'</tr>');

	can.view.ejs('canui_grid_row', '<tr data-cid="<%= cid %>">' +
		'<% can.each(this, function(current) { %>' +
		'<% if(current.isComputed) { %>' +
			'<td><%== current() %></td>' +
			'<% } else { %>' +
			'<td <%= (el) -> can.append(el, current) %>></td>' +
			'<% } %>' +
		'<% }); %>' +
	'</tr>');

	can.Control('can.ui.Grid', {
		pluginName : 'grid',
		defaults : {
			view : function(observe) {
				var row = [], self = this;
				can.each(this.options.columns, function(col) {
					var content = can.isFunction(col.content) ?
						col.content.call(self, observe, col) :
						can.compute(function() {
							return observe.attr(col.content);
						});
					row.push(content);
				});
				row.cid = observe._cid;
				return can.view('canui_grid_row', row);
			},
			headerContent : 'canui_grid_header',
			emptyContent : function() {
				return 'No data';
			},
			loadingContent : function() {
				return 'Loading...';
			},
			scrollable : false
		}
	}, {
		setup : function(el, ops) {
			var table = appendIf(can.$(el), 'table');
			this.el = {
				header : appendIf(table, 'thead'),
				body : appendIf(table, 'tbody'),
				footer : appendIf(table, 'tfoot')
			}
			if(!(ops.columns instanceof can.Observe.List)) {
				ops.columns = new can.Observe.List(ops.columns);
			}
			can.Control.prototype.setup.call(this, table, ops);
			return [table, ops];
		},

		init : function(el, ops) {
			this.el.header.append(this._fnView('headerContent', this.options.columns));
			this.update();
		},

		update : function(options) {
			can.Control.prototype.update.apply(this, arguments);
			this.el.body.list(this.options);
			this.control = {
				list : this.el.body.control(can.ui.List)
			}
		},

		columns : function(cols) {
			if(!cols) {
				return this.options.columns;
			}
			this.update({ columns : cols });
		},

		_fnView : function(name, args) {
			var val = this.options[name],
				current = can.isFunction(val) ? val.call(this, args) : can.view(val, args);
			if(!can.$(current).is('tr')) {
				current = can.$('<tr><td colspan="' + this.options.columns.length
					+ '"></td></tr>').find('td').html(current).end();
			}
			return current;
		},

		'{columns} change' : function() {
			if(this.options.scrollable) {
				this.element.tableScroll();
			}
		},

		' rendered' : function() {
			if(this.options.scrollable) {
				this.element.tableScroll();
				this.control.tableScroll = this.element.control(can.ui.TableScroll);
			}
		},

		' changed' : function() {
			// Trigger resize to adjust the TableScroll
			if(this.options.scrollable) {
				this.element.trigger('resize');
			}
		},

		items : function() {
			return this.control.list.items.apply(this.control.list, arguments);
		},

		list : function() {
			return this.control.list.list.apply(this.control.list, arguments);
		},

		rowElements : function() {
			return this.control.list.rowElements.apply(this.control.list, arguments);
		},

		tableScroll : function() {
			return this.control.tableScroll;
		}
	});
});