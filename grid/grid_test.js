steal("canui/grid", 'funcunit/qunit').then(function () {

	module("canui/grid/list");

	var columns = [
		{
			attr : "name",
			header : "Name"
		},
		{
			attr : "age",
			header : "Age"
		}
	];

	test("Initialize empty", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			grid = new can.ui.Grid(container, {
				columns : columns
			});

		equal(container.find('th').length, 2, 'Both columns rendered as table headings');
		ok(container.find('td:contains("No data")').length, 'Empty text columns exists');
		equal(grid.items().length, 0, 'Grid item list is empty');
	});

	test("Initialize with Array, set Array", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : [
					{
						name : 'Test 1',
						age : 0
					},
					{
						name : 'Test 2',
						age : 1
					}
				]
			});

		equal(container.find('th').length, 2, 'Both columns rendered as table headings');
		equal(grid.items().length, 2, 'Grid list has two items');
		ok(grid.items() instanceof can.Observe.List, '');
		ok(grid.list() instanceof Array, 'Original list still kept');
		equal(container.find('[data-cid] td').first().html(), 'Test 1', 'Content set properly');
		grid.list([
			{
				name : 'Test 3',
				age : 4
			},
			{
				name : 'Test 4',
				age : 2
			}
		]);

		equal(container.find('[data-cid] td').first().html(), 'Test 3', 'Content set properly');
	});

	test("Initialize with can.Observe.List", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'Test 1',
					age : 0
				},
				{
					name : 'Test 2',
					age : 1
				}
			]),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : people
			});
		equal(container.find('th').length, 2, 'Both columns rendered as table headings');
		equal(grid.items().length, 2, 'Grid list has two items');
		equal(grid.items(), people, 'List got passed right through');
	});

	test("Initialize with can.Deferred, resolve with array", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			dfd = can.Deferred(),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : dfd
			});

		ok(container.find('td:contains("Loading...")').length, 'Grid is showing loading text');
		equal(grid.items().length, 0, 'Grid item list is empty');
		dfd.resolve([
			{
				name : 'Deferred Test 1',
				age : 0
			},
			{
				name : 'Deferred Test 2',
				age : 1
			}
		]);
		equal(grid.items().length, 2, 'Grid list has two items');
		equal(container.find('[data-cid] td').first().html(), 'Deferred Test 1', 'Content set properly');
	});

	test("Initialize with can.compute, return Array, set can.compute", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			observe = new can.Observe({ age : 100, count : 2 }),
			compute = can.compute(function() {
				var res = [];
				for(var i = 0; i < observe.attr('count'); i++) {
					res.push({
						name : 'Observer ' + i,
						age : observe.attr('age') + i
					});
				}
				return res;
			}),
			otherCompute = can.compute(function() {
				var res = [];
				for(var i = 0; i < observe.attr('count') + 1; i++) {
					res.push({
						name : 'Other Observer ' + (i + 1),
						age : observe.attr('age') + 10 + i
					});
				}
				return res;
			}),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : compute
			});

		equal(grid.items().length, observe.attr('count'), 'Added count items');
		equal(container.find('[data-cid] td').first().html(), 'Observer 0', 'Content set properly');
		observe.attr({
			count : 3,
			age : 80
		});
		equal(grid.items().length, observe.attr('count'), 'Added count items');
		equal(grid.items()[0].age, 80, 'Also updated age');
		grid.list(otherCompute);
		equal(container.find('[data-cid] td').first().html(), 'Other Observer 1', 'Content set properly');
		equal(grid.items().length, observe.attr('count') + 1, 'Added count items with different compute');
		equal(grid.items()[0].age, 90, 'Also updated age');
	});

	test("Live binding", function() {
		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'Test 1',
					age : 0
				},
				{
					name : 'Test 2',
					age : 1
				}
			]),
			unshifter = new can.Observe({
				name : 'Unshifter',
				age : 2
			}),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : people
			});

		equal(grid.items().length, 2, 'Grid list has two items');
		equal(grid.items(), people, 'List got passed right through');
		people.unshift(unshifter);
		equal(grid.items().length, 3, 'Item added');
		equal(container.find('[data-cid] td').first().html(), 'Unshifter', 'Content set properly');
		unshifter.attr('name', 'Updated unshifter');
		equal(container.find('[data-cid] td').first().html(), 'Updated unshifter', 'Live binding update');
		people.pop();
		equal(grid.items().length, 2, 'Item got removed');
		equal(container.find('tr[data-cid]').length, 2, 'Row got removed');
	});

	test(".rows()", function () {
	});

	test(".items()", function () {
	});

	test(".list() changing", function() {
	});
});
