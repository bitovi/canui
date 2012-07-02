# can.ui.Accordion

## Purpose

The accordion widget shows and hides content for a given header element, similar to tabs.  It works with a number of DOM markups as long as there is a header/content consistency.  This accordion is configurable for either horizontal or vertical styles.  An accordion doesn't allow more than one content panel to be open at the same time.

## Learn from

- http://docs.jquery.com/UI/API/1.8/Accordion
- http://jquery.bassistance.de/accordion/demo/
- http://twitter.github.com/bootstrap/javascript.html#collapse

## Markup

	<div class='accordion'>
		<h2>Header 1</h2>
		<div>Content 1</div>
		
		<h2>Header 2</h2>
		<div>Content 2</div>
	</div>

	new can.ui.Accordion($('.accordion'));

## Options

- active
	Options: Selector, Element, jQuery, Boolean
	Default: ':first'
	Description: The active/open element by default. Set to false to display none at start.
	
- dir
	Options: 'vertical' or 'horizontal'
	Default: 'vertical'
	Description: The direction to which the accordion will be expanding/collapsing.
	
- fillSpace
	Options: Boolean
	Default: false
	Description: Determines whether the accordion completely fills the dimension based on the 'dir' option of the parent element or not.
	
- header
	Options: Selector
	Default: ':header'
	Description: The element to be the toggler.
	
- disabled
	Options: Boolean
	Default: false
	Description: Enables/Disables the accordion from expanding/collapsing.

- animation
	Options: Boolean, Object
	Default: { effect: 'slide', speed: 'fast' }
	Description: Animation to use when showing elements.  To disabled animations, pass false.  
	
- animation : effect
	Options: 'blind', 'clip', 'drop', 'explode', 'fold', 'puff', 'slide', 'scale', 'size', 'pulsate'
	Default: 'slide'
	Description: Animation effect to use. For more information on animations, visit: http://jqueryui.com/demos/effect/ 

- animation : speed
	Options: Integer, 'slow' or 'fast'
	Default: 'fast'
	Descriopnt: A string representing one of the predefined speeds ("slow" or "fast") or the number of milliseconds to run the animation (e.g. 1000).

## Events

- activate
	Description: Occurs when an item is 'activated'.  
	Notes: Currently only supports 'click' but should add 'hover'.

## Methods

- show
	Arguments: Selector or Element
	Description: Shows the passed element.

## Localization

The accordion allows for localization of the tool-tips that appear when hovering the headers.  To change the default properties, override the 'locale' properties with your language.

The default strings are:

	locale:{
		expand: "Click to expand",
		collaspe: "Click to collaspe"
	}

## Theming

The CanUI framework uses TwitterBootstrap for its default themeing.  Alternatively, you can customize the themes by overriding the default classes either via CSS or the 'css' attribute in the options.

The default styles are:

	css: {
		header: "accordion-toggle",
		content: "accordion-body",
		activated: "active",
		hover: "hover",
		selected: "selected"
	}

## Examples

Open accordion.html