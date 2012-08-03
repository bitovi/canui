@page canui.Fills
@parent canui

Fills resizes an element so that it fills up the remaining space of
a parent element. When no parent selector or jQuery element is passed, the window will be filled.
For example, with this HTML:

    <div id="container">
        <div id="top">
          Longer text that might be wraped but everything still looks right.
        </div>
        <div id="fill">#fill</div>
        <div id="bottom">A bottom sibling.</div>
    </div>

To make the `#container` element fill up the window and the `#fill` element the remaining space in `#container`,
use this:

    $('#container').fills();
    $('#fill').fills('#container');

Fills listens to the [jQuery.event.resize resize event] to recalculate the fill element dimensions.
Whenever the container dimensions are changed programmatically `resize` has to be triggered:

    $('#fill').fills('#container');
    $('#container').height(500).resize();

## Demo

The following example shows a [resizable](http://jqueryui.com/demos/resizable/) `div` with a 10px padding and two
paragraphs. Resize it to see how the `#fill` element adjust it's size properly including the paragraphs margin
and the parent element padding even when a paragraph wraps.

@demo jquery/dom/fills/fills.html