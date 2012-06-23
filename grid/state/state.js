steal('can/observe',
	'can/observe/setter',
	'can/observe/delegate',
	'can/construct/proxy',
	'can/observe/sort',
function() {
	var convertList = function(data) {
		if(!(data instanceof can.Observe.List) && can.isArray(data)) {
			return new can.Observe.List(data);
		}
		return data;
	},
	sortFn = function(name, order) {
		return function(a, b) {
			var a = a[name],
				b = b[name],
				res = a === b ? 0 : (a < b ? -1 : 1);

			return order == 'asc' ? res : (res * -1);
		}
	};

	// offset
	// limit
	// sort - Sort the data by column
	// data - The initial data
	// view - An observable list of viewable data
	can.Observe('can.ui.grid.State', {
		defaults : {
			offset : 0,
			limit : -1,
			multisort : false
		}
	},
	{
		setup : function(options) {
			return can.Observe.prototype.setup.call(this, can.extend({},
				this.constructor.defaults, options));
		},

		init : function() {
			this.bind('data set', this.proxy('updateView'));
			this.bind('offset set', this.proxy('updateView'));
			this.bind('limit set', this.proxy('updateView'));
		},

		updateView : function(ev) {
			var newView = new can.Observe.List(),
				data = this.attr('data'),
				offset = this.offset,
				limit = this.limit !== -1 ? this.limit : data.length - offset;

			for(var i = offset; i < offset + limit; i++) {
				newView.push(data[i]);
			}

			this.attr('view', newView);
		},

		setColumns : function(columns) {
			return convertList(columns);
		},

		getColumn : function(name) {
			this.columns.each(function(col) {
				if(col.name == name) {
					return col;
				}
			});
			return null;
		},

		setSort : function(column, order) {
			if(typeof column == 'string') {
				var parts = column.split(' ');
				// TODO
			} else {
				if(column.attr('sort') == 'asc') {
					column.attr('sort', 'desc');
				} else {
					column.attr('sort', 'asc');
				}
				// TODO don't convert to array if it is a model list
				var arr = this.data.serialize();
				arr.sort(sortFn(column.name, column.sort));
				this.attr('data', arr);
			}
		}
	});
});