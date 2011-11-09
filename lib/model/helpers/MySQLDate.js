var moment	= require('moment');

(function () {
	var moment	= require('moment'),
		mysql_format	= 'YYYY-MM-DD HH:mm:ss';
	
	exports	= {
		'current': function () {
			return moment(new Date()).format(mysql_format);
		}
	}
}());