steal('jquery', 'can/control', 'can/control/plugin', 'can/view', 'can/observe',
function($) {
	can.Control('can.ui.List', {
		pluginName : 'list',
		defaults : {
			attribute : 'data-cid',
			cid : '_cid'
		}
	}, {
		init : function() {
			this._cidMap = {};
			this.update();
		},

		update : function(options) {
			can.Control.prototype.update.call(this, options);
			var list = this.options.list;
			if(list && list.isComputed) {
				// TODO doesn't trigger
				this.on(list, 'change', can.proxy(function(ev, newVal) {
					this._update(newVal);
				}, this));
				list = list();
			}
			this._update(list);
		},

		/**
		 * Updates the data list and sets this.options.data. Converts Arrays
		 * and waits for Deferreds.
		 *
		 * @param {can.Deferred|can.Observe.List|Array} data The data to set
		 * @private
		 */
		_update : function(data) {
			data = data || [];
			if(can.isDeferred(data)) {
				this.element.html(this.loadingContent());
				data.done(can.proxy(this._update, this));
			} else {
				var cidMap = {};
				this.options.data = data instanceof can.Observe.List ? data : new can.Observe.List(data);
				// Update the mapping from can.Observe unique id to Observe instance
				this.options.data.forEach(function(observe) {
					cidMap[observe._cid] = observe;
				});
				this._cidMap = cidMap;
				this.on();
				this._render(this._rows(this.options.data));
			}
		},

		/**
		 * Returns a can.$ wrapped list of rendered rows for the given observes.
		 *
		 * @param {Array|can.Observe.List} observes The observables to render
		 * @return {can.$} A can.$ wrapped list of rendered rows
		 * @private
		 */
		_rows : function(observes) {
			observes = can.makeArray(observes);
			var rows = $.map(observes, can.proxy(function(observe) {
				if(can.isFunction(this.options.view)) {
					return this.options.view.call(this, observe);
				}
				return can.view(this.options.view, observe);
			}, this));
			return can.$(rows);
		},

		/**
		 * Renders the row element list. If the rows are empty or there
		 * are no rows, the content set in the `empty` option will be rendered.
		 *
		 * @param rows
		 * @private
		 */
		_render : function(rows) {
			var content = !rows || rows.length === 0 ? this.emptyContent() : rows;
			this.element.html(content);
		},

		_fnOption : function(name, args) {
			var val = this.options[name];
			return can.isFunction(val) ? val.apply(this, args || []) : val;
		},

		emptyContent : function() {
			return this._fnOption('emptyContent');
		},

		loadingContent : function() {
			return this._fnOption('loadingContent');
		},

		'{data} length' : function(list, ev, length) {
			if(length === 0) {
				this._render();
			}
		},

		'{data} remove' : function(list, ev, observes) {
			if(list.length) { // We can't get rowElements from an empty list
				this.rowElements(observes).remove();
			}
		},

		'{data} add' : function(list, ev, observes) {
			var rowElements = this.rowElements(),
				newRows = this._rows(observes);
			if(rowElements.length) {
				// We either append after the last data row
				rowElements.last().after(newRows);
			} else {
				// Or prepend it to the element
				this.element.prepend(newRows);
			}
		},

		/**
		 * Returns all rows for a list of observables.
		 *
		 * @param arg
		 * @return {*}
		 */
		rowElements : function(arg) {
			if(!arg) {
				return this.element.find('[' + this.options.attribute + ']');
			}

			var elements = [],
				observes = can.isArray(arg) ? arg : can.makeArray(arguments);

			can.each(observes, can.proxy(function(current) {
				var row = this.element.find('[' + this.options.attribute + '="' + current[this.options.cid] + '"]')[0];
				elements.push(row || null);
			}, this));

			return can.$(elements);
		},

		/**
		 * Returns all
		 *
		 * @param {Collection} rows An array or DOM element collection
		 * @return {can.Observe.List|can.Observe}
		 */
		list : function(rows) {
			if(!rows) {
				return this.options.list || new can.Observe.List();
			}

			var result = new can.Observe.List(),
				map = this._cidMap;

			can.each(can.makeArray(rows), function(row) {
				row = row[0] || row;
				// Either use getAttribute or the name itself as the index
				// that way you can pass a list of ids as well
				var id = row.getAttribute('data-cid');
				if(map[id]) {
					result.push(map[id]);
				}
			});

			return result;
		}
	});
});
