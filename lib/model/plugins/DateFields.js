module.exports	= (function () {
	return {
		/**
		 * Get the date modified field.
		 * @return {Date}
		 */
		'getDateModified': function () {
			return this.getProp('date_modified');
		},
		/**
		 * Get the date create field.
		 * @return {Date}
		 */
		'getDateCreated': function () {
			return this.getProp('date_created');
		},
		/**
		 * Set the date this object was created.
		 * @param {Date} date_created
		 * @return {Model}
		 */
		'setDateCreated': function (date_created) {
			return this.setProp('date_created', date_created);
		}
	};
}());