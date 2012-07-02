steal(
	'can/construct/proxy',
	'can/construct/super',
	'can/control',
	'can/view/ejs',
	'can/util/function',
	'canui/positionable',
	'steal/less'
).then(
	"./views/tooltip.ejs",
	'./tooltip.less',
function() {

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

	can.Control("can.ui.Tooltip",
	/**
	 * @static
	 */
	{
		/**
		 * This is just a hash map that holds some values for positionable as
		 * well as some classes that get applied to the arrow depending on
		 * which position you choose for the tooltip.
		 *
		 * @hide 
		 */
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
		/**
		 * Default options for the tooltip.
		 *
		 * * `theme` - {String} String name of the theme to be applied to the
		 * tooltip. Possible values:
		 *		* `info`
		 *		* `success`
		 *		* `error`
		 *		* `notice`
		 *	Default: `info`.
		 *	* `showEvent` - {String|Boolean} The name of the event that should 
		 *	trigger the tooltip to be shown. Set to `false` to have the tooltip 
		 *	shown on initialization. Default: `mouseenter`.
		 *	* `hideEvent` - {String} The name of the event that should trigger
		 *	the tooltip to hide. Default: `mouseleave`.
		 *	* `showEffect` - {String} Animation effect to be used to display the
		 *	tooltip. Default: `show`.
		 *	* `hideEffect` - {String} Animation effect to be used to hide the
		 *	tooltip. Default: `fadeOut`.
		 *	* `showTimeout` - {Integer} Length of time in ms to wait before
		 *	showing the tooltip. Default: `200`.
		 *	* `hideTimeout` - {Integer} Length of time in ms to wait before
		 *	hiding the tooltip. Default: `500`.
		 *	* `position` - {String} The position the tooltip should be relative
		 *	to the element it's being initialized on.
		 *
		 * @attribute
		 */
		defaults: {
			theme: "info",
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
	}, 
	/** @prototype */
	{

		setup : function( el, options ) {
		
			options = $.extend( this.constructor.defaults, options || {} );

			// Append template to the offset parent
			var offsetParent = el.offsetParent();
			offsetParent.append( can.view( "./views/tooltip.ejs", options ) );

			// save references to each component of the tooltip
			options.$ = {
				tooltip : offsetParent.children().eq(-1)
			}
			can.each( ["outer", "inner", "arrow"], function( className ) {
				options.$[ className ] = options.$.tooltip.find( "." + className );
			});

			this._super( el, options );
		
		},

		init : function() {

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

		/**
		 * Methods to ensure that the tooltip doesn't hide when your mouse is
		 * over it.
		 * @hide
		 */
		"{$.tooltip} mouseenter" : function() {
			if ( this.options.showEvent == "mouseenter" ) {
				this.show();
			}
		},
		/** @hide */
		"{$.tooltip} mouseleave" : function() {
			if ( this.options.showEvent == "mouseenter" ) {
				this.hide();
			}
		},

		/**
		 * Determines where to position the "tip" of the tooltip depending on
		 * where the tooltip is being positioned.
		 * @hide
		 */
		determineCorners: function() {
			var arrowSpacing = this.space * 2,
			    offsetSpacing = this.space * 4;

			this.corners = {
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

		/**
		 * Determines where to position the tooltip.
		 * @hide
		 */
		determinePosition: function() {

			var parts = "my at".split(" "),
				positionArrays = {
					my : [],
					at : []
				},
				position = {};

			// ZOMG double each, thats like, O(n^2)
			can.each( parts, this.proxy( function( part ) {
				can.each( this.options.position.split(""), function( c ) {
					positionArrays[part].push( can.ui.Tooltip.positions[ c ][part] );
				});

				// Have to do this craziness because the jQuery UI position
				// plugin requires position to be in the format of
				// "horizontal vertical" :/
				position[part] = (/left|right/.test( positionArrays[part][0] ) ?
					positionArrays[part] : 
					positionArrays[part].reverse()
					).join(" ");
			}));

			this.position = $.extend({},
				can.ui.Tooltip.positions[ this.options.position.charAt(0) ],
				position
			);

			this.options.$.arrow
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

		/**
		 * Sets the position of the tooltip. Takes into account if the tooltip
		 * is visible or not.
		 * @hide
		 */
		setPosition: function() {

			var isHidden = this.options.$.tooltip.css("display") == "none",
			    positionable;

			if ( isHidden ) {
				this.options.$.tooltip.css({
					visibility: "hidden",
					display: "block"
				})

				positionable = new can.ui.Positionable(this.options.$.tooltip,
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
				positionable = new can.ui.Positionable(this.options.$.tooltip,
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

		/**
		 * Manually shows the tooltip according to the `showEvent` and
		 * `showEffect`.
		 */
		show : function() {
			clearTimeout( this.options.hideTimeoutId );
			this.options.$.tooltip.stop( true, true )[ this.options.showEffect ]();
		},

		/**
		 * Manually hides the tooltip according to the `hideEvent` and
		 * `hideEffect`.
		 */
		hide : function() {
			this.options.hideTimeoutId = setTimeout(this.proxy( function() {
				this.options.$.tooltip[ this.options.hideEffect ]();
			}), this.options.hidetimeout );
		},

		/**
		 * Binding of the show and hide events.
		 * @hide
		 */
		" {showEvent}" : "show",

		/** @hide */
		" {hideEvent}" : "hide",

		/**
		 * Destroys the tooltip and unbinds events.
		 */
		"destroy" : function() {
			this.options.$.tooltip.remove();
			delete this.options.$;
			this._super();
		},

		/**
		 * Debounced window resize event to reposition the tooltip when the
		 * window resizes.
		 */
		"{window} resize" : function() {
			clearTimeout( this.windowTimeout );
			this.windowTimeout = setTimeout( this.proxy( this.setPosition, this ), 100);
		}
	});

});
