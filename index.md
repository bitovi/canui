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
a parent element. This is extremely useful for complex page layouts because it takes any margin, padding
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
footers fixed. This is useful for grid like widgets.

Considering a markup like this:

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

The table can be made scrollable like this:

{% highlight javascript %}
$('table').table_scroll();
{% endhighlight %}

It works for any table that has a fixed height container element.
The following example creates a randomly generated, scrollable table:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/KHNyy/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

### resize `$(element).resize()`

The `resize` event on a scrollable table should be triggered whenever the tables dimensions
or column content changes:

{% highlight javascript %}
$('table').table_scroll();
$('table').find('td:first').html('AColumnNameThatIsLong');
$('table').resize();
{% endhighlight %}

### updateCols `$(element).table_scroll('updateCols')`

`$(element).table_scroll('updateCols')` should be called after a header or footer column has changed.
This will also trigger a `resize` event.

{% highlight javascript %}
$('table').table_scroll();
// Update the first heading column
$('table').find('th:first').html('NewColumnName');
// Update the columns
$('table').table_scroll('updateCols');
{% endhighlight %}

### elements `$(element).control(can.ui.TableScroll).elements()`

`$(element).control(can.ui.TableScroll).elements()` returns an object with references to the `body`, `header`, `footer`
and `scrollBody` elements. To change the column heading, for example, use this:

{% highlight javascript %}
$('table').table_scroll();
// Retrieve the can.ui.TableScroll instance
var scroller = $(element).control(can.ui.TableScroll);
var elements = scroller.elements();
elements.body.find('td:first').html('Updated column content');
// We need to resize whenever anything changes
$('table').resize();
{% endhighlight %}

### rows `$(element).table_scroll('rows', [how], [newRows])`

`$(element).table_scroll('rows', [how], [newRows])` allows you to add new rows to the table and automatically
triggers the `resize` event. `how` indicates how the new rows will be inserted and can have the following values:

- __append__ - Appends `newRows` to the end of the table
- __prepend__ - Adds `newRows` to the beginning of the table
- __replaceWith__ - Replaces all the current rows with `newRows`

The default value is __append__.

{% highlight javascript %}
var firstNewRow = $('<tr><td>John</td><td>Doe</td></tr>'),
    secondNewRow = $('<tr><td>New</td><td>User</td></tr>');
$('table').table_scroll();
// Append newRow to the table
$('table').table_scroll('rows', newRow);
// Replace all rows with secondRow
$('table').table_scroll('rows', 'replaceWith', secondRow);
{% endhighlight %}

`rows` can also be used to retrieve all actual rows in the table:

{% highlight javascript %}
$('table').table_scroll();
// Retrieve the can.ui.TableScroll instance
var scroller = $(element).control(can.ui.TableScroll);
scroller.rows().remove();
{% endhighlight %}

## Grid `new can.ui.Grid( element, options )`

[can.ui.Grid](http://donejs.com/docs.html#!canui.grid) provides a table that live binds to an observable list.
Along with [can.ui.TableScroll](#tablescroll) this can be used to create a full grid like widget.

Possible options:

- `list` - The item provider which can be
  - An array of items
  - `can.Observe.List` of observes
  - `can.Deferred` that resolves to the above
  - `can.compute` that returns any of the above
- `emptyText` - The content to display when there are no items
- `loadingText` - The text to display when a deferred is being resolved
- `columns` - The columns to display in the form of `{ header : 'Heading', attr : 'attribute }`

Create a grid like this:

{% highlight html %}
<div id="grid"></div>
{% endhighlight %}

{% highlight javascript %}
var people = new can.Observe.List([
    {
      firstname : 'John',
      lastname : 'Doe',
      age : 42
    },
    {
      firstname : 'First',
      lastname : 'Last',
      age : 26
    }
  ]),
  grid = new can.ui.Grid({
    columns : [
      {
        header : 'Name',
        attr : function(observe) {
          return observe.attr('firstname') + ' ' + observe.attr('lastname');
        }
      },
      {
        header : 'Age',
        attr : 'age'
      }
    ],
    list : people
  });
{% endhighlight %}

The methods available on a grid instance are:

- `grid.rows([observes])` - Returns all row elements or all row elements for the given observe(s)
- `grid.items([rows])` - Returns a `can.Observe.List` of all items or all items for the given row(s)
- `grid.columns([columns])` - Gets or sets the current column configuration
- `grid.list([list])` - Gets or set the list provider
- `grid.emptyText([text])` - Gets or sets the content to display when there are no items
- `grid.loadingText([loadingText])` - Gets or sets the text to display while a `can.Deferred` is being resolve

### columns `$(el).grid('columns', [columns])`

### list `$(el).grid('list', [list])`

### rows `$(el).grid('rows', [rows])`

### items `$(el).grid('items', [item])`

### Managing columns

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

### List providers

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

### Demo

The following example shows the grid to add and remove items and reset the list:

<iframe style="width: 100%; height: 350px" src="http://jsfiddle.net/hY3AS/embedded/result,html,js,css" allowfullscreen="allowfullscreen" frameborder="0">JSFiddle</iframe>

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
