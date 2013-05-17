steal('can/util','can/control','can/view/mustache',function(can){

var Checked = can.Control({
	init: function(){
		this.check()
	},
	"{value} change": "check",
	check: function(){
		if(this.element.prop("type") == "checkbox"){
			
			this.element.prop("checked", !!this.options.value() )
			
		} else {
			if(this.options.value() === this.element.val()){
				this.element.prop("checked", true)
			} else {
				this.element.prop("checked", false)
			}
		}
		
		
	},
	"change": function(){
		if(this.element.prop("type") == "checkbox"){
			this.options.value( !!this.element.is(":checked") );
		} else {
			if(this.element.is(":checked")){
				this.options.value(this.element.val())
			}
		}
		
	}
});

can.Mustache.registerHelper('checked', function(value){
    return function(el){
        new Checked(el, {value: value});
    }
});

return Checked;

});