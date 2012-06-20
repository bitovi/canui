steal('can/control', 'can/view', 'can/util/string', function() {
	can.Control('can.ui.Widget', {
		defaults : {
			select : {},
			view : {},
			locale : {},
			event : {}
		}
	}, {
		/**
		 * Make a query within this controls element. Either use the selector from
		 * `this.options.select` or the passed selector.
		 *
		 * @param {String|jQuery} selector The selector to query
		 * @return {Collection} A collection of matching elements
		 */
		find : function(selector) {
			return this.element.find(this.options.select[selector] || selector);
		},

		/**
		 * Returns a localized message
		 *
		 * @param {String} name The name of the message in this.options.locale
		 * @param {Object} options The options to pass
		 * @return {String} The localized message
		 */
		message : function(name, options) {
			return can.sub(this.options.locale[name], options);
		},

		/**
		 * Render a view with a given name which is either a full string or a name in
		 * this.options.views.
		 *
		 * @param {String} name The name or full path of the view
		 * @param [options] The options to pass to the view, passes this control by default
		 * @return {DocumentFragment} The rendered view document fragment
		 */
		render : function(name, options) {
			return can.view(this.options.view[name] || name, options || this);
		}
	});
});