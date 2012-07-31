steal('jquery', 'canui/list', 'can/view/ejs', 'canui/table_scroll', function($) {
	var proto = can.ui.List.prototype;
	can.ui.List('can.ui.Grid', {
		pluginName : 'grid',
		defaults : {
			view : function(observe) {
				// TODO this isn't nice yet
				var row = [], self = this;
				can.each(this.options.columns, function(col) {
					row.push(can.isFunction(col.content) ?
						col.content.call(self, observe, col) :
						can.compute(function() {
							return observe.attr(col.content);
						}));
				});
				return can.view('//canui/grid/views/row.ejs', { row : row, cid : observe._cid });
			},
			header : '//canui/grid/views/head.ejs',
			emptyContent : function() {
				return '<tr><td colspan="'
					+ this.options.columns.length
					+ '" class="empty">No data</td></tr>'
			},
			loadingContent : function() {
				return '<tr><td colspan="'
					+ this.options.columns.length
					+ '" class="loading">Loading...</td></tr>'
			},
			scrollable : false
		}
	}, {
		setup : function(el, ops) {
			proto.setup.apply(this, arguments);
			this.$ = {
				table : this.element
			};
			this.element = can.$('<tbody>').appendTo(this.$.table);
			this.$.body = this.element;
			return [this.element, ops];
		},

		init : function(el, ops) {
			this.$.table.prepend(can.view(this.options.header, this.options.columns));
			this.$.header = this.$.table.find('thead');
			proto.init.apply(this, arguments);
		},

		' rendered' : function() {
			if(this.options.scrollable) {
				this.$.table.tableScroll();
			}
		},

		elements : function() {
			return this.$;
		},

		tableScroll : function() {
			var control = this.$.table.control(can.ui.TableScroll);
			if(!this.options.scrollable || !control) {
				return null;
			}
			this.$.tableScroll = control.elements();
			return control;
		},

		destroy : function() {
			delete this.$;
			proto.destroy.apply(this, arguments);
		}
	});
});