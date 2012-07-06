---
layout: default
version: 1.0b
---

# Welcome to CanUI

CanUI brings the best of CanJS and jQuery++ together to help you build awesome user interfaces.
It is not supposed to be a full UI widget library but instead provides the building blocks you need
to create your own UI widgets the way you want them.

## Get CanUI

## Configuring CanUI

## Fills `$(element).fills([parent])`

[Fills](http://donejs.com/docs.html#!canui.fills) resizes an element so that it always fills out the remaining space of
a parent element. This is extremely useful for complex page layouts because Fills takes any margin, padding
and sibling element dimensions into consideration.

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


## TableScroll `$(element).table_scroll([fillParent])`

[TableScroll](http://donejs.com/docs.html#!canui.table_scroll) makes a table scrollable while keeping headers and
footers fixed. This is useful for tables that display big amounts of data in a grid like widget.
A table like this:

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

Can be made scrollable like this:

{% highlight javascript %}
$('table').table_scroll();
{% endhighlight %}

The following example creates a scrollable table with links to all CanUI builds on [ci.javascriptmvc.com](http://ci.javascriptmvc.com/job/CanUI):

<iframe style="width: 100%; height: 270px" src="http://jsfiddle.net/KHNyy/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### resize `$(element).resize()`

The `resize` event should be triggered on a scrollable table whenever the table dimensions
or column content changes:

{% highlight javascript %}
$('table').table_scroll();
$('table').find('td:first').html('AColumnNameThatIsLong');
$('table').resize();
{% endhighlight %}

### elements `$('table').table_scroll('elements')`

`$('table').table_scroll('elements')` returns an object with references to the `body`, `header`, `footer`
and `scrollBody` elements. To add a class to the scroll body, for example, use this:

{% highlight javascript %}
$('table').table_scroll();
// Get the elements
var elements = $('table').table_scroll('elements');
// Add a class to scrollBody
elements.scrollBody.addClass('scollable');
{% endhighlight %}

### updateCols `$(element).table_scroll('updateCols')`

`$(element).table_scroll('updateCols')` should be called after a header or footer column on a TableScroll
element has changed. This will also trigger a `resize` event.

{% highlight javascript %}
$('table').table_scroll();
// Get the header element
var header = $('table').table_scroll('elements').header;
// Update the first heading column
header.find('th:first').html('NewColumnName');
// Update the columns
$('table').table_scroll('updateCols');
{% endhighlight %}

### rows `$(element).table_scroll('rows', [how], [newRows])`

`$(element).table_scroll('rows', [how], [newRows])` retrieves all table rows or adds new rows to the table.
`how` indicates how the new rows will be inserted and can have the following values:

- __append__ - Appends `newRows` to the end of the table
- __prepend__ - Adds `newRows` to the beginning of the table
- __replaceWith__ - Replaces all current rows with `newRows`

The default value is __append__. When adding rows this way, there is no need to explicitly trigger `resize`.

{% highlight javascript %}
var firstNewRow = $('<tr><td>John</td><td>Doe</td></tr>'),
    secondNewRow = $('<tr><td>New</td><td>User</td></tr>');

$('table').table_scroll();
// Append newRow to the table
$('table').table_scroll('rows', newRow);
// Replace all rows with secondRow
$('table').table_scroll('rows', 'replaceWith', secondRow);
$('table').table_scroll('rows') // -> [<tr><td>New</td><td>User</td></tr>]
{% endhighlight %}


## Grid `$(element).grid(options)`

[Grid](http://donejs.com/docs.html#!canui.grid) provides a table that live binds to an observable list.
Along with [TableScroll](#tablescroll) this can be used to create a full grid widget.

Possible options:

- `list` - The item provider which can be
  - An array of items
  - `can.Observe.List` of observes
  - `can.Deferred` that resolves to the above
  - `can.compute` that returns any of the above
- `emptyText` - The content to display when there are no items
- `loadingText` - The text to display when a deferred is being resolved
- `columns` - The columns to display

With a markup like this:

{% highlight html %}
<div id="grid"></div>
{% endhighlight %}

Initialize the grid like this:

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

$('#grid').grid({
  columns : [
    { header : 'First name', content : 'firstname' },
    { header : 'Last name', content : 'latname' },
    { header : 'Age', content : 'age' }
  ],
  list : people
});
{% endhighlight %}

The following example shows the grid to add and remove items and reset the list:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/hY3AS/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### columns `$(el).grid('columns', [columns])`

Column definitions are provided as an array of objects, where each object must contain

- `header` - The header text
- `attr` - The attribute to display

`attr` can either be the attribute name or a function that takes the element and the index in the list as the parameters
and returns a computed property. From the above example:

{% highlight javascript %}
function(observe) {
  return observe.attr('firstname') + ' ' + observe.attr('lastname');
}
{% endhighlight %}

Returns the combined *firstname* and *lastname* property and live updates whenever the attributes change.

### list `$(el).grid('list', [list])`

There are several ways to provide the grid with a list of data. Usually it will be a `can.Observe.List` instance
that contains the observable objects. When passing a normal Array, it will be converted to an observable list.
Another option is to pass a `can.Deferred` that resolves to an observable list or array. The grid will show the
content of `loadingText` while the Deferred is being resolved.

This allows to directly pass `can.Model` requests:

{% highlight javascript %}
var Person = can.Model({
    findAll : 'GET /people',
    findOne : 'GET /people/{id}',
    create  : 'POST /people',
    update  : 'PUT /people/{id}',
    destroy : 'DELETE /people/{id}'
  }, {}),
  grid = new can.ui.Grid({
    columns : [
      {
        header : 'First name',
        attr : 'firstname'
      },
      {
        header : 'Last name',
        attr : 'lastname'
      }
    ],
    list : Person.findAll()
  });
{% endhighlight %}

The last option is to pass a `can.compute` which returns an array a `can.Observe.List` or a `can.Deferred`.
As an example, this could be used to load the new data whenever a pagination observe changes:

{% highlight javascript %}
var paginator = new can.Observe({
    offset : 0,
    limit : 10
  }),
  grid = new can.ui.Grid({
    columns : [
      {
        header : 'First name',
        attr : 'firstname'
      },
      {
        header : 'Last name',
        attr : 'lastname'
      }
    ],
    list : can.compute(function() {
      return Person.findAll({
        offset : paginator.attr('offset'),
        limit : paginator.attr('limit')
      });
    })
  });
{% endhighlight %}

### rows `$(el).grid('rows', [rows])`

### items `$(el).grid('items', [item])`

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