@page canui CanUI
@parent index 4

CanUI is a __BETA__ UI library for
CanJS and jQuery.  It's designed to be lightweight,
with limited options, but flexible enough
to be extended and mixed for richness.  

Here's what's inside:

  - [can.ui.nav.Accordion Accordion] - an accordion widget.
  - [can.ui.layout.Sortable Sortable] - sort elements.
  - [can.ui.nav.Slider Slider] - a slider
  - [jQuery.fn.can\_ui\_layout\_wrap Wrap] - Wrap elements
  - [can.ui.layout.Bgiframe Bgiframe] - adds a background iframe to stop IE's input element 'bleed' problem.
  - [can.ui.layout.Positionable Positionable] - Allows you to position an element relative to another element.

// TODO

  - [Mxui.Layout.Block Block] - makes an element fill up another element or window.
  - [jQuery.fn.mxui\_layout\_fill Fill] - makes complex layouts easy.
  - [Mxui.Layout.Modal Modal] - creates a modal
  - [Mxui.Layout.Resize Resize] - allows resizing of widgets
  - [Mxui.Nav.Selectable Selectable] - keyboard and mouse navigation.
  - [Mxui.Layout.Split Split] - a splitter widget
  - [Mxui.Layout.TableScroll TableScroll] - makes a tbody scroll.

## Demo

The following shows almost all of the above controls in action:
   
@demo mxui/demo.html

## Installing

If you are using github, you can simply add `mxui` as a submodule
the same way you added `steal`, `jquerymx`, etc.  Simply
fork and clone 
[https://github.com/jupiterjs/mxui https://github.com/jupiterjs/mxui].

You can also install Mxui from the command line.  Run:

    ./js steal/getjs mxui
    
If you only want part of MXUI, you can install that like:

    ./js steal/getjs mxui/layout/fill
    


## In Progress

We also have the following widgets which we are working on:

  - Grid - a basic grid
  - Tree - a basic tree
  - Combobox - a rich combobox 

