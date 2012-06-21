steal('can/control',
	'can/construct/super',
	'canui/layout/positionable',
	'canui/layout/fill').then(function($){
	/**
	 * @class can.ui.layout.Block
	 * @parent canui
	 * @plugin canui/layout/block
	 * @test canui/layout/block/funcunit.html
	 * 
	 * Blocks the browser screen or element from user interaction.
	 * 
	 * Sometimes it is necessary to block the browser from user interaction such as when a spinner image
	 * is giving the user feedback that a request for data is taking place. can.ui.layout.Block attaches to an
	 * element sets its width and height to the window's width and height and sets its z-index to a 
	 * configurable value (default is 9999).
	 * 
	 * To block the browser screen just attach can.ui.layout.Block to an element you
	 * wish to act as a blocker:
	 * 
	 *		new can.ui.layout.Block($("#blocker"));
	 *
	 * If you'd like to block a specific element, simply pass it as the argument
	 * to the can.ui.layout.Block call:
	 *
	 *		new can.ui.layout.Block($("#blocker"), $("#parent"));
	 *
	 * You can also simply pass a string selector as the argument to determine
	 * the parent
	 *
	 *		new can.ui.layout.Block($("#blocker"), "#parent");
	 *
	 * @demo canui/layout/block/block.html
	 */	
	can.Control("can.ui.layout.Block", {
		defaults : {
			zIndex: 9999
		},
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

			new can.ui.layout.Positionable(this.element.show());

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
					top: $(this.options.parent).scrollTop() + "px", 
					left: $(this.options.parent).scrollLeft() + "px" , 
					zIndex: this.options.zIndex
				})
				.can_ui_layout_fill({
					all: true, 
					parent: this.options.parent
				});
			
		},
		show : function(){
			this.element.css('top', $(this.options.parent).scrollTop() + "px").show();
		},
		update : function(options){
			this._super(options);
			this.element.show().resize()
		},
		"{parent} scroll" : function(el, ev){
			this.element.css('top', $(el).scrollTop() + "px");
			this.element.css('left', $(el).scrollLeft() + "px")
		}
	})
})
