/**
 * This is a port of jQuery.extend
 * @see https://github.com/jquery/jquery/blob/master/src/core.js
 */
 
 module.exports = (function() {
    var _           = require('underscore'), class2type;
    _.mixin(require('underscore.string'));
    
    class2type  = (function () {
        var list    = "Boolean Number String Function Array Date RegExp Object".split(" "),
            types   = {};
        _.each(list, function(name) {
           types[ "[object " + name + "]" ] = name.toLowerCase(); 
        });
        return types;
    }());
    
    /**
     * Support function to determine the type of a given object.
     * @param {Object} obj
     * @return {string}
     */
    function type( obj ) {
        return obj == null ?
            String( obj ) :
            class2type[ toString.call(obj) ] || "object";
    }
    
    /**
     * Support function to determine if the given value is a plain object.
     * @param {*} value
     * @return {boolean}
     */
    function isPlainObject(value) {
        var key,
            hasOwn  = Object.prototype.hasOwnProperty;
            
        //Must be an Object.
        //Kept the nodeType check but removed the isWindow check.  Doesn't seem 
        //necessary to implement the isWindow() function and the nodeType check
        //may be useful in some fashion.
        if ( !value || type(value) !== "object" || hasOwn.call(value, 'nodeType') ) {
            return false;   
        }
        
        try {
            if (value.constructor &&
                !hasOwn.call(value, "constructor") &&
                !hasOwn.call(value.constructor.prototype, "isPrototypeOf") ) {
                return false;    
            }
            
        } catch ( e ) {
            //An exception may be thrown, originally for IE8, 9 perhaps pointless here.
            return false;
        }
        
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for ( key in value ) {}
        
        return key === undefined || hasOwn.call( value, key );
    }
    
    function merge() {
        var options, name, src, copy, copyIsArray, clone,
            target  = arguments[0] || {},
            i       = 1,
            length  = arguments.length,
            deep    = false;
            
        //Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep    = target;
            target  = arguments[1] || {};
            // skip the boolean and the target
            i       = 2;
        }
        
        //Handle case when taret is a string or something (possible in a deep copy)
        if ( typeof target !== "object" && !_.isFunction(target) ) {
            target  = {};
        }
        
        for ( ; i < length; i += 1) {
            //Only deal with non-null/undefined values
            if ( (options = arguments [ i ]) != null ) {
                //Extend the base object.
                for ( name in options ) {
                    src     = target[ name ];
                    copy    = options [ name ];
                    
                    //Prevent never-ending loop
                    if ( target === copy ) {
                        continue;   
                    }
                    
                    //Recurse if we're merging plain objects or arrays.
                    if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = _.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone       = src && _.isArray(src) ? src : [];
                            
                        } else {
                            clone       = src && isPlainObject(src) ? src : {};
                        }
                        
                        //Never move original objects, clone them.
                        target[ name ]  = merge( deep, clone, copy );
                    
                    //Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ]      = copy;
                    }
                } 
            }
        }
        
        return target;
    }
    
    _.mixin({
        'type': type,
        'isPlainObject': isPlainObject,
        'merge': merge
    });
    return _;
 }());