---
layout: default
version: 1.0b
---

# Welcome to CanUI

CanUI brings the best of CanJS and jQuery++ together to help you build awesome user interfaces.
It is not supposed to be a full UI widget library but instead provides the building blocks you need
to create your own UI widgets the way you want them.

## Get CanUI

{% include builder.html %}

## Fills `$(element).fills([container])`

[Fills](http://donejs.com/docs.html#!canui.fills) resizes an element so that it fills up the remaining space of
a parent element. When no parent selector or jQuery element is passed, the window will be filled.
For example, with this HTML:

{% highlight html %}
<div id="container">
    <div id="top">
      Longer text that might be wraped but everything still looks right.
    </div>
    <div id="fill">#fill</div>
    <div id="bottom">A bottom sibling.</div>
</div>
{% endhighlight %}

To make the `#container` element fill up the window and the `#fill` element the remaining space in `#container`,
use this:

{% highlight javascript %}
$('#container').fills();
$('#fill').fills('#container');
{% endhighlight %}

The following example shows a container that can be resized using the blue square and demonstrates how the
`#fill` element adjusts its size correctly to fill out the remaining space:

<iframe style="width: 100%; height: 370px" src="http://jsfiddle.net/HSWTA/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### resize `$(element).resize()`

Fills listens to the [jQuery++ resize](http://jquerypp.com/#resize) event to recalculate the fill element dimensions.
Whenever the container dimensions are changed programmatically `resize` has to be triggered:

{% highlight javascript %}
$('#fill').fills('#container');
$('#container').height(500).resize();
{% endhighlight %}

## TableScroll `$(element).tableScroll([fillParent])`

[TableScroll](http://donejs.com/docs.html#!canui.) makes a table body scrollable while keeping the table headers and
footers fixed. This is useful for making grid like widgets.

The following example shows a scrollable table with fixed header and footer:

<iframe style="width: 100%; height: 270px" src="http://jsfiddle.net/KHNyy/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

To make a table scrollable call:

{% highlight javascript %}
$('table').tableScroll();
{% endhighlight %}

On a table like this:

{% highlight html %}
<div style="height: 200px;">
  <table>
    <thead>
      <tr>
        <th>Firstname</th>
        <th>Lastname</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Jean-Luc</td>
        <td>Picard</td>
      </tr>
      <tr>
        <td>William</td>
        <td>Adama</td>
      </tr>
    </tbody>
  </table>
</div>
{% endhighlight %}

### update `$(element).tableScroll()`

After creating a TableScoll, future calls to `$(element).tableScroll()` update the tables'
layout after a header or footer column has been added, removed, or had its content changed.

{% highlight javascript %}
$('table').tableScroll();
// Get the header element
var header = $('table').tableScroll('elements').header;
// Update the first heading column
header.find('th:first').html('NewColumnName');
// Update the columns
$('table').tableScroll('update');
{% endhighlight %}

### elements `$('table').tableScroll('elements')`

TableScroll rearranges the original table to allow the table body to scroll and the `thead` and `tfoot` elements
to stay fixed. The new HTML from the above example will look like this:

{% highlight html %}
<div style="height: 200px;">
  <div class="tableScroll">
    <div class="header">
      <table>
        <thead>
          <tr>
            <th>Firstname</th>
            <th>Lastname</th>
          </tr>
        </thead>
      </table>
    </div>
    <div style="width: 100%;">
      <div style="height: ...;">
        <table>
          <tbody>
            <tr>
              <td>Jean-Luc</td>
              <td>Picard</td>
            </tr>
            <tr>
              <td>William</td>
              <td>Adama</td>
            </tr>
            <tr data-spacer="thead">
              <th><div></div></th>
              <th><div></div></th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
{% endhighlight %}

`$('table').tableScroll('elements')` returns an object with references to the `body`, `header`, `footer`
and `scrollBody` elements to easily access these new elements. For example, the text of the header
columns can be changed like this:

{% highlight javascript %}
$('table').tableScroll();
// Get the elements
var elements = $('table').tableScroll('elements');
// Change the header
elements.header.find('th:eq(0').html('First');
elements.header.find('th:eq(1').html('Last');
// Update the tableScroll
$('table').tableScroll();
{% endhighlight %}

### resize `$(element).resize()`

The `resize` event should be triggered whenever any table dimensions or row contents have changed to keep
header and footer widths synchronized.

{% highlight javascript %}
// Get the table body
var body = $('table').tableScroll('elements').body;
// Change the first rows content
body.find('tr:first td:first').html("Very long content");
$('table').resize();
{% endhighlight %}

### rows `$(element).tableScroll('rows', [replaceRows])`

`$(element).tableScroll('rows', [replaceRows])` is the recommended way of accessing and manipulating rows.
It returns a jQuery collection containing all rows or replaces all rows with a collection of new rows.
A [resize](#tablescroll-resize) event should be triggered after any modification to keep content,
header and footer sizes synchronized.

{% highlight javascript %}
// Remove the last row
$('#grid').grid('rows').last().remove();
// Resize everything
$('#grid').resize();
{% endhighlight %}

## List `$(element).list(options)`

[List](http://donejs.com/docs.html#!canui.list) displays the contents of a `can.Observe.List`. It is faster than
live binding to an observable list because it only updates the affected rows instead of re-rendering the entire
list. It is also possible to provide different list sources like a `can.Deferred` or a `can.compute` and set the
content to display when the list is empty or a deferred is being resolved.
Initialize it with the following options:

- `list` - An array, `can.Observe.List`, `can.Deferred` or `can.compute` providing the list data.
- `tag` - The tag name for the wrapping row element.
- `view` - The view to render a single row. Gets the current `can.Observe` passed.
- `empty` - The content to show when the list is empty.
- `loading` - The content to show while a deferred is being resolved.
- `cid` (default : `'_cid'`) - The unique id attribute to identify a `can.Observe`.
- `attribute` (default : `'data-cid'`) - The rows attribute name that stores the `cid` value.

### Row views

A row is defined by the `tag` name and a `view` containing an [EJS](http://canjs.us/#can_ejs) view
or callback that returns the content of that tag. The current observable will be passed either as the EJS
view context or as the callback parameter.
Initialize the list widget on an unordered list (`<ul id="list"></ul>`) like this:

{% highlight javascript %}
$('#list').list({
  tag : 'li',
  view : '<%= this.attr(\'name\') %>',
  list : new can.Observe.List([{
    name : 'Jean-Luc'
  }])
});
{% endhighlight %}

Because `can.view(viewname)` returns a renderer callback you can load views like this:

{% highlight javascript %}
$('#list').list({
  tag : 'li',
  view : can.view('path/to/view.ejs'),
  list : new can.Observe.List([{
    name : 'Jean-Luc'
  }])
});
{% endhighlight %}

`empty` and `loading` will also be wrapped into the tag and can be either an EJS view or a callback
that returns the content. Initializing an empty list can be done like this:

{% highlight javascript %}
$('#list').list({
  tag : 'li',
  view : '<%= this.attr(\'name\') %>',
  empty : 'Nothing found'
});
{% endhighlight %}

### List data

There are several ways to provide list data. Usually it will be a `can.Observe.List` instance
that contains observable objects. When passing a normal Array, it will be converted to an observable list.
Another option is to pass a `can.Deferred` that resolves to an observable list or array. The grid will show the
content of `loading` while the Deferred is being resolved. This makes it possible to directly pass
`can.Model.findAll` requests:

{% highlight javascript %}
var Person = can.Model({
  findAll : 'GET /people',
  findOne : 'GET /people/{id}',
  create  : 'POST /people',
  update  : 'PUT /people/{id}',
  destroy : 'DELETE /people/{id}'
}, {});

$('#list').list({
  tag : 'li',
  loading : 'Please wait...',
  empty : 'Sorry, nothing found...',
  view : '<%= this.attr(\'name\') %>',
  list : Person.findAll()
});
{% endhighlight %}

Another possibility is to pass a `can.compute` which returns an array, `can.Observe.List` or `can.Deferred`.
Combined with `can.Observe`, this makes paginating Model requests very easy, for example:

{% highlight javascript %}
var paginator = new can.Observe({
  offset : 0,
  limit : 10
});

$('#list').list({
  tag : 'li',
  loading : 'Please wait...',
  empty : 'Sorry, nothing found...',
  view : '<%= this.attr(\'name\') %>',
  list : can.compute(function() {
    return Person.findAll({
      offset : paginator.attr('offset'),
      limit : paginator.attr('limit')
    });
  })
});

// This will load items 20 to 29 from the server
// and render the result into the list
paginator.attr('offset', 20);
{% endhighlight %}

### Events

List triggers the `rendered` event after the list has been fully rendered and the `changed` event when items
got removed or added. Listening to the `rendered` event is useful if you want to get the actual converted list data,
for example after a deferred or computed property changed:

{% highlight javascript %}
var compute = can.compute([]);

$('#list').list({
  tag : 'li',
  loading : 'Please wait...',
  empty : 'Sorry, nothing found...',
  view : '<%= this.attr(\'name\') %>',
  list : compute
});

// When the list is rendered, retrieve the first element
$('#list').on('rendered', function(ev) {
  var list = $(this).list('list');
  list[0] instanceof can.Observe // -> true
  list[0].attr()
  // -> { firstname : "John", lastname : "Doe" }
});

// Update the compute with an array
compute([{
  firstname : "John",
  lastname : "Doe"
}]);
{% endhighlight %}

### Example

The following example uses the List widget to display a list of simple Todo data. It is also possible
to add and remove Todos from the list:

<iframe style="width: 100%; height: 270px" src="http://jsfiddle.net/donejs/Vmxep/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### update `$(element).list([options])`

Once created on an element, any other call to `$(element).list([options])` will force rerendering the list
using the updated options.

{% highlight javascript %}
// Will update the list with an empty array
// causing it to show `empty`
$('#list').list({
  list : []
});
{% endhighlight %}

### list `$(element).list('list', [newList])`

`$(element).list('list', [newList])` returns a `can.Observe.List` with the currently displayed data.
When passing `newList`, the List will be updated with that list. `$(element).list('list')` is the best way
to work with the resolved list data, for example when a Deferred was passed initially:

{% highlight javascript %}
$('#list').list({
  tag : 'li',
  loading : 'Please wait...',
  empty : 'Sorry, nothing found...',
  view : '<%= this.attr(\'name\') %>',
  list : Person.findAll()
});

// After the list is rendered, remove the last element
$('#list').on('rendered', function(ev) {
  $('#list').list('list').pop();
});
{% endhighlight %}

### items `$(element).list('items', [rows])`

`$(element).list('items', [rows])` returns a `can.Observe.List` of all observes (the same as `$(element).list('list')`)
or all observes for the given row elements. This can be used to retrieve the observable for a row that was clicked:

{% highlight javascript %}
$('li[data-cid]').on('click', function() {
  var observe = $('#list').list('items', this)[0];
});
{% endhighlight %}

Or to remove a `can.Model` from the list when clicking on a `.remove` element in a row:

{% highlight javascript %}
$('#list').on('click', '.remove', function() {
  var row = $(this).closest('li[data-cid]'),
      model = $('#list').list('items', row)[0];

  // A destroyed model will be automatically removed
  // from any list
  model.destroy();
});
{% endhighlight %}

### rowElements `$(element).list('rowElements', [observes])`

`$(element).list('rowElements', [observes])` returns a jQuery collection of all rows or all row elements
representing the given observes. The following example retrieves all observes with an age of less
than 18 and adds the `underage` class to their row elements:

{% highlight javascript %}
var underaged = new can.Observe.List();
$('#list').list('list').each(function(observe) {
  if(observe.attr('age') < 18) {
    underaged.push(observe);
  }
});

$('#list').list('rowElements', underaged).addClass('underage');
{% endhighlight %}

## Grid `$(element).grid(options)`

[Grid](http://donejs.com/docs.html#!canui.grid) combines [List](#list) and [TableScroll](#tablescroll) into a grid
widget to display a list of data in a table.

Possible options:

- `empty` - The view name or a callback for the content to display when the list is empty.
- `loading` - The view name or a callback for the content to display while a deferred is being resolved.
- `footer` - The view name or a callback for the content to display in the table footer.
- `row` - View name for a single grid row that gets the converted columns passed.
- `list` - An array, `can.Observe.List`, `can.Deferred` or `can.compute` providing the [list data](#list-list_data).
- `columns` - The definition of the [columns](#grid-column) to display.
- `scrollable` (default: `false`) - If this grid should be scrollable using [TableScroll](#tablescroll).

With a markup like this:

{% highlight html %}
<table id="grid"></table>
{% endhighlight %}

And this `can.Observe.List`:

{% highlight javascript %}
var people = new can.Observe.List([{
    firstname : 'John',
    lastname : 'Doe',
    age : 42
  }, {
    firstname : 'First',
    lastname : 'Last',
    age : 26
  }
]);
{% endhighlight %}

The grid can be initialized like this:

{% highlight javascript %}
$('#grid').grid({
  empty : 'Sorry, nothing found',
  loading : 'Retrieving people list...',
  columns : [
    { header : 'First name', content : 'firstname' },
    { header : 'Last name', content : 'lastname' },
    { header : 'Age', content : 'age' }
  ],
  list : people
});
{% endhighlight %}

<iframe style="width: 100%; height: 270px" src="http://jsfiddle.net/donejs/GRxpe/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### columns `$(element).grid('columns', [columns])`

Column definitions are provided as a `can.Observe.List` or an array of objects. Each object
must at least contain:

- `header` - The table column header content.
- `content` - The content to display for this column. This can either be an attribute name
or a callback in the form of `function(observe)` that returns the string content or document
fragment with computed properties for the current column.

The following example creates a grid with a column that contains the combined first- and lastname:

{% highlight javascript %}
$('#grid').grid({
  columns : [{
      header : 'Name',
      content : function(observe) {
        return observe.attr('firstname') + ' ' + observe.attr('lastname');
      }
    },
    { header : 'Age', content : 'age' }
  ],
  list : people
});
{% endhighlight %}

Columns are acessible as a `can.Observe.List`, which makes it easy to update its attributes:

{% highlight javascript %}
// Update the header text of the first column
$('#grid').grid('columns').attr('0.header', 'Full name');
{% endhighlight %}

### list `$(element).grid('list', [newList])`

`$(element).grid('list', [newList])` returns a `can.Observe.List` with the data currently displayed in the grid or
updates the current list. It does this by passing this call to the [list method](#list-list) of the List widget
used to display the rows internally. To remove the last item from the grid simply use this:

{% highlight javascript %}
$('#grid').grid('list').pop();
{% endhighlight %}

### items `$(element).grid('items', [rows])`

`$(element).list('items', [rows])` returns a `can.Observe.List` of all observes or all observes for the
given row elements. It works just like the [items](#list-items) method of the List widget.
Use it, for example, to retrieve the observe instance for a row that has been clicked:

{% highlight javascript %}
$('#grid tr').on('click', function() {
  var observe = $('#grid').grid('items', this)[0];
});
{% endhighlight %}

### rowElements `$(element).grid('rowElements', [observes])`

`$(element).grid('rowElements', [observes])` returns a jQuery collection of all rows or all row elements
representing the given observes just like the [rowElements](#list-rowelements) method of the List widget:

{% highlight javascript %}
// Retrieves the row element for the first observe
$('#list').grid('rowElements', people[0])
// -> [<tr data-cid="...">...</tr>]
{% endhighlight %}

### tableScroll `$(element).grid('tableScroll')`

If the `scrollable` option is set to true, `$(element).grid('tableScroll')` will return the [TableScroll](#tablescroll)
instance that is used to make the grid scrollable, otherwise `null`.
This can be used, for example, to automatically request new data when the user scrolled to the bottom of the grid:

{% highlight javascript %}
var offset = 0;
$('#grid').grid({
  loading : function() {
    return 'Loading data...';
  },
  columns : [{
      header : 'First name',
      attr : 'firstname'
    }, {
      header : 'Last name',
      attr : 'lastname'
    }
  ],
  list : Person.findAll({
    offset : offset,
    limit : 10
  })
});

var elements = $('#grid').grid('tableScroll').elements(),
  deferred = null;

elements.scrollBody.on('scroll', function() {
  if($(this).scrollTop() == $(this).parent().height()) {
    if(!deferred || deferred.isResolved()) {
      offset += 10;
      deferred = Person.findAll({
        offset : offset,
        limit : 10
      }).done(function(people) {
        var data = $('#grid').grid('list');
        can.each(people, function(person) {
          data.push(people);
        });
      });
    }
  }
});
{% endhighlight %}

## Positionable `$(element).positionable(options)`

[Positionable](http://donejs.com/docs.html#!canui.positionable) allows to position an element relative to
another. This is very useful for implementing UI widgets, such as tooltips and autocompletes.
Positionable takes the following options:

- `my` - Edge of the positionable element to use for positioning.
Can be one of `"top"`, `"center"`, `"bottom"`, `"left"` and `"right"`.
Combined values like `bottom left` are also possible.
- `at` - Edge of the target element to use for positioning. Accepts the same values as `my`.
- `of` - The target element or selector to use for positioning.
- `collision` - The collision strategy to use when the positionable element doesn't fit in the window. Possible values:
  - `"fit"` - Attempts to position the element as close as possible to the target without clipping the positionable.
  - `"flip"` - Flips the element to the opposite side of the target.
  - `"none"` - Doesn't use any collision strategey.
- `hideWhenInvisible` - Hide the positionable element when the target element scrolls out of visibility range.

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/donejs/UqNs8/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### move `$(element).trigger('move')`

The `move` event should be triggered whenever a positionable needs to reposition itself.
For example, when the target element scrolls within an overflowing container:

{% highlight javascript %}
$('#tooltip').positionable({
  of: $('#element'),
  my: "bottom",
  at: "top",
  hideWhenOfInvisible: true
});

$('.scrollable').bind('scroll', function(){
  $('#tooltip').trigger('move')
});
{% endhighlight %}

If the target element is [draggable](http://jquerypp.com/#drag), `move` will be triggered whenever the
draggable moves.

## Selectable `$(element).selectable(options)`

[Selectable](http://donejs.com/docs.html#!canui.selectable) provides keyboard and mouse selection for a group
of elements. It handles keyboard navigation, multi selection and automatic deselection. A selectable can be
initialized with the following options:

- `selectOn` (default: `"[tabindex]"`) - The selector to use for selectable items
- `selectedClassName` (default: `"selected"`) - The class name to add to a selected item
- `activateClassName` (default: `"activated"`) - The class name to add to an activated item
- `multiActivate` (default: `true`) - If multi selection is enabled
- `outsideDeactivate` (default: `true`) - Deactivate everything when a click or keypress happens outside of the selectable
- `deactivateParent` (default: `document`) - If `outsideDeactivate` is true, the parent element to use for deactivating

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/donejs/hJdf2/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### selectables `$(element).selectable('selectables')`

Returns all visible elements that are selectable:

{% highlight html %}
<ul>
  <li tabindex="0">Item 1</li>
  <li tabindex="1">Item 2</li>
  <li tabindex="2" style="display: none;">Item 3</li>
</ul>
{% endhighlight %}

{% highlight javascript %}
$('ul').selectable();
$('ul').selectable('selectables')
// -> [<li tabindex="0">Item 1</li>, <li tabindex="1">Item 2</li>]
{% endhighlight %}

### selected `$(element).selectable('selected', [selection])`

Gets or sets the selected element. When setting the element, the `select` event will be triggered.
Only one element can be selected at a time. The second `li` from the above example can be selected
programmatically like this:

{% highlight javascript %}
// Listen to the select event
$('ul li').on('select', function() {
  console.log('Selected', this);
});
$('ul').selectable('selected', $('ul li:eq(1)'));
$('ul').selectable('selected') // -> <li tabindex="1">Item 2</li>
{% endhighlight %}

### deselect `$(element).selectable('deselect')`

Deselect the currently selected element and trigger the `deselect` event:

{% highlight javascript %}
// Listen to the deselect event
$('ul li').on('deselect', function() {
  console.log('Deselected', this);
});
$('ul').selectable('deselect');
{% endhighlight %}

### activated `$(element).selectable('activated', [el], [ev])`

Returns the currently activated elements or activates an element and triggers the `activate` event.
`ev` can be either an event object used to check if a multi selection key (shift, control or meta)
is pressed or `true` to add the element to a multi selection.

The following example activates the second list item and then adds the first item:

{% highlight javascript %}
$('ul').selectable('activated', $('ul li:eq(1)'));
$('ul').selectable('activated', $('ul li:eq(0)'), true);
{% endhighlight %}

### deactivate `$(element).selectable('deactivate')`

Deactivates all active elements and triggers the `deactivate` event.

## Resizable

[Resizable](http://donejs.com/docs.html#!canui.resizable) allows to resize an element by adding draggable handles.
It can be initialized with these options:

- __aspectRatio__ (default: `false`) - Whether to keep the ratio between width and height
- __autoHide__ (default: `false`) - If `true`, hide the handles unless the mouse is inside the resizable element
- __delay__  - The time to wait (in milliseconds) until resizing starts
- __distance__ - How far, in pixels, to wait before resizing starts
- __handles__ - Which handles sould be displayed (an array containing `s`, `se` and `e`)
- __maxHeight__ - The maxiumum height the element can be resized to
- __maxWidth__ - The maxiumum width the element can be resized to
- __minHeight__ - The minimum height the element should have
- __minWidth__ - The minimum width the element should have
- __handleClassName__ (default: `'ui-resizable-handle'`) - A class name to use for the resizing handles.

A resizable element will trigger the following events:

- __resizestart__ - When the resize motion start
- __resize__ - Every time after the resizable has changed the element dimension.
See the [resize event](http://jquerypp.com/#resize) for more information.
- __resizestop__ - When the resize motion has ended

The following example shows a simple resizable `div` with minimum and maximum dimensions:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/donejs/BjSeE/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

## Split `$(element).split(options)`

[Split](http://donejs.com/docs.html#!canui.split) manages a container with independently resizable content
panels. It does this by inserting a "splitter bar" between each panel element, which can be dragged or
optionally collapsed. Use [split.css](#) as the base CSS for split elements.

- __hover__ (default `"split-hover"`) - CSS class to apply to a splitter when the mouse enters it
- __direction__ - The panel split orientation. Either `"vertical"` or `"horizontal"`
- __dragDistance__ (default: `5`) - Maximum number of pixels away from the slider element to initiate a drag
- __panelSelector__ - The selector for panel elements

Given markup like this:

{% highlight html %}
<div id="container">
  <div class="panel">Content 1</div>
  <div class="panel">Content 2</div>
  <div class="panel">Content 3</div>
</div>
{% endhighlight %}

Split will create three separate content panels like this:

{% highlight javascript %}
$('#container').split({
  panelSelector : '.panel'
});
// Split vertically
$('#container').split({
  direction : 'vertical',
  panelSelector : '.panel'
});
{% endhighlight %}

The following example shows a vertical and horizontal split. Drag the handles to resize the respective areas:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/donejs/bRktC/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### panels `$(elements).split('panels')`

Returns the panel elements. From the above example:

{% highlight javascript %}
$('#container').split('panels');
// -> [<div class="panel">Content 1</div>,
// <div class="panel">Content 2</div>,
// <div class="panel">Content 3</div>]
{% endhighlight %}

### resize `$(element).resize()`

The `resize` event should be triggered whenever a panel is added or removed or the dimensions changed.

{% highlight javascript %}
// Remove the first panel
$('#container').split('panels').first().remove();
// Resizes all other panels properly
$('#container').resize();
{% endhighlight %}

### hide/show

To collapse a visible panel use `$(element).split('hidePanel', panel, [keepSplitter])`. `keepSplitter` is a boolean
indicating if the split handle should be hidden as well.

`$(element).split('showPanel', panel, [width])` shows a collapsed panel, optionally setting it to the given width.

{% highlight javascript %}
var firstPanel = $('#container').split('panels').first();
$('#container').split('hidePanel', firstPanel);
// Show first panel and set width to 300px
$('#container').split('showPanel', firstPanel, 300);
{% endhighlight %}

## Get Help

This site highlights the most important features of CanUI. You can find the full API documentation on the
[DoneJS documentation](http://donejs.com/docs.html#!canui) page.

There are also several places you can go to ask questions or get help debugging problems.

### Twitter

Follow [@canui](http://twitter.com/#!/canui) for updates, announcements and quick answers to your questions.

### Forums

Visit the [Forums](http://forum.javascriptmvc.com/#Forum/canui) for questions requiring more than 140 characters. DoneJS has a thriving community that's always eager to help out.

### IRC

The DoneJS IRC channel (`#donejs` on **irc.freenode.net**) is an awesome place to hang out with fellow DoneJS users and get your questions answered quickly.

__Help Us Help You __

Help the community help you by using the [CanUI jsFiddle template](http://jsfiddle.net/). Just fork it and include the URL when you are asking for help.

### Get Help from Bitovi

Bitovi _(developers of CanUI)_ offers [training](http://bitovi.com/training/) and [consulting](http://bitovi.com/consulting/) for your team. They can also provide private one-on-one support staffed by their JavaScript/Ajax experts. [Contact Bitovi](mailto:contact@bitovi.com) if you're interested.

## Why CanUI

### Supported

CanUI is developed by [Bitovi](http://bitovi.com).  We're active on the forums, but should the need
arise, can also be hired for paid support, training, and development.

## Developing CanUI

To develop CanUI, add features, etc, you first must install DoneJS. DoneJS is the
parent project of CanUI and the 4.0 version of JavaSciptMVC. It has DocumentJS and
Steal as submodules that are used to generate the documentation and build the CanUI downloads.

### Installing

 1. `fork` [canui on github](https://github.com/jupiterjs/canui).
 2. Clone DoneJS with:

        git clone git@github.com:jupiterjs/donejs

 3. Open the donejs folder's .gitmodule file and change the URL of the `"canui"` submodule:

        url = git://github.com/jupiterjs/canui.git

    to your `fork`ed URL like

        url = git://github.com/justinbmeyer/canui.git

 4. Install all submodules by running

        cd donejs
        git submodule update --init --recursive

    Depending on your version of git, you might need to cd into each submodule and run `git checkout`.

### Developing

After [installing](#developing_canui__-installing) CanUI and DoneJS, you'll find
the

### Documentation

To edit canui.com, installing CanUI and DoneJS is not necessary. Simply *fork* and edit the
github pages's [index.md page](https://github.com/jupiterjs/canui/blob/gh-pages/index.md) online. Don't forget to
submit a pull request.

To edit the documentation at [DoneJS.com](http://doneJS.com/docs.html):

 1. [install](#developing_canui-installing) CanUI and DoneJS.
 2. Edit the markdown and js files in the `canui` folder.
 3. Generate the docs with:

        js site/scripts/doc.js

    View them at `site/docs.html`

 4. Submit a pull request.

### Making a build

To make a CanUI build, run:

    js canui/build/make.js

It puts the downloads in `canui/dist`. To build a specific version check out the [git tag](https://github.com/jupiterjs/canui/tags) you want to build and run the above command.

### Change Log

__1.0 Beta__

Released!
