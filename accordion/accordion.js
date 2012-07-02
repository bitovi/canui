steal('can/control',
	  'can/construct/proxy',
	  'canui/selectable',
	  'jquery/dom/dimensions',
	  function(){
		
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

});