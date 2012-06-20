(function($){
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
	 *		 new can.ui.layout.Positionable($("#tooltip"), {
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
	 *		new can.ui.layout.Positionable($("#autocomplete"), {
	 *			my: "top left",
	 *			at: "bottom left",
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
	 *					success : this.callback("updateResults")
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
	 * @demo canui/layout/positionable/positionable.html
	 *
	 * @param {Object} options Object literal describing how to position the
	 * current element against another.
	 *
	 *	- `my` {String} - String containing the edge of the positionable element to be
	 *	used in positioning. Possbile values are:
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
	 *
	 * 
	 * This plugin is built on top of the [jQuery UI Position Plugin](http://docs.jquery.com/UI/Position),
	 * so you may refer to their documentation for more advanced usage.
	 */
	can.Control("can.ui.Positionable",
	 {
		rhorizontal : /left|center|right/,
		rvertical : /top|center|bottom/,
		hdefault : "center",
		vdefault : "center",
		listensTo : ["show",'move'],
		iframe: false,
		keep : false, //keeps it where it belongs,
		scrollbarWidth: function() {
			var w1, w2,
				div = $( "<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
				innerDiv = div.children()[0];
	
			$( "body" ).append( div );
			w1 = innerDiv.offsetWidth;
			div.css( "overflow", "scroll" );
	
			w2 = innerDiv.offsetWidth;
	
			if ( w1 === w2 ) {
				w2 = div[0].clientWidth;
			}
	
			div.remove();
	
			return w1 - w2; 
		},
		getScrollInfo: function(within) {
			var notWindow = within[0] !== window,
				overflowX = notWindow ? within.css( "overflow-x" ) : "",
				overflowY = notWindow ? within.css( "overflow-y" ) : "",
				scrollbarWidth = overflowX === "auto" || overflowX === "scroll" ? $.position.scrollbarWidth() : 0,
				scrollbarHeight = overflowY === "auto" || overflowY === "scroll" ? $.position.scrollbarWidth() : 0;
	
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
		init : function(element, options) {
			this.element.css("position","absolute");
			if(!this.options.keep){
				this.element[0].parentNode.removeChild(this.element[0])
				document.body.appendChild(this.element[0]);
			}
		},
		show : function(el, ev, position){
			this.move.apply(this, arguments)
			  //clicks elsewhere should hide
		},
		move : function(el, ev, positionFrom){
			var position = this.position.apply(this, arguments),
				elem     = this.element,
				options  = this.options;
	
			// if elem is hidden, show it before setting offset
			var visible = elem.is(":visible")
			if(!visible){
				elem.css("opacity", 0)
					.show()
				
			}

			elem.offset( $.extend( position, { using: options.using } ) )
			if(!visible){
				elem.css("opacity", 1)
					.hide();
			}
		},
		update : function(options){
			can.extend(this.options, options);
			this.on();
		},
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
				
			} else {
				targetWidth = target.outerWidth();
				targetHeight = target.outerHeight();
				if(false){
					var to = target.offset();
					
					var eo =this.element.parent().children(":first").offset();
					
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
				getScrollInfo = this.constructor.getScrollInfo,
				over,
				myOffset,
				atOffset;

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
						marginLeft = parseInt( $.curCSS( elem[0], "marginLeft", true ) ) || 0,
						marginTop = parseInt( $.curCSS( elem[0], "marginTop", true ) ) || 0;
						
					var scrollInfo = getScrollInfo(within);
					$.ui.position[ collision[i] ][ dir ]( position, {
						targetWidth: targetWidth,
						targetHeight: targetHeight,
						elem: elem,
						within : within,
						collisionPosition : {
							marginLeft: parseInt( $.curCSS( elem[0], "marginLeft", true ) ) || 0,
							marginTop: parseInt( $.curCSS( elem[0], "marginTop", true ) ) || 0
						},
						collisionWidth: elemWidth + marginLeft +
							( parseInt( $.curCSS( elem[0], "marginRight", true ) ) || 0 ) + scrollInfo.width,
						collisionHeight: elemHeight + marginTop +
						( parseInt( $.curCSS( elem[0], "marginBottom", true ) ) || 0 ) + scrollInfo.height,
						elemWidth: elemWidth,
						elemHeight: elemHeight,
						offset: offset,
						my: options.my,
						at: options.at
					});
				}
			});
			return position
		},
		"{of} move" : function(el, ev){
			clearTimeout(this._finalMove)
			this.move(this.element, ev, el);
			this._finalMove = setTimeout(this.proxy(function(){
				this.move(this.element, ev, el);
			}), 1)
		},
		" move" : function(){
			this.move.apply(this, arguments)
		}
	})


})(jQuery);
.can_ui_layout_split .split {
	overflow: auto;
	float:left;
}
.can_ui_layout_split .vsplitter {
	width:3px;
	cursor:w-resize;
	float:left;
	line-height: 3px;
	font-size: 0px;
	border-top:solid 1px #b6b6b6;
	border-bottom:solid 1px #b6b6b6;
	background:url(images/split_sprite.gif) repeat-y -35px 0;
}
.can_ui_layout_split .hsplitter {
	width:100%;
	cursor:s-resize;
	float:left;
	line-height: 3px;
	font-size: 0px;
	height:3px;
	background:url(images/split_sprite_horz.gif) repeat-x 0 0;
}
.can_ui_layout_split .split-hover {
	background:#5f83b9;
}
.can_ui_layout_split .collapsed{
	display:none;
}
.can_ui_layout_split .disabled.vsplitter,
.can_ui_layout_split .disabled.hsplitter {
	background:red;
}
.can_ui_layout_split .vsplitter .collapser {
	position:absolute;
	top:50%;
	margin-top:-13px;
	width:3px;
	cursor:pointer;
	height:27px;
	outline:none;
}
.can_ui_layout_split .hsplitter .collapser {
	position:absolute;
	left:50%;
	margin-left:-13px;
	width:27px;
	cursor:pointer;
	height:3px;
	outline:none;
}
.can_ui_layout_split .vsplitter .right-collapse {
	background:#FFF url(images/split_sprite.gif) no-repeat -4px 0;
}
.can_ui_layout_split .vsplitter .left-collapse {
	background:#FFF url(images/split_sprite.gif) no-repeat -1px 0;
}
.can_ui_layout_split .hsplitter .right-collapse {
	background:#FFF url(images/split_sprite.gif) no-repeat -8px -4px;
}
.can_ui_layout_split .hsplitter .left-collapse {
	background:#FFF url(images/split_sprite.gif) no-repeat -8px -1px;
}
;
.modal-overlay {
  background: rgba(0,0,0,0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
};
(function( $ ) {
	//evil things we should ignore
	var matches = /script|td/,

		// if we are trying to fill the page
		isThePage = function( el ) {
			return el === document || el === document.documentElement || el === window || el === document.body
		},
		//if something lets margins bleed through
		bleeder = function( el ) {
			if ( el[0] == window ) {
				return false;
			}
			var styles = el.styles('borderBottomWidth', 'paddingBottom')
			return !parseInt(styles.borderBottomWidth) && !parseInt(styles.paddingBottom)
		},
		//gets the bottom of this element
		bottom = function( el, offset ) {
			//where offsetTop starts
			return el.outerHeight() + offset(el);
		}
		pageOffset = function( el ) {
			return el.offset().top
		},
		offsetTop = function( el ) {
			return el[0].offsetTop;
		},
		inFloat = function( el, parent ) {
			while ( el && el != parent ) {
				var flt = $(el).css('float')
				if ( flt == 'left' || flt == 'right' ) {
					return flt;
				}
				el = el.parentNode
			}
		},
		/**
		 * @function jQuery.fn.fills
		 * @parent jQuery.fills
		 * @test jquery/dom/fills/funcunit.html
		 * @plugin jquery/dom/fills
		 *
		 * Fills a parent element's height with the current element.
		 * This is extremely useful for complex layout, especially when you want to account for line-wrapping.
		 *
		 * ## Basic Example
		 *
		 * If you have the following html:
		 *
		 *     <div id='box'>
		 * 	    <p>I am a long heading.</p>
		 * 	    <div id='child'>I'm a child.</div>
		 *     </div>
		 *
		 * The follow makes `#child` fill up `#box`:
		 *
		 *     $('#child').can_ui_layout_fill("#box")
		 *
		 * ## Limitations
		 *
		 * Fill currently does not well with:
		 *
		 *   - Bleeding margins - Where margins leak through parent elements
		 *     because the parent elements do not have a padding or border.
		 *
		 *   - Tables - You shouldn't be using tables to do layout anyway.
		 *
		 *   - Floated Elements - the child element has `float: left` or `float: right`
		 *
		 *
		 * @param {HTMLElement|selector|Object} [parent] the parent element
		 * to fill, defaults to the element's parent.
		 *
		 * The following fills the parent to `#child`:
		 *
		 *     $('#child').fills()
		 *
		 * A selector can also be pased.  This selector is passed to jQuery's
		 * closet method.  The following matches the first `#parent` element that
		 * is a parentNode of `#child`:
		 *
		 *     $('#child').fills("#parent")
		 *
		 * An element or window can also be passed.  The following will make
		 * `#child` big enough so the entire window is filled:
		 *
		 *      $('#child').fills(window)
		 *
		 * If you pass an object, the following options are available:
		 *
		 * - __parent__ - The parent element selector or jQuery object
		 * - __className__ - A class name to add to the element that fills
		 * - __all__ - Reset the parents height when resizing
		 *
		 * @return {jQuery} the original jQuery collection for chaining.
		 */
		filler = $.fn.fills = function( parent ) {
			var options = parent;
			options || (options = {});
			if(typeof options == 'string'){
				options = this.closest(options)
			}
			if ( options.jquery || options.nodeName ) {
				options = {parent: options };
			}
			// Set the parent
			options.parent || (options.parent = $(this).parent());
			options.parent = $(options.parent)

			// setup stuff on every element
			if(options.className) {
				this.addClass(options.className)
			}

			var thePage = isThePage(options.parent[0]);
			
			if ( thePage ) {
				options.parent = $(window)
			}

			this.each(function(){
				var evData = {
					filler: $(this),
					inFloat: inFloat(this, thePage ? document.body : options.parent[0]),
					options: options
				},
				cb = function() {
					filler.parentResize.apply(this, arguments)
				}
				// Attach to the `resize` event
				$(options.parent).bind('resize', evData, cb);

				$(this).bind('destroyed', evData, function( ev ) {
					if(options.className) {
						$(ev.target).removeClass(options.className)
					}
					$(options.parent).unbind('resize', cb)
				});
				
			});

			// resize to get things going
			var func = function() {
				options.parent.resize();
			}

			if ( $.isReady ) {
				func();
			} else {
				$(func)
			}
			return this;
		};


	$.extend(filler, {
		parentResize : function( ev ) {
			if (ev.data.filler.is(':hidden')) {
				return;
			}
			
			var parent = $(this),
				isWindow = this == window,
				container = (isWindow ? $(document.body) : parent),

				//if the parent bleeds margins, we don't care what the last element's margin is
				isBleeder = bleeder(parent),
				children = container.children().filter(function() {
					if ( matches.test(this.nodeName.toLowerCase()) ) {
						return false;
					}

					var get = $.styles(this, ['position', 'display']);
					return get.position !== "absolute" && get.position !== "fixed"
						&& get.display !== "none" && !jQuery.expr.filters.hidden(this)
				}),
				last = children.eq(-1),
				first,
				parentHeight = parent.height() - (isWindow ? parseInt(container.css('marginBottom'), 10) || 0 : 0),
				currentSize;
			var div = '<div style="height: 0px; line-height:0px;overflow:hidden;' + (ev.data.inFloat ? 'clear: both' : '') + ';"/>'

			if ( isBleeder ) {
				//temporarily add a small div to use to figure out the 'bleed-through' margin
				//of the last element
				last = $(div).appendTo(container);
				
			}

			//for performance, we want to figure out the currently used height of the parent element
			// as quick as possible
			// we can use either offsetTop or offset depending ...
			if ( last && last.length > 0 ) {
				if ( last.offsetParent()[0] === container[0] ) {

					currentSize = last[0].offsetTop + last.outerHeight();
				} else if (last.offsetParent()[0] === container.offsetParent()[0]) {
					// add pos abs for IE7 but
					// might need to adjust for the addition of first's hheight
					var curLast =last[0].offsetTop;
					first = $(div).prependTo(container);
					
					currentSize = ( curLast + last.outerHeight() ) - first[0].offsetTop;
					
					first.remove();
				} else {
					// add first so we know where to start from .. do not bleed in this case
					first = $(div).prependTo(container);

					currentSize = ( last.offset().top + last.outerHeight() ) - first.offset().top;
					first.remove();
				}
			}

			// what the difference between the parent height and what we are going to take up is
			var delta = parentHeight - currentSize,
				// the current height of the object
				fillerHeight = ev.data.filler.height();

			//adjust the height
			if ( ev.data.options.all ) {
				// we don't care about anything else, we are likely absolutely positioned
				// we need to fill the parent width
				// temporarily collapse, then expand
				ev.data.filler.height(0).width(0);
				var parentWidth = parent.width(),
					parentHeight = parent.height();

				ev.data.filler.outerHeight(parentHeight);
				ev.data.filler.outerWidth(parentWidth);
			} else {
				ev.data.filler.height(fillerHeight + delta)
			}

			//remove the temporary element
			if ( isBleeder ) {
				last.remove();
			}
		}
	});
})(jQuery);
(function(){

//we have to clear out activate
$.event.special.activate = {
	setup : function(){return true},
	teardown : function(){return true}
}

/**
 * @class can.ui.Selectable
 * @test canui/nav/selectable/funcunit.html
 * @parent canui
 * 
 * Selectable provides keyboard and mouse selection to a group of 
 * items. Instead of listening to click and key events, 
 * add selectable and listen to activate and select events. It also 
 * provides multi-selection and activation with the shift and ctrl key.
 * 
 * ## Basic Example
 * 
 * If you have HTML like:
 * 
 *     <div id='menu'>
 *       <li tabindex="0">JavaScriptMVC</li>
 *       <li tabindex="0">StealJS</li>
 *       <li tabindex="0">FuncUnit</li>
 *     </div>
 * 
 * And styles like:
 * 
 *     li          { background-color: #ddddee; }
 *     li.selected { background-color: #efefff; }
 *     li.activated{ background-color: #dddddd; }
 * 
 * Make this selectable like:
 * 
 *     new can.ui.Selectable($('#menu'));
 * 
 * You can listen for `activate` and `select` events (also `deactivate` and `deselect`) like:
 * 
 *     $('#menu').delegate('li', 'activate', function(ev, items){
 *        console.log(this, 'has been activated')
 *     }).delegate('li', 'select', function(ev){
 *        console.log(this, 'has been activated')
 *     })
 * 
 * ## Demo
 * 
 * Use the keyboard and mouse to navigate.  Use the __SHIFT__ and __CTRL__ keys too!
 * 
 * @demo canui/nav/selectable/demo.html
 * 
 * ## Listening to events
 * 
 * Instead of listening to clicks and keypresses and having to provide navigation
 * for each, selectable allows you to listen to either `activate` or `select` events.
 * 
 * __select__ events happen when an element is moused over or navigated to with the keyboard.
 * 
 * __activate__ events happen when an element (or elements) are click 
 *   or the _enter_ key is pressed.
 * 
 * When an activate event happens, it comes back with the second argument 
 * the elements (or models) that are activated.  For example, if __SHIFT__
 * or __CTRL__ was used to select multiple elements, `activated`
 * would be a jQuery-wrapped collection of the activated elements:
 * 
 *     $('#menu').delegate('li', 'activate', function(ev, activated){
 *        console.log(activated, 'has been activated')
 *     })
 * 
 * However, if [jQuery.fn.model] is used to add model data to those elements, 
 * then activated will be the model instances.
 * 
 * @param {HTMLElement} element an HTMLElement or jQuery-wrapped element.
 * @param {Object} options options to set on the selectable, with the 
 * following __names__,  `default values`, and meanings:
 * 
 *   - __selectOn__ `"[tabindex]"` - The selector used to identify 
 *     something that is selectable.
 *     
 *   - __selectedClassName__ `"selected"` - The className that 
 *     gets added to things selected.
 *     
 *   - __activateClassName__ `"activated"` - The className 
 *     that gets added to activated elements.
 *     
 *   - __multiActivate__ `true` - True for multi-selection, 
 *     false if only a single item can be activated at a time.
 *     
 *   - __cache__ `false` - Cache selectables for performance.
 *   
 *   - __outsideDeactivate__ `true` - Deactivate selected when a click or 
 *     keypress happens outside the selectable. 
 *     
 * Use them like:
 * 
 *     new can.ui.Selectable($('#menu'), {
 *       selectOn : "tr",
 *       selectedClassName : "ui-hover",
 *       activateClassName: "ui-active",
 *       multiActivate: false,
 *       cache: true,
 *       outsideDeactivate: false
 *     })
 */
can.Control('can.ui.Selectable',{
    defaults : {
        // what can be selected
		selectOn: "[tabindex]",
		// what class is selected
        selectedClassName : "selected",
		// 
        activatedClassName : "activated",
		multiActivate: true,
		// caches 
		cache : false,
		outsideDeactivate: true,
		deactivateParent: document
    }
},
{
	/**
	 * @prototype
	 */
    //initializing does nothings
	init: function() {
		this.lastSelected = null;
		this.lastMouse ={};
    },
	
	"{deactivateParent} click":function(el,ev)
	{
		if(this.options.outsideDeactivate && 
			!$.contains(this.element[0],ev.target)  ){
				
			// if there's a click, keypress, or activate event 
			// outside of us ... deactivate
			var active = this.element.find("." + this.options.activatedClassName);
			if(active.length){
				active.trigger('deactivate');
				this.element.trigger('outsideDeactivate', [ $(ev.target) ]);
			}
		}
	},
	// if we mouse out, and don't have focus -> deselect
	// if we lose focus, but have moused out -> deselect
	"mouseenter" : function(){
		this.mousein = true;
	},
	"mouseleave" : function(){
		this.mousein = false;
		
		if(!this._focused){
			this.deselected();
		} else {
			// re-select what is focused ...
			this.selected(this._focused)
		}
	},
	
	_getSelected : function(){
		return this._selected && this._selected.hasClass(this.options.selectedClassName) ?
			this._selected :
			(this._selected = this.element.find("."+this.options.selectedClassName) )
	},
	/**
	 * Gets or sets the selected element.
	 * 
	 * Set the current selected element:
	 *
	 *     var selectable = new can.ui.Selectable($('#selectable'));
	 *     selectable.selected($('.selectable:eq(1)'));
	 *
	 * Get the current selected element:
	 *
	 *     selectable.selected()
	 *
	 * @param {jQuery} el - the element to select.
	 * @param {Boolean} [autoFocus=false] should the selected element be
	 * focused.  It's focused if the user is using keyboard navigation.
	 */
	selected : function(el, autoFocus){
		// get old selected
		// if getter
		if(!el){
			return this._getSelected();
		}else{
			//we are setting ...
			el = $(el);
			
			// don't need to deselect, this will be done by select event
			
			// set new selected, don't set class, done by trigger
			this._selected = el;
			
			// if we should focus
			if(autoFocus === true){
				el[0].focus()
			}
			
			//add select event
			el.trigger("select", el.model && el.model());
		}
	},
	// deselects the selected
	deselected : function(){
		this._getSelected().trigger("deselect");
	},
	/**
	 * Activates an element.
	 * 
	 *     var selectable = new can.ui.Selectable('#selectable');
	 *     selectable.activated($('.selectable:eq(1)'));
	 * 
	 * @param {jQuery} el the jQuery-wrapped element to select
	 * @param {Event} [ev] an event used to test if ctrlKey or shiftKey was held.
	 */
	activated : function(el, ev){
		ev = ev || {};
		// if we should only select one element ...
		if(!this.options.multiActivate || (!ev.shiftKey && !ev.ctrlKey)){
			// remove the old activated ...
			this.element
				.find("." + this.options.activatedClassName)
				.trigger('deactivate');
			
			// activate the new one
			
			el.trigger("activate", el.models ? [el.models()] : [el]);
			
		}else if(ev.ctrlKey){ // if we add to the 'activated' list
			
			// Toggle
			if(el.hasClass(this.options.activatedClassName)){
				el.trigger("deactivate");
			}else{
				var activated = this.element.find("."+this.options.activatedClassName);
				if(el.models){
					el.trigger("activate", [ activated.add(el).models() ]);
				}else{
					el.trigger("activate", [ activated.add(el) ]);
				}
				
			}
		}else if(ev.shiftKey){
			
			// Find everything between and activate
			var selectable = this.element.find( this.options.selectOn+":visible"),
				found = false,
				lastSelected= this.lastSelected,
				activated = $().add(el).add(lastSelected);
				
			if(lastSelected.length && lastSelected[0] != el[0]){
				for(var i =0; i < selectable.length;i++){
					var select = selectable[i];
					if( select ===  lastSelected[0] || select == el[0] ){
						if(!found){
							found = true;
						}else{
							break;
						}
					}else if(found){
						activated.push(select)
					}
				}
			}
			activated.addClass(this.options.activatedClassName)
			el.trigger("activate",el.models ? 
					[activated.models()] :
					[activated]);
		}
	},
	// determines if the mouse event was 
	ifKeying : function(ev){
		return this.keying;
	},
    "{selectOn} mouseenter": function(el, ev){
        
		if(! this.ifKeying(ev) ){
			this.selected(el, false);
		}
    },
	
	"{selectOn} mouseleave" : function(el, ev){
		if(! this.ifKeying(ev) ) {
			
			// deselect if we haven't focused, or we are 
			// leaving something not the focused element
			if(!this._focused ){ //make sure it's deselected
				this.deselected();
			}
			
		}
	},
    "{selectOn} click": function(el, ev){
		this.activated(el, ev);
		
    },
    "{selectOn} focusin": function(el, ev){
		this.times = !this.times ? 1 : this.times + 1;
        
		this.selected(el, false);
		this._focused = el;
    },
	"{selectOn} focusout": function(el, ev){
		this._focused = null;
		// we are not in the element, and we are not focused on anything
		if(!this.mousein){
			this.deselected();
		}
    },
    "{selectOn} activate": function(el, ev, keys){
        // if event is synthetic (not IE native activate event)
		el.addClass(this.options.activatedClassName);
		this.lastSelected = el;
		
    },
    "{selectOn} deactivate": function(el, ev){
        // if event is synthetic (not IE native deactivate event)
        if (!ev.originalEvent) {
			el.removeClass(this.options.activatedClassName);
		}
    },
    "{selectOn} select" : function(el, ev){
		var selected = this.element.find( "."+this.options.selectedClassName ).not(el);
        if (selected.length) {
            selected.trigger('deselect');
        }
        el.addClass( this.options.selectedClassName );
    },
    "{selectOn} deselect": function(el, ev){
        el.removeClass( this.options.selectedClassName );
    },
    "{selectOn} keydown": function(el, ev){
		// we are keying, this means we dont
		// accept mouse select events w/o a move

		// set keying for a brief time.
		// this is to support when keying scrolls.
		var key = ev.keyName()
		if(/down|up|right|left/.test(key)){
			var nextEl = this.moveTo(el, key);
			
			this.selected(nextEl, true);
			ev.preventDefault();
			this.keying = true;
			setTimeout(this.proxy(function(){
				this.keying = false;
			}),100)
		} else  if(key == "\r") {
			this.activated(el, ev);
			this.keying = true;
			setTimeout(this.proxy(function(){
				this.keying = false;
			}),100)
		} 
    },
	cache : function(){
		this._cache = this.element.find(this.options.selectOn);
	},
	selectable : function(){
		return this._cache ?
				this._cache.filter(":visible") :
				this.element.find(this.options.selectOn+":visible")
	},
	moveTo : function(current, dir, selectables){
		// go forward and backwards ... if xtest or ytest
		// returns a function that returns the abs diff between 2 dimensions
		var abs = function(dir){
			return function(current, el){
				return Math.abs(current[dir] - el[dir])
			}
		};
		// returns the difference of a direction
		// way - true - current - el
		//     - false - el - current
		var diff = function(dir, way){
			return function(current, el){
				return way ?  current[dir] - el[dir] : el[dir] - current[dir];
			}
		}
		var xtest, ytest, traverse;
		if(dir == "right"){
			dirtest = diff("left",false);
			closetest = abs("top");
			traverse = 1
		} else if(dir == "left"){
			dirtest = diff("left",true);
			closetest = abs("top");
			traverse = -1
		} else if(dir == "up"){
			closetest = abs("left");
			dirtest = diff("top",true);
			traverse = -1
		} else if(dir == 'down') {
			closetest = abs("left");
			dirtest = diff("top",false);
			traverse = 1
		}
		
		// now, go traverse direction.   
		// if dirtest > 0, keep that value, stop once it is again > new value
		// then get the lowest value of close test
		
		var currentOffset = current.offset(),
			el,
			elOffset,
			els = selectables || this.selectable(),
			index= els.index(current),
			i,
			min = Infinity,
			minEl,
			dist,
			close;
		
		
		
		for(i = index+traverse;i < els.length && i >= 0; i = i + traverse){
			
			var el = els.eq(i),
				elOffset = el.offset()
				res = dirtest( currentOffset, elOffset );
			// if we havent set dist, and res is > 5 set it to dist
			// 5 is basically a threshold for weirdness
			if(!dist && res > 5){
				dist = res;
			}
			// if we are on the 2nd level
			if(dist && Math.abs(res - dist) > 5){
				break;
			}
			if(dist){
				close = closetest(currentOffset,elOffset )
				if(close < min){
					min = close;
					minEl = el;
				}
			}
		}
		if(minEl){
			return minEl;
		}
		
		// we don't have a min el ... now we need to wrap?
		if(traverse == 1){ // going down or right, pick the next element or the first
			if(index >= els.length -1){
				// no one to the right
				return els.eq(0)
			} else {
				return els.eq(index+1)
			}
		} else {
			if(index == 0){
				return els.eq(els.length-1)
			} else {
				return els.eq(index-1)
			}
		}
		
		
		// now select
	}
});

})(jQuery);
(function( $ ) {
		
	var	prefixes = ' -webkit- -moz- -o- -ms- -khtml-'.split(' '),
		supportsTransitions = (function() {
			var elem = $("<div />"),
				support = false;
			$.each(prefixes, function( i, prefix ) {
				var prop = prefix + "transition",
					value = "all 1s ease-in-out";
				elem.css( prop, value );
				if ( elem.css( prop ) == value ) {
					support = true;
					return false;
				}
			});
			return support;
		}());


	can.Control("can.ui.Tooltip", {
		positions: {
			n : {
				my: "bottom",
				at: "top",
				arrowClass: "down",
				arrowMargin: "margin-left"
			},
			e : {
				my: "left",
				at: "right",
				arrowClass: "left",
				arrowMargin: "margin-top"
			},
			w : {
				my: "right",
				at: "left",
				arrowClass: "right",
				arrowMargin: "margin-top"
			},
			s : {
				my: "top",
				at: "bottom",
				arrowClass: "up",
				arrowMargin: "margin-left"
			}
		},
		defaults: {
			theme: "error",
			showEvent: "mouseenter",
			hideEvent: "mouseleave",
			showEffect: "show",
			hideEffect: "fadeOut",
			showTimeout: 200,
			hideTimeout: 500,
			showTimeoutId: null,
			hideTimeoutId: null,
			position: "n"
		}
	}, {

		setup : function( el, options ) {
			options = $.extend( this.constructor.defaults, options || {} );
			options.$ = {
				tooltip : $( can.view( "./views/tooltip.ejs", options ) )
			}
			$.each( ["outer", "inner", "arrow"], this.proxy( function( i, className ) {
				options.$[ className ] = options.$.tooltip.find( "." + className );
			}));
			this._super( el, options );
		},


		init : function() {


			// save references to each compontent of the tooltip

			// Append template to the offset parent
			this.element.offsetParent().append( this.options.$.tooltip );

			// Spacing for arrows and stuff is calculated off the margin,
			// perhaps should be changed to a setting
			this.space = parseInt( this.options.$.outer.css("margin-left"), 10 );

			// Position tooltip
			this.determinePosition();
			this.setPosition();

			$.each( ["width", "height"], this.proxy( function( i, dim ) {
				this.options.$.tooltip[ dim ]( this.options.$.tooltip[ dim ]() );
			}));

			this.options.$.tooltip.css({
				display: this.options.showEvent ? "none" : "block",
				visibility: "visible"
			});


			// Set up transitions
			if ( supportsTransitions ) {
				setTimeout( this.proxy( function() {
					$.each(prefixes, this.proxy( function( i, prefix ) {
						this.options.$.tooltip.css( prefix + "transition", "top .5s ease-in-out, left .5s ease-in-out" );
					}));
				}), 0);
			}
		},

		"{$.tooltip} mouseenter" : function() {
			if ( this.options.showEvent == "mouseenter" ) {
				this.show();
			}
		},

		"{$.tooltip} mouseleave" : function() {
			if ( this.options.showEvent == "mouseenter" ) {
				this.hide();
			}
		},

		determineCorners: function() {
			var arrowSpacing = this.space * 2,
				offsetSpacing = this.space * 4;

			this.corners= {
				ne: {
					arrowCss: {
						left: arrowSpacing
					},
					offset : [ -( offsetSpacing ), 0 ]
				},
				en: {
					arrowCss: {
						top : "initial",
						bottom: arrowSpacing
					},
					offset : [ 0, ( offsetSpacing ) ]
				},
				es: {
					arrowCss: {
						bottom : "initial",
						top: arrowSpacing
					},
					offset : [ 0, -( offsetSpacing ) ]
				},
				se: {
					arrowCss: {
						left: arrowSpacing
					},
					offset : [ -( offsetSpacing ), 0 ]
				},
				sw: {
					arrowCss: {
						right: arrowSpacing,
						left: "initial"
					},
					offset : [ ( offsetSpacing ), 0 ]
				},
				ws: {
					arrowCss: {
						bottom : "initial",
						top: arrowSpacing
					},
					offset : [ 0, -( offsetSpacing ) ]
				},
				wn: {
					arrowCss: {
						top: "initial",
						bottom: arrowSpacing
					},
					offset : [ 0, ( offsetSpacing ) ]
				},
				nw: {
					arrowCss: {
						right: arrowSpacing,
						left: "initial"
					},
					offset : [ ( offsetSpacing ), 0 ]
				}
			}
		},

		determinePosition: function() {

			var parts = "my at".split(" "),
				positionArrays = {
					my : [],
					at : []
				},
				position = {};

			// ZOMG double each, thats like, O(n^2)
			$.each( parts, this.proxy( function( i, part ) {
				$.each( this.options.position.split(""), function( i, c ) {
					positionArrays[part].push( can.ui.Tooltip.positions[ c ][part] );
				});

				// Have to do this craziness because the jQuery UI position
				// plugin requires position to be in the format of
				// "horizontal vertical" :/
				position[part] = (/left|right/.test( positionArrays[part][0] ) ?
					positionArrays[part] : 
					positionArrays[part].reverse()
					).join(" ");
			} ));

			this.position = $.extend({},
				can.ui.Tooltip.positions[ this.options.position.charAt(0) ],
				position
			);

			this.options.$
				.arrow
				.addClass( this.position.arrowClass )
				.css( "border-width", this.space )

			this.determineCorners();

			if ( positionArrays.my.length == 2 ) {
				this.options.$.arrow.css( this.corners[ this.options.position ].arrowCss );
				$.extend( this.position, {
					offset : this.corners[ this.options.position ].offset.join(" ")
				});
			} else {
				this.options.$.arrow.css( this.position.arrowMargin, "-" + this.space + "px");
			}

		},

		setPosition: function() {
			var isHidden = this.options.$.tooltip.css("display") == "none", positionable;

			if ( isHidden ) {
				this.options.$.tooltip.css({
					visibility: "hidden",
					display: "block"
				})

				positionable = new can.ui.layout.Positionable(this.options.$.tooltip,
					$.extend({
						of : this.element,
						collision : "none"
					}, this.position )
				);

				this.options.$.tooltip.css({
					visibility: "visible",
					display: "none"
				})
			} else {
				positionable = new can.ui.layout.Positionable(this.options.$.tooltip,
					$.extend({
						of : this.element,
						collision : "none",
						using: this.proxy( function( pos ) {
							this.options.$.tooltip.stop( true, false )[ supportsTransitions ? "css" : "animate" ]( pos );
						})
					}, this.position )
				);
			}
			positionable.move();
		},

		show : function() {
			clearTimeout( this.options.hideTimeoutId );
			this.options.$.tooltip.stop( true, true )[ this.options.showEffect ]();
		},

		hide : function() {
			this.options.hideTimeoutId = setTimeout(this.proxy( function() {
				this.options.$.tooltip[ this.options.hideEffect ]();
			}), this.options.hidetimeout );
		},

		"{showEvent}" : function() {
			this.show();
		},

		"{hideEvent}" : function() {
			this.hide();
		},

		"destroy" : function() {
			this.options.$.tooltip.remove();
			delete this.options.$;
			this._super();
		},

		"{window} resize" : (function() {
			var timeout;
			return function() {
				clearTimeout( timeout );
				setTimeout( this.proxy( this.callback("setPosition")), 100 );
			}
		}())
	});

})(jQuery);
(function( $ ) {

	/**
	 * @class can.ui.Split
	 * @parent canui
	 * @test canui/layout/split/funcunit.html
	 * 
	 * @description Makes a splitter widget.
	 * 
	 * The splitter widget manages a container whose content "panels" can be independently resized. It
	 * does this by inserting a "splitter bar" between each panel element, which can be dragged or
	 * optionally collapsed.
	 * 
	 * Panel elements can be added or removed from the container at any time using ordinary DOM manipulation.
	 * The spliter widget will automatically adjust the splitter bars anytime a `resize` event is triggered.
	 * 
	 * The splitter widget will try to auto-detect whether it should operate in `vertical` or `horizontal`
	 * mode by inspecting the positions of its first two elements. If the panels can wrap due to floating
	 * content, or the container does not have two elements at initialization time, this check may be
	 * unreliable, so just pass the direction in the options.
	 * 
	 * ## Basics
	 * 
	 * Suppose you have this HTML:
	 *
	 *     <div id="container">
	 *       <div class="panel">Content 1</div>
	 *       <div class="panel">Content 2</div>
	 *       <div class="panel">Content 3</div>
	 *     </div>
	 * 
	 * The following will create the splitter widget:
	 * 
	 *     new can.ui.Split($('#container'));
	 * 
	 * You can also provide the direction explicitly:
	 * 
	 *     new can.ui.Split($('#container'), { direction: 'vertical' });
	 * 
	 * The `direction` parameter refers to the splitter bar: `vertical` bars mean that the panels are arranged
	 * from left-to-right, and `horizontal` bars mean the panels are arranged from top-to-bottom.
	 * 
	 * To indicate that a panel should be collapsible, simply apply the <code>collapsible</code> CSS class
	 * to the panel.
	 * 
	 * ## Styling
	 * 
	 * The splitter widget uses a number of CSS classes that permit fine-grained control over the look
	 * and feel of various elements. The most commonly used are the following:
	 * 
	 *   - `.can_ui_layout_split`: the container itself
	 *     - `.splitter`: splitter bars
	 *     - `.vsplitter`: only vertical splitter bars
	 *     - `.hsplitter`: only horizontal splitter bars
	 *     - `.collapser`: collapser buttons
	 *     - `.left-collapse`: only left collapser buttons
	 *     - `.right-collapse`: only right collapser buttons
	 * 
	 * You can see the standard styles for the splitter widget
	 * [https://github.com/jupiterjs/canui/blob/master/layout/split/split.css here].
	 * 
	 * Additionally, the `panelClass` initialization option allows you to specify which subelements of
	 * the container should be interpreted as panel elements, and the `hover` option specifies a CSS class
	 * which will be applied to a splitter when the user hovers over it.
	 * 
	 * ## Events
	 * 
	 * The splitter widget responds to the [jQuery.event.special.resize resize] event by performing a quick
	 * check to see if any panel elements have been inserted or removed, and updating its internal
	 * state to reflect the changes. Simply add or remove whatever panel elements you wish from the DOM
	 * using any appropriate jQuery methods, and then trigger the `resize` event on it:
	 * 
	 *     var container = $('#container');
	 *     container.append($('<div class="panel">New Content</div>'));
	 *     container.find('.panel:first').remove();
	 *     container.resize();
	 * 
	 * ## Demo
	 * 
	 * @demo canui/layout/split/demo.html
	 * 
	 * ## More Examples
	 * 
	 * For some larger, more complex examples, see [//canui/layout/split/split.html here].
	 * 
	 * @param {HTMLElement} element an HTMLElement or jQuery-wrapped element.
	 * @param {Object} options options to set on the split:
	 * 
	 *   - __hover__ (def. `"split-hover"`) - CSS class to apply to a splitter when the mouse enters it
	 *   - __direction__ - whether the panel layout is `"vertical"` or `"horizontal"` (see above)
	 *   - __dragDistance__ (def. `5`) - maximum number of pixels away from the slider to initiate a drag
	 *   - __panelClass__ - CSS class that indicates a child element is a panel of this container
	 *      					(by default any child is considered a panel)
	 * @return {can.ui.Split}
	 */
	can.Control("can.ui.Split",
	/** 
	 * @static
	 */
	{
		defaults: {
			active: "active",
			hover: "split-hover",
			splitter: "splitter",
			direction: null,
			dragDistance: 5,
			panelClass: null,
			locale:{
				collaspe: "Click to collapse",
				expand: "Click to expand"
			}
		},
		listensTo: ['resize'],
		directionMap: {
			vertical: {
				dim: "width",
				cap: "Width",
				outer: "outerWidth",
				pos: "left",
				dragDir: "horizontal"
			},
			horizontal: {
				dim: "height",
				cap: "Height",
				outer: "outerHeight",
				pos: "top",
				dragDir: "vertical"
			}
		}
	},
	/** 
	 * @prototype
	 */
	{
		/**
		 * @hide
		 * Init method called by CanJS base control.
		 */
		init: function() {
			var c = this.panels();

			//- Determine direction.  
			//- TODO: Figure out better way to measure this since if its floating the panels and the 
			//- width of the combined panels exceeds the parent container, it won't determine this correctly.
			if (!this.options.direction ) {
				this.options.direction = c.eq(0).position().top == c.eq(1).position().top ? "vertical" : "horizontal";
			}

			$.Drag.distance = this.options.dragDistance;
			this.dirs = this.constructor.directionMap[this.options.direction];
			this.usingAbsPos = c.eq(0).css('position') == "absolute";
			
			if(this.usingAbsPos){
				if(!/absolute|relative|fixed/.test(this.element.css('position'))){
					this.element.css('position','relative')
				}
			}
			
			this.element.css('overflow', 'hidden');
			this.initalSetup(c);
		},

		/**
		 * @hide
		 * Sizes the split bar and split elements initially.  This is 
		 * different from size in that fact
		 * that initial size retains the elements widths and resizes 
		 * what can't fit to be within the parent dims.
		 * @param {Object} c
		 */
		initalSetup: function( c ) {
			//- Insert the splitter bars
			for ( var i = 0; i < c.length - 1; i++ ) {
				var $c = $(c[i]),
					$cCollasible = $c.hasClass('collapsible'),
					$cCollapsed = $c.hasClass('collapsed'),
					$nxt = $(c[i + 1]),
					$nxtCollasible = $nxt.hasClass('collapsible'),
					$nxtCollapsed = $nxt.hasClass('collapsed'),
					dir, txt;
					
				if($cCollasible && !$cCollapsed){
					txt = this.options.locale.collaspe;
				} else {
					txt = this.options.locale.expand;
				}
					
				if(($cCollasible && !$cCollapsed) || ($nxtCollasible && $nxtCollapsed)){
					dir = "left";
					
				} else if(($nxtCollasible && !$nxtCollapsed) || ($cCollasible && $cCollapsed)){
					dir = "right";
				}
				
				$c.after(this.splitterEl(dir, txt));
			}

			var splitters = this.element.children(".splitter"),
				splitterDim = splitters[this.dirs.outer](),
				// why is this calculated and not used
				total = this.element[this.dirs.dim]() - splitterDim * (c.length - 1),
				pHeight = this.element.height();


			//- If its vertical, we need to set the height of the split bar
			if ( this.options.direction == "vertical" ) {
				splitters.height(pHeight);
			}

			//- Size the elements				  
			for ( var i = 0; i < c.length; i++ ) {
				var $c = $(c[i]);
				
				// store in data for faster lookup
				$c.data("split-min-" + this.dirs.dim, parseInt($c.css('min-' + this.dirs.dim)));
				$c.addClass("split");
			}

			//- Keep track of panels so that resize event is aware of panels that have been added/removed
			this._cachedPanels = this.panels().get();

			this.size();
		},

		/**
		 * @hide
		 * Appends a split bar.
		 * @param {Object} dir
		 */
		splitterEl: function( dir,txt ) {
			var splitter = $("<div class='" + this.options.direction.substr(0, 1) + "splitter splitter' tabindex='0'>")
							.css("position", this.usingAbsPos ? "absolute" : "relative");

			if ( dir ) {
				splitter.append("<a title='" + txt + "' class='" + dir + "-collapse collapser' href='javascript://'></a>")
			}

			return splitter;
		},

		/**
		 * Returns all the panels managed by this controller.
		 * 
		 * Given a `container`, iterate over its panels and collect their content:
		 * 
		 *     var content = '';
		 *     var split = new can.ui.Split('#container');
		 *     split.panels().each(function(el){
		 *       content += el.text();
		 *     });
		 * 
		 * @return {jQuery} Returns a jQuery-wrapped nodelist of elements that are panels of this container.
		 */
		panels: function() {
			return this.element.children((this.options.panelClass ? "." + this.options.panelClass : "") + ":not(.splitter)")
		},

		".splitter mouseenter": function( el, ev ) {
			if (!this.dragging ) {
				el.addClass(this.options.hover)
			}
		},

		".splitter mouseleave": function( el, ev ) {
			if (!this.dragging ) {
				el.removeClass(this.options.hover)
			}
		},

		".splitter keydown": function( el, ev ) {
			var offset = el.offset();
			switch ( ev.keyName() ) {
			case 'right':
				this.moveTo(el, offset.left + 1);
				break;
			case 'left':
				this.moveTo(el, offset.left - 1);
				break;
			case '\r':
				this.toggleCollapse(el);
				break;
			}
		},

		".splitter draginit": function( el, ev, drag ) {
			drag.noSelection();
			drag.limit(this.element);

			// limit motion to one direction
			drag[this.dirs.dragDir]();
			var hoverClass = this.options.hover;
			el.addClass("move").addClass(this.options.hover);
			this.moveCache = this._makeCache(el);
			
			if(this.moveCache.next.hasClass('collapsed') 
			|| this.moveCache.prev.hasClass('collapsed')){
				el.addClass('disabled');
				drag.cancel();
				
				setTimeout(function(){ el.removeClass('disabled')
										 .removeClass("move")
										 .removeClass(hoverClass); }, 800);
			} else {
				this.dragging = true;
			}
		},

		/**
		 * @hide
		 * Internal method for getting the cache info for an element
		 * @param {Object} el
		 */
		_makeCache: function( el ) {
			var next = el.next(),
				prev = el.prev();
			return {
				offset: el.offset()[this.dirs.pos],
				next: next,
				prev: prev,
				nextD: next[this.dirs.dim](),
				prevD: prev[this.dirs.dim]()
			};
		},

		/**
		 * @hide
		 * Moves a slider to a specific offset in the page
		 * @param {jQuery} el
		 * @param {Number} newOffset The location in the page in the direction the slider moves
		 * @param {Object} [cache] A cache of dimensions data to make things run faster (esp for drag/drop). It looks like
		 * 
		 *     {
		 *       offset: {top: 200, left: 200},
		 *       prev: 400, // width or height of the previous element
		 *       next: 200  // width or height of the next element
		 *     }
		 * @return {Boolean} false if unable to move
		 */
		moveTo: function( el, newOffset, cache ) {
			cache = cache || this._makeCache(el);

			var prevOffset = cache.offset,
				delta = newOffset - prevOffset || 0,
				prev = cache.prev,
				next = cache.next,
				prevD = cache.prevD,
				nextD = cache.nextD,
				prevMin = prev.data("split-min-" + this.dirs.dim),
				nextMin = next.data("split-min-" + this.dirs.dim);

			// we need to check the 'getting smaller' side
			if ( delta > 0 && (nextD - delta < nextMin) ) {
				return false;
			} else if ( delta < 0 && (prevD + delta < prevMin) ) {
				return false;
			}

			// make sure we can't go smaller than the right's min
			if ( delta > 0 ) {
				next[this.dirs.dim](nextD - delta);
				prev[this.dirs.dim](prevD + delta);
			} else {
				prev[this.dirs.dim](prevD + delta);
				next[this.dirs.dim](nextD - delta);
			}

			if ( this.usingAbsPos ) {
				//- Sets the split bar element's offset relative to parents
				var newOff = $(el).offset();
				newOff[this.dirs.pos] = newOffset;
				el.offset(newOff);
				
				//- Sets the next elements offset relative to parents
				var off = next.offset();
				off[this.dirs.pos] = newOffset + el[this.dirs.outer]();
				next.offset(off);
			}

			// this can / should be throttled
			clearTimeout(this._moveTimer);
			this._moveTimer = setTimeout(function() {
				prev.trigger("resize",[false]);
				next.trigger("resize",[false]);
			}, 1);
		},

		".splitter dragmove": function( el, ev, drag ) {
			var moved = this.moveTo(el, drag.location[this.dirs.pos](), this.moveCache)

			if ( moved === false ) {
				ev.preventDefault();
			}
		},

		".splitter dragend": function( el, ev, drag ) {
			this.dragging = false;
			el.removeClass(this.options.hover)
			drag.selection();
		},

		/**
		 * @hide
		 * Resizes the panels.
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} data
		 */
		resize: function( el, ev, data ) {
			if(!this.element.is(":visible")){
				return;
			}
			
			var changed = this.refresh(),
				refreshed = ( !! changed.inserted.length || changed.removed ),
				keepEl = data && data.keep;
			if ( ! keepEl && changed.inserted.length ){
				// if no keep element was provided, and at least one element was inserted,
				// keep the first inserted element's dimensions/position
				keepEl = $(changed.inserted.get(0));
			}
			
			// if not visible do nothing
			if (!this.element.is(":visible") ) {
				this.oldHeight = this.oldWidth = 0;
				return;
			}

			if (!(data && data.force === true) && !this.forceNext && !refreshed) {
				var h = this.element.height(),
					w = this.element.width();
				if ( this.oldHeight == h && this.oldWidth == w && !this.needsSize) {
					ev.stopPropagation();
					return;
				}
				this.oldHeight = h;
				this.oldWidth = w;
			}

			this.forceNext = false;
			this.size(null, null, keepEl, false);
		},

		/**
		 * @hide
		 * Refresh the state of the container by handling any panels that have been added or removed.
		 */
		refresh: function(){
			var changed = {
				inserted: this.insert(),
				removed: this.remove()
			};
			this._cachedPanels = this.panels().get();
			return changed;
		},

		/**
		 * @hide
		 * Handles the insertion of new panels into the container.
		 * @param {jQuery} panel
		 */
		insert: function(){
			var self = this,
				//cached = this._cachedPanels,
				panels = this.panels().get(),
				inserted = [];
			
			$.each(panels, function(_, panel){
				panel = $(panel);
				
				if( !panel.hasClass('split') ){
					panel.before(self.splitterEl(panel.hasClass('collapsible') && 'right'))
						.addClass('split')
					
					inserted.push(panel);
					
					if ( self.options.direction == 'vertical' ) {
						var splitBar = panel.prev(),
							pHeight = self.element.height();

						splitBar.height(pHeight);
						panel.height(pHeight);
					}
				}
			});
			
			return $(inserted);
		},
		
		/**
		 * @hide
		 * Handles the removal of a panel from the container.
		 * @param {jQuery} panel
		 */
		remove: function(){
			var self = this,
				splitters = this.element.children('.splitter'),
				removed = [];
			
			$.each(splitters, function(_, splitter){
				splitter = $(splitter);
				
				var prev = $(splitter).prev(),
					next = $(splitter).next();
				
				if( !prev.length || !next.length || next.hasClass('splitter') ){
					removed.push( splitter[0] );
				}
			});
			
			if( removed.length ){
				$(removed).remove();
				return true;
			}
		},

		".collapser click": function( el, event ) {
			this.toggleCollapse(el.parent());
		},

		/**
		 * @hide
		 * Given a splitter bar element, collapses the appropriate panel.
		 * @param {Object} el
		 */
		toggleCollapse: function( splitBar ) {
			// check the next and prev element should be collapsed
			var prevElm = splitBar.prev(),
				nextElm = splitBar.next(),
				elmToTakeActionOn = (prevElm.hasClass('collapsible') && prevElm) || (nextElm.hasClass('collapsible') && nextElm);
				
			if (!elmToTakeActionOn ) {
				return;
			}

			if (!elmToTakeActionOn.is(':visible') ) {
				this.showPanel(elmToTakeActionOn);
				splitBar.find('a').attr('title', this.options.locale.collaspe);
			} else {
				this.hidePanel(elmToTakeActionOn, true);
				splitBar.find('a').attr('title', this.options.locale.expand);
			}
			
			splitBar.children().toggleClass('left-collapse').toggleClass('right-collapse');
		},

		/**
		 * Shows a panel that is currently hidden.
		 * 
		 * Given some `container`, cause its last panel to be shown:
		 * 
		 *     split.showPanel(container.find('.panel:last'));
		 *
		 * @param {Object} panel
		 * @param {Object} width
		 */
		showPanel: function( panel, width ) {
			if (!panel.is(':visible') ) {

				if ( width ) {
					panel.width(width);
				}

				panel.show();
				panel.removeClass('collapsed');
				panel.trigger('toggle', true)

				var prevElm = panel.prev();
				if ( prevElm.hasClass('splitter') ) {
					prevElm.show();
				} else {
					//- if it was hidden by start, it didn't get a 
					//- splitter added so we need to add one here
					panel.before(this.splitterEl(
					prevElm.hasClass('collapsible') ? "left" : (
					panel.hasClass('collapsible') ? "right" : undefined)));
				}

				this.size(null, false, panel);
			}
		},

		/**
		 * Hides a panel that is currently visible.
		 * 
		 * Given some `container`, cause its last panel to be hidden:
		 * 
		 *     split.hidePanel(container.find('.panel:last'));
		 *
		 * @param {Object} panel
		 * @param {Object} keepSplitter
		 */
		hidePanel: function( panel, keepSplitter ) {
			if ( panel.is(':visible') || panel.hasClass('collapsed') ) {
				panel.hide();
				panel.addClass('collapsed');
				panel.trigger('toggle', false)

				if (!keepSplitter ) {
					panel.prev().hide();
				}

				this.size();
			}
		},

		/**
		 * @hide
		 * Takes elements and animates them to the right size.
		 * @param {jQuery} [els] child elements
		 * @param {Boolean} [animate] animate the change
		 * @param {jQuery} [keep] keep this element's width / height the same
		 * @param {Boolean} [resizePanels] resize the panels or not.
		 */
		size: function( els, animate, keep, resizePanels ) {
			els = els || this.panels();
			resizePanels = resizePanels == undefined ? true : false;

			var space = this.element[this.dirs.dim](),
				splitters = this.element.children(".splitter:visible"),
				splitterDim = splitters[this.dirs.outer](),
				total = space - (splitterDim * splitters.length),
				// rounding remainder
				remainder = 0,
				dims = [],
				newDims = [],
				sum = 0,
				i, $c, dim, increase, keepSized = false,
				curLeft = 0,
				index, rawDim, newDim, pHeight = this.element.height(),
				pWidth = this.element.width(),
				length, 
				start,
				keepIndex = keep ? els.index(keep[0]) : -1;

			// if splitters are filling the entire width, it probably means the 
			// style has not loaded
			// this should be fixed by steal, but IE sucks
			if(splitterDim === space){
				this.needsSize = true;
				return;
			} else {
				this.needsSize = false;
			}

			// adjust total by the dimensions of the element whose size we want to keep
			if ( keep ) {
				total = total - $(keep)[this.dirs.outer]();
			}

			length = els.length;
			start = Math.floor(Math.random() * length);

			// round down b/c some browsers don't like fractional dimensions
			total = Math.floor(total);

			//calculate current percentage of height
			for ( i = 0; i < length; i++ ) {
				$c = $(els[i]);
				dim = $c.hasClass('collapsed') ? 0 : $c[this.dirs.outer](true);
				dims.push(dim);
				if( keepIndex !== i ) {
					sum += dim;
				}
			}

			increase = total / sum;

			// this randomly adjusts sizes so scaling is approximately equal
			for ( i = start; i < length + start; i++ ) {
				index = i >= length ? i - length : i;
				dim = dims[index];
				rawDim = (dim * increase) + remainder;
				newDim = (i == length + start - 1 ? total : Math.round(rawDim));
				
				if (keepIndex == i) {
					// if we're keeping this element's size, use the original dimensions
					newDims[index] = dim;
				} else {
					// use the adjusted dimensions
					newDims[index] = newDim;
					total = total - newDim;
				}
			}

			//resize splitters to new height if vertical (horizontal will automatically be the right width)
			if ( this.options.direction == "vertical" ) {
				splitters.height(pHeight);
			}

			// Adjust widths for each pane and account for rounding
			for ( i = 0; i < length; i++ ) {
				$c = $(els[i]);

				var minWidth = $c.data("split-min-width") || 0,
					minHeight = $c.data("split-min-height") || 0,
					dim = this.options.direction == "horizontal" ? {
						outerHeight: Math.max( newDims[i], minHeight ),
						outerWidth: Math.max( pWidth, minWidth )
					} : {
						outerWidth: Math.max( newDims[i], minWidth ),
						outerHeight: Math.max( pHeight, minHeight )
					};
					
				if($c.hasClass('collapsed')){
					if(this.options.direction == "horizontal"){
						dim.outerHeight = 0;
					} else {
						dim.outerWidth = 0;
					}
				}
				
				// Only resize panels that are actually visible, otherwise leave the dimensions of the panel alone 
				if ($c.is(':visible')) {
					if ( animate && !this.usingAbsPos ) {
						$c.animate(dim, "fast", function() {
							if ( resizePanels ) {
								$(this).trigger('resize', [false]);
							}

							if ( keep && !keepSized ) {
								keep.trigger('resize', [false])
								keepSized = true;
							}
						});
					}
					else {
						$c.outerHeight(dim.outerHeight).outerWidth(dim.outerWidth);

						if ( resizePanels ) {
							$c.trigger('resize', [false]);
						}
					}
				}

				// adjust positions if absolutely positioned
				if ( this.usingAbsPos ) {
					//set splitter in the right spot
					$c.css(this.dirs.pos, curLeft)
					splitters.eq(i).css(this.dirs.pos, curLeft + newDims[i])
				}
				// move the next location
				curLeft = curLeft + newDims[i] + splitterDim;
			}
		}
	})
})(jQuery);
(function() {

	/**
	 * @class can.ui.Slider
	 * @test canui/slider/slider_test.js
	 * @parent canui
	 *
	 * @description Creates a slider with `min`, `max` and `interval` options.
	 * Creates a slider with `min`, `max` and `interval` options.
	 *
	 * Given the following markup:
	 *
	 *		<div class="container">
	 *			<div id="slider"></div>
	 *		</div>
	 *
	 * You can create a slider with the following code:
	 *
	 *      var slider = new can.ui.Slider($('#slider'), {
	 *			interval: 1, 
	 *			min: 1, 
	 *			max: 10, 
	 *			val: 4
	 *		});
	 *
	 *	The targeted element then becomes a draggable box within the bounding
	 *	box of it's parent element. You can then call the val method to
	 *	retrieve it's current value:
	 *
	 *	    slider.val() // 4
	 *
	 *	You can also use the `val` method as a setter:
	 *
	 *		slider.val(6)
	 *
	 *	Alternatively, you can subscribe to the `change` event on the slider,
	 *	which will pass the value as the second argument to the event handler.
	 *
	 *		$("#slider").change(function( e, value ) {
	 *			value; // 6
	 *		});
	 *
	 * ## Demo
	 * @demo canui/nav/slider/slider.html
	 *
	 * @param {Object} options - An object literal describing the range,
	 * interval and starting value of the slider
	 *
	 *	- `min` {Number} - The minimum value the slider can go down to.
	 *	- `max` {Number} - The maximum value the slider can go up to.
	 *	- `interval` {Number} - The step size that the slider should increment
	 *	by when being moved.	
	 *	- `val` {Number} - The initial starting value of the slider.
	 */
	can.Control("can.ui.Slider",
		/**
		 * @hide
		 * @static
		 */
	{
		defaults: {
			min: 0,
			max: 10,
			step : 1,
			// if the slider is contained in the parent
			contained : true,
			val : undefined
		}
	}, 
	/**
	 * @prototype
	 */
	{		
		init: function() {
			this.element.css("position", 'relative');
			// convert options to computed
			for(var optionName in this.options){
				this.options[optionName] = can.compute(this.options[optionName])
			}
			// rebind
			this.on();
			if ( this.options.val() ) {
				this.updatePosition()
			}
		},
		resize: function() {
			this.updatePosition();
		},
		getDimensions: function() {
			var spots = this.options.max() - this.options.min() + 1,
				parent = this.element.parent(),
				outerWidth = this.element.outerWidth(),
				styles, leftSpace;

			this.widthToMove = parent.width() - outerWidth;
			this.widthOfSpot = this.widthToMove / (spots - 1);

			styles = parent.styles("borderLeftWidth", "paddingLeft");
			leftSpace = parseInt(styles.borderLeftWidth) + parseInt(styles.paddingLeft) || 0;
			this.leftStart = parent.offset().left + leftSpace - (this.options.contained() ? 0 : Math.round(outerWidth / 2));
		},
		"draginit": function( el, ev, drag ) {
			this.getDimensions();
			drag.limit(this.element.parent(), this.options.contained ? undefined : "width")
				.step(this.widthOfSpot, this.element.parent());
		},
		"dragmove": function( el, ev, drag ) {
			var current = this.determineValue();
			if(this.lastMove !== current){
				
				this.element.trigger( "changing", current );
				this.lastMove = current;
			} 
		},
		"dragend": function( el, ev, drag ) {
			this.options.val( this.determineValue() )
		},
		determineValue : function() {
			var left = this.element.offset().left - this.leftStart,
				spot = Math.round(left / this.widthOfSpot);
			return spot + this.options.min();
		},
		updatePosition: function() {
			this.getDimensions();
			this.element.offset({
				left: this.leftStart + Math.round((this.options.val() - this.options.min()) * this.widthOfSpot)
			})
		},
		/**
		 * @param {Number} value - Optional. The new value for the slider. If
		 * omitted, the current value is returned.
		 * @return {Number}
		 */
		val: function( value ) {
			return this.options.val(value)
		},

		"{val} change" : function(){
			// change the position ... 
			this.lastMove = this.options.val();
			console.log("changed to ", this.lastMove)
			this.updatePosition();
			this.element.trigger( "change", this.lastMove )
		}
	})

})(jQuery);
(function($){
	/**
	 * @class can.ui.Modal
	 * @parent canui
	 * @test canui/layout/modal/funcunit.html
	 * 
	 * @description A basic modal implementation. 
	 * A basic modal implementation. 
	 * 
	 * ## Use
	 *
	 * Create a new Modal control instance:
	 *
	 *		new can.ui.Modal($('#modal'));
	 *
	 * This will take the jQuery object and place it centered
	 * on the window. If you want an overlay over the page behind the modal, use
	 * the overlay option:
	 *
	 *		new can.ui.Modal($('modal'), {
	 *			overlay: true
	 *		});
	 *
	 * This will create <div class="can_ui_layout_modal-overlay"></div> element
	 * and display it over the page. Default CSS applied to the overlay is:
	 * 
	 *		.can_ui_layout_modal-overlay {
	 *			background: rgba(0,0,0,0.5);
	 *			position: fixed;
	 *			top: 0;
	 *			bottom: 0;
	 *			right: 0;
	 *			left: 0;
	 *		}
	 *
	 * You can either overwrite that CSS in your stylesheet, or you
	 * can use pass the overlay class as an option to the can_ui_layout_modal:
	 *
	 *		new can.ui.Modal($('modal'), {
	 *			overlay: true, 
	 *			overlayClass: 'my-overlay-class'
	 *		});
	 *
	 * Alternatively, if you'd like to use a custom element as your overlay,
	 * simply pass it in the overlay option:
	 *
	 *		new can.ui.Modal($('modal', {
	 *			overlay: $(".custom_overlay")
	 *		});
	 *
	 * By default modals will be hidden and left in the DOM after you trigger "hide"
	 * on the modal element. If you want to destroy the modal (and overlay) you can pass
	 * true to the destroyOnHide option:
	 *
	 *		new can.ui.Modal($('modal'), {
	 *			destroyOnHide: true
	 *		});
	 *
	 * You can hide or destroy the modal by pressing the "Escape" key or by clicking on
	 * the overlay element (if overlay exists).
	 *
	 * Modals can also be attached to an element rather than the window using
	 * the `of` option.
	 *
	 *		new can.ui.Modal($('modal'), {
	 *			of : $("#box"),
	 *			overlay: true
	 *		});
	 *
	 * Modal windows can be stacked one on top of another. If modal has overlay, it will
	 * cover the existing modal windows. If you use the "Escape" key to hide the modals
	 * they will be hidden one by one in the reverse order they were created.
	 *
	 * ## Demo
	 * @demo canui/layout/modal/modal.html
	 * @constructor
	 * 
	 * @param {Object} [options] Values to configure the behavior of modal:
	 * 
	 *	- `overlay` - An element to block the screen behind the modal. When
	 *	clicked, the modal closes.
	 *		- `{Boolean}` - If true an overlay will be created and used.
	 *		- `{HTMLElement}` - If an element is passed, that element will be
	 *		used as the overlay. This is useful for implementing custom
	 *		overlays.
	 *	- `overlayClass` - `{String}` - A class name to be added to the overlay element.
	 *	- `of` - `{HTMLElement}` - The element you would like the modal to be applied to. The
	 *	default is the `window`.
	 *	- `destroyOnHide` - `{Boolean}` - If `true`, the modal will be
	 *	destroyed when it's `hide` method is called.
	 *	- `overlayClick`- `{Boolean}` - If `true`, when user clicks on the overlay
	 *	modal's `hide` method will be called.
	 *	- `autoShow`- `{Boolean}` - If `true`, modal will be shown immediately, otherwise it
	 * will be hidden.
	 *
	 * @return {can.ui.Modal}
	 */
	
	/* Starting z-index for modals. We use stack variable to keep open models in order */
	
	var zIndex = 9999, stack = [];
	
	can.ui.Positionable("can.ui.Modal", {
		defaults: {
			my: 'center center',
			at: 'center center',
			of: window,
			collision: 'fit fit',
			// destroy modal when hide is triggered
			destroyOnHide : false,
			// show overlay if true
			overlay: false,
			// class that will be applied to the overlay element
			overlayClass : "modal-overlay",
			// close modal if overlay is clicked
			overlayClick: true,
			autoShow : true,
			hideOnEsc : true,
			hide : function(el, overlay, cb){
				el.hide();
				overlay.hide();
				cb();
			},
			show : function(el, position, overlay, cb){
				overlay.show();
				el.show().css(position);
				cb();
			}
		}
	},
	/*
	 * @prototype
	 */
	{
		setup: function(el, options) {
			var opts = $.extend({}, this.constructor.defaults, options)
			if ( opts.overlay ) {
				if ( opts.overlay === true ) {
					options.overlayElement = $('<div />', {
						"class" : opts.overlayClass
					});
				} else if ( opts.overlay.jquery ) {
					options.overlayElement = opts.overlay;
					options.overlayElement.addClass( opts.overlayClass );
				}

				if ( $.isWindow( opts.of ) ) {
					$(document.body).append( options.overlayElement.detach() )
					options.overlayPosition = "fixed";
					//console.log( 'here', options );
				} else {
					opts.of.css("position", "relative").append( options.overlayElement.detach() )
					options.overlayPosition = "absolute";
					//console.log( 'there', options );
				}
				//console.log( options.overlayElement, options.overlayElement.parent() );
				options.overlayElement.hide()

			}
			this._super.apply(this, [el, options])
		},
		init : function(){
			this._super.apply(this, arguments);
			this.stackId = "modal-" + (new Date()).getTime();
			this.options.autoShow ? this.show() : this.hide();
		},
		update : function(options){
			if(options && options.overlay === true && typeof this.options.overlayElement == 'undefined'){
				var klass = options.overlayClass || this.options.overlayClass;
				options.overlayElement = $('<div class="'+klass+'"></div>');
				$('body').append(options.overlayElement.hide())
			} else if(options && options.overlay === false && typeof this.options.overlayElement != 'undefined'){
				this.options.overlayElement.remove();
				delete this.options.overlayElement;
			}
			this._super(options);
			this.show();
		},
		destroy : function(){
			if(typeof this.options.overlayElement != "undefined"){
				this.options.overlayElement.remove();
			}
			this._super.apply(this, arguments)
		},
		/**
		 * Hide modal element and overlay if overlay exists
		 */
		hide : function(){
			this.options.hide(this.element, this.overlay(), this.proxy('hideCb'))
		},
		hideCb : function(){
			var stackIndex;
			if((stackIndex = stack.indexOf(this.stackId)) > -1){
				stack.splice(stackIndex, 1);
			}
			if(this.options.destroyOnHide){
				this.element.trigger('hidden');
				this.element.remove();
				this.overlay().remove();
			} else {
				this.element.hide();
				this.overlay().hide();
				this.element.trigger('hidden');
			}
		},
		' hide' : function() {
			this.hide();
		},
		/**
		 * Show modal element and overlay if overlay exists
		 */
		show : function(){
			this.moveToTop();
			this.options.show(this.element, this.position(), this.overlay(), this.proxy('showCb'))
		},
		showCb : function(){
			this.element.trigger('shown')
		},
		' show' : function() {
			this.show();
		},
		/**
		 * Move modal to the top of the stack.
		 */
		moveToTop : function(){
			if($.inArray(this.stackId, stack) == -1){
				stack.unshift(this.stackId);
			} else {
				stack.splice(stack.indexOf(this.stackId), 1);
				stack.unshift(this.stackId);
			}
			if ( this.options.overlayElement ){
				this.options.overlayElement.css({
					'z-index': ++zIndex, 
					position: this.options.overlayPosition
				})
			}
			this.element.css({'z-index': ++zIndex});
			this.element.css('position', this.options.overlayPosition );
		},
		overlay : function(){
			return this.options.overlayElement ? this.options.overlayElement : $([]);
		},
		"{document} keyup" : function(el, ev){
			if(this.element.css('display') == "block" && ev.which == 27 && stack[0] == this.stackId){
				this.element.trigger('hide');
				ev.stopImmediatePropagation();
			}
		},
		"{overlayElement} click" : function(el, ev){
			if(this.options.overlayClick) { this.hide(); }
		},
		// Reposition the modal on window resize
		"{window} resize" : function(el, ev){
			this.move();
		}
	})
})(jQuery);
(function($){
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
})(jQuery);
(function(){
		
/**
 * @class can.ui.nav.Accordion
 * @parent canui
 * @test canui/nav/accordion/funcunit.html
 * 
 * Provides basic accordion vertical accordion functionality.
 */
can.Control("can.ui.Accordion",{
	
	defaults: {
		/**
		 * @attribute locale
		 * Locale to be passed for localization.
		 */
		locale:{
			expand: "Click to expand",
			collaspe: "Click to collaspe"
		},

		/**
		 * @attribute css
		 * Css Classes to be assigned to 'active', 'hover', and 'selected'.
		 *
		 * Defaults are:
		 * 		active - 'ui-state-active'
		 *		hover - 'ui-state-hover'
		 *		selected - 'ui-state-selected'
		 */
		css: {
			activated: "ui-state-active",
			hover: "ui-state-hover",
			selected: "ui-state-selected"
		},

		/**
		 * @attribute animate
		 * Animation to use when showing elements.  
		 * To disabled animations, pass false.
		 * For more information on animations, visit: http://jqueryui.com/demos/effect/ 
		 * 'slide' by default.
		 */
		animate: {
			/**
			 * @attribute effect
			 * The effect to be used. 
			 * Possible values: 'blind', 'clip', 'drop', 'explode', 'fold', 'puff', 'slide', 'scale', 'size', 'pulsate'.
			 * Default value: 'slide'.
			 */
			effect: 'slide',

			/**
			 * @attribute speed
			 * A string representing one of the predefined speeds ("slow" or "fast") or 
			 * the number of milliseconds to run the animation (e.g. 1000).
			 * Default value: 'fast'.
			 */
			speed: 'fast'
		},
		
		/**
		 * @attribute header
		 * The element to act as the selector.
		 * ':header' by default, see: http://api.jquery.com/header-selector/
		 */
		header: ":header",

		/**
		 * @attribute disabled
		 * Disables or enables the accordian.
		 * 'false' by default.
		 */
		disabled: false,

		/**
		 * @attribute active
		 * Element for the active element.
		 * Undefined by default.
		 */
		active: undefined,

		/**
		 * @attribute fillSpace
		 * Fill the space of the content.
		 * 'false' by default.
		 */
		fillSpace: false,

		/**
		 * @attribute dir
		 * Direction to slide. 
		 * Possible values: 'vertical' or 'horizontal'.
		 * 'vertical' by default.
		 */
		dir: 'vertical',
		
		/**
		 * @attribute autoDim
		 * Resets the dimension to 'auto' after activate.
		 * 'false' by default.
		 */
		autoDim: false
	}, 
	
	/**
	 * @hide
	 * Direction map used to determine dims based 
	 * on the direction in the options.
	 */
	dirMap: {
		horizontal: {
			dim: "width",
			outer: "outerWidth"
		},
		vertical: {
			dim: "height",
			outer: "outerHeight"
		}
	}
	
},{
	init : function(){
		this._setupDom();
		
		new can.ui.Selectable(this.element, {
			selectedClassName: this.options.css.selected,
			activatedClassName: this.options.css.activated,
			multiActivate: false,
			outsideDeactivate: false
		});
		
		if(this.options.fillSpace){
			new can.ui.layout.Fill(this.element);
		}
		
		if(this.options.active){
			this.options.active.trigger('activate');
		}
	},
	
	/**
	 * Sets up the dom for the widget, adds css, titles, and tab indexes.
	 */
	_setupDom:function(){
		var expand = this.options.locale.expand;
		this.element.addClass('ui-accordion ui-widget ui-helper-reset');
		this.element.children(this.options.header).each(function(i){
			$(this).addClass('ui-accordion-header ui-helper-reset ui-state-default');
			$(this).attr('title', expand);
			$(this).attr('tabindex', i)
			$(this).next().addClass('ui-accordion-content ui-helper-reset ui-widget-content');
		});
	},
	
	/**
	 * Header 'activate' event.  
	 * Hides the old element and shows the new one.
	 * @param {Object} elm
	 * @param {Object} event
	 */
	"{header} activate":function(elm,ev){
		var to = elm.next(),
			dim = this.constructor.dirMap[this.options.dir].dim,
			animation = {
				duration: this.options.duration
			};
		
		if (!this.options.active) {
			animation[dim] = "show";
			to.animate(animation);
			this.options.active = elm;
			return;
		}
		
		var from = this.options.active.next(),
			fromDim = from[this.constructor.dirMap[this.options.dir].outer](),
			toDim = to[this.constructor.dirMap[this.options.dir].outer](),
			diff = toDim / fromDim,
			autoDim = this.options.autoDim;		
			
		animation[dim] = "hide";
			
		from.attr('title', this.options.locale.expand)
		to.attr('title', this.options.locale.collaspe)
		
		to.css({ height: 0, overflow: 'hidden' }).show();
			
		from.animate(animation, {
			step:function(now){
				to[dim](Math.ceil((fromDim - now) * diff));
			},
			complete:function(){
				if(autoDim){
					to[dim]('auto')
				}
			}
		});
		
		this.options.active = elm;
	}
	
});

})(jQuery)