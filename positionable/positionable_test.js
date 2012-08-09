steal('funcunit').then(function(){

module("can.ui.Positionable",{
	setup: function(){
        S.open("//canui/positionable/demos.html");
	}
});

test("General positioning", function(){
	S('.tooltip').invisible('Tooltip hidden');
	S('a:first').click();
	S('.tooltip').visible('Tooltip shows');
	S('.tooltip').css('top', '30px', 'Top is set to 30px');
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
