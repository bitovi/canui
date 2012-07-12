steal('funcunit').then(function(){
	
module("can.ui.Resize",{
	setup: function(){
		S.open("//canui/resize/resize.html");
	}
})

test("resize box", function() {
	S('#resize').exists().click(function() {
		equal(S('.resizable').size(), 1, 'resize created');
		var height = S('.resizable').height(),
			width = S('.resizable').width();
		S('.resizable .ui-resizable-se').drag('+100 +100', function() {
			ok(S('.resizable').height() > height, 'height increased');
			ok(S('.resizable').width() > width, 'width increased');
		});
	});
})

test('handle hidden until mouse moves into resize', function() {
	S('#resizeAutoHide').exists().click(function() {
		equal(S('.resizable').size(), 1, 'resize created');	

		S('#resizeAutoHide').move('.resizable');

		S('.resizable .ui-resizable-se').exists().css('display', 'block')

		S('.resizable').move('#resizeAutoHide')

		S('.resizable .ui-resizable-se').exists().css('display', 'none')

	});
})

})