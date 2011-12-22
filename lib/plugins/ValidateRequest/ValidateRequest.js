/**
 * A handler that will check for a validation object and return the appropriate
 * error response if necessary.
 * 
 * Will return a response code of 496 in the event of a validation failure.
 * This will keep the API compatible with the CJAF framework error handler.
 */

module.exports    = function (MVC, server) {
    function sendErrors(res, errors) {
        res.json({
            'validation_errors': errors
        }, 496);
    }
    
	return function (req, res, next) {
		if (req.validation && !req.validation.isValid) {
			sendErrors(res, req.validation.errors);
			
		} else if (req.form && !req.form.isValid && 
			typeof req.form.getErrors === 'function') {
                sendErrors(res, req.form.getErrors());
		} else {
            next();
		}
	};
};