steal('canui/widget',
	'can/observe/delegate',
	'can/view/ejs',
	'canui/grid/state')
.then(function() {
	can.ui.Widget('can.ui.Grid', {
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
				head : '//canui/grid/views/head.ejs'
			},
			state : {
				items : -1,
				sortColumn : null
			}
		}
	}, {
		setup : function(el, ops) {
			var options = can.extend({}, ops, {
				// Initialize the grid state object
				state : ops.state instanceof can.ui.grid.State ? ops.state : new can.ui.grid.State({
					columns : ops.columns
				})
			});
			return can.Control.prototype.setup.call(this, el, options);
		},

		init : function(el, ops) {
			this.element.html(this.render('init'));
			this.heading = this.find('heading').html(this.render('head', this.options.state));
			this.body = this.find('body');
			if(this.options.data) {
				this.attr('data', this.options.data);
			}
		},

		attr : function() {
			return this.options.state.attr.apply(this.options.state, arguments);
		},

		draw : function(items) {
			var body = this.body.empty(), self = this;
			items.each(function(item) {
				body.append(self.render('row', { state : self.options.state, item : item }));
			});
		},

		'{state} view set' : function(view) {
			this.draw(view);
		},

		'{select.header} click' : function(el, ev) {
			this.attr('sort', can.data(el, 'column'));
		},

		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		message : function(name, options) {
			return can.sub(this.options.locale[name], options);
		},

		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
		}
	});
});