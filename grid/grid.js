steal('can/control', 'can/view/ejs', 'can/observe').then(
'//canui/grid/views/init.ejs', '//canui/grid/views/row.ejs',
'//canui/grid/views/single.ejs', '//canui/grid/views/head.ejs',
function() {
	var computes = [ 'columns', 'list', 'emptyText' ];

	can.Control('can.ui.Grid', {
		defaults : {
			select : {
				heading : 'thead',
				body : 'tbody',
				header : 'th',
				row : 'tbody tr.grid-row',
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
			var options = can.extend({}, ops);
			// Convert computed properties
			can.each(computes, function(name) {
				options[name] = can.compute(ops[name] || {});
			});
			can.Control.prototype.setup.call(this, el, options);
		},

		init : function() {
			this.element.html(this.render('init'));
			this.heading = this.find('heading').html(this.render('head', {
				options : this.options,
				columns : this.options.columns()
			}));
			this.body = this.find('body');
			this.element.trigger('init', this);
			this.draw();
		},

		/**
		 * Redraw the currently displayed list.
		 *
		 * @return {can.ui.Grid} The Grid control instance
		 */
		draw : function() {
			var data = this.options.list();

			this.body.empty();

			// Only do this for actual observable lists
			if(data instanceof can.Observe.List) {
				this.options.data = data;
				this.on();
			}

			if(!data.length) {
				this.singleColumn(this.options.emptyText);
			} else {
				can.each(data, can.proxy(this.appendRow, this));
			}

			this.element.trigger('redraw', this);

			return this;
		},

		appendRow : function(item, index) {
			var columnData = [],
				self = this;

			can.each(self.options.columns(), function(column) {
				var defaultCallback = function() {
					return can.isFunction(item.attr) ? item.attr(column.attr) : item[column.attr];
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

		' loading' : function(el, ev, text) {
			this.body.empty();
			this.singleColumn(text || this.options.loadingText);
		},

		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
		},

		// When the columns change we can reinitialize everything
		'{columns} change' : 'init',
		// Redraw if someone updates the list
		'{list} change' : 'draw',

		// We will redraw everything as removing and adding items might trigger other things as well
		'{data} remove' : 'draw',
		'{data} add' : 'draw'
	});

	// Create direct accessors for computed properties
	can.each(computes, function(name) {
		can.ui.Grid.prototype[name] = function(data) {
			return this.options[name](data);
		}
	});
});