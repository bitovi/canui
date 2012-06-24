# can.ui.Modal

can.ui comes with the modal widget. It is a low level widget that allows you 
to easily build your modal widgets. can.ui.Modal takes care of all plumbing involved
in creation and using of widgets. Some of the things can.ui.Modal will take care of:

1. Modal positioning. can.ui.Modal uses can.ui.Positionable which allows you to use
simple syntax to position your modal.

2. Modal stacking. can.ui.Modal keeps stack of all open modals to make sure they are
always shown in proper order. If closeOnEscape option is set to true can.ui.Modal will
make sure only the modal that is currently on top is closed.

3. Modal reordering. You can use moveToTop method to put the modal on top.

4. Overlays. can.ui.Modal allows you to pass either true or jQuery object as an overlay.
It will take care of correct z-index, dimensions and positioning.

5. Showing modals inside elements. can.ui.Modal can be shown inside an element and everything
will just work, including positioning, overlay dimensions, etc.

6. Easy customization. can.ui.Modal allows you to customize show and hide methods on the controller
or on the instance level. This makes it easy to create custom modal controllers that can be 
customized on per instance basis.

## Examples

### Implementing Twitter Bottstrap style modal

[Twitter Bootstrap](http://twitter.github.com/bootstrap/javascript.html#modals) has a nice modal implementation.
In this example we will recreate it's basic behavior:

1. Modal window should slide from the top of the page.
2. Overlay element should fade in.
3. Closing overlay should slide modal out of page and fade out the overlay.

Here is the code:

    var bootstrapModal = can.ui.Modal({
    	show : function(el, position, overlay, cb){
    		if(!el.is(':visible')){
    			el.css('opacity', 0).show();
    			var height = el.outerHeight()
    			el.css('opacity', 1).hide();
    		}
    		var hiddenPosition = $.extend({}, position, {top: "-" + height + "px"})
    		overlay.css('opacity', 0).show().animate({opacity: 1}, 100);
    		el.show().css(hiddenPosition).animate(position, 100, cb);
    	},
    	hide : function(el, overlay, cb){
    		var height = el.outerHeight();
    		el.animate({top: "-" + height + "px"}, 100, cb)
    		overlay.animate({opacity: 0}, 100)
    	}
    }, {})

You can create this modal like this:

    new bootstrapModal(element);

