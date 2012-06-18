steal('can/control',
	'can/construct/super',
	'canui/positionable',
	'canui/fills').then(function($){
	/**
	 * @class can.ui.Block
	 * @parent canui
	 * @plugin canui/layout/block
	 * @test canui/layout/block/funcunit.html
	 * 
	 * Blocks the browser screen or element from user interaction.
	 * 
	 * Sometimes it is necessary to block the browser from user interaction such as when a spinner image
	 * is giving the user feedback that a request for data is taking place. can.ui.Block attaches to an
	 * element sets its width and height to the window's width and height and sets its z-index to a 
	 * configurable value (default is 9999).
	 * 
	 * To block the browser screen just attach can.ui.Block to an element you
	 * wish to act as a blocker:
	 * 
	 *		new can.ui.Block($("#blocker"));
	 *
	 * If you'd like to block a specifc element, simply pass it as the argument
	 * to the can.ui.Block call:
	 *
	 *		new can.ui.Block($("#blocker"), $("#parent"));
	 *
	 * You can also simply pass a string selector as the argument to determine
	 * the parent
	 *
	 *		new can.ui.Block($("#blocker"), "#parent");
	 *
	 * @demo canui/layout/block/block.html
	 */	
	can.Control("can.ui.Block", {
		defaults : {
			zIndex: 9999
		},
		listensTo: ['show','hide']
	}, {
		setup: function( el, option ) {
			var parent;
			if ( option && ( $.isWindow( option ) || option.jquery )) {
				parent = option;
			} else if ( ({}).toString.call( option ) == "[object String]" ) {
				parent = $( option );
			} else {
				parent = el.parent();
			}

			this._super(el, {
				parent : parent
			});
		},
		init : function() {

			new can.ui.Positionable(this.element.show());

			// If the block element is styled with a width or height of zero,
			// this will still work
			if ( ! this.element.is(":visible") ) {
				this.element.css({
					height: "1px",
					width: "1px"
				});
			}

			if ( ! $.isWindow( this.options.parent )) {
				// If its an element, make sure it's relatively positioned
				this.options.parent.css("position", "relative");
				// Put the block inside of the parent if it's not
				if ( ! $.contains( this.options.parent[0], this.element[0] ) ) {
					this.options.parent.append( this.element.detach() );
				}
			}

			this.element
				.css({
					top: "0px", 
					left: "0px" , 
					zIndex: this.options.zIndex
				})
				.fills({
					all: true, 
					parent: this.options.parent
				});
			
		},
		update : function(options){
			this._super(options);
			this.element.show().resize()
		}
	})
})
