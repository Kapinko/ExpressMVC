(function() {
	var default_plugin_dir	= require('path').join(__dirname, '../', '../', '/plugins'),
		loaded				= [];
	
	require('../express/extension')('Plugin', function (name) {
		if (loaded[name]) {
			return loaded[name];
			
		} else {
			var base_dir	= this.set('plugin_dir') || default_plugin_dir,
				plugin		= require(base_dir + '/' + name + '/' + name)(this);
				
			loaded[name]	= plugin;
			return plugin;
		}
	});
}());