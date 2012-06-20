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