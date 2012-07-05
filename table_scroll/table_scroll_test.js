steal('funcunit').then(function(){
	
module("can.ui.layout.TableScroll", {
	setup: function(){
        S.open("//canui/table_scroll/table_scroll_plain.html");
		
		// helps compare columns
		this.compareCols = function(i, size){
			var width = S(".header th:eq("+i+")").outerWidth();
			
			var outer = S("#table tr:first td:eq("+i+")").outerWidth();
			
			if(i == size -1){
				ok(outer < width,"Last is bigger")
			}else{
				equals(outer, width, ""+i+" columns widths match")
			}
			
		}
	}
});

test("columns are the right size", function(){
	var compareCols = this.compareCols;
	
	S("#scrollable").click().wait(100, function(){
		var size = S(".header th").size();
		for(var i =0; i < size; i++){
			compareCols(i, size);
		}
	});
});

test("horizontal scroll", 1, function(){
	S("#scrollable").click().wait(100);

	
	S('.scrollBody').scroll("left",10);
	S('.header').scrollLeft(10, function(){
		ok(true, "assertions make people feel better")
	});
});

test("update columns and resize", 2, function() {
	S("#scrollable").click().wait(100);
	var oldThWidth, oldTdWidth;
	S(function() {
		oldThWidth = S.win.$('th:eq(1)').width();
		oldTdWidth = S.win.$('td:eq(2)').width();
	});

	S("#changeHeading").click().then(function(){
		ok(S.win.$('td:eq(1)').width() > oldThWidth, 'Columns got resized as well');
	});

	S("#changeColumn").click().then(function(){
		ok(S.win.$('th:eq(2)').width() > oldTdWidth, 'Heading got resized as well');
	});
});

})