steal('can/control',
	  'canui/selectable',
	  'canui/fills',
	  function(){
		
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

});