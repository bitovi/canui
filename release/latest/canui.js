(function() {
 var module = { _define : window.define };
module['jquery'] = jQuery;
module['can/util'] = can;
define = function(id, deps, value) {
	module[id] = value();
};
define.amd = { jQuery: true };

module['canui/fills/fills.js'] = (function( $ ) {
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
			options.parent || (options.parent = window);
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
})(module["jquery"], module["jquery/dom/dimensions/dimensions.js"], module["jquery/event/resize/resize.js"]);
module['canui/util/scrollbar_width.js'] = (function ($) {
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
	return window.can.ui.scrollbarWidth;
})(module["jquery"]);
module['canui/table_scroll/table_scroll.js'] = (function ($) {

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
			// this.$.container = this.$.table.parents('.' + this.constructor.pluginName);
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

			var scrolls = $(this.$.head).add(this.$.foot);
			this.on(this.$.scrollBody, 'scroll', function (ev) {
				scrolls.scrollLeft($(ev.target).scrollLeft());
			});
			this.on(this.$.table, 'resize', 'resize');

			this.update();
		},

		update : function() {
			if (this.$.foot) {
				this._addSpacer('tfoot');
			}
			if (this.$.head) {
				this._addSpacer('thead');
			}

			this.resize();
		},

		_wrapWithTable : function (i, tag) {
			// save it
			var el = this.$[tag] = this.$.table.children(tag);
			if (el.length && el.find('td, th').length) {
				var table = $('<table>'), parent = el.parent();
				// We want to keep classes and styles
				table.attr('class', parent.attr('class'));
				table.attr('style', parent.attr('style'));

				// remove it (w/o removing any widgets on it)
				// el[0].parentNode.removeChild(el);

				//wrap it with a table and save the table
				this.$[tag + "Table"] = el.wrap(table).parent();
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
		 * you call `update()`.
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
				scrollBody : this.$.scrollBody,
				container : this.element
			};
		},

		/**
		 * @function rows
		 * @parent can.ui.TableScroll
		 *
		 * Returns all actual rows (excluding any spacers).
		 *
		 * @param {Collection} [replaceRows] If passed, all rows will be replaced with the given rows.
		 * @return {can.$) The content elements of the table body without any spacers.
		 */
		rows : function(replaceRows) {
			if(replaceRows) {
				this.rows().remove();
				this.$.tbody.prepend(replaceRows);
			}
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
					"border-top" : 'none',
					"border-bottom" : 'none',
					margin : 0,
					width : ''
				}) // If padding is removed from the cell sides, layout might break!
				$spacer.outerWidth(width + 2).css({
					"float" : "none",
					"visibility" : "hidden",
					height : "1px"
				}).html("");
			})
			this.$.spacer = spacer;
		},

		/**
		 * This is either triggered by the `resize` event or should be called manually when
		 * the table content or dimensions change.
		 */
		resize : function () {
			var body = this.$.body,
				children = body.find("tr:first:not([data-spacer])").children(),
				// getting the outer widths is the most expensive thing
				firstWidths = children.map(function () {
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
			var controls = can.data(this.$.table,"controls");
			controls.splice(can.inArray(this, controls),1);
			delete this.$;
			can.Control.prototype.destroy.call(this);
		}
	})
})(module["jquery"], module["can/control/control.js"], module["can/control/plugin/plugin.js"], module["canui/fills/fills.js"], module["canui/util/scrollbar_width.js"], module["jquery/event/resize/resize.js"]);
module['canui/selectable/selectable.js'] = (function($) {

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
 *       outsideDeactivate: false
 *     })
 */
