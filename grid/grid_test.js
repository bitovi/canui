steal("jquery", "canui/grid", 'funcunit/qunit').then(function ($) {

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

	test("Initialize empty, live binding columns", function () {
		var container = $('<table>').appendTo('#qunit-test-area');
		container.grid({
			columns : columns
		});

		equal(container.find('th').length, 2, 'Both columns rendered as table headings');
		ok(container.find('td:contains("No data")').length, 'Empty text columns exists');
		equal(container.grid('list').length, 0, 'Grid item list is empty');
		container.grid('columns').pop();
		equal(container.find('th').length, 1, 'Column removed, only one left');
		container.grid('columns').attr('0.header', 'Live binding');
		equal($.trim(container.find('th:first').html()), 'Live binding', 'Live updated column content');
	});

	test("Initialize content", function() {
		var container = $('<table>').appendTo('#qunit-test-area');
		container.grid({
			columns : columns,
			loadingContent : function() {
				return 'Loading...';
			},
			emptyContent : function() {
				return 'Nothing found';
			}
		});

		var dfd = can.Deferred();
		container.grid('list', dfd);
		equal(can.$.trim(container.find('td:first').html()), 'Loading...', 'Showing loading content');
		dfd.resolve([]);
		equal(can.$.trim(container.find('td:first').html()), 'Nothing found', 'Showing empty content');
		var compute = can.compute([{ name : 'Compute', age : 23  }]);
		container.grid('list', compute);
		equal(can.$.trim(container.find('td:first').html()), 'Compute', 'Got compute array');
		dfd = can.Deferred();
		compute(dfd);
		equal(can.$.trim(container.find('td:first').html()), 'Loading...', 'Showing loading content');
		dfd.resolve([{ name : 'Updated', age : 230  }]);
		equal(can.$.trim(container.find('td:first').html()), 'Updated', 'Got compute array');
	});

	test("tableScroll", function() {
		var container = $('<table>').appendTo('#qunit-test-area');
		container.grid({
			columns : columns,
			loadingContent : 'Loading...',
			emptyContent : 'Nothing found',
			scrollable : true
		});
	});
});
