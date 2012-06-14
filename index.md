---
layout: default
version: 1.0b
---

# Welcome to CanUI

## Get CanUI

## Configuring CanUI

### Styles

By default, CanUI uses themeroller styles.  You can overwrite CanUI to use other classNames like:

{% highlight javascript %}
can.ui.classNames.active = "ui-active-state";
{% endhighlight %}

## Accordion `new can.ui.Accordion( element, [options] )`

[can.ui.Accordion](http://donejs.com/docs.html#!can.ui.Accordion) provides basic
vertical accordion functionality.

### activate `accordion.activate( titleElement )`

### expand `accordion.expand( titleElement )`

### resize `accordionElement.resize()`



## Block `new can.ui.Block( element, [blockedElement])`

### resize `blockedElement.resize()`

Tells the modal to resize, if it needs to.

## Grid `new can.ui.Grid( element, options )`

Options:

 - `list` - a [can.Observe.List] of items
 - `emptyText` - what to show when there are no items
 - `columns` - columns to display

Issues:
 - filtering on list
 - adding widgets / editors


### list `grid.list( newList )`

Sets the list option.  It can also accept a deferred that resolves to `can.Observe.List`.

{% highlight javascript %}
var items = new can.Observe.List();

var grid = new can.ui.Grid("#todos", {
  list : items
});

// update the list
grid.list( Task.findAll({}) )
    .emptyText("Loading tasks")

{% endhighlight %}

#### Forever Scroll

{% highlight javascript %}
var items = new can.Observe.List();

var grid = new can.ui.Grid("#todos", {
  list : items
});

$(grid.elements().scrollBody).bind("scroll", function(){
  if( atBottom ){
    Task.findAll(nextSet).then(function(tasks){
      items.push(tasks);
    })
  }
})
{% endhighlight %}



## Modal

## Position

## Resize

## Selectable

## Slider

## Sortable

## Split

## TableScroll

## Tooltip

## Validator

## Utilities

### Wrap



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
