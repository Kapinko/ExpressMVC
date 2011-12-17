/**
 * A handler that will check for a validation object and return the appropriate
 * error response if necessary.
 * 
 * Will return a response code of 496 in the event of a validation failure.
 * This will keep the API compatible with the CJAF framework error handler.
 */

module.exports    = function (MVC, server) {
	return function (req, res, next) {
		if (!req.validation.isValid) {
			res.json(req.validation.errors, 496);
			
		} else if (req.form && !req.form.isValid && 
			typeof req.form.getErrors === 'function') {
            res.json(req.form.getErrors(), 496);
		} else {
            next();
		}
	};
};