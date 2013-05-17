steal('can','./init.ejs', function(can, initView){
    /**
     * @class canui/form/select
	 * @alias Select   
     */
    return can.Control(
	/** @Static */
	{
		defaults : {}
	},
	/** @Prototype */
	{
		init : function(){
			this.element.html(initView({
				message: "Hello World from Select"
			}));
		}
	});
});