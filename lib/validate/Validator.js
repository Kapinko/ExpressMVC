/**
 * The Validator object.
 */
 
 module.exports = (function () {
     var $      = require('uquery'),
         /**
          * These are the default settings, can be overridden by options passed to
          * the constructor.
          * @type {Object.<string,*>}
          */
          defaults   = {
             /**
              * Is the field to be validated allowed to be empty?
              * @type {boolean}
              */
             allowEmpty: false,
             /**
              * A list of the dependency functions.
              * @type {Array.<function>}
              */
              dependencies: []
         };
     /**
      * Validator constructor function
      * @param {string} field
      * @param {Object.<string,*>}
      */
     function Validator(field, options) {
         /**
          * @type {string}
          */
         this.field = field;
         
         /**
          * @type {Object.<string,*>}
          */
         this.options	= $.merge(true, {}, defaults, options);
     }
     Validator.prototype    = (function () {
         /**
          * Private function to determine if all validation dependencies are met.
          * @return {boolean}
          */
         function are_dependencies_met () {
            var been_met        = true,
                dependencies    = this.options.dependencies,
                index, dependency;
                
            if ($.isArray(dependencies)) {
                for (index = 0; index < dependencies.length; index += 1) {
                    dependency  = dependencies[index];
                    
                    if ($.isFunction(dependency) && !dependency()) {
                        been_met    = false;
                        break;
                    }
                }
            }
            return been_met;
         }
         
         
         return {
            /**
             * Is the given value valid?
             * @param {*} value
             * @param {boolean}
             */
            'isValid': function (value) {
                value   = this._parse_value(value);
                
                if (this.isEmpty(value) && !this.options.allowEmpty) {
                    return false;
                }
                
                if (!are_dependencies_met().call(this)) {
                    return false;
                }
                
                if (!this._is_valid(value)) {
                    return false;
                }
                
                return true;
            },
            /**
             * Does the given value represent an empty value?
             * @param {*} value
             * @return {boolean}
             */
            'isEmpty': function (value) {
                var empty   = false;
                
                if (value === '' || value === null || value === undefined) {
                    empty   = true;
                }
                return empty;
            },
            /**
             * Internal hook function that should validate that the given value
             * is within acceptable parameters.  This is provided for derived
             * objects to overwrite.
             * @param {*} value
             * @return {boolean}
             */
            '_is_valid': function (value) {
                return true;
            },
            /**
             * Internal hook function to allow the user to provide a way to 
             * manipulate the value before we validate it.
             * @param {*} value
             * @return {*}
             */
            '_parse_value': function (value) {
                return value;
            }
         };
     }());
     
     
     return Validator;
 }());