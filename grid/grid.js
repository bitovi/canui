steal('can/control', 'can/view/ejs', 'can/observe', 'can/control/plugin').then(
'//canui/grid/views/init.ejs', '//canui/grid/views/row.ejs',
'//canui/grid/views/single.ejs', '//canui/grid/views/head.ejs',
function() {
	// A list of properties that should be turned into can.computes and be directly accessible


	var proto = can.ui.List.prototype;
	can.ui.List('can.ui.Grid', {
		pluginName : 'grid',
		defaults : {
			header : '',
			view : '//canui/grid/views/row.ejs',
			emptyContent : '',
			loadingContent : '',
			scrollable : false
		}
	}, {
		init : function(el, ops) {
			this.element.append(can.view(this.options.header, this.options.columns));
			proto.init.apply(this, arguments);
		}
	});

//	var computes = [ 'columns', 'list', 'emptyText', 'loadingText' ];
//	// Create direct accessors for computed properties
//	can.each(computes, function(name) {
//		if(!can.ui.Grid.prototype[name]) {
//			can.ui.Grid.prototype[name] = function(data) {
//				// Computes need to be directly assigned
//				if(data && data.isComputed) {
//					this.options[name] = data;
//					// Rebind listeners (for {name} change)
//					this.on();
//					// Call the compute and update the data
//					this._update(data());
//					return data;
//				}
//
//				return this.options[name](data);
//			}
//		}
//	});
});