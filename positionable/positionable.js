steal('jquery', 
	'can/control',
	'can/construct/proxy',
	'can/construct/super',
	'jquery/event/reverse',
	'can/control/plugin',
	'canui/util/scrollbar_width.js', 
	'./position.js',
	function($){

	if(!$.event.special.move) {
		$.event.reverse('move');
	}

	/**
	 * @class can.ui.layout.Positionable
	 * @parent canui
	 *
	 * @description Allows you to position an element relative to another element.
	 *
	 * The positionable plugin allows you to position an element relative to
	 * another. It abstracts all of the calculating you might have to do when
	 * implementing UI widgets, such as tooltips and autocompletes.
	 *
	 * # Basic Example
	 *
	 * Given the following markup:
	 *
	 *		<a id="target" href="http://jupiterjs.com/">Bitovi!</a>
	 *		<div id="tooltip">Bitovi</div>
	 *
	 * To position the tooltip element above the anchor link, you would use the
	 * following code:
	 *
	 *		// Initialize the positionable plugin
	 *		 new can.ui.Positionable($("#tooltip"), {
	 *			my: "bottom",
	 *			at: "top",
	 *			of: $("#target")
	 *		});
	 *
	 *		// Trigger the move event on the tooltip to move it's position
	 *		$("#tooltip").trigger("move");
	 *
	 * In the options passed to the positionable plugin, we're telling the plugin
	 * to align the bottom of the `#tooltip` element to the top of the
	 * `#target` element.
	 *
	 * # Autocomplete Example
	 *
	 * Given the following markup:
	 *
	 *		<form>
	 *			<label>
	 *				Search
	 *				<input type="text" name="search" />
	 *			</label>
	 *		</form>
	 *		<ul id="autocomplete">
	 *		</ul>
	 *
	 * You could easily implement an autocompleting search input using the
	 * following code:
	 *
	 *		// Position the autocomplete list below the search input
	 *		new can.ui.Positionable($("#autocomplete"), {
	 *			my: "left top",
	 * 			at: "left bottom",
	 *			of: $("#search")
	 *		});
	 *		
	 *		// Autocomplete controller
	 *		var Autocomplete = can.Control({
	 *			"keyup" : function( el, ev ) {
	 *				this.options.list.show();
	 *				$.ajax({
	 *					url : "/search.php",
	 *					data : el.val(),
	 *					success : this.proxy("updateResults")
	 *				});
	 *			},
	 *			"blur" : function() {
	 *				this.options.list.hide();
	 *			},
	 *			"updateResults" : function( json ) {
	 *				this.options.list.html( "views/autocomplete-list.ejs", json );
	 *			},
	 *			"{list} li click" : function( el, ev ) {
	 *				this.blur();
	 *				this.element.val( el.text() );
	 *			}
	 *		});
	 *		
	 *		// Initialize the autocomplete controller on the search element
	 *		new Autocomplete($("#search"), {
	 *			list: $("#autocomplete")
	 *		});
	 *
	 *
	 * ## Demo
	 * @demo canui/positionable/positionable.html
	 *
	 * @param {Object} options Object literal describing how to position the
	 * current element against another.
	 *
	 *	- `my` {String} - String containing the edge of the positionable element to be
	 *	used in positioning. Possible values are:
	 *	- `at` {String} - String containing the edge of the target element to be
	 *	used in positioning.
	 *	- Possible values for both the `my` and `at` options include:
	 *		- `"top"`
	 *		- `"center"`
	 *		- `"bottom"`
	 *		- `"left"`
	 *		- `"right"`
	 *		- Horizontal and vertical values can be used in conjunction with
	 *		eachother, separated by a space. For example, `"bottom left"`.
	 *	- `of` {jQuery} - The target DOM element.
	 *	- `collision` {String} - Collision strategy to be used in case the positionable
	 *	element does not fit in the window. Possible values include
	 *		- `fit` - Attempts to position the element as close as possible to
	 *		the target without clipping the positionable.
	 *		- `flip` - Flips the element to the opposite side of the target.
	 *		- `none` - Don't use any collision strategey.
	 *	- `using` {Function} - function that recieves the calculated position
	 *	in the format of `{ top: x, left: y }` to handle the positioning. If a
	 *	`using` parameter is passed, the element won't be positioned
	 *	automatically, but must be positioned by hand in the `using` callback.
	 * - `hideWhenInvisible` - `{Boolean}` - hide element when `of` element is
	 * not visible because of scrolling. If you set this to `true` make sure that
	 * `of` element's parent that is scrollable has `position` set to `relative` or
	 *`absolute`
	 *
	 * This plugin is built on top of the [jQuery UI Position Plugin](http://docs.jquery.com/UI/Position),
	 * so you may refer to their documentation for more advanced usage.
	 */
	can.Control("can.ui.Positionable",
	 {
		pluginName : 'positionable',
	 	rhorizontal : /left|center|right/,
		rvertical : /top|center|bottom/,
		hdefault : "center",
		vdefault : "center",
	 	defaults : {
			iframe: false,
			of: window,
			keep : false, //keeps it where it belongs,
			hideWhenInvisible : false
	 	},
		
		getScrollInfo: function(within) {
			var notWindow = within[0] !== window,
				overflowX = notWindow ? within.css( "overflow-x" ) : "",
				overflowY = notWindow ? within.css( "overflow-y" ) : "",
				scrollbarWidth = overflowX === "auto" || overflowX === "scroll" ? can.ui.scrollbarWidth() : 0,
				scrollbarHeight = overflowY === "auto" || overflowY === "scroll" ? can.ui.scrollbarWidth() : 0;
	
			return {
				height: within.height() < within[0].scrollHeight ? scrollbarHeight : 0,
				width: within.width() < within[0].scrollWidth ? scrollbarWidth : 0
			};
		}
	 },
	/** 
	 * @prototype
	 */
	 {
	 	setup : function(element, options){
	 		var controls = $(element).data('controls'),
	 			pluginName = this.constructor._shortName;

	 		if(controls && controls.length > 0){
	 			for(var i = 0; i < controls.length; i++){
	 				if(controls[i].constructor._shortName === pluginName){
	 					controls[i].destroy();
	 				}
	 			}
	 		}

	 		this._super(element, options);
	 	},

		init : function(element, options) {
			this.element.css("position","absolute");
			if(!this.options.keep){
				// Remove element from it's parent only if this element _has_ parent.
				// This allows us to call positionable like `new can.ui.layout.Positionable($('<div/>'))
				if(this.element[0].parentNode){
					this.element[0].parentNode.removeChild(this.element[0])
				}

				document.body.appendChild(this.element[0]);				
			}
		},

		show : function(el, ev, position){
			this.move.apply(this, arguments)
		},

		move : function( el, ev, positionFrom ) {
			// When combined with 'drag', this can fire
			// causing errors when its goes to try to call
			// methods on the Drag class rather than what its expecting
			if($.Drag && positionFrom instanceof $.Drag) {
				return false;
			}
			
			var position = this.position.apply(this, arguments),
				elem     = this.element,
				options  = this.options;
	
			// if elem is hidden, show it before setting offset
			var visible = elem.is(":visible")
			if ( ! visible ) {
				elem.css("opacity", 0).show()
			}

			elem.offset( $.extend( position, { using: options.using } ) );

			if ( ! visible ) {
				elem.css("opacity", 1).hide();
			}

			if(this.options.hideWhenInvisible){
				this.element.toggle(this.isOfVisible());
			}
		},

		isOfVisible : function(){
			var of = this.options.of,
				pos = of.position();

			if(pos.top < 0 ||
				pos.top > of.offsetParent().height() ||
				pos.left < 0 ||
				pos.left + of.width() > of.offsetParent().width()) {
					return false;
			} 

			return true;
		},

		/**
		 * Calculate the position of the element.
		 */
		position : function(el, ev, positionFrom){
			var options  = $.extend({},this.options);
				 options.of= positionFrom || options.of;

			if(!options.of)	return;

			var target = $( options.of ),
				collision = ( options.collision || "flip" ).split( " " ),
				offset = options.offset ? options.offset.split( " " ) : [ 0, 0 ],
				targetWidth,
				targetHeight,
				basePosition;

			if ( options.of.nodeType === 9 ) {
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: 0, left: 0 };
			} else if ( options.of.scrollTo && options.of.document ) {
				targetWidth = target.width();
				targetHeight = target.height();
				basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
			} else if ( options.of.preventDefault ) {
				// force left top to allow flipping
				options.at = "left top";
				targetWidth = targetHeight = 0;
				basePosition = { top: options.of.pageY, left: options.of.pageX };
			} else if (options.of.top){
				options.at = "left top";
				targetWidth = targetHeight = 0;
				basePosition = { top: options.of.top, left: options.of.left };	
			} else if(target.is('path') || target.is('rect')) { 
				//SVG elements have .width() and .height() of 0, so we have to use getBBox()
				targetWidth = target[0].getBBox().width;
				targetHeight = target[0].getBBox().height;
				basePosition = target.offset();	
			} else {
				targetWidth = target.outerWidth();
				targetHeight = target.outerHeight();

				if(false){
					var to = target.offset(),
						eo =this.element.parent().children(":first").offset();
					
					basePosition = {
						left: to.left - eo.left,
						top: to.top -eo.top
					}
				}else{
					basePosition = target.offset();
				}			
			}
		
			// force my and at to have valid horizontal and veritcal positions
			// if a value is missing or invalid, it will be converted to center 
			$.each( [ "my", "at" ], this.proxy( function( i, val ) {
				var pos = ( options[val] || "" ).split( " " );

				if ( pos.length === 1) {
					pos = this.constructor.rhorizontal.test( pos[0] ) ?
						pos.concat( [this.constructor.vdefault] ) :
						this.constructor.rvertical.test( pos[0] ) ?
							[ this.constructor.hdefault ].concat( pos ) :
							[ this.constructor.hdefault, this.constructor.vdefault ];
				}

				pos[ 0 ] = this.constructor.rhorizontal.test( pos[0] ) ? pos[ 0 ] : this.constructor.hdefault;
				pos[ 1 ] = this.constructor.rvertical.test( pos[1] ) ? pos[ 1 ] : this.constructor.vdefault;
				options[ val ] = pos;
			}));
		
			// normalize collision option
			if ( collision.length === 1 ) {
				collision[ 1 ] = collision[ 0 ];
			}
		
			// normalize offset option
			offset[ 0 ] = parseInt( offset[0], 10 ) || 0;
			if ( offset.length === 1 ) {
				offset[ 1 ] = offset[ 0 ];
			}

			offset[ 1 ] = parseInt( offset[1], 10 ) || 0;
		
			if ( options.at[0] === "right" ) {
				basePosition.left += targetWidth;
			} else if (options.at[0] === this.constructor.hdefault ) {
				basePosition.left += targetWidth / 2;
			}
		
			if ( options.at[1] === "bottom" ) {
				basePosition.top += targetHeight;
			} else if ( options.at[1] === this.constructor.vdefault ) {
				basePosition.top += targetHeight / 2;
			}
		
			basePosition.left += offset[ 0 ];
			basePosition.top += offset[ 1 ];
			
			var elem = this.element,
				elemWidth = elem.outerWidth(),
				elemHeight = elem.outerHeight(),
				position = $.extend( {}, basePosition ),
				getScrollInfo = this.constructor.getScrollInfo;

			if ( options.my[0] === "right" ) {
				position.left -= elemWidth;
			} else if ( options.my[0] === this.constructor.hdefault ) {
				position.left -= elemWidth / 2;
			}
	
			if ( options.my[1] === "bottom" ) {
				position.top -= elemHeight;
			} else if ( options.my[1] === this.constructor.vdefault ) {
				position.top -= elemHeight / 2;
			}

			$.each( [ "left", "top" ], function( i, dir ) {
				if ( $.ui.position[ collision[i] ] ) {
					var isEvent = ((options.of && options.of.preventDefault) != null),
						within = $(isEvent || !options.of ? window : options.of),
						marginLeft = parseInt( $.css( elem[0], "marginLeft", true ) ) || 0,
						marginTop = parseInt( $.css( elem[0], "marginTop", true ) ) || 0;
						
					var scrollInfo = getScrollInfo(within);
					$.ui.position[ collision[i] ][ dir ]( position, {
						targetWidth: targetWidth,
						targetHeight: targetHeight,
						elem: elem,
						within : within,
						collisionPosition : {
							marginLeft: parseInt( $.css( elem[0], "marginLeft", true ) ) || 0,
							marginTop: parseInt( $.css( elem[0], "marginTop", true ) ) || 0
						},
						collisionWidth: elemWidth + marginLeft +
							( parseInt( $.css( elem[0], "marginRight", true ) ) || 0 ) + scrollInfo.width,
						collisionHeight: elemHeight + marginTop +
						( parseInt( $.css( elem[0], "marginBottom", true ) ) || 0 ) + scrollInfo.height,
						elemWidth: elemWidth,
						elemHeight: elemHeight,
						offset: offset,
						my: options.my,
						at: options.at
					});
				}
			});

			return position;
		},

		/**
		 * Move element when the `of` element is moving
		 */
		"{of} move" : function(el, ev){
			clearTimeout(this._finalMove);
			this.move(this.element, ev, el);
			this._finalMove = setTimeout(this.proxy(function(){
				this.move(this.element, ev, el);
			}), 1)
		}
	});
});
