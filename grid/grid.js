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

	// The header default EJS view
	can.view.ejs('canui_grid_header', '<tr>' +
		'<% can.each(this, function(col) { %>' +
			'<th <%= (el) -> can.data(el, \'column\', col) %>>' +
			'<%= col.attr(\'header\') %>' +
			'</th>' +
		'<% }) %>' +
	'</tr>');

	// The default row view
	can.view.ejs('canui_grid_row', '<% can.each(this, function(current) { %>' +
		'<td><%== current() %></td>' +
	'<% }); %>');

	can.Control('can.ui.Grid', {
		pluginName : 'grid',
		defaults : {
			view : function(observe) {
				var row = [], self = this;
				can.each(this.options.columns, function(col) {
					var content = can.isFunction(col.content) ?
						can.compute(function() {
							return col.content.call(self, observe, col);
						}) :
						can.compute(function() {
							return observe.attr(col.content);
						});
					row.push(content);
				});
				return this._rowView('row', false, row);
			},
			row : 'canui_grid_row',
			header : 'canui_grid_header',
			empty : function() {
				return 'No data';
			},
			loading : function() {
				return 'Loading...';
			},
			scrollable : false,
			tag : 'tr'
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
			this.el.header.append(this._rowView('header', false, this.options.columns));
			if(this.options.footer) {
				this.el.header.append(this._rowView('footer', false));
			}
			this.control = {};
			this.update();
		},

		_rowView : function(name, wrap, param) {
			var self = this;
			return function() {
				var current = self.options[name];
				if(!current) {
					return '';
				}

				current =  can.isFunction(current) ?
					current.call(this, param) :
					can.view(current, param);

				// TODO maybe make an option
				if(wrap && !can.$(current).is('td')) {
					current = can.$('<td colspan="' + self.options.columns.length
						+ '"></td>').html(current);
				}

				return current;
			}
		},

		update : function(options) {
			can.Control.prototype.update.apply(this, arguments);
			var self = this;
			this.el.body.list({
				loading : this._rowView('loading', true),
				empty : this._rowView('empty', true),
				view : can.proxy(self.options.view, this),
				tag : this.options.tag,
				list : this.options.list
			});

			this.control.list = this.el.body.control(can.ui.List)
		},

		columns : function(cols) {
			if(!cols) {
				return this.options.columns;
			}
			this.update({ columns : cols });
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