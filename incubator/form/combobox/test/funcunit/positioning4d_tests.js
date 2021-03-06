module("combobox4 test", { 
	setup: function(){
        S.open("//canui/form/combobox/positioning4d.html");
	}
})

/*
 *  4. Combobox positioning tests - Combobox appended to documentElement:
 *  
 *  4a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  4b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  4c Tests if the space above is greater than the space below and  dropdown fits in space above, the dropdown opens above with full height.
 *  4d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  4e Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  4d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, 
 *  the dropdown opens to fit space avaialble above   
 */
test("4d Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above", function() {
	
	S("#combobox4d").exists();
	
	S("#combobox4d").visible();	
	
	var comboOffset = S("#combobox4d").offset(),
		comboTop = comboOffset.top;
		
	S("#combobox4d").find("input[type=text]").click();
	
	S("#combobox4d_dropdown").visible();
			
	// make sure the dropdown position is right	
	S("#combobox4d_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(dropTop) < 1;
	});
	
});


