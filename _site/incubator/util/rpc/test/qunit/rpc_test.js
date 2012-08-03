steal("funcunit/qunit",'can/util/fixture','canui/util/rpc').then(function(){

	module("rpchub")
	test("rpchub works", function(){
		stop();
		can.rpc("Event.findAll",{thing: 5},function(events){
			
			ok(events.length,"we got events")
			start(); //lets do the next test in a second
		}, null,
		"//canui/util/rpc/fixtures/Event.findAll.json");

		stop();
		setTimeout(function(){
			can.rpc("Event.findOne",{thing: 5},function(event){
				ok(event.id,"only 1 thing");
				equals(can.rpc.numberOfRequests,1, "right number of requests made");
				start();
			}, null,
			"//canui/util/rpc/fixtures/Event.findOne.json")
		},3)
	})
	
	test("rpchub works twice", function(){
		stop();
		can.rpc("Event.findAll",{thing: 5},function(events){
			start();
			ok(events.length,"we got events")
	
		}, null,
		"//canui/util/rpc/fixtures/Event.findAll.json");

		stop();
		setTimeout(function(){
			can.rpc("Event.findOne",{thing: 5},function(event){
				ok(event.id,"only 1 thing");
				equals(can.rpc.numberOfRequests,2,"right number of requests");
				start();
			}, null,
			"//canui/util/rpc/fixtures/Event.findOne.json")
		},3)
	})

});
