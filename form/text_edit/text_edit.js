steal('can/util','can/control','can/view/mustache',function(can){

var TextEdit = can.Control({
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
		this.element.text(this.options.value())
	},
	"click": function(el, ev){
		if(ev.target.nodeName.toLowerCase() != "input"){
			var input = $("<input type='text' value='"+this.options.value()+"'/>");
			this.element.html(input);
			setTimeout(function(){
				
				input.focus()	
			})
		}
		
	},
	"focusout" : function(){
		this.options.value(this.element.find('input').val());
		this.element.text(this.options.value())
	}
});

can.Mustache.registerHelper('textEdit', function(value){
    return function(el){
        new TextEdit(el, {value: value});
    }
});

return TextEdit;

});