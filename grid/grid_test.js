steal("canui/grid", 'funcunit/qunit').then(function () {

	module("can.ui.Grid");

	var columns = [
		{
			content : "name",
			header : "Name"
		},
		{
			content : "age",
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
		container.remove();
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
		container.remove();
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
		container.remove();
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
		container.remove();
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
		container.remove();
	});

	test("Computed property columns", function() {
		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'Comp 1',
					age : 87
				},
				{
					name : 'Comp 2',
					age : 55
				}
			]),
			grid = new can.ui.Grid(container, {
				columns : [{
					header : 'Person',
					content : function(person) {
						return can.compute(function() {
							return person.attr('name') + ' (' + person.attr('age') + ')';
						});
					}
				}],
				list : people
			});

		equal(container.find('[data-cid] td:eq(0)').html(), 'Comp 1 (87)', 'Content set properly');
		equal(container.find('[data-cid] td:eq(1)').html(), 'Comp 2 (55)', 'Content set properly');
		people.attr('0.name', 'Updated comp');
		people.attr('1.age', 90);
		equal(container.find('[data-cid] td:eq(0)').html(), 'Updated comp (87)', 'Content set properly');
		equal(container.find('[data-cid] td:eq(1)').html(), 'Comp 2 (90)', 'Computed content updated');
		container.remove();
	});

	test("EJS columns", function() {
		var script = $('<script type="text/ejs" id="personEJS">' +
			'<%= person.attr("name") %>: <%= person.attr("age") %>' +
		'</script>').appendTo('body');

		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'EJS rendered',
					age : 87
				}
			]),
			grid = new can.ui.Grid(container, {
				columns : [{
					header : 'Person',
					content : function(observe) {
						return can.view('personEJS', {
							person : observe
						});
					}
				}],
				list : people
			});

		equal(container.find('[data-cid] td:eq(0)').html(), 'EJS rendered: 87', 'Content set properly');
		people[0].attr('age', 99);
		equal(container.find('[data-cid] td:eq(0)').html(), 'EJS rendered: 99', 'Live bind EJS update');
		script.remove();
		container.remove();
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
		container.remove();
	});

	test(".rows()", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'Row 1',
					age : 20
				},
				{
					name : 'Row 2',
					age : 21
				}
			]),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : people
			});

		var rows = grid.rows(people[0]);
		equal(rows.length, 1, 'Got one row');
		equal(rows.find('td:first').html(), 'Row 1', 'First row');
		var rows = grid.rows(people[1]);
		equal(rows.length, 1, 'Got one row');
		equal(rows.find('td:first').html(), 'Row 2', 'Second row');
		container.remove();
	});

	test(".items()", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			people = new can.Observe.List([
				{
					name : 'Item 1',
					age : 100
				},
				{
					name : 'Item 2',
					age : 99
				}
			]),
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : people
			});

		var person = grid.items(container.find('tbody tr:first'));
		ok(person instanceof can.Observe, 'Got an observe instance');
		var people = grid.items(container.find('tbody tr'));
		ok(people instanceof can.Observe.List, 'Got an observe list');
		equal(people.length, 2, 'Got two instances');
		equal(people[0].attr('name'), 'Item 1', 'Correct item');
		container.remove();
	});

	test(".list() change", function() {
		var container = $('<div>').appendTo('#qunit-test-area'),
			oldList = [
				{
					name : 'Test 1',
					age : 0
				},
				{
					name : 'Test 2',
					age : 1
				}
			],
			grid = new can.ui.Grid(container, {
				columns : columns,
				list : oldList
			}),
			newList = [
				{
					name : 'Test 3',
					age : 4
				},
				{
					name : 'Test 4',
					age : 2
				}
			],
			dfd = can.Deferred(),
			compute = can.compute(function() {
				return oldList;
			});

		equal(grid.items()[0].attr('name'), 'Test 1', 'Item set');
		grid.list(dfd);
		ok(container.find('td:contains("Loading...")').length, 'Grid is showing loading text');
		dfd.resolve(newList);
		equal(grid.items()[0].attr('name'), 'Test 3', 'New item set');
		grid.list(compute);
		equal(grid.items()[0].attr('name'), 'Test 1', 'Compute set to old item');
		container.remove();
	});
});
