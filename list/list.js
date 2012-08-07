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

		/**
		 * Updates the options and re-renders the list.
		 *
		 * @param {Object} [options] The options to udpate
		 */
		update : function(options) {
			can.Control.prototype.update.call(this, options);
			var list = this.options.list;
			if(list && list.isComputed) {
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
				this.element.html(this._fnOption('loadingContent'));
				data.done(can.proxy(this._update, this));
			} else {
				this._cidMap = {};
				this.options.data = data instanceof can.Observe.List ? data : new can.Observe.List(data);
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
			var self = this;
			observes = can.makeArray(observes);
			return can.$.map(observes, can.proxy(function(observe) {
				// Update the mapping from can.Observe unique id to Observe instance
				self._cidMap[observe[self.options.cid]] = observe;
				var view = can.isFunction(this.options.view) ?
						this.options.view.call(this, observe) :
						can.view(this.options.view, observe);
				return self._wrapWithTag(view, observe);
			}, this));
		},

		_wrapWithTag : function(content, observe) {
			if(!this.options.tag) {
				return content;
			}
			var tag = can.$(this.options.tag.indexOf(0) == '<' ? this.options.tag : '<' + this.options.tag + '>');
			if(observe) {
				tag.attr(this.options.attribute, observe[this.options.cid]);
			}
			if(content) {
				tag.append(content);
			}
			// We need to return the raw DOM element
			return tag[0];
		},

		/**
		 * Renders the row element list. If the rows are empty or there
		 * are no rows, the content set in the `empty` option will be rendered.
		 *
		 * @param rows
		 * @private
		 */
		_render : function(rows) {
			var content = !rows || rows.length === 0 ? this._fnOption('emptyContent') : rows;
			this.element.html(content);
			this.element.trigger('rendered', this);
		},

		_fnOption : function(name, args) {
			var val = this.options[name];
			return this._wrapWithTag(can.isFunction(val) ? val.apply(this, args || []) : val);
		},

		'{list} change' : function(target, ev, newVal) {
			if(target.isComputed) {
				this._update(newVal);
			}
		},

		'{data} length' : function(list, ev, length) {
			if(length === 0) {
				this._render();
			}
		},

		'{data} remove' : function(list, ev, observes) {
			if(list.length) { // We can't get rowElements from an empty list
				var self = this;
				// Remove the CID mapping
				can.each(observes, function(observe) {
					delete self._cidMap[observe[self.options.cid]];
				});
				this.rowElements(observes).remove();
				this.element.trigger('changed', this);
			}
		},

		'{data} add' : function(list, ev, observes) {
			var rowElements = this.rowElements(),
				newRows = this._rows(observes);
			if(rowElements.length) {
				// We either append after the last data row
				rowElements.last().after(newRows);
			} else {
				// Or set it as the content
				this.element.html(newRows);
			}
			this.element.trigger('changed', this);
		},

		/**
		 * Returns all rows or all rows representing the given list of observables.
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
		 * Returns a `can.Observe.List` containing all observes (equivalent to `.list()`)
		 * or all observes representing the given rows.
		 *
		 * @param {jQuery} rows The collection of row elements
		 * @return {can.Observe.List}
		 */
		items : function(rows)
		{
			if(!rows) {
				return this.list();
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
		},

		/**
		 * Returns a `can.Observe.List` of the current list data.
		 *
		 * @param {can.Observe.List|Array|can.compute|can.Deferred} newlist The list to replace
		 * @return {can.Observe.List|can.Observe}
		 */
		list : function(newlist) {
			if(!newlist) {
				return this.options.data || new can.Observe.List();
			}
			this.update({
				list : newlist
			});
		}
	});
});
