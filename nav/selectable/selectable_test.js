steal('funcunit',function(){
	
module('can.ui.nav.Selectable', {
	setup : function(){
		S.open("//canui/nav/selectable/selectable.html")
	}
})
	
test('clicking activates', function(){
	S('#menu span:first').click(function(){
		ok(S('#menu span:first').hasClass('activated'),"activated Class" )
		ok(S('#menu span:first').hasClass('selected'),"selected Class" )
	}).type('[down]', function(){
		ok(S('#menu span:first').hasClass('activated'),"activated Class" )
		ok(!S('#menu span:first').hasClass('selected'),"no longer selected Class" )
		
		ok(S('#menu span:eq(1)').hasClass('selected'),"selected moved" )
	});
});

})
