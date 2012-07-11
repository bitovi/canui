steal('funcunit',function(){
	
module('can.ui.Selectable', {
	setup : function(){
		S.open("//canui/selectable/selectable.html")
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

test('Keyboard navigation', function(){
	S('#menu [tabindex="0"]').type('\r\t[shift]\r', function() {
		ok(S('#menu li:eq(0) span').hasClass('activated'), 'First item is activated');
		ok(S('#menu li:eq(1) span').hasClass('activated'), 'Second item is activated');
		ok(S('#menu li:eq(1) span').hasClass('selected'), 'Second item is selected');
	});
});

})