can.Control('can.ui.Selectable',{
	pluginName : 'selectable',
    defaults : {
        // what can be selected
		selectOn: "[tabindex]",
		// what class is selected
        selectedClassName : "selected",
		// 
        activatedClassName : "activated",
		multiActivate: true,
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
			this.deselect();
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
			el.trigger("select", el);
		}
	},
	// deselects the selected
	deselect : function(){
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
		if(!el) {
			return this.element.find("."+this.options.activatedClassName);
		}

		ev = ev || {};
		// if we should only select one element ...
		if(!this.options.multiActivate || (!ev.shiftKey && !ev.ctrlKey && !ev.metaKey && ev !== true)){
			// remove the old activated ...
			this.element
				.find("." + this.options.activatedClassName)
				.trigger('deactivate');
			
			// activate the new one
			
			el.trigger("activate", el.models ? [el.models()] : [el]);
			
		}else if(ev.ctrlKey || ev.metaKey || ev === true){ // if we add to the 'activated' list
			
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
				
			if(lastSelected && lastSelected.length && lastSelected[0] != el[0]){
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
			activated.addClass(this.options.activatedClassName);
			el.trigger("activate", [activated]);
		}
	},

	deactivate : function() {
		this.activated().trigger('deactivate');
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
				this.deselect();
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
			this.deselect();
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
	selectables : function(){
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
		var dirtest, closetest, traverse;
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
			els = selectables || this.selectables(),
			index= els.index(current),
			i,
			min = Infinity,
			minEl,
			dist,
			close;
		
		
		
		for(i = index+traverse;i < els.length && i >= 0; i = i + traverse){
			
			var el = els.eq(i),
				elOffset = el.offset(),
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

})(module["jquery"], module["can/control/control.js"], module["can/construct/proxy/proxy.js"], module["can/control/plugin/plugin.js"], module["jquery/event/key/key.js"]);
module['canui/split/split.js'] = (function($) {

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
		pluginName : 'split',
		defaults: {
			active: "active",
			hover: "split-hover",
			splitter: "splitter",
			direction: null,
			dragDistance: 5,
			panelSelector: '',
			locale:{
				collaspe: "Click to collapse",
				expand: "Click to expand"
			}
		},
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
			return this.element.children(this.options.panelSelector + ":not(.splitter)")
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
			return changed;
		},

		/**
		 * @hide
		 * Handles the insertion of new panels into the container.
		 * @param {jQuery} panel
		 */
		insert: function(){
			var self = this,
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
})(module["jquery"], module["can/control/control.js"], module["can/control/plugin/plugin.js"], module["jquery/event/drag/limit/limit.js"], module["jquery/dom/dimensions/dimensions.js"], module["jquery/event/key/key.js"], module["jquery/event/resize/resize.js"]);
module['canui/list/list.js'] = (function($) {
	can.Control('can.ui.List', {
		pluginName : 'list',
		defaults : {
			attribute : 'data-cid',
			cid : '_cid'
		}
	}, {
		init : function() {
			this._cidMap = {};
			this.update();
		},

		/**
		 * Updates the options and re-renders the list.
		 *
		 * @param {Object} [options] The updated options
		 */
		update : function(options) {
			can.Control.prototype.update.call(this, options);
			var list = this.options.list;
			if(can.isFunction(list)) {
				list = can.compute(list);
			}
			if(list && list.isComputed) {
				// TODO doesn't trigger
				this.on(list, 'change', can.proxy(function(ev, newVal) {
					this._update(newVal);
				}, this));
				list = list();
			}
			this._update(list);
		},

		/**
		 * Updates the data list and sets this.options.data. Converts Arrays
		 * and waits for Deferreds.
		 *
		 * @param {can.Deferred|can.Observe.List|Array} data The data to set
		 * @private
		 */
		_update : function(data) {
			data = data || [];
			if(can.isDeferred(data)) {
				this.element.html(this._fnOption('loadingContent'));
				data.done(can.proxy(this._update, this));
			} else {
				this._cidMap = {};
				this.options.data = data instanceof can.Observe.List ? data : new can.Observe.List(data);
				this.on();
				this._render(this._rows(this.options.data));
			}
		},

		/**
		 * Returns a can.$ wrapped list of rendered rows for the given observes.
		 *
		 * @param {Array|can.Observe.List} observes The observables to render
		 * @return {can.$} A can.$ wrapped list of rendered rows
		 * @private
		 */
		_rows : function(observes) {
			var self = this;
			observes = can.makeArray(observes);
			var rows = $.map(observes, can.proxy(function(observe) {
				// Update the mapping from can.Observe unique id to Observe instance
				self._cidMap[observe[self.options.cid]] = observe;
				if(can.isFunction(this.options.view)) {
					return this.options.view.call(this, observe);
				}
				return can.view(this.options.view, observe);
			}, this));
			return can.$(rows);
		},

		/**
		 * Renders the row element list. If the rows are empty or there
		 * are no rows, the content set in the `empty` option will be rendered.
		 *
		 * @param rows
		 * @private
		 */
		_render : function(rows) {
			var content = !rows || rows.length === 0 ? this._fnOption('emptyContent') : rows;
			this.element.html(content);
			this.element.trigger('rendered', this);
		},

		_fnOption : function(name, args) {
			var val = this.options[name];
			return can.isFunction(val) ? val.apply(this, args || []) : val;
		},

		'{data} length' : function(list, ev, length) {
			if(length === 0) {
				this._render();
			}
		},

		'{data} remove' : function(list, ev, observes) {
			if(list.length) { // We can't get rowElements from an empty list
				var self = this;
				// Remove the CID mapping
				can.each(observes, function(observe) {
					delete self._cidMap[observe[self.options.cid]];
				});
				this.rowElements(observes).remove();
				this.element.trigger('changed', this);
			}
		},

		'{data} add' : function(list, ev, observes) {
			var rowElements = this.rowElements(),
				newRows = this._rows(observes);
			if(rowElements.length) {
				// We either append after the last data row
				rowElements.last().after(newRows);
			} else {
				// Or set it as the content
				this.element.html(newRows);
			}
			this.element.trigger('changed', this);
		},

		/**
		 * Returns all rows for a list of observables.
		 *
		 * @param arg
		 * @return {*}
		 */
		rowElements : function(arg) {
			if(!arg) {
				return this.element.find('[' + this.options.attribute + ']');
			}

			var elements = [],
				observes = can.isArray(arg) ? arg : can.makeArray(arguments);

			can.each(observes, can.proxy(function(current) {
				var row = this.element.find('[' + this.options.attribute + '="' + current[this.options.cid] + '"]')[0];
				elements.push(row || null);
			}, this));

			return can.$(elements);
		},

		items : function(rows)
		{
			if(!rows) {
				return this.list();
			}

			var result = new can.Observe.List(),
				map = this._cidMap;

			can.each(can.makeArray(rows), function(row) {
				row = row[0] || row;
				// Either use getAttribute or the name itself as the index
				// that way you can pass a list of ids as well
				var id = row.getAttribute('data-cid');
				if(map[id]) {
					result.push(map[id]);
				}
			});

			return result;
		},

		/**
		 * Returns all
		 *
		 * @param {Collection} rows An array or DOM element collection
		 * @return {can.Observe.List|can.Observe}
		 */
		list : function(newlist) {
			if(!newlist) {
				return this.options.data || new can.Observe.List();
			}
			this.update({
				list : newlist
			});
		}
	});
})(module["jquery"], module["can/control/control.js"], module["can/control/plugin/plugin.js"], module["can/view/view.js"], module["can/observe/observe.js"]);
module['canui/grid/grid.js'] = (function($) {
	var appendIf = function(el, tag) {
		if(el.is(tag) || !tag) {
			return el;
		}
		var res = el.find(tag);
		if(res.length) {
			return res;
		}
		return el.append(can.$('<' + tag + '>')).find(tag);
	};

	can.Control('can.ui.Grid', {
		pluginName : 'grid',
		defaults : {
			view : function(observe) {
				var row = [], self = this;
				can.each(this.options.columns, function(col) {
					row.push(can.isFunction(col.content) ?
						col.content.call(self, observe, col) :
						can.compute(function() {
							return observe.attr(col.content);
						}));
				});
				row.cid = observe.cid;
				return can.view('//canui/grid/views/row.ejs', row);
			},
			headerContent : '//canui/grid/views/head.ejs',
			emptyContent : 'No data',
			loadingContent : 'Loading...',
			scrollable : false
		}
	}, {
		setup : function(el, ops) {
			var table = appendIf(can.$(el), 'table'),
				options = can.extend({}, ops),
				self = this;
			this.el = {
				header : appendIf(table, 'thead'),
				body : appendIf(table, 'tbody'),
				footer : appendIf(table, 'tfoot')
			}
			can.each(['emptyContent', 'loadingContent', 'footerContent'], function(name) {
				var current = options[name] || self.constructor.defaults[name];
				if(!can.$(current).length) {
					options[name] = '<tr><td colspan="' + ops.columns.length
						+ '">' + current + '</td></tr>';
				}
			});
			if(!(options.columns instanceof can.Observe.List)) {
				options.columns = new can.Observe.List(options.columns);
			}
			can.Control.prototype.setup.call(this, table, options);
			return [table, options];
		},

		init : function(el, ops) {
			this.el.header.append(this._fnView('headerContent', this.options.columns));
			this.control = {
				list : this.el.body.control(can.ui.List)
			}
			// this.el.footer.append(this._fnView('footerContent', this.options.columns));
			this.update();
		},

		update : function(options) {
			can.Control.prototype.update.apply(this, arguments);
			this.el.body.list(this.options);
		},

		columns : function(cols) {
			if(!cols) {
				return this.options.columns;
			}
			this.update({ columns : cols });
		},

		_fnView : function(name, arg) {
			var val = this.options[name];
			if(can.isFunction(val)) {
				return val.call(this, arg);
			}
			return can.view(val, arg);
		},

		'{columns} change' : function() {
			if(this.options.scrollable) {
				this.element.tableScroll();
			}
		},

		' rendered' : function() {
			if(this.options.scrollable) {
				this.element.tableScroll();
				this.control.tableScroll = this.element.control(can.ui.TableScroll);
			}
		},

		' changed' : function() {
			// Trigger resize to adjust the TableScroll
			if(this.options.scrollable) {
				this.element.trigger('resize');
			}
		},

		items : function() {
			return this.control.list.items.apply(this.control.list, arguments);
		},

		list : function() {
			return this.control.list.list.apply(this.control.list, arguments);
		},

		rowElements : function() {
			return this.control.list.rowElements.apply(this.control.list, arguments);
		},

		tableScroll : function() {
			return this.control.tableScroll;
		}
	});
})(module["jquery"], module["can/control/control.js"], module["canui/list/list.js"], module["can/view/ejs/ejs.js"], module["canui/table_scroll/table_scroll.js"]);

window.define = module._define;
})();