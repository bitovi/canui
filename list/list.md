@page can.ui.List
@parent canui

[List](http://donejs.com/docs.html#!canui.list) displays the contents of a `can.Observe.List`. It is faster than
live binding to an observable list because it only updates the affected rows instead of re-rendering the entire
list. It is also possible to provide different list sources like a `can.Deferred` or a `can.compute` and set the
content to display when the list is empty or a deferred is being resolved.
Initialize it with the following options:

- `list` - An array, `can.Observe.List`, `can.Deferred` or `can.compute` providing the list data to render.
- `view` - The view to render a single row. Gets the current `can.Observe` passed.
- `emptyContent` - The content to show when the list is empty.
- `loadingContent` - The content to show while a deferred is being resolved.
- `cid` (default : `'_cid'`) - The unique id attribute to identify a `can.Observe`.
- `attribute` (default : `'data-cid'`) - The rows attribute name that stores the `cid` value.

### Row views

A row is identified by having the `attribute` property set to the unique id of a `can.Observe`, usually in the
form of `data-cid="<%= this._cid %>"` in an [EJS](http://canjs.us/#can_ejs) view.
A simple row view for an ordered or unordered list can look like this:

{% highlight html %}
<script type="text/ejs" id="rowEJS">
  <li data-cid="<%= this._cid %>">
    <%= this.attr('name') %>
  </li>
</script>
{% endhighlight %}

### List data

There are several ways to provide list data. Usually it will be a `can.Observe.List` instance
that contains observable objects. When passing a normal Array, it will be converted to an observable list.
Another option is to pass a `can.Deferred` that resolves to an observable list or array. The grid will show the
content of `loadingContent` while the Deferred is being resolved. This makes it possible to directly pass
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
  loadingContent : '<li>Please wait...</li>',
  loadingContent : '<li class="empty">Sorry, nothing found...</li>',
  view : 'rowEJS',
  list : Person.findAll()
});
{% endhighlight %}

Another possibility is to pass a `can.compute` which returns an array, `can.Observe.List` or `can.Deferred`.
If you pass a function, it will be converted to a `can.compute`.
Combined with `can.Observe`, this makes paginating Model requests very easy:

{% highlight javascript %}
var paginator = new can.Observe({
  offset : 0,
  limit : 10
});

$('#list').list({
  loadingContent : '<li>Please wait...</li>',
  loadingContent : '<li class="empty">Sorry, nothing found...</li>',
  view : 'rowEJS',
  list : function() {
    return Person.findAll({
      offset : paginator.attr('offset'),
      limit : paginator.attr('limit')
    });
  }
});

// This will load items 20 to 30 from the server
// and render the result into the list
paginator.attr('offset', 20);
{% endhighlight %}

### update `$(element).list([options])`

Once created on an element, any other call to `$(element).list([options])` will force rerendering the list
using the updated options.

### list `$(element).list('list', [rows])`

`$(element).list('list', [rows])` returns a `can.Observe.List` of all observes or all observes for the given row elements.
This can be used to retrieve the observable for a row that was clicked:

{% highlight javascript %}
var data = $('#list').list('list');
data // -> can.Observe.List

$('li[data-cid]').on('click', function() {
  var observe = $('#list').list('list', this)[0];
});
{% endhighlight %}

### rowElements `$(element).list('rowElements', [observes])`

`$(element).list('rowElements', [observes])` returns a jQuery collection of all rows or all rows for the given observes:

{% highlight javascript %}
// Retrieves the row element for the first observe
$('#list').list('rowElements', people[0])
// -> [<li data-cid="...">John</li>]
{% endhighlight %}
