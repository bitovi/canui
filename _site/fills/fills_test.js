steal('funcunit').then(function(){

module("jQuery.fn.fills",{
	setup: function(){
        S.open("//canui/fills/fills.html");
	}
})

test("Filler Tests", function(){
	var dimensions = {};
	S(function() {
		var Q = S.win.$;
		dimensions.fillWidth = Q('#fill').width();
		dimensions.fillHeight = Q('#fill').height();
		dimensions.topHeight = Q('#top').height();
	});
	S('#resizer').drag('+50 +50');
	S(function() {
		var Q = S.win.$;
		ok(Q('#fill').width() == dimensions.fillWidth + 58, 'Width increased by 50px');
		ok(Q('#fill').height() == dimensions.fillHeight + 50, 'Height increased by 50px');
	});
	S('#resizer').drag('-200 -10');
	S(function() {
		var Q = S.win.$;
		ok(Q('#top').height() > dimensions.topHeight, 'Height is greater, too');
	});
})


	
})
