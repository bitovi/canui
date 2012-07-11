steal('jquery').then(function ($) {
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
});
