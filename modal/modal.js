steal('can/construct/super',
	'can/construct/proxy',
	'can/control',
	'jquery/event/resize',
	'jquery/event/pause',
	'canui/positionable',
	'canui/block',
	'./modal.css').then(function($){
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
	 * This will create <div class="modal-overlay"></div> element
	 * and display it over the page. Default CSS applied to the overlay is:
	 * 
	 *		.modal-overlay {
	 *			background: rgba(0,0,0,0.5);
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
	 *	will be hidden.
	 *	- `hideOnEsc` - `{Boolean}` - If `true` modal will be hidden when user presses the 
	 *	escape button
	 *
	 * @return {can.ui.Modal}
	 */
	
	/* Starting z-index for modals. We use stack variable to keep open models in order */
	
	var zIndex = 9999, stack = [];
	
	can.ui.Positionable("can.ui.Modal", {
		/**
		 * Default `hide` method.
		 */
		hide : function(el, overlay, cb){
			el.hide();
			overlay.hide();
			cb();
		},
		/**
		 * Default `show` method.
		 */
		show : function(el, position, overlay, cb){
			overlay.show();
			el.show().css(position);
			cb();
		},
		defaults: {
			my            : 'center center',
			at            : 'center center',
			of            : window,
			collision     : 'fit fit',
			// destroy modal when hide is triggered
			destroyOnHide : false,
			// show overlay if true
			overlay       : false,
			// class that will be applied to the overlay element
			overlayClass  : "modal-overlay",
			// close modal if overlay is clicked
			overlayClick  : true,
			autoShow      : true,
			hideOnEsc     : true,
			show          : null,
			hide          : null
		}
	},
	/*
	 * @prototype
	 */
	{
		setup: function(el, options) {
			var opts = $.extend({}, this.constructor.defaults, options)
			if ( opts.overlay ) {
				// Create overlay element if `true` is passed to the `overlay` option.
				if ( opts.overlay === true ) {
					options.overlayElement = $('<div />', {
						"class" : opts.overlayClass
					});
				} else if ( opts.overlay.jquery ) {
					// We need to clone the overlay element so when multiple
					// overlays use it everything works as expected.
					options.overlayElement = opts.overlay.clone();
					options.overlayElement.addClass( opts.overlayClass );
				}

				if ( $.isWindow( opts.of ) ) {
					// Append overlay to body if window is passed as the `of` option
					$(document.body).append( options.overlayElement.detach() )
				} else {
					// Otherwise append overlay to the element passed as the `of` option
					opts.of.css("position", "relative").append( options.overlayElement.detach() )
				}
				// Initialize can.ui.Block on the overlay element
				new can.ui.Block($(options.overlayElement), options.of || $(window))
				options.overlayElement.trigger('hide')

			}
			this._super.apply(this, [el, options])
		},
		init : function(){
			this._super.apply(this, arguments);
			// Generate stackId of the modal window. This is used
			// to close modals in  the correct order.
			this.stackId = "modal-" + (new Date()).getTime();
			// If `autoShow` option is true immediately show the modal
			this.options.autoShow ? this.show() : this.hide();
			// If modal is shown inside some element, instead of window,
			// use the relative position.
			if(!$.isWindow(this.options.of)){
				var ofPosition = this.options.of.css('position');
				if(["absolute", "relative", "fixed"].indexOf(ofPosition) < 0){
					this.options.of.css('position', 'relative')
				}
			}
		},
		/**
		 * Trigger async `hide` event to allow users to pause it in their
		 * modal widgets.
		 */
		hide : function(){
			this.element.triggerAsync('hide');
		},
		/**
		 * This function is passed as the callback to the function that hides
		 * the modal. We have to use the callback because users might have code
		 * that animates the hiding or in some other way prevents immediate 
		 * execution.
		 */
		hideCb : function(){
			// Hide modal and overlay again to make sure they're really hidden.
			this.element.hide();
			this.overlay().hide();
			// Trigger `hidden` event on the element after hiding is complete
			this.element.trigger('hidden');
			var stackIndex;
			// Remove this element's stackId from the stack
			if((stackIndex = stack.indexOf(this.stackId)) > -1){
				stack.splice(stackIndex, 1);
			}
			if(this.options.destroyOnHide){
				// If modal window should be destroyed on hide, remove the element
				this.element.remove();
			}
		},
		/**
		 * Default event handler for the `hide` event
		 */
		' hide.default' : function() {
			var hideFn =  this.options.hide || this.constructor.hide;
			var hideCb = this.proxy('hideCb');
			hideFn(this.element, this.overlay(), hideCb);
		},
		/**
		 * Call function that shows the modal
		 */
		show : function(){
			var showFn = this.options.show || this.constructor.show;
			this.moveToTop();
			showFn(this.element, this.position(), this.overlay(), this.proxy('showCb'))
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
			// If element's stackId is not in the stack add it to the 
			// beggining. If it exists in the stack, then move it to
			// the beggining.
			if($.inArray(this.stackId, stack) == -1){
				stack.unshift(this.stackId);
			} else {
				stack.splice(stack.indexOf(this.stackId), 1);
				stack.unshift(this.stackId);
			}
			// If overlay exists for this modal, move it on the top
			// of all other overlay and modal elements.
			if ( this.options.overlayElement ){
				this.options.overlayElement.css({
					'z-index': ++zIndex, 
					position: this.options.overlayPosition
				})
			}
			// Move modal element to the top.
			this.element.css({'z-index': ++zIndex});
			this.element.css('position', this.options.overlayPosition );
		},
		/** 
		 * Helper function that always returns jQuery collection for the overlay
		 * even if overlay doesn't exist. 
		 */
		overlay : function(){
			return this.options.overlayElement ? this.options.overlayElement : $([]);
		},
		/**
		 * Get the position where modal should placed. Save it with scroll values
		 * substracted so we can correctly reposition the modal when user scrolls.
		 */
		position : function(el, ev, positionFrom){
			var pos = this._super.apply(this, arguments);
			this._pos = {
				left: pos.left,
				top: pos.top
			}
			this._pos.top = this._pos.top - $(this.options.of).scrollTop();
			this._pos.left = this._pos.left - $(this.options.of).scrollLeft();
			return pos;
		},
		/** 
		 * If `hideOnEsc` option is true and user pressed the escape button, check if 
		 * this modal is the top one and hide it.
		 */ 
		"{document} keyup" : function(el, ev){
			if(this.element.css('display') == "block" && ev.which == 27 && stack[0] == this.stackId && this.options.hideOnEsc === true){
				this.hide();
				ev.stopImmediatePropagation();
			}
		},
		/**
		 * Hide modal if user clicked on the overlay and `overlayClick` option is set to true.
		 */
		"{overlayElement} click" : function(el, ev){
			if(this.options.overlayClick) { this.hide(); }
		},
		/**
		 * Remove the overlay when modal element is removed or someone directly destroyed
		 * can.ui.Modal instance on the element.
		 */
		destroy : function(){
			this.overlay().remove();
			this._super.apply(this, arguments)
		},
		/**
		 * Reposition the modal when container is resized.
		 */
		"{of} resize" : function(el, ev){
			this.move();
		},
		/**
		 * If `window` is the container, reposition modal on the scroll.
		 */
		"{of} scroll" : function(el, ev){
			if($.isWindow(el)){
				this.element.css('top', (this._pos.top + $(el).scrollTop()) + "px")
				this.element.css('left', (this._pos.left + $(el).scrollLeft()) + "px")
			}
			
		}
	})
})
