steal('can/control', 'can/view/ejs', 'can/observe').then(
'//canui/grid/views/init.ejs', '//canui/grid/views/row.ejs',
'//canui/grid/views/single.ejs', '//canui/grid/views/head.ejs',
function() {
	// A list of properties that should be turned into can.computes and be directly accessible
	var computes = [ 'columns', 'list', 'emptyText', 'loadingText' ];

	can.Control('can.ui.Grid', {
		defaults : {
			select : {
				heading : 'thead',
				body : 'tbody',
				header : 'th',
				row : 'tbody tr[data-cid]',
				column : 'td'
			},
			view : {
				init : '//canui/grid/views/init.ejs',
				row : '//canui/grid/views/row.ejs',
				single : '//canui/grid/views/single.ejs',
				head : '//canui/grid/views/head.ejs'
			},
			emptyText : 'No data',
			loadingText : 'Loading...'
		}
	}, {
		setup : function(el, ops) {
			var options = can.extend({}, ops),
				defaults = this.constructor.defaults;
			// Convert computed properties (if they aren't a can.compute already)
			can.each(computes, function(name) {
				var isComputed = ops[name] && ops[name].isComputed;
				options[name] = isComputed ? ops[name] : can.compute(ops[name] || defaults[name] || false);
			});
			can.Control.prototype.setup.call(this, el, options);
		},

		init : function() {
			this._cidMap = {};
			this.element.html(this.render('init'));
			this.heading = this.find('heading').html(this.render('head', {
				options : this.options,
				columns : this.options.columns()
			}));
			this.body = this.find('body');
			this.element.trigger('init', this);
			this._update(this.options.list());
		},

		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
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
				var self = this;
				this.body.empty();
				this.singleColumn(this.options.loadingText());
				data.done(can.proxy(this._update, this));
			} else {
				var cidMap = {};
				this.options.data = data instanceof can.Observe.List ? data : new can.Observe.List(data);

				// Update the mapping from can.Observe unique id to Observe instance
				this.options.data.forEach(function(observe) {
					cidMap[observe._namespace] = observe;
				});

				this._cidMap = cidMap;
				this.on();
				this.draw();
			}
		},

		/**
		 * Redraw the currently displayed list.
		 *
		 * @return {can.ui.Grid} The Grid control instance
		 */
		draw : function() {
			var data = this.options.data;
			this.body.empty();

			if(!data.length) {
				this.singleColumn(this.emptyText());
			} else {
				can.each(data, can.proxy(this.appendRow, this));
			}

			this.element.trigger('redraw', this);
		},

		appendRow : function(item, index) {
			var columnData = [],
				self = this;

			can.each(self.options.columns(), function(column, i) {
				if(!column.attr) {
					throw "Column " + i + " needs an 'attr' property!";
				}

				var defaultCallback = function() {
					return item.attr(column.attr);
				};

				var callback = can.isFunction(column.attr) ?
						function() { return column.attr(item, index); } :
						defaultCallback;

				columnData.push(can.compute(callback));
			});

			self.body.append(self.render('row', {
				options : self.options,
				columns : columnData,
				item : item
			}));
		},

		singleColumn : function(text) {
			this.body.append(this.render('single', {
				text : text,
				options : this.options
			}));
		},

		/**
		 * Returns all rows for a list of observables.
		 *
		 * @param arg
		 * @return {*}
		 */
		rows : function(arg) {
			if(!arg) {
				return this.element.find('row');
			}

			var element = this.element,
				elements = [],
				observes = can.isArray(arg) ? arg : can.makeArray(arguments);

			can.each(observes, function(current) {
				var row = element.find('[data-cid="' + current._namespace + '"]')[0];
				elements.push(row || null);
			});

			return can.$(elements);
		},

		/**
		 * Returns all
		 *
		 * @param arg
		 * @return {can.Observe.List|can.Observe}
		 */
		items : function(arg) {
			if(!arg) {
				return this.options.data || new can.Observe.List();
			}

			var result = new can.Observe.List(),
				map = this._cidMap,
				rows = can.isArray(arg) ? arg : can.makeArray(arguments);

			can.each(rows, function(row) {
				// Either use getAttribute or the name itself as the index
				// that way you can pass a list of Observe._namespace IDs as well
				var id = row[0] ? row[0].getAttribute('data-cid') : row;
				if(map[id]) {
					result.push(observe);
				}
			});

			return rows.length == 1 ? result.pop() : result;
		},

		// Update if someone updates the list
		'{list} change' : function(compute, ev, newVal) {
			this._update(newVal);
		},

		// We will redraw everything as removing and adding items
		// might trigger other things as well
		'{data} remove' : 'draw',
		'{data} add' : 'draw',

		// When the columns change we can reinitialize everything
		'{columns} change' : 'init'
	});

	// Create direct accessors for computed properties
	can.each(computes, function(name) {
		if(!can.ui.Grid.prototype[name]) {
			can.ui.Grid.prototype[name] = function(data) {
				// Computes need to be directly assigned
				if(data && data.isComputed) {
					this.options[name] = data;
					// Rebind listeners (for {name} change)
					this.on();
					// Call the compute and update the data
					this._update(data());
					return data;
				}

				return this.options[name](data);
			}
		}
	});
});