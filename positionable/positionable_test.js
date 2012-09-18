steal('funcunit').then(function(){

module("can.ui.Positionable",{
	setup: function(){
        S.open("//canui/positionable/positionable.html");
	}
});

test("General positioning", 3, function(){
	S('.tooltip').invisible('Tooltip hidden');
	S('a:first').click();
	S('.tooltip').visible('Tooltip shows');
	S(function() {
		ok(S.win.$('.tooltip').offset().top >= 30, "Positioned properly");
	});
});

test("hideWhenInvisible", function(){
	S('.tooltip').invisible('Tooltip hidden');
	S('.scrollable a:first').click();
	S('.tooltip').visible('Tooltip shows');
	S('.scrollable').scroll('top', 20);
	S('.tooltip').invisible('Tooltip hidden when scrolled');
});

test("Moving", function(){
	S('.tooltip').invisible('Tooltip hidden');
	S(function() {
		S.win.$('.tooltip').on('move', function() {
			ok('moved')
		})
	})
	S('.scrollable a:eq(4)').click();
	S('.tooltip').visible('Tooltip shows');
	S('.scrollable').scroll('top', 60);
});

})
