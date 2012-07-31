steal('funcunit', function(){
	
module("can.ui.TableScroll", {
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

/* TODO trigger scrolling doesn't work
test("horizontal scroll", 2, function(){
	S("#scrollable").click().wait(100);

	S(function() {
		S.win.$('.tableScroll div:eq(1)').scrollLeft(100).trigger('scroll');
		console.log(S.win.$('.tableScroll div:eq(1)').scrollLeft());
	})
	S('.tableScroll div.header').scrollLeft(10, function(){
		ok(true, "Header moved")
	});
	S('.tableScroll div.footer').scrollLeft(10, function(){
		ok(true, "Footer moved")
	});
});
*/

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