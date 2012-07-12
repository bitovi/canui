steal('funcunit').then(function(){
	
module("can.ui.Modal",{
	setup: function(){
		S.open("//canui/modal/modal.html");
	}
})

test("Modal initialization works", function(){
	S('#show').click();
	S('#modal').hasClass('can_ui_modal', true, "Controller is initialized");
	S('#modal').css('position', 'absolute', 'Position is absolute');
})

test("Stacking of modals works", function(){
	S('#show').click();
	S('#modal').css('z-index', "10000", 'Z-index of first modal is 10000');
	S('#show-stacked').click();
	S('.can_ui_modal').size(6, 'Six modals stacked');
	S('#show').click();
	S('#modal').css('z-index', "10011", 'After reordering Z-index of first modal is 10011');
})

test("Custom overlay class works", function(){
	S('#show-custom-overlay-class').click();
	S('.custom-overlay').size(1, 'Custom overlay class used')
})

test("Overlay should be on the correct place after scrolling", function(){
	S('#show-in-scrollable').click();
	S('.scrollable').scroll("top", 50).scroll("left", 50)
	S('#customOverlayElement').css('top', '50px', "Overlay is on correct vertical position")
	S('#customOverlayElement').css('left', '50px', "Overlay is on correct horizontal position")
})

test("Pausable hide event", function(){
	S('#show-modal-pausable').click();
	S('#signup-form input').type("Test")
	S("#signup-form").type("[escape]")
	S('.confirm').size(1, "Confirm modal appeared")
	S('.confirm').click()
	S('#signup-form').invisible("Pausable modal was hidden after confirmation")
})

test("Pressing [escape] should close modals in correct order", function(){
	S('#show').click();
	S('#modal').css('z-index', "10000", 'Z-index of first modal is 10000');
	S('#show-stacked').click();
	S('.can_ui_modal').size(6, 'Six modals stacked');
	S('#show').click();
	S('#modal').css('z-index', "10011", 'After reordering Z-index of first modal is 10011');
})

});