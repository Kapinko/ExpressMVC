

module.exports  = function () {    
    return {
        /**
         * A standard not found response function
         * @param {*} res
         */
        'notFound': function (res) {
            res.json({
                'message': 'Not Found'
            }, 404);
        },
        /**
         * A standard not authorized response function.
         * @param {Object.<string,*>} res
         */
        'notAuthorized': function(res) {
            res.json({
                'message': 'Unauthorized'
            }, 401);
        },
        /**
         * A standard error handling response
         * @param {*} res
         * @param {*} err
         */
        'error': function (res, err) {
            res.json({
                'message': (err.message || err.toString())
            }, parseInt(err.code || 500, 10));
        },
        
        'modelHandler': function (name) {
            return function (req, res, next) {
                return function (err, object) {
                    if (err) {
                        req.err = err;
                        next();
                        
                    } else if (object) {
                        req[name]   = object;
                        next();
                        
                    } else {
                        res.json('Not Found', 404);
                    }
                };
            };
        },
        /**
         * @deprecated
         */
        'errorResponse': function (res, err) {
            this.error(res, err);
        },
        
        'objectResponse': function (name) {
			var error	= this.error;
            return function (req, res) {
                if (req.err) {
                    error(res, req.err);
                    
                } else if (req[name]) {
                    res.json(req[name]);
                    
                } else {
                    res.json('Not Found', 404);
                }
            };
        }
    };
};