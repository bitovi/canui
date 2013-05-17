steal('canui/form/select','funcunit', function( Select, S ) {

	module("canui/form/select", { 
		setup: function(){
			S.open( window );
			$("#qunit-test-area").html("<div id='select'></div>")
		},
		teardown: function(){
			$("#qunit-test-area").empty();
		}
	});
	
	test("updates the element's html", function(){
		new Select('#select');
		ok( $('#select').html() , "updated html" );
	});

});