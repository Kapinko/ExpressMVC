module.exports	= (function () {
	var mustache	= require('./ext/mustache.js'),
		tmpl		= {
			compile: function (source, options) {
				if (typeof source === 'string') {
					return function (options) {
						var partials	= options.partials || {};
						
						return mustache.to_html(source, options, partials);
					};
					
				} else {
					return source;
				}
			},
			
			render: function (template, options) {
				template	= this.compile(template, options);
				return template(options);
			}
		};
	
	
	return tmpl;
}());