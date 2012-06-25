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
		init : function() {
			this.options.list = can.compute(this.options.list || []);
			this.columns(this.options.columns);
			this.element.html(this.render('init'));
			this.heading = this.find('heading').html(this.render('head', { options: this.options }));
			this.body = this.find('body');
			this.draw();
		},

		/**
		 * Set or get the currently displayed list.
		 * Can be an array or a can.Observe.List
		 *
		 * @param {can.Observe.List|Array} [data] The list data. Arrays will be converted to can.Observe.List
		 * @return {can.Observe.List} The (converted) list instance
		 */
		draw : function() {
			var body = this.body.empty(),
				self = this;

			this.options.data = this.options.list();
			this.on();

			this.options.data.each(function(item) {
				body.append(self.render('row', { options : self.options, item : item }));
			});
		},

		list : function() {
			return this.options.list.apply(this, arguments);
		},

		'{list} change' : 'draw',

		'{data} remove' : function() {

		},

		'{data} add' : function() {

		},

		/**
		 * Returns or sets the current column configuration.
		 * Columns are an array or can.Observe.List of single column configurations.
		 *
		 * @param {can.Observe.List|Array} [cols] The columns to set
		 * @return {can.Observe.List}
		 */
		columns : function(cols) {
			if(typeof cols !== 'undefined') {
				var columns = cols instanceof can.Observe.List ? cols : new can.Observe.List(cols);
				columns.colspan = can.compute(function() {
					var colspan = 0;
					columns.each(function(col) {
						colspan += col.attr('visible') === false ? 0 : 1;
					});
					return colspan;
				});
				this.options.columns = columns;
				this.on();
			}
			return this.options.columns;
		},

		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
		}
	});
});