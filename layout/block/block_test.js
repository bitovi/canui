steal('funcunit').then(function(){

module("can.ui.layout.Block",{
	setup: function(){
        S.open("//canui/layout/block/block.html");
	}
});

test("Block window", function() {
	S('#blocker1').exists().height(0, 'Blocker has no height');
	S('#block').click();
	S('#blocker1').exists().height(function() {
		return S.win.$(this).height() == S.win.$(S.win).height();
	}, 'Blocker has full window height')
		.css('z-index', '9999', 'Z-Index set high');
});

test("Block element", function() {
	S('#blocker2').exists().height(0, 'Blocker has no height');
	S('#block2').click();
	S('#blocker2').height(function() {
		return S.win.$(this).height() == S.win.$('#block-div').height();
	}, '#blocker2 covers whole div')
		.css('z-index', '9999', 'Z-Index set high');
});

});