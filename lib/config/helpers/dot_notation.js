/**
 * This is a helper function that will allow a user to specity a dot notation
 * syntax for object value access.
 */
/*jslint node:true*/
/*global requirejs:false*/
'use strict';

module.exports	= (function () {
	return {
		/**
		 * object property accessor that will enable the user to 
		 * use a dot "." separated string notation.
		 * @param {string} accessor
		 * @return {*}
		 */
		'accessor': function (accessor, object) {
			var keys	= accessor.split('.'),
				result	= object, key;

			while (keys.length > 0) {
				key	= keys.shift();

				if (typeof result[key] !== 'undefined') {
					result	= result[key];
				} else {
					result	= null;
					break;
				}
			}
			return result;
		}
	};
}());
