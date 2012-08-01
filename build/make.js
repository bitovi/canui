
load("steal/rhino/rhino.js");
steal('steal/build/pluginify', function() {

	var out = "canui/dist/",
		excludes = [ 'steal/dev',
			'can/',
			'jquery/',
			'jquery',
			'steal/less' ];

	steal.File(out).mkdirs();

	// Create full library
	steal.build.pluginify('canui/canui.js', {
		out: out + "canui.js",
		skipCallbacks: true,
		exclude : excludes
	});

});
