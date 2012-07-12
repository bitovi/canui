steal('jquery',
	'can/construct/proxy',
	'can/control',
	'jquery/event/drag',
	'jquery/dom/dimensions',
	'canui/fills',
	'can/control/plugin')
.then(function () {
	$.support.correctOverflow = false;

	$(function () {
		var container = $('<div style="height: 18px; padding: 0; margin: 0">' +
			'<div style="height: 20px; padding: 0; margin: 0"></div></div>')
			.appendTo(document.body)
		$.support.correctOverflow = container.height() == 18;
		container.remove();
		container = null;
	});

	/**
	 * @class can.ui.Resize
	 * @parent canui
	 * @test canui/resize/funcunit.html
	 *
	 * @description A lightweight resize widget
	 *
	 * A lightweight resize widget
	 *
	 * ## Use
	 *
	 * Create a new resizable control instance:
	 *
	 *     new can.ui.Resize($('#resize'));
	 *
	 * This will take the jQuery object and allow you to
	 * resize it on the bottom, right, and bottom right
	 * of the element. If you want to choose which side
	 * you can resize it from, use the handles option:
	 *
	 *     new can.ui.Resize($('#resize'), {
	 *       handles: ['s']
	 *     });
	 *
	 * This will allow your content to be resizable only
	 * by dragging the bottom of the element. You can use any
	 * combination, and each direction corresponds to a side
	 * of the element:
	 *
	 * - s: bottom of the element
	 * - e: right side of the element
	 * - se: bottom right corner of the element
	 *
	 * You can also constrain how big or how small you want to
	 * allow the content to be with the min/max height/width
	 * options:
	 *
	 *     new can.ui.Resize($('#resize'), {
	 *       maxWidth: 300,
	 *       maxHeight: 300,
	 *       minWidth: 100,
	 *       minHeight: 200,
	 *     });
	 *
	 * This will limit the height of the resizable widget to between
	 * 200px and 300px and the width of the widget to between 100px
	 * and 300px.
	 *
	 * Similarly, it is also possible to keep the proportion of the height and width
	 * equal as you resize the element, this is done with the aspectRatio
	 * option:
	 *
	 *     new can.ui.Resize($('#resize'), {
	 *       aspectRatio: 16 / 9
	 *     });
	 *
	 * This will keep the size of your resizable widget with the aspect ratio
	 * of standard HD videos. This could come in handly if you are resizing
	 * a video element. This is also helpful if your widget resizes an image
	 * and you wish to keep the proportions of the image the same while resizing.
	 *
	 * You can contrain when resizing will take place on your widget. This is
	 * useful when a user might inadvertently start resizing the element. There are
	 * two ways to go about this:
	 *
	 *     new can.ui.Resize($('#resize'), {
	 *       delay: 2000,
	 *       distance: 10
	 *     });
	 *
	 * With the delay and distance options set, resizing cannot happen until
	 * two seconds have passed and you drag at least 10 pixels away from where you
	 * moused down at. Resizing will not occure until both conditions are met.
	 *
	 * It is possible to both style and hide the handles of the resizable widget
	 * You can choose to either style the default handle class, ui-resizable-handle
	 * which has the following styles applied to it be default:
	 *
	 *     .ui-resizable-handle {
	 *       display:block;
	 *       font-size:0.1px;
	 *       position:absolute;
	 *       z-index: 1000;
	 *     }
	 *
	 * You can also style specific handles with the ui-resizable-{direction name}
	 * classes. By default these are:
	 *     .ui-resizable-s {
	 *       bottom:-3px;
	 *       cursor:s-resize;
	 *       height:7px;
	 *       left:0;
	 *       width:100%;
	 *     }
	 *
	 *     .ui-resizable-e {
	 *       cursor:e-resize;
	 *       height:100%;
	 *       right:-3px;
	 *       top:0;
	 *       width:7px;
	 *     }
	 *
	 *     .ui-resizable-se {
	 *       bottom:0px;
	 *       cursor:se-resize;
	 *       height:12px;
	 *       right:0px;
	 *       width:12px;
	 *       background-color: #ddddff;
	 *     }
	 *
	 * Finally, you can choose to not have these handles appear until you
	 * move your mouse into the widget, this is done as:
	 *
	 *     new can.ui.Resize($('#resize'), {
	 *       autoHide: true
	 *     });
	 *
	 * With autoHide set to true, the handles will not appear on the screen until
	 * your mouse enters your widget, and will disappear as soon as your mouse
	 * leaves the widget.
	 *
	 * ## Demo
	 * @demo canui/resize/resize.html
	 *
	 * @param {Object} [options] Values to configure the behavior of resize:
	 *
	 * - `aspectRatio` - `{Number}` - The proportional relationship between the widget's width and its height
	 * - `autoHide` - `{Boolean}` - If `true`, the resize handles will not appear unless the
	 * mouse is inside the widget
	 * - `delay`  - `{Number}` - How long, in milliseconds, to wait until resizing starts
	 * - `distance` - `{Number}` - How far, in pixels, to wait until resizing starts
	 * - `handles` - `{Array}` - Where the handles should be in relation to the widget itself
	 * - `maxHeight` - `{Number}` - The maxiumum height the widget can be
	 * - `maxWidth` - `{Number}` - The maxiumum width the widget can be
	 * - `minHeight` - `{Number}` - The minimum height the widget can be
	 * - `minWidth` - `{Number}` - The minimum width the widget can be
	 * - `handleClassName` - `{String}` - A class name to use for the resizing handles.
	 *
	 * @return {can.ui.Resize}
	 */
	can.Control('can.ui.Resize', {
		pluginName : 'resizable',
		defaults : {
			aspectRatio : false,
			autoHide : false,
			delay : 0,
			distance : 0,
			handles : ['e', 's', 'se'],
			maxHeight : null,
			maxWidth : null,
			minHeight : 10,
			minWidth : 10,
			handleClassName : 'ui-resizable-handle'
		}
	}, {
		directionInfo : {
			's' : {
				limit : 'vertical',
				dim : 'height'
			},
			'e' : {
				limit : 'horizontal',
				dim : 'width'
			},
			'se' : {

			}
		},

		setup : function (el, options) {
			var diff = this._wrap($(el))[0];
			can.Control.prototype.setup.call(this, diff, options)

			this.original = $(el);
			if (diff != $(el)[0]) {
				this.original = $(el).fills({all : true}); //set to fill
			}
		},

		init : function (el, options) {
			this.element.prepend($.map(this.options.handles, this.proxy(function (dir) {
				return '<div class="ui-resizable-' + [dir, this.options.handleClassName].join(' ') + '"/>';
			})).join(''));


			this.options.autoHide && this.element.find('.ui-resizable-se').hide();
		},

		_wrap : function (el) {
			var ret = [];
			el.each(function () {
				if (this.nodeName.match(/canvas|textarea|input|select|button|img/i)) {
					var $el = $(this),
						$org = $el
					//Opera fix for relative positioning
					if (/relative/.test($el.css('position')) && $.browser.opera)
						$el.css({ position : 'relative', top : 'auto', left : 'auto' });

					//Create a wrapper element and set the wrapper to the new current internal element
					var position = $el.css('position')
					$el.wrap(
						$('<div class="ui-wrapper"></div>').css({
							position : position == 'static' ? "relative" : position,
							width : $el.outerWidth(),
							height : $el.outerHeight(),
							top : $el.css('top'),
							left : $el.css('left')
						})
					);

					//Overwrite the original $el
					$el = $el.parent()

					$elIsWrapper = true;

					//Move margins to the wrapper
					$el.css({
						marginLeft : $org.css("marginLeft"),
						marginTop : $org.css("marginTop"),
						marginRight : $org.css("marginRight"),
						marginBottom : $org.css("marginBottom")
					});

					$org.css({
						marginLeft : "0px",
						marginTop : "0px",
						marginRight : "0px",
						marginBottom : "0px"
					});

					ret.push($el)
				} else {
					ret.push(this)
				}
			});

			return $(ret);
		},

		_getDirection : function (el) {
			return el[0].className.match(/ui-resizable-(se|s|e)/)[1]
		},

		'.{handleClassName} dragdown' : function (el, ev, drag) {
			drag.distance(this.options.distance);
			this.delayMet = !this.options.delay;

			if (!this.delayMet) {
				this.dragTimeout = setTimeout(this.proxy(function () {
					this.delayMet = true;
				}), this.options.delay);
			}
		},

		mouseenter : function () {
			this.options.autoHide && this.element.find('.ui-resizable-se').show();
		},

		mouseleave : function () {
			this.options.autoHide && this.element.find('.ui-resizable-se').hide();
		},

		'.{handleClassName} draginit' : function (el, ev, drag) {
			this.margin = this.element.offsetv().plus(this.element.dimensionsv('outer')).minus(el.offsetv());
			this.overflow = $.curCSS(this.element[0], 'overflow');

			if (!$.support.correctOverflow && this.overflow == 'visible') {
				this.element.css('overflow', 'hidden');
			}

			var direction = this._getDirection(el);

			ev.stopPropagation();

			if (this.directionInfo[direction].limit) {
				drag[this.directionInfo[direction].limit]()
			}
			this.original.trigger('resizestart', arguments);
		},

		'.{handleClassName} dragmove' : function (el, ev, drag) {
			ev.preventDefault();
			if (this.delayMet) {
				this._move(el, ev, drag);
				this.original.trigger('resize', arguments);
			}
		},

		_move : function (el, ev, drag) {
			var direction = this._getDirection(el);

			if (direction.indexOf('s') > -1) {
				this._smallerMove(drag.location.y(),
					this.element.offset().top,
					this.options.minHeight,
					this.options.maxHeight,
					'outerHeight',
					this.options.minWidth,
					this.options.maxWidth,
					'outerWidth',
					this.margin.y(),
					this.options.aspectRatio)
			}

			if (direction.indexOf('e') > -1) {
				this._smallerMove(drag.location.x(),
					this.element.offset().left,
					this.options.minWidth,
					this.options.maxWidth,
					'outerWidth',
					this.options.minHeight,
					this.options.maxHeight,
					'outerHeight',
					this.margin.x(),
					1 / this.options.aspectRatio)
			}

			this.element.resize();
		},

		_smallerMove : function (end, start, min, max, outerFunc, oMin, oMax, oOuterFunc, margin, aspectRatio) {
			var outer = end - start;
			outer = Math.max(outer, min);

			if (max) {
				outer = Math.min(outer, max);
			}

			this.element[outerFunc](outer + margin);

			if (aspectRatio) {
				var otherOuter = outer * aspectRatio;
				otherOuter = Math.max(otherOuter, oMin);

				if (oMax) {
					otherOuter = Math.min(otherOuter, oMax);
				}
				this.element[oOuterFunc](otherOuter);
			}
		},

		'.{handleClassName} dragend' : function (el, ev, drag) {
			if (!$.support.correctOverflow && this.overflow == 'visible') {
				this.element.css('overflow', 'visible')
			}
			this.original.trigger('resizestop', arguments)
		},

		destroy : function () {
			this.element.find('.' + this.options.handleClassName).remove();
			can.Control.prototype.destroy.apply(this, arguments);
		}
	})
})