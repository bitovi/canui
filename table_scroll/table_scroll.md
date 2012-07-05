@page can.ui.TableScroll
@parent canui

Makes a table body scroll under a table
header.  This is very useful for making grid-like widgets.

## Basic Example

If you have the following html:

    <div id='area' style='height: 500px'>
       <p>This is My Table</p>
       <table id='people'>
         <thead>
           <tr> <th>Name</th><th>Age</th><th>Location</th> </tr>
         </thead>
         <tbody>
           <tr> <td>Justin</td><td>28</td><td>Chicago</td> </tr>
           <tr> <td>Brian</td><td>27</td><td>Chicago</td> </tr>
           ...
         </tbody>
       </table>
    </div>

The following make the list of people, the tbody, scrollable between
the table header and footer:

    var scroller = new can.ui.TableScroll('#people')

It makes it so you can always see the table header
and footer.  The table will [canui.fills fill] the height of it's parent
element. This means that if the `#area` element's height
is 500px, the table will take up everything outside the paragraph element.

## Demo

@demo canui/layout/table_scroll/demo.html

## How it works

To scroll the `tbody` under the `thead`, TableScroll
wraps the table with `div`s and seperates out the
`thead` into its own div.  After changing the DOM,
the table looks like:

    <div class='can_ui_table_scroll'>
      <div class='header'>
         <table>
           <thead> THEAD CONTENT </thead>
         </table>
      </div>
      <div class='body'>
         <div class='scrollBody'>
           <table>
             <tbody> TBODY CONENT </tbody>
           </table>
         </div>
      </div>
    </div>

The grid also maintains a copy of the `thead`'s content
in the scrolling table to ensure the columns are
sized correctly.

## Changing the table

When you change the table's content or dimensions you might need
to trigger the `resize` event or call `scoller.resize()` manually.

@class can.ui.TableScroll
@constructor

@param {HTMLElement} el
@param {Object} [options] values to configure
the behavior of table scroll:

   - `filler` - By default, the table fills
     it's parent's height. Pass false to not actually scroll the
     table.
	 