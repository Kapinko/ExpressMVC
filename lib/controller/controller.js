(function () {
	var default_base_dir	= require('path').join(__dirname, '../', '../');
	
	require('express');
	require('express-namespace');
	require('express-params');
	
	function Controller(name) {
		var base_dir		= this.set('base_dir') || default_base_dir;
		require(base_dir + '/controllers/' + name)(this);
	}
	
	exports	= module.exports		= Controller;
	require('../express/extension')('Controller', Controller);
}());