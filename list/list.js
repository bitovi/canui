steal('can/control', 'can/control/plugin', 'can/view', 'can/observe').then(function() {
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
			this._update(this.options.list);
		},

		/**
		 * Updates the data list and sets this.options.data. Converts Arrays
		 * and waits for can.Deferreds.
		 *
		 * @param {can.Deferred|can.Observe.List|Array} data The data to set
		 * @private
		 */
		_update : function(data) {
			data = data || [];
			if(can.isDeferred(data)) {
				this.element.html(this.options.loading);
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

		_rows : function(observes) {
			observes = can.makeArray(observes);
			var rows = $.map(observes, can.proxy(function(observe) {
				return can.view(this.options.view, observe);
			}, this));
			return can.$(rows);
		},

		_render : function(rows) {
			if(!rows || rows.length === 0) {
				this.element.html(this.options.empty);
			} else {
				this.element.html(rows);
			}
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
			this.element.append(this._rows(observes));
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

			var element = this.element,
				elements = [],
				observes = can.isArray(arg) ? arg : can.makeArray(arguments);

			can.each(observes, can.proxy(function(current) {
				var row = element.find('[' + this.options.attribute + '="' + current[this.options.cid] + '"]')[0];
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
		items : function(rows) {
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

			return rows.length == 1 ? result.pop() : result;
		}
	});
});
