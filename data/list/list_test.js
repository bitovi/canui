steal('funcunit').then(function() {
	module('can.ui.data.List', {
		setup : function() {
			S.open('//canui/data/list/list.html');
		}
	});

	test('Select and toggle item', function() {
		S('.item:first').click();
		S('#out1').html('Entry 0', 'Event triggered');
		S('.item:first').hasClass('activated');
		S('.item:first').click().then(function() {
			ok(!S.win.$('.item:first').hasClass('activated'), 'Toggled active class');
		});
	});

	test('Click other item', function() {
		S('.item:first').click();
		S('#out1').html('Entry 0', 'Event triggered');
		S('.item:first').hasClass('activated');
		S('.item:last').click();
		S('#out1').html('Entry 9', 'Event triggered');
	});
})