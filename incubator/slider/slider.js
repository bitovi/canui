steal('can/construct/proxy',
	  'can/control',
	  'can/observe/compute',
	  'jquery/event/drag/limit', 
	  'jquery/event/drag/step',
	  'jquery/dom/styles')
.then(function() {

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
	 * @demo canui/slider/slider.html
	 *
	 * @param {Object} options - An object literal describing the range,
	 * interval and starting value of the slider
	 *
	 *	- `min` {Number} - The minimum value the slider can go down to.
	 *	- `max` {Number} - The maximum value the slider can go up to.
	 *	- `interval` {Number} - The step size that the slider should increment
	 *	by when being moved.	
	 *	- `val` {Number} - The initial starting value of the slider.
	 * - `dim` {String} - The orientation of the slider.  Possible options are: 
	 *	'h' for horiztonal or 'v' for vertical.
	 * - `range` {String,Boolean} - A 'min' range goes from the slider min to one handle. 
	 *	A 'max' range goes from one handle to the slider max.  Defaults to 'false'.
	 * `contained` {Boolean} - If the slider is contained in the parent.
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
			contained : true,
			val : undefined,
			orientation: "h",
			range: false,
			animate: true
		},
		dimMap:{
			h: {
				outer: "outerWidth",
				offset: "left",
				border: "borderLeft",
				padding: "paddingLeft",
				dim: "width",
				pos: "clientX"
			},
			v: {
				outer: "outerHeight",
				offset: "top",
				border: "borderTop",
				padding: "paddingTop",
				dim: "height",
				pos: "clientY"
			},
		}
	}, 
	/**
	 * @prototype
	 */
	{		
		init: function() {
			this.element.css("position", 'relative');
			this.dimMap = this.constructor.dimMap[this.options.orientation];

			for(var optionName in this.options){
				this.options[optionName] = can.compute(this.options[optionName])
			}

			if(this.options.contained){
				this.options.parent = this.element.parent();
			}

			if(this.options.range){
				this.element[this.options.range() === "min" 
					? 'before' : 'after']("<div class='slider-fill " + 
						this.options.range() + "' />");
			}

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
				outer = this.element[this.dimMap.outer](),
				styles, space;

			this.dimToMove = parent[this.dimMap.dim]() - outer;
			this.dimOfSpot = this.dimToMove / (spots - 1);

			styles = parent.styles(this.dimMap.border, this.dimMap.padding);
			space = parseInt(styles[this.dimMap.border]) + parseInt(styles[this.dimMap.padding]) || 0;

			this.start = parent.offset()[this.dimMap.offset] + space - (this.options.contained() ? 0 : Math.round(outer / 2));
		},
		"draginit": function( el, ev, drag ) {
			this.getDimensions();
			drag.limit(this.element.parent(), this.options.contained ? undefined : this.dimMap.offset)
				.step(this.dimOfSpot, this.element.parent());
			this.element.addClass('dragging');
		},
		"dragmove": function( el, ev, drag ) {
			var current = this.determineValue();
			if(this.lastMove !== current){
				this.element.trigger( "changing", current );
				this.lastMove = current;
				this.updateRange(Math.round((current - this.options.min()) * this.dimOfSpot));
			} 
		},
		"dragend": function( el, ev, drag ) {
			this.options.val( this.determineValue() )
			this.element.removeClass('dragging');
		},
		determineValue : function(offset) {
			var offset = (offset || this.element.offset()[this.dimMap.offset]) - this.start,
				spot = Math.round(offset / this.dimOfSpot);
			return spot + this.options.min();
		},
		updatePosition: function() {
			this.getDimensions();
			var dim = Math.round((this.options.val() - this.options.min()) * this.dimOfSpot);

			var offset = {};
			offset[this.dimMap.offset] = dim;

			if(this.options.animate()){
				this.element.animate(offset, 'fast');
			} else {
				offset[this.dimMap.offset] = this.start + dim
				this.element.offset(offset);
			}

			this.updateRange(dim);
		},
		updateRange:function(dim){
			if(this.options.range()){
				this.element[this.options.range() === "min" ? 
					"prev" : "next"]()[this.dimMap.dim](dim);
			}
		},
		/**
		 * @param {Number} value - Optional. The new value for the slider. If
		 * omitted, the current value is returned.
		 * @return {Number}
		 */
		val: function( value ) {
			if(value != undefined){
				if(value < this.options.min()){
					value = this.options.min();
				} else if(value > this.options.max()){
					value = this.options.max();
				}
			}

			return this.options.val(value)
		},
		"{val} change" : function(){
			this.lastMove = this.options.val();
			this.updatePosition();

			this.element.trigger("changing", this.lastMove)
						.trigger("change", this.lastMove);
		},
		"{parent} click":function(elm,ev){
			if(ev.srcElement != this.element[0]){
				this.getDimensions();
				this.options.val(this.determineValue(ev[this.dimMap.pos]));
			}
		}
	})

});
