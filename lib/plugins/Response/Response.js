

module.exports  = function () {    
    return {
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
        
        'errorResponse': function (res, err) {
            res.json({
                'message': (err.message || err.toString())
            }, parseInt(err.code || 500, 10));
        },
        
        'objectResponse': function (name) {
            return function (req, res) {
                if (req.err) {
                    this.errorResponse(res, err);
                    
                } else if (req[name]) {
                    res.json(req[name]);
                    
                } else {
                    res.json('Not Found', 404);
                }
            };
        }
    };
};