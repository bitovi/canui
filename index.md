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

## Configuring CanUI

## Fills `$(element).fills([parent])`

[Fills](http://donejs.com/docs.html#!canui.fills) resizes an element so that it always fills out the remaining space of
a parent element. This is very useful for complex, desktop like page layouts where different content panels should fill
out the full remaining height of the browser window.

When no parent selector or jQuery element is passed, the elements direct parent element will be filled:

{% highlight javascript %}
// Fill the parent
$('#fill').fills();
// Fill the #container element
$('#fill').fills('#container');
{% endhighlight %}

Resize the container in the following example using the blue square to see how the `#fill` element adjusts its size correctly
to fill out the remaining space:

<iframe style="width: 100%; height: 370px" src="http://jsfiddle.net/HSWTA/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

## TableScroll `$(element).tableScroll([fillParent])`

[TableScroll](http://donejs.com/docs.html#!canui.) makes a table scrollable while keeping headers and
footers fixed. This is useful for making grid like widgets.

To make a table scrollable call:

{% highlight javascript %}
$('table').tableScroll();
{% endhighlight %}

On a table like this:

{% highlight html %}
<div style="height: 200px; overflow: auto;">
  <table>
    <thead>
      <th>Firstname</th>
      <th>Lastname</th>
    </thead>
    <tbody><!-- ... --></tbody>
  </table>
</div>
{% endhighlight %}

TableScroll will take the table and put the `thead` and `tfoot` elements in their own container so that they can stay
fixed. The original table will be wrapped into a scrollable `div`:

<iframe style="width: 100%; height: 270px" src="http://jsfiddle.net/KHNyy/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### elements `$('table').tableScroll('elements')`

`$('table').tableScroll('elements')` returns an object with references to the `body`, `header`, `footer`
and `scrollBody` elements. This is different than the elements of the original table since TableScroll
changes the DOM to keep the header and footer elements fixed.
To add a class to the scroll body, for example, use this:

{% highlight javascript %}
$('table').tableScroll();
// Get the elements
var elements = $('table').tableScroll('elements');
// Add a class to scrollBody
elements.scrollBody.addClass('scrollable');
{% endhighlight %}

### update `$(element).tableScroll()`

Once initialized, `$(element).tableScroll()` should be called after a header or footer column has been updated, removed
or inserted. This will also trigger a `resize` event.

{% highlight javascript %}
$('table').tableScroll();
// Get the header element
var header = $('table').tableScroll('elements').header;
// Update the first heading column
header.find('th:first').html('NewColumnName');
// Update the columns
$('table').tableScroll('updateCols');
{% endhighlight %}

### resize `$(element).resize()`

The `resize` event should be triggered whenever any table dimensions might have changed.

{% highlight javascript %}
$('table').tableScroll();
$('table').width(700);
$('table').resize();
{% endhighlight %}

### rows `$(element).tableScroll('rows')`

`$(element).tableScroll('rows')` returns a jQuery collection containing all table rows. This can be used to
remove, insert or replace certain rows. A [resize event](#tablescroll-resize) should be triggered after any
modification to keep content, header and footer sizes synchronized.

{% highlight javascript %}
// Remove the last row
$('#grid').grid('rows').last().remove();
// Resize everything
$('#grid').resize();
{% endhighlight %}

## List `$(element).list(options)`

[List](http://donejs.com/docs.html#!canui.list) offers an element list that is bound to a `can.Observe.List`.
It can be initialized with the following options:

- `data` - The `can.Observe.List` instance to render
- `cid` (default : `'_namespace'`) - The unique id attribute to identify a `can.Observe`
- `attribute` (default : `'data-cid'`) - The attribute the `can.Observe` unique id for each row is stored in
- `view` - List view to render. Gets the original options passed as view data

In the view, each row needs to set have the attribute property set to the `cid` of the current `can.Observe`.
An [EJS](http://canjs.us/#can_ejs) list view can look like this:

{% highlight html %}
<script type="text/ejs" id="listEJS">
  <ul>
  <% list(data, function(item) { %>
    <li data-cid="<%= item[cid] %>">
      <%= item.attr('firstname') %>
    </li>
  <% }) %>
  </ul>
</script>
{% endhighlight %}

And used like this:

{% highlight javascript %}
var people = new can.Observe.List([{
  firstname : 'John'
}, {
  firstname : 'Dave'
}]);

$('#list').list({
  view : 'listEJS',
  data : people
});
{% endhighlight %}

### update `$(element).list(options)`

Once initialized on an element, any other call to `$(element).list(options)` will force it to rerender the list
with the updated options.

### items `$(element).list('items', [rows])`

`$(element).list('items', [rows])` returns a `can.Observe.List` of all items or all items for the given row elements.
It will return a single `can.Observe` if only one row is passed. This makes it easy to retrieve the observable
instance for a row that has been clicked for the above example:

{% highlight javascript %}
$('li[data-cid]').on('click', function() {
  var observe = $('#list').list('items', this);
});
{% endhighlight %}

### rows `$(element).grid('rows', [observes])`

`$(element).list('rows', [observes])` returns a jQuery collection of all rows or all rows for the given observes:

{% highlight javascript %}
// Retrieves the row element for the first observe
$('#list').list('rows', people[0])
// -> [<li data-cid="...">John</li>]
{% endhighlight %}

## Grid `$(element).grid(options)`

[Grid](http://donejs.com/docs.html#!canui.grid) provides a table that live binds to a
[can.Observe.List](http://donejs.com/docs.html#!can.Observe.List).
Along with [TableScroll](#tablescroll) this can be used to create a full grid widget.

Possible options:

- `emptyContent` - The content to display when there are no items
- `loadingContent` - The content to display while a deferred is being resolved
- `list` - The item provider described in more detail in the [list](#grid-list) section
- `columns` - The columns to display, see the [columns](#grid-column) section
- `scrollable` - If this grid should become scrollable using [TableScroll](#tablescroll)

With a markup like this:

{% highlight html %}
<div id="grid"></div>
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

The Grid can be initialized like this:

{% highlight javascript %}
$('#grid').grid({
  emptyContent : 'Sorry, nothing found',
  loadingContent : 'Retrieving people list...',
  columns : [
    { header : 'First name', content : 'firstname' },
    { header : 'Last name', content : 'latname' },
    { header : 'Age', content : 'age' }
  ],
  list : people
});
{% endhighlight %}

The following example shows a grid that allows you to add and remove items and reset the list
to its initial state:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/hY3AS/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### columns `$(element).grid('columns', [columns])`

Column definitions can be provided as a `can.Observe.List` or an array of objects. Each object
must at least contain:

- `header` - The header content.
- `content` - The content to display for this column. This can either be an attribute name
or a callback in the form of `function(observe, index)` that returns the content or a
[can.compute](#) for the current column with computed properties.

The following example creates a grid with a column that contains the combined first- and lastname:

{% highlight javascript %}
$('#grid').grid({
  columns : [{
      header : 'Name',
      content : function(observe) {
        return can.compute(function() {
          return observe.attr('firstname') + ' ' + observe.attr('lastname');
        });
      }
    },
    { header : 'Age', content : 'age' }
  ],
  list : people
});
{% endhighlight %}

It is also possible to render [views](http://canjs.us/#can_view). For example this [EJS](http://canjs.us/#can_ejs)
script:

{% highlight html %}
<script type="text/ejs" id="ageEJS">
<span <% if(person.attr('age') < 21) { %>class="underage"<% } %>>
  <%= person.attr('age') %>
</span>
</script>
{% endhighlight %}

{% highlight javascript %}
$('#grid').grid({
  columns : [
    { header : 'First name', content : 'firstname' },
    { header : 'Last name', content : 'latname' },
    {
      header : 'Age',
      content : function(observe) {
        return can.view('ageEJS', { person : observe });
      }
    }
  ],
  list : people
});
{% endhighlight %}

Columns are acessible as a `can.Observe.List`, which makes it easy to update its attributes:

{% highlight javascript %}
$('#grid').grid('columns').attr('0.header', 'Full name');
{% endhighlight %}

### list `$(element).grid('list', [list])`

There are several ways to provide the grid with a list of data. Usually it will be a `can.Observe.List` instance
that contains observable objects. When passing a normal Array, it will be converted to an observable list.
Another option is to pass a `can.Deferred` that resolves to an observable list or array. The grid will show the
content of `loadingContent` while the Deferred is being resolved.

This allows to directly pass `can.Model` requests:

{% highlight javascript %}
var Person = can.Model({
    findAll : 'GET /people',
    findOne : 'GET /people/{id}',
    create  : 'POST /people',
    update  : 'PUT /people/{id}',
    destroy : 'DELETE /people/{id}'
  }, {});

$('#grid').grid({
  loadingContent : 'Please wait...',
  columns : [{
      header : 'First name',
      attr : 'firstname'
    }, {
      header : 'Last name',
      attr : 'lastname'
    }
  ],
  list : Person.findAll()
});
{% endhighlight %}

The last option is to pass a `can.compute` which returns an array, `can.Observe.List` or `can.Deferred`.
As an example, this can be used to load the new data whenever a pagination observe changes:

{% highlight javascript %}
var paginator = new can.Observe({
    offset : 0,
    limit : 10
  });
$('#grid').grid({
  columns : [{
      header : 'First name',
      attr : 'firstname'
    }, {
      header : 'Last name',
      attr : 'lastname'
    }
  ],
  list : function() {
    return Person.findAll({
      offset : paginator.attr('offset'),
      limit : paginator.attr('limit')
    });
  }
});
{% endhighlight %}

### items `$(element).grid('items', [rows])`

`$(element).grid('items', [rows])` returns a `can.Observe.List` of all items or all items for the given row elements.
It will return a single `can.Observe` if only one row is passed. This makes it easy to retrieve the observable
instance for a row that has been clicked:

{% highlight javascript %}
$('#grid tr').on('click', function() {
  var observe = $('#grid').grid('items', $(this));
});
{% endhighlight %}

### rows `$(element).grid('rows', [observes])`

`$(element).grid('rows', [observes])` returns a jQuery collection of all rows or all rows for the given observes.

### tableScroll `$(element).grid('tableScroll')`

If the `scrollable` option is set to true, `$(element).grid('tableScroll')` will return the [TableScroll](#tablescroll)
instance that is used to make the grid scrollable, `null` otherwise.
This can be used to automatically load new data when scrolled to the bottom of the grid:

{% highlight javascript %}
var offset = 0;
$('#grid').grid({
  loadingContent : 'Loading data...',
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
    offset += 10;
    if(!deferred || deferred.isResolved()) {
      deferred = Person.findAll({
        offset : offset,
        limit : 10
      }).done(function(people) {
        var data = $('#grid').grid('items');
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
another. This is very useful for implementing UI widgets, such as tooltips and autocompletes. Positionable
uses the [jQueryUI position plugin](http://jqueryui.com/demos/position/) and takes the following options:

- __my__ - Edge of the positionable element to use for positioning. Can be one of `top`, `center`, `bottom`, `left` and `right`.
Combined values like `bottom left` are also possible.
- __at__ - Edge of the target element to use for positioning. Accepts the same values as `my`.
- __of__ - The target element or selector to use for positioning.
- __collision__ - The collision strategy to use when the positionable element doesn't fit in the window. Possible values:
  - `fit` - Attempts to position the element as close as possible to the target without clipping the positionable.
  - `flip` - Flips the element to the opposite side of the target.
  - `none` - Doesn't use any collision strategey.
- __hideWhenOfInvisible__ - Hide the positionable element when the target element scrolls out of visibility range.

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

If the target element is [draggable](http://jquerypp.com/#drag), `move` will be triggered automatically when the
draggable moves.

### isOfVisible `$(element).positionable('isOfVisible')`

`$(element).positionable('isOfVisible')` returns if the target element is currently visible. This is used internally
for the `hideWhenOfInvisible` option to hide the positionable when the target element moves out of the visible area but
it also can be used to perform other actions when the positionable moves:

{% highlight javascript %}
$('#tooltip').on('move', function() {
  if(!$(this).positionable('isOfVisible')) {
    // target element became invisble
  }
});
{% endhighlight %}

## Selectable `$(element).selectable(options)`

[Selectable](http://donejs.com/docs.html#!canui.selectable) provides keyboard and mouse selection for a group
of elements. It handles keyboard navigation, multi selection and automatic deselection. A selectable can be
initialized with the following options:

- __selectOn__ (default: `"[tabindex]"`) - The selector to use for selectable items
- __selectedClassName__ (default: `"selected"`) - The class name to add to a selected item
- __activateClassName__ (default: `"activated"`) - The class name to add to an activated item
- __multiActivate__ (default: `true`) - If multi selection is enabled
- __outsideDeactivate__ (default: `true`) - Deactivate everything when a click or keypress happens outside of the selectable
- __deactivateParent__ (default: `document`) - If `outsideDeactivate` is true, the parent element to use for deactivating

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

[Resizable](http://donejs.com/docs.html#!canui.resizable) allows to resize an element by adding draggable handles and can
be initialized with these options:

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
