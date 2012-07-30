steal('jquery', 'funcunit/qunit', 'canui/list', function($) {
	module("can.ui.List");

	test("Initialize empty", function () {
		var emptyHtml = '<li>Nothing here...</li>',
			container = $('<ul>').appendTo('#qunit-test-area').list({
				view : '//canui/list/test.ejs',
				emptyContent : emptyHtml
			});

		equal(container.html(), emptyHtml, 'Set to empty text');
	});

	test("Initialize with observe list, live binding", function () {
		var people = new can.Observe.List([
			{
				name : 'John I',
				age : 10
			}, {
				name : 'John II',
				age : 18
			}
		]);

		var container = $('<ul>').appendTo('#qunit-test-area').list({
				view : '//canui/list/test.ejs',
				list : people
			});

		equal(container.find('li').length, 2, 'Two items rendered');
		equal($.trim(container.find('li:first').html()), 'John I', 'First li rendered');
		people[0].attr('name', 'John Updated');
		equal($.trim(container.find('li:first').html()), 'John Updated', 'First li updated');
		people.push(new can.Observe({ name : 'Dave', age : 23 }));
		equal(container.find('li').length, 3, 'New item rendered');
		equal($.trim(container.find('li:last').html()), 'Dave', 'Last li is new item');
		people.shift();
		equal(container.find('li').length, 2, 'Element removed');
		equal($.trim(container.find('li:first').html()), 'John II', 'First li shifted');
	});

})