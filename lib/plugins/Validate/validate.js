/**
 * This is the Validator Plugin factory object.
 */
 
 (function () {
     var validators = {};
     
     exports.factory    = function (options) {
         
     };
     
     /**
      * A function to allow the user to add a single custom validator.
      * @param {string} name
      * @param {function} validator
      * @return {boolean} - return false on name collision
      */
     exports.addValidator = function(name, validator) {
         var success    = false;
         
         if (!validators.hasOwnProperty(name)) {
             validators[name]   = validator;
         }
         
         return success;
     };
 }());