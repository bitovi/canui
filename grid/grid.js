steal('can/control', 'can/view/ejs', 'can/observe').then(function() {
	can.Control('can.ui.Grid', {
		defaults : {
			select : {
				heading : 'thead',
				body : 'tbody',
				header : 'th',
				row : 'tr',
				column : 'td'
			},
			view : {
				init : '//canui/grid/views/init.ejs',
				row : '//canui/grid/views/row.ejs',
				empty : '//canui/grid/views/empty.ejs',
				head : '//canui/grid/views/head.ejs'
			},
			emptyText : 'No data'
		}
	}, {
		setup : function(el, ops) {
			// Convert the options for list and columns into a can.compute
			var options = can.extend({}, ops, {
				list : can.compute(ops.list || {}),
				columns : can.compute(ops.columns || [])
			});
			can.Control.prototype.setup.call(this, el, options);
		},

		init : function() {
			this.element.html(this.render('init'));
			this.heading = this.find('heading');
			this.body = this.find('body');
			this.heading.html(this.render('head', { options : this.options, columns : this.options.columns() }));
			this.draw();
		},

		/**
		 * Redraw the currently displayed list.
		 *
		 * @return {can.ui.Grid} The Grid control instance
		 */
		draw : function() {
			var body = this.body.empty(),
				self = this,
				data = this.options.list();

			// Only do this for actual observable lists
			if(data instanceof can.Observe.List) {
				this.options.data = data;
				this.on();
			}

			data.each(function(item) {
				body.append(self.render('row', { options : self.options, columns : self._row(item), item : item }));
			});

			return this;
		},

		/**
		 * Converts a data item into a list of can.computes according to the columns.
		 *
		 * @param item
		 * @return {Array}
		 * @private
		 */
		_row : function(item) {
			var res = [];
			can.each(this.options.columns(), function(column) {
				var callback = can.isFunction(column.attr) ?
						can.proxy(column.attr, item) :
						function() {
							return item.attr(column.attr);
						};
				res.push(can.compute(callback));
			});
			return res;
		},

		// When the columns change we can reinitialize everything
		'{columns} change' : 'init',
		'{list} change' : 'draw',

		// TODO these should just remove and add their row
		'{data} remove' : 'draw',
		'{data} add' : 'draw',

		columns : function(cols) {
			return this.options.columns(cols);
		},

		list : function(data) {
			return this.options.list(data);
		},

		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
		}
	});
});