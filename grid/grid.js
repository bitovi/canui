steal('jquery', 'can/control', 'canui/list', 'can/view/ejs', 'canui/table_scroll', function($) {
	var appendIf = function(el, tag) {
		if(el.is(tag) || !tag) {
			return el;
		}
		var res = el.find(tag);
		if(res.length) {
			return res;
		}
		return el.append(can.$('<' + tag + '>')).find(tag);
	};

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
				return can.view('//canui/grid/views/row.ejs', row);
			},
			headerContent : '//canui/grid/views/head.ejs',
			emptyContent : 'No data',
			loadingContent : 'Loading...',
			scrollable : false
		}
	}, {
		setup : function(el, ops) {
			var table = appendIf(can.$(el), 'table'),
				options = can.extend({}, ops),
				self = this;
			this.el = {
				header : appendIf(table, 'thead'),
				body : appendIf(table, 'tbody'),
				footer : appendIf(table, 'tfoot')
			}
			can.each(['emptyContent', 'loadingContent', 'footerContent'], function(name) {
				var current = options[name] || self.constructor.defaults[name];
				if(can.isFunction(current)) {
					current = current.call(this, options);
				}
				if(!can.$(current).is('tr')) {
					current = '<tr><td colspan="' + ops.columns.length
						+ '">' + current + '</td></tr>';
				}
				options[name] = current;
			});
			if(!(options.columns instanceof can.Observe.List)) {
				options.columns = new can.Observe.List(options.columns);
			}
			can.Control.prototype.setup.call(this, table, options);
			return [table, options];
		},

		init : function(el, ops) {
			var header = can.isFunction(this.options.headerContent) ?
					this.options.headerContent.call(this, this.options.columms) :
					can.view(this.options.headerContent, this.options.columns);
			this.el.header.append(header);
			this.control = {
				list : this.el.body.control(can.ui.List)
			}
			this.update();
		},

		update : function(options) {
			can.Control.prototype.update.apply(this, arguments);
			this.el.body.list(this.options);
		},

		columns : function(cols) {
			if(!cols) {
				return this.options.columns;
			}
			this.update({ columns : cols });
		},

		_fnView : function(name, arg) {
			var val = this.options[name];
			if(can.isFunction(val)) {
				return val.call(this, arg);
			}
			return can.view(val, arg);
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