steal('funcunit').then(function(){
	
module("can.ui.Resize",{
	setup: function(){
		S.open("//canui/resize/resize.html");
	}
})

test("resize box", function() {
	S('#resize').exists().click(function() {
		equal(S('.can_ui_resize').size(), 1, 'resize created');	
		var height = S('.can_ui_resize').height(),
			width = S('.can_ui_resize').width();
		S('.can_ui_resize .ui-resizable-se').drag('+100 +100', function() {
			ok(S('.can_ui_resize').height() > height, 'height increased');
			ok(S('.can_ui_resize').width() > width, 'width increased');
		});
	});
})

test('handle hidden until mouse moves into resize', function() {
	S('#resizeAutoHide').exists().click(function() {
		equal(S('.can_ui_resize').size(), 1, 'resize created');	

		S('#resizeAutoHide').move('.can_ui_resize');

		S('.can_ui_resize .ui-resizable-se').exists().css('display', 'block')

		S('.can_ui_resize').move('#resizeAutoHide')

		S('.can_ui_resize .ui-resizable-se').exists().css('display', 'none')

	});
})

})