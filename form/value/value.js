steal('can/util','can/control','can/view/mustache',function(can){
	
var Value = can.Control({
	init: function(){
		if(this.element.prop('nodeName').toUpperCase() === "SELECT"){
			// need to wait until end of turn ...
			setTimeout($.proxy(this.set,this),1)
		} else {
			this.set()
		}
		
	},
	"{value} change": "set",
	set: function(){
		this.element.val(this.options.value())
	},
	"change": function(){
		this.options.value(this.element.val())
	}
})

can.Mustache.registerHelper('value', function(value){
    return function(el){
        new Value(el, {value: value});
    }
});

return Value;

});