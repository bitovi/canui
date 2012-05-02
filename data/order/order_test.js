steal('funcunit').then(function(){

module("can.ui.data.Order", {
	setup: function(){
		S.open("//canui/data/order/order.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Mxui.Data.Order Demo","demo text");
});


});