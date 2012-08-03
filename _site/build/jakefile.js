var path = require("path"),
	spawn = require("child_process").spawn,
	rootPath = path.join(__dirname, "../../"),
	exec = function (cmd, args, callback, options) {
		console.log(cmd + ' ' + args.join(' '));
		var spawned = spawn(cmd, args, options || {});

		spawned.stdout.pipe(process.stdout, { end : false });
		spawned.stderr.pipe(process.stderr, { end : false });

		spawned.on('exit', function () {
			callback();
		});
	},
	// Additional files to deploy to a release directory
	deployFiles = {
		'split/split.css' : 'split.css',
		'resizable/resizable.css' : 'resizable.css'
	};

desc('Runs make.js to build the application');
task('build', function (params) {
	var executable = process.platform == 'win32' ? 'js.bat' : './js';
	console.log('Building...');
	exec(executable, ['canui/build/make.js'], function () {
		complete();
	}, { cwd : rootPath });
}, { async : true });

namespace('deploy', function () {
	desc('Checkout gh-pages branch and update latest release');
	task('latest', [ 'build' ], function () {
		console.log('Cloning CanUI repository');
		exec('git', ['clone', 'git@github.com:jupiterjs/canui.git'], function () {
			exec('git', ['checkout', 'gh-pages'], function() {
				jake.cpR(path.join(rootPath + 'canui/dist/canui.js'), './canui/release/latest/canui.js');
				exec('git', ['commit', '-a', '-m', '"Updating release"'], function() {
					exec('git', ['push', 'origin', 'gh-pages'], function () {
						exec('rm', [ '-rf', './canui' ], function() {});
					}, { cwd : './canui' });
				}, { cwd : './canui' });
				complete();
			}, { cwd : './canui' });
		});
	}, { async : true });
});
