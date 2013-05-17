steal('can/util','can/control','can/view/mustache',function(can){
	var placeholderSupported = "placeholder" in document.createElement("input")

    var Placeholder = can.Control({
        init: function(element, options) {
            if( placeholderSupported ) {
            		this.element.attr('placeholder', this.options.placeholder() );   
            } else {
                if( this.element.val() === '' ) {
                    this.addPlaceholder(); 
                } else {
                		this.changed = true;
                }
                
            }
            
        },
        addPlaceholder: function(){
            this.element.val(this.options.placeholder()) 
            	.addClass('placeholder');
            this.changed = false;
        },
        removePlaceholder: function(){
        		this.element.val("").removeClass('placeholder');
        },
        'focus': function(el, ev) {
            if( ! placeholderSupported && !this.changed ) {
                if(  this.element.val() === this.options.placeholder() ) {
                		this.removePlaceholder();
                }
            }
        },
        'blur': function(){
            if( !placeholderSupported ) {
                if( this.element.val() === '' ) {
                		this.addPlaceholder();
                }
            }
        },
        "{value} change": function(value, ev, newVal, oldVal){
        		if( !placeholderSupported && newVal) {
        			this.element.removeClass('placeholder');
    			}
        },
        "{placeholder} change": function(placeholder, ev, newVal, oldVal){
            if( placeholderSupported ) {
                this.element.attr('placeholder', newVal)
            } else {
                if( !this.changed && !this.isFocused() ) {
                    this.element.val(newVal);
                }
            }
        },
        "change" : function(){
        		this.changed = (this.element.val() !== "");
        },
        isFocused: function(){
        		return document.activeElement === this.element[0];   
        }
    });
    
    can.Mustache.registerHelper('placeholder', function(placeholder, value){
        return function(el){
        		if(typeof placeholder === "string"){
        			placeholder = can.compute(placeholder);
        		}
            new Placeholder(el, {
            		placeholder: placeholder,
            		value: value
            	});
        }
    });
    return Placeholder;
});