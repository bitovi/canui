(function ($) {
	window.can || (window.can = {});
	window.can.ui || (window.can.ui = {});

	var cached = null;
	window.can.ui.scrollbarWidth = function() {
		if(cached === null) {
			var div = $('<div id="out"><div style="height:200px;"></div></div>').css({
					position : "absolute",
					top : "0px",
					left : "0px",
					visibility : "hidden",
					width : "100px",
					height : "100px",
					overflow : "hidden"
				}).appendTo(document.body),
				inner = $(div[0].childNodes[0]),
				w1 = inner[0].offsetWidth,
				w2;

			div.css("overflow", "scroll");
			var w2 = inner[0].offsetWidth;
			if (w2 == w1) {
				inner.css("width", "100%"); //have to set this here for chrome
				w2 = inner[0].offsetWidth;
			}
			div.remove();
			cached = w1- w2;
		}

		/**
		 * @parent canui
		 * @attribute can.ui.scrollbarWidth
		 * @type {Number}
		 *
		 * Stores the width of the browsers scrollbars in can.ui.scrollbarWidth.
		 *
		 *      $('#element').width($('#element').width()
		 *          - can.ui.scrollbarWidth);
		 */
		return cached;
	}
})(jQuery);
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
		if(!this.options.multiActivate || (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey)){
			// remove the old activated ...
			this.element
				.find("." + this.options.activatedClassName)
				.trigger('deactivate');
			
			// activate the new one
			
			el.trigger("activate", el.models ? [el.models()] : [el]);
			
		}else if(ev.ctrlKey || ev.metaKey){ // if we add to the 'activated' list
			
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
(function ($) {

	// helpers
	var setWidths = function (cells, firstWidths) {
			var length = cells.length - 1;
			for (var i = 0; i < length; i++) {
				cells.eq(i).outerWidth(firstWidths[i]);
			}
		},
		TableFill = can.Control({
			setup : function (el, options) {
				//remove the header and put in another table
				el = $(el);
				if (el[0].nodeName.toLowerCase() == 'table') {
					this.$ = {
						table : el
					}
					can.Control.prototype.setup.call(this, this.$.table.wrap("<div></div>").parent(),
						options)
				} else {
					this.$ = {
						table : el.find('table:first')
					}
					can.Control.prototype.setup.call(this, el, options);
				}

			},
			init : function () {
				// add a filler ...
				var options = {};
				if (this.options.parent) {
					options.parent = this.options.parent;
					options.fill = this.options.fill;
				}
				this.element.fills(options).css('overflow', 'auto');

			},
			// listen on resize b/c we want to do this right away
			// in case anyone else cares about the table's
			// dimensions (like table scroll)
			resize : function (ev) {
				var table = this.$.table,
					el = this.element[0];
				//let the table flow naturally
				table.css("width", "");
				// is it scrolling vertically
				if (el.offsetHeight < el.scrollHeight) {
					table.outerWidth(this.element.width() - can.ui.scrollbarWidth())
				} else {
					table.outerWidth(this.element.width())
				}

			}
		});

	can.Control("can.ui.TableScroll", {
		defaults : {
			fill : true
		},
		pluginName : 'tableScroll'
	},
	/**
	 * @prototype
	 */
	{
		setup : function (el, options) {
			// a cache of elements.
			this.$ = {
				table : $(el)
			}

			// the area that scrolls
			this.$.scrollBody = this.$.table.wrap('<div><div ><div></div></div></div>').parent();
			// a div that houses the scrollable area.  IE < 8 needs this.  It acts
			// as a buffer for the scroll bar
			this.$.body = this.$.scrollBody.parent();

			can.Control.prototype.setup.call(this, this.$.body.parent()[0], options);
			// We have to add the control to the original table element as well
			(arr = can.data(this.$.table,"controls")) || can.data(this.$.table,"controls",arr = []);
			arr.push(this);
		},

		init : function () {
			// body acts as a buffer for the scroll bar
			this.$.body.css("width", "100%");

			// get the thead, and tfoot into their own table.
			$.each(['thead', 'tfoot'], can.proxy(this._wrapWithTable, this));


			// get the tbody
			this.$.tbody = this.$.table.children('tbody')

			// if one doesn't exist ... make it
			if (!this.$.tbody.length) {
				this.$.tbody = $('<tbody/>')
				this.$.table.append(this.$.tbody)
			}

			// add thead
			if (this.$.theadTable) {
				this.$.head = $("<div class='header'></div>").css({
					"visibility" : "hidden",
					overflow : "hidden"
				}).prependTo(this.element).append(this.$.theadTable);
				this._addSpacer('thead');
			}
			if (this.$.tfootTable) {
				this.$.foot = $("<div class='footer'></div>").css({
					"visibility" : "hidden",
					overflow : "hidden"
				}).appendTo(this.element).append(this.$.tfootTable);
				this._addSpacer('tfoot');
			}


			// add representations of the header cells to the bottom of the table

			// fill up the parent
			// make the scroll body fill up all other space
			if (this.options.fill) {
				new TableFill(this.$.scrollBody, {
					parent : this.element.parent()
				});
			}

			var thead = this.$.head;
			this.on(this.$.scrollBody, 'scroll', function (ev) {
				thead.scrollLeft($(ev.target).scrollLeft());
			});
			this.on(this.$.table, 'resize', 'resize');

			this.updateCols();
		},

		_wrapWithTable : function (i, tag) {
			// save it
			this.$[tag] = this.$.table.children(tag);
			if (this.$[tag].length && this.$[tag].find('td, th').length) {
				var table = $('<table>'), parent = this.$[tag].parent();
				// We want to keep classes and styles
				table.attr('class', parent.attr('class'));
				table.attr('style', parent.attr('style'));

				// remove it (w/o removing any widgets on it)
				this.$[tag][0].parentNode.removeChild(this.$[tag][0]);

				//wrap it with a table and save the table
				this.$[tag + "Table"] = this.$.thead.wrap(table).parent()
			}
		},

		/**
		 * @parent can.ui.TableScroll
		 * @function elements
		 *
		 * Returns useful elements of the table
		 * the thead, tbody, tfoot, and scrollBody of the modified table:
		 *
		 * If you need to change the content of the table, you can
		 * use elements for access.  If you change the content, make sure
		 * you call `updateColumns()`.
		 *
		 * @return {Object} an object like:
		 *
		 *     {
		 *         body : HTMLTableSelectionElement,
		 *         footer : HTMLTableSelectionElement,
		 *         header : HTMLTableSelectionElement,
		 *         scrollBody : HTMLDivElement
		 *     }
		 */
		elements : function () {
			return {
				header : this.$.thead,
				footer : this.$.tfoot,
				body : this.$.body,
				scrollBody : this.$.scrollBody
			};
		},

		/**
		 * @function rows
		 * @parent can.ui.TableScroll
		 *
		 * Returns all actual rows (excluding any spacers).
		 *
		 * @return {can.$) The content elements of the table body without any spacers.
		 */
		rows : function() {
			return this.$.tbody.children(":not([data-spacer])");
		},

		/**
		 * @hide
		 * Adds a spacer on the bottom of the table that mimicks the dimensions
		 * of the table header elements.  This keeps the body columns for being
		 * smaller than the header widths.
		 *
		 * This ONLY works when the table is visible.
		 */
		_addSpacer : function (tag) {
			if (!this.$[tag].is(":visible")) {
				return;
			}
			//check last element ...
			var last = this.$.tbody.children('[data-spacer="' + tag + '"]');
			if (last.length) {
				last.remove();
			}

			var spacer = this.$[tag].children(0).clone().attr('data-spacer', tag);

			// wrap contents with a spacing
			spacer.children("th, td").each(function () {
				var td = $(this);
				td.html("<div style='float: left;'>" + td.html() + "</div>")
			});

			spacer.appendTo(this.$.tbody);

			//now set spacing, and make minimal height
			spacer.children("th, td").each(function () {
				var $td = $(this),
					$spacer = $td.children(':first'),
					width = $spacer.outerWidth();

				$td.css({
					"padding-top" : 0,
					"padding-bottom" : 0,
					margin : 0,
					width : ""
				}) // If padding is removed from the cell sides, layout might break!
				$spacer.outerWidth(width + 2).css({
					"float" : "none",
					"visibility" : "hidden",
					height : "1px"
				}).html("")
			})
			this.$.spacer = spacer;
		},

		updateCols : function(resize) {
			if (this.$.foot) {
				this._addSpacer('tfoot');
			}
			if (this.$.head) {
				this._addSpacer('thead');
			}

			if(resize) {
				this.resize();
			}
		},

		/**
		 * This is either triggered by the `resize` event or should be called manually when
		 * the table content or dimensions change.
		 */
		resize : function () {
			var body = this.$.body,

			// getting the outer widths is the most expensive thing
				firstWidths = this.$.tbody.find("tr:first:not([data-spacer])").children().map(function () {
					return $(this).outerWidth()
				}),

				padding = this.$.table.height() >= body.height() ? can.ui.scrollbarWidth() : 0,
				tableWidth = this.$.table.width();

			if (tableWidth) {
				if (this.$.foot) {
					var cells = this.$.tfootTable.find("th, td")
					if (cells.length == firstWidths.length) {
						setWidths(cells, firstWidths);
					}
					this.$.foot.css('visibility', 'visible')
					this.$.tfootTable.width(tableWidth + padding)
				}

				if (this.$.head) {
					var cells = this.$.theadTable.find("th, td")
					if (cells.length == firstWidths.length) {
						setWidths(cells, firstWidths);
					}
					this.$.head.css('visibility', 'visible')
					this.$.theadTable.width(tableWidth + padding)
				}
			}
		},

		destroy : function () {
			var controls = can.data(this.element,"controls");
			controls.splice(can.inArray(this, controls),1);
			delete this.$;
			can.Control.prototype.destroy.call(this);
		}
	})
})(jQuery);
(function(){
		
/**
 * @class can.ui.Accordion
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
		 * 		active - 'active'
		 *		hover - 'hover'
		 *		selected - 'ui-state-selected'
		 */
		css: {
			header: "accordion-toggle",
			content: "accordion-body",
			activated: "active",
			hover: "hover",
			selected: "selected"
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
		active: ":first",

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
		dir: 'vertical'
	}, 
	
	/**
	 * @hide
	 * Direction map used to determine dims based 
	 * on the direction in the options.
	 */
	dirMap: {
		horizontal: {
			dim: "width",
			outer: "outerWidth",
			inner: "innerWidth"
		},
		vertical: {
			dim: "height",
			outer: "outerHeight",
			inner: "innerHeight"
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
			var dim = this.dir().dim,
				outer = this.dir().outer,
				inner = this.dir().inner,
				maxDim = this.element.parent()[dim](),
				maxPadding = 0,
				headers = this.element.children(this.options.header);
				
			headers.each(function() {
				maxDim -= $(this)[outer]();
			});
			
			headers.next().each(function() {
				maxPadding = Math.max(maxPadding, $(this)[outer]() - $(this)[dim]());
			})[dim](maxDim - maxPadding);
		}
		
		if(this.options.dir === "horizontal"){
			this.element.children().outerHeight(this.element.innerHeight());
		}
		
		if(this.options.active){
			this.options.active.trigger('activate', true);
		}
	},
	
	dir:function(){
		return this.constructor.dirMap[this.options.dir];
	},
	
	/**
	 * Sets up the dom for the widget, adds css, titles, and tab indexes.
	 */
	_setupDom:function(){
		this.element.addClass('accordion accordion_' + this.options.dir);
		
		if(typeof this.options.active === "string"){
			this.options.active = this.element.find(this.options.active);
		}
		
		var headers = this.element.children(this.options.header);
		headers.each(this.proxy(function(i,elm){
			var $elm = $(elm).addClass(this.options.css.header)
				  			 .attr('title', this.options.locale.expand)
				  			 .attr('tabindex', i),
				$next = $elm.next().addClass(this.options.css.content);
				
			if(i === 0){
				$elm.addClass('first')
				$next.addClass('first')
			} else if(i === (headers.length - 1)){
				$elm.addClass('last')
				$next.addClass('last')
			}
		}));
	},
	
	/**
	 * Header 'activate' event.  
	 * Hides the old element and shows the new one.
	 * @param {Object} elm
	 * @param {Object} event
	 * @param {Boolean} first
	 */
	"{header} activate":function(elm,ev,first){
		ev.stopPropagation();
		
		if(this.options.disabled){
			return false;
		}
		
		var to = elm.next();
		
		/**
		 * @hide
		 * If no other element is 'active',
		 * just show the new one and return.
		 */
		if (this.options.active && first === true) {
			to.show();
			this.options.active = elm;
			return;
		}
		
		/**
		 * @hide
		 * If we click the same elm, return.
		 */
		if(this.options.active.is(elm)){
			return;
		}
		
		var dim = this.dir().dim,
			animation = { duration: this.options.duration },
			from = this.options.active.next(),
			fromDim = from[this.dir().outer](),
			toDim = to[this.dir().outer](),
			toInner = to[this.dir().dim](),
			diff = toDim / fromDim;
			
		animation[dim] = "hide";
		
		from.attr('title', this.options.locale.expand)
		to.attr('title', this.options.locale.collaspe)
		
		to.css({ overflow: 'hidden' }).show();

		from.animate(animation, {
			step:function(now){
				to[dim](Math.min(Math.floor((fromDim - now) * diff), toInner));
			}
		});
		
		this.options.active = elm;
	}
	
});

})(jQuery)