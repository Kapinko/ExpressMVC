module.exports	= function (name_field) {
	if (!name_field) {
		name_field	= 'name';
	}
	
	return {
		/**
		 * Get the name field of this model.
		 * @return {string}
		 */
		'getName': function () {
			return this.getProp(name_field);
		},
		
		/**
		 * Set the name of this model.
		 * @param {string} name
		 * @return {Model}
		 */
		'setName': function (name) {
			return this.setProp(name_field, name);s
		}
	}
}