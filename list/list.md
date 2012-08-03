@page canui.List
@parent canui

List displays the contents of a `can.Observe.List`. It is faster than
live binding to an observable list because it only updates the affected rows instead of re-rendering the entire
list. It is also possible to provide different list sources like a `can.Deferred` or a `can.compute` and set the
content to display when the list is empty or a deferred is being resolved.
Initialize it with the following options:

- __list__ - An array, `can.Observe.List`, `can.Deferred` or `can.compute` providing the list data to render.
- __view__ - The view to render a single row. Gets the current `can.Observe` passed.
- __emptyContent__ - The content to show when the list is empty.
- __loadingContent__ - The content to show while a deferred is being resolved.
- __cid__ (default : `'_cid'`) - The unique id attribute to identify a `can.Observe`.
- __attribute__ (default : `'data-cid'`) - The rows attribute name that stores the `cid` value.

## View, empty and loading content

`view`, `emptyContent` and `loadingContent` can either be a [can.view can.view name] or a callback that returns
the HTML content. `this` in the callback will refer to the List instance and the callback for `view` will get
the current observe instance passed as a parameter. This allows you to provide almost any content possible,
for example:

    $('#list').list({
      emptyContent : 'empty.ejs',
      loadingText : 'Loading something',
      loadingContent : function() {
        return '<li class="loading">' + this.options.loadingText + '</li>';
      },
      view : 'rowEJS'
    });

## Row views

A row is identified by having the `attribute` property set to the unique id of a `can.Observe`, usually in the
form of `data-cid="<%= this._cid %>"` in an [EJS](http://canjs.us/#can_ejs) view.
A simple row view for an ordered or unordered list can look like this:

    <script type="text/ejs" id="rowEJS">
      <li data-cid="<%= this._cid %>">
        <%= this.attr('name') %>
      </li>
    </script>

## List data

There are several ways to provide list data. Usually it will be a `can.Observe.List` instance
that contains observable objects. When passing a normal Array, it will be converted to an observable list.

### can.Deferred

Another option is to pass a `can.Deferred` that resolves to an observable list or array. The grid will show the
content of `loadingContent` while the Deferred is being resolved. This makes it possible to directly pass
`can.Model.findAll` requests:

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

### can.compute

Another possibility is to pass a `can.compute` which returns an array, `can.Observe.List` or `can.Deferred`.
Combined with `can.Observe`, this makes paginating Model requests very easy:

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
