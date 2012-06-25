steal("canui/grid", "can/observe/sort", 'funcunit/qunit').then(function () {

	module("canui/grid/list");

	test("empty initialization", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			list = new can.ui.Grid(container, {
				columns : [
					{
						name : "name",
						text : "Name"
					},
					{
						name : "age",
						text : "Age"
					}
				]
			});

		equal($('th').length, 2, 'Both columns rendered as table headings');
		ok(container.find('td:contains("No data")').length, 'Empty text columns exists');
		ok(list.columns() instanceof can.Observe.List, 'Columns converted to observe list');
		list.columns().attr('0.visible', false);
		equal(container.find('th').length, 1, 'First column hidden');
	});

	test("array initialization", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			list = new can.ui.Grid(container, {
				columns : [
					{
						name : "name",
						text : "Name"
					},
					{
						name : "age",
						text : "Age"
					}
				],
				list : [
					{
						name : 'John',
						age : 42
					},
					{
						name : 'Dave',
						age : 26
					}
				]
			});

		equal(container.find('tbody tr').length, 2, 'Rendered two rows');
		ok(list.list() instanceof can.Observe.List, 'List converted to observe list');
	});

	test("observe list initialization", function () {
		var container = $('<div>').appendTo('#qunit-test-area'),
			data = new can.Observe.List([
				{
					name : 'John',
					age : 42
				},
				{
					name : 'Dave',
					age : 26
				}
			]),
			list = new can.ui.Grid(container, {
				columns : [
					{
						name : "name",
						text : "Name"
					},
					{
						name : "age",
						text : "Age"
					}
				],
				list : data
			});

		equal(container.find('tbody tr').length, 2, 'Rendered two rows');
		data.attr('1.name', 'Test Name');
		ok(container.find('td:contains("Test Name")').length, 'Live update: attr()');
		data.pop();
		equal(container.find('tbody tr').length, 1, 'Live update: pop()');
		data.push({
			name : 'Tester',
			age : 1
		});
		ok(container.find('td:contains("Tester")').length, 'Live update: push()');
		data.comparator = 'age';
		data.sort();
		console.log(data);
	});
});
