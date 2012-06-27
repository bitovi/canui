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

## Example - Implementing Twitter Bottstrap style modal

[Twitter Bootstrap](http://twitter.github.com/bootstrap/javascript.html#modals) has a nice modal implementation.
In this example we will recreate it's basic behavior:

1. Modal window should slide from the top of the page.
2. Overlay element should fade in.
3. Closing overlay should slide modal out of page and fade out the overlay.

We can implement that kind of behavior by passing custom hide and show functions when we create the modal

    new can.ui.Modal($(elem), {
    	show : function(el, position, overlay, cb){
    		var height = el.height();
    		var hiddenPosition = $.extend({}, position, {top: "-" + height + "px"})
    		overlay.css('opacity', 0).show().animate({opacity: 1}, 100);
    		el.show().css(hiddenPosition).animate(position, 100, cb);
    	},
    	hide : function(el, overlay, cb){
    		var height = el.height();
    		el.animate({top: "-" + height + "px"}, 100, cb)
    		overlay.animate({opacity: 0}, 100)
    	}
    }, {})

Although this will work, we have to pass these functions every time we create a modal window. It would be great
 if we could just create our custom modal controller and simply pass the default functions. We can do that too:

    var bootstrapModal = can.ui.Modal({
    	show : function(el, position, overlay, cb){
    		var height = el.height();
    		var hiddenPosition = $.extend({}, position, {top: "-" + height + "px"})
    		overlay.css('opacity', 0).show().animate({opacity: 1}, 100);
    		el.show().css(hiddenPosition).animate(position, 100, cb);
    	},
    	hide : function(el, overlay, cb){
    		var height = el.height();
    		el.animate({top: "-" + height + "px"}, 100, cb)
    		overlay.animate({opacity: 0}, 100)
    	}
    }, {})

This implementation will allow us to create our custom modal by calling:

    new bootstrapModal(element);

If we want to customize show or hide behavior, we can still pass show or hide method when creating the modal:

    new bootstrapModal($(elem), {
    	show : function(el, position, overlay, cb){
    		// custom show code
    	}
    }, {})


In just a few lines of code we've implemented the modal widget that behaves similary to the Twitter bootstrap's
modal widget, while using all of the low level plumbing from the can.ui.Modal.

## Example - Pausable events and modal

Modal widget is implemented in a way that allows you to easily take control over hiding / closing. Imagine if 
user was presented with some form inside the modal. We want to make sure that he won't accidentaly close the 
form if he put some content in there. Let's see how we can implement it. 

This is the HTML structure for the form:

    <div id="signup-form" class="modal">
    	<form>
    		<div><label>Username</label><input name="username" /></div>
    		<div><label>Password</label><input name="password" type="password" /></div>
    		<div><input type="submit" value="Save!" /></div>
    	</form>
    </div>

Our modal widget is implemented like this:

    var formModal = can.ui.Modal({}, {
    	"input keydown" : "markDirty",
    	"input change"  : "markDirty",
    	markDirty : function(){
    		this.element.addClass('dirty')
    	},
    	" hide" : function(el, ev){
    		if(this.element.hasClass('dirty')){
    			ev.pause();
    			new confirmModal($('<div/>'), {
    				confirm : function(){
    					ev.resume();
    				},
    				of : this.element
    			})
    		}
    	}
    })

As you can see it will mark the element as dirty if someone enters something in the form. If `hide` event is triggered
on the modal (by pressing the escape key for instance) that event is going to be paused and another modal will show up
with the confirmation. Confirm modal is implemented like this:

    var confirmModal = can.ui.Modal({
    	defaults : {
    		confirm       : function(){},
    		destroyOnHide : true
    	}
    }, {
    	init : function(){
    		this.element.html('Are you sure? <a href="javascript://"" class="confirm">YES!</a>').addClass('modal');
    		this._super.apply(this, arguments)
    	},
    	".confirm click" : function(){
    		this.options.confirm();
    		this.element.remove();
    	}
    })

Confirm modal will call whatever is passed as the `confirm` option when user clicks on the "YES!" link. In our case we 
passed it a function that will resume the event. 

This was an example that showed you how to take control over the behavior of your modals. can.ui.Modal is a great low
level modal widget that is extremely easy to customize and extend.