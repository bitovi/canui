# can.ui.Resize

can.ui comes with a simple resizable widget. It is a widget that allows you to resize elements with draggable handles. The base can.ui.Resize widget allows you to customize the resizing experience by:

1. Restricting the size of the element by setting minimum and maximum heights and widths
2. Customizing the aspect ratio of the element, so when resizing the element's height and width will remain in proportion with the other.
3. Postponing resizing of the element either for a set amount of time, or until the mouse has moved a certain amount of pixels away from the element

can.ui.Resize also lets you hook these events while resizing elements:

- resizestart
- resize
- resizestop

### resizestart

This event is triggered at the start of resizing an element. This happens as soon as you mouse down on one of the resize handles.

### resize

This event is triggered every time the mouse moves while dragging a resize handle.

### resizestop

This event is triggered at the end of resizing an element, as soon as you mouse up on one of the resize handles.

## Example - Resizable Modal

[jQuery UI's Dialog](http://jqueryui.com/demos/dialog/) allows you to resize modal dialogs by default with the resizable flag. We can recreate this behavior in a custom widget with the can.ui.Resize and can.ui.Modal widgets together. Basically what we need to do is:

1. Create a modal widget
2. When the widget is created, make the element resizable

We can implement a widget with this functionality by overriding the modal's init event, and applying the resize widget to its element as such:

    var resizableModal = can.ui.Modal({}, {
        init: function() {
        this._super.apply(this, arguments);
        new can.ui.Resize(this.element);
      }
    })

This allows us to to create several resizable modals by calling:

    var modal = new resizableModal(element);

## Example - Destroy Resize After Displaying Full Content

You might want to allow a certain portion of your content to remain hidden from view until it's dragged into view. Once the content is completely in view, you wouldn't want the user to hide it again. We can do this by listening for  the resize and resizestop events. We can implement it as:

This is the HTML structure for the content:

    <div id="disable-content">
        <div class="temp_content" style="display: none; width:300px"></div>
        <div id="resizable" style="width:300px">
        Nam metus purus, convallis eu mollis lacinia, consequat eu erat. Cras ac velit sit amet dolor luctus pulvinar vel lobortis metus. Donec vehicula varius blandit. Aenean ultrices lacinia mi adipiscing pulvinar. Etiam tincidunt, magna quis pretium mattis, arcu augue varius leo, ut aliquam ligula diam sed lorem. Phasellus faucibus, nulla in aliquet tempus, quam lectus fermentum turpis, fringilla aliquet nibh ante a leo.
        </div>
        <div class="status">Drag to show more content</div>
    </div>

Our resizable widget is implemented like this:

    var disableAfterResize = can.ui.Resize({ }, {
      init: function(el, ev) {
        this.options.handles = ['s'];
        this._super.apply(this, arguments);
        this.max_height = this.element.siblings('.temp_content').html(this.element.html()).height();

      },
      " resize": function(el, ev) {
        if(el.height() >= this.max_height) {
          this.element.siblings('.status').html('No more content');
        }
        else {
            this.element.siblings('.status').html('Drag to show more content');
        }
      },
      " resizestop": function(el, ev) {
        if(el.height() >= this.max_height) {
          this.destroy();
        }
      }
    })

When we drag down the widget, we now add extra functionality whenever it is resized and when resizing stops. If the height of the widget is greater than or equal to the height of the content, we say that all the content is shown. Once resizing is stopped, if this is still the case, we remove the ability to resize.