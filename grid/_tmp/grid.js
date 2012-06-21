steal('can/construct/proxy',
	'can/view/ejs',
	'can/view/modifiers',
	'can/control/plugin',
	'canui/layout/table_scroll',
	'canui/data',
	'canui/data/order',
	'canui/nav/selectable')
	.then('./views/th.ejs','./views/init.ejs','./views/list.ejs')
	.then(function($){

/**
 * @class can.ui.data.Grid
 * @parent canui
 * 
 * A simple data grid that is paginate-able and sortable.
 * 
 * ## Use
 * 
 * Add the grid to a div (or other element) like:
 * 
 *     new can.ui.data.Grid($('#grid'), {
 *     
 *       model : Recipe,		   // a model to use to make requests
 *       
 *       params : new Mxui.Data,   // a model to use for pagination 
 *                                 // and sorting values
 *       
 *       row : "//path/to/row.ejs" // a template to render a row with
 *       
 *       columns : {               // column titles
 *         title : "Title",
 *         date : "Date"
 *       }
 *     });
 *   
 * The grid will automatically 'fill'
 * its parent element's height.
 * 
 * @constructor
 * 
 * @param {Object} columns A object of columnName -> columnTitle pairs. Ex:
 * 
 *     columns : { title : "Title", date : "Date" }
 * 
 */

can.Control("can.ui.data.Grid", {
	defaults: {
		columns: {},
		params: new can.ui.Data,
		row : null,
		model : null,
		noItems : "No Items",
		// if true, can sort by multiple columns at a time
		multiSort: true,
		// if true, there are three states (asc, desc, no sort)
		canUnsort: true,
		// set to false for infinite scroll
		offsetEmpties: true,
		// set to false to turn off the filler
		filler: true,

		// immediately uses the  model to request items for the grid
		loadImmediate: true,
		selectable : true
	},
	listensTo : ["select","deselect"]
},
{
	setup : function(el, options){
		// check params has attrs
		if(options && options.params && !options.params.constructor){
			options.params = new can.ui.Data(options.params)
		}
		this._super.apply(this, arguments);
	},
	init : function(){
		//create the scrollable table
		var count = 0;
		for(var name in this.options.columns){
			count++;
		}

		this.element.append('//canui/data/grid/views/init.ejs',
			{columns: this.options.columns, count: count});

		this.element.children('table').can_ui_layout_table_scroll({
			filler: this.options.filler
		});
		this.$ = this.element.children(":first").control(can.ui.layout.TableScroll).elements()


		this.$.thead.can_ui_data_order({
			params: this.options.params,
			multiSort: this.options.multiSort,
			canUnsort: this.options.canUnsort
		})

		this.options.selectable && this.$.tbody.can_ui_nav_selectable();
		//this.scrollable.cache.thead.mxui_layout_resizer({selector: "th"});
		this.element.addClass("grid");
		if (this.options.filler) {
			this.element.can_ui_layout_fill();
		}
		//this.setFixedAndColumns()

		// add jQuery UI stuff ...
		this.element.find(".header table").attr('cellSpacing', '0').attr('cellPadding', '0');

		var ths = this.$.thead.find('th').addClass("ui-helper-reset ui-state-default");

		ths.eq(0).addClass('ui-corner-left')
		ths.eq(-1).addClass('ui-corner-right')


		if(this.options.loadImmediate){
			this.options.model.findAll(this.options.params.attr(), this.proxy('list', true))
		}

	},
	/**
	 *
	 * @param {Object} clear if this is true, clear the grid and create a new one, else insert
	 * @param {Object} items
	 */
	list : function(clear, items){
		this.curentParams = this.options.params.attr();

		this.options.params.attr('updating', false);

		var trs = $(can.view('//canui/data/grid/views/list.ejs',{
			row : this.options.row,
			items: items
		}));

		if(clear){
			this.empty();
		}

		this.append(trs);
		// update the items
		this.options.params.attr('count',items.count)
	},
	"{params} updated.attr" : function(params, ev, attr, val){
		if(attr !== 'count' && attr !== 'updating'){
			//want to throttle for rapid updates
			params.attr('updating', true)
			clearTimeout(this.newRequestTimer,100)
			this.newRequestTimer = setTimeout(this.proxy('newRequest', attr, val))
		}
	},
	newRequest : function(attr, val){
		var clear = true;
		if(!this.options.offsetEmpties && attr == "offset"){ // if offset changes and we have offsetEmpties false
			clear = false;
		}
		this.options.model.findAll(this.options.params.attr(), this.proxy('list', clear))
	},
    /**
     * Listen for updates and replace the text of the list
     * @param {Object} called
     * @param {Object} item
     */
    "{model} updated" : function(model, ev, item){
        var el = item.elements(this.element).html(this.options.row, item);
        if(this.options.updated){
            this.options.updated(this.element, el, item)
        }
		this.element.resize()
    },
    "{model} created" : function(model, ev, item){
        var newEl = $(can.view("//canui/data/grid/views/list",{
            items : [item],
            row: this.options.row
        }))
        if(this.options.append){
            this.options.append(this.element, newEl, item)
        }else{
            this.append(newEl)
			//newEl.appendTo(this.element).slideDown();
        }
    },
    "{model} destroyed" : function(model, ev, item){
        var el = item.elements(this.element)
        if(this.options.remove){
            this.options.remove(this.element,el, item)
        }else{
            el.slideUp( function(){
                el.remove();
            })
        }
    },
	/**
	 * Insert rows into the table
	 * @param {Object} row insert after this row
	 * @param {Object} newEls new elements to insert (they should be trs)
	 */
	append: function( row, newEls ) {
		if( !newEls ) {
			newEls = row;
			row = undefined;
		}
		this.element.children(":first").can_ui_layout_table_scroll("append",  newEls, row)
	},
	/**
	 * Remove all children from the table
	 */
	empty: function(){
		this.element.children(":first").can_ui_layout_table_scroll("empty")
	},
	"select" : function(el, ev){
		ev.preventDefault();
	},
	"deselect" : function(el, ev){
		ev.preventDefault();
	}

});

})