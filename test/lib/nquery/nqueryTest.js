/**
 * Unit test for the nquery library.
 */
 
 (function () {
     var    vows    = require('vows'), 
            assert  = require('assert'),
            nquery  = require('../../../lib/nquery/nquery');
            
    function type_test(value, expected) {
        var context = {
            topic: nquery.type(value)
        };
        context["should return a value of \"" + expected + "\""]   = function (topic) {
            assert.strictEqual(topic, expected);
        };
        return context;
    }
    
    function isPlainObject_fail(value) {
        var context = {
            topic: nquery.isPlainObject(value)
        };
        context["should return false"]  = function (topic) { assert.isFalse(topic); };
        
        return context;
    }
            
    vows.describe('nquery.type() function behavior').addBatch({
        'when testing a null value': type_test(null, "null"),
        'when testing an undefined value': type_test(undefined, "undefined"),
        'when testing a boolean true': type_test(true, "boolean"),
        'when testing a boolean false': type_test(false, "boolean"),
        'when testing a coerced boolean true': type_test(Boolean(true), "boolean"),
        'when testing a zero number value': type_test(0, "number"),
        'when testing a one (1) number value': type_test(1, "number"),
        'when testing a coerced one (1) number value': type_test(Number(1), "number"),
        'when testing an empty string': type_test("", "string"),
        'when testing the string "a"': type_test("a", "string"),
        'when testing "a" coerced to a string': type_test(String("a"), "string"),
        'when testing an empty object "{}"': type_test({}, "object"),
        'when testing "/foo/"': type_test(/foo/, "regexp"),
        'when testing a regular expression object': type_test(new RegExp("asdf"), "regexp"),
        'when testing an array': type_test([1], "array"),
        'when testing a Date object': type_test(new Date(), "date"),
        'when testing a Function object': type_test(new Function("return;"), "function"),
        'when testing an anonymous function object': type_test(function () {}, "function")
    }).export(module);
    
    vows.describe('When calling nquery.isPlainObject() ').addBatch({
        'with a string': isPlainObject_fail(""),
        'with the number one (1)': isPlainObject_fail(1),
        'with the number zero (0)': isPlainObject_fail(0),
        'with null': isPlainObject_fail(null),
        'with undefined': isPlainObject_fail(undefined),
        'with an array': isPlainObject_fail([]),
        'with a Date object': isPlainObject_fail(new Date()),
        'with an empty function': (function () {
            var fn  = function (){};
            return isPlainObject_fail(fn);
        }()),
        'with an instantiated function': (function () {
            var fn  = function () {};
            return isPlainObject_fail(new fn());
        }()),
        'with a function that has a prototype method': (function () {
            var fn  = function () {};
            fn.prototype    = { someMethod: function () {}};
            
            return isPlainObject_fail(new fn());
        }()),
        'with a plain object': {
            topic: nquery.isPlainObject({}),
            'should return true': function (topic) { assert.isTrue(topic); }
        }
    }).export(module);
    
    (function () {
        var settings = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
            options = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
            optionsCopy = { xnumber2: 1, xstring2: "x", xxx: "newstring" },
            merged = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "x", xxx: "newstring" },
            deep1 = { foo: { bar: true } },
            deep1copy = { foo: { bar: true } },
            deep2 = { foo: { baz: true }, foo2: { 'blah': 'more blah', 'boo': 'scared' } },
            deep2copy = { foo: { baz: true }, foo2: { 'blah': 'more blah', 'boo': 'scared' } },
            deepmerged = { foo: { bar: true, baz: true }, foo2: { 'blah': 'more blah', 'boo': 'scared' } },
            arr = [1, 2, 3],
            nestedarray = { arr: arr };
        
        vows.describe('When calling nquery.extend()').addBatch({
            'with two different objects': {
                topic: nquery.extend(settings, options),
                'should return an object that represents the merge of the two objects': function (topic) {
                    assert.deepEqual(settings, merged);
                }
            },
            'with an object and a copy of itself': {
                topic: nquery.extend(options, optionsCopy),
                'should return an un-modified copy of the first object': function (topic) {
                    assert.deepEqual(options, optionsCopy);
                }
            },
            'with two different objects and a "null" second parameter': {
                topic: nquery.extend(settings, null, options),
                'should return an object that represents the merge of the two objects': function (topic) {
                    assert.deepEqual(settings, merged);
                }
            },
            'with an object, a copy of itself and a "null" second parameter': {
                topic: nquery.extend(options, null, optionsCopy),
                'should return an un-modified copy of the first object': function (topic) {
                    assert.deepEqual(options, optionsCopy);
                }
            },
            'with a deep copy request and two different objects': {
                topic: nquery.extend(true, deep1, deep2),
                'should result in a proper deep merge': function (topic) {
                    assert.deepEqual(deep1.foo, deepmerged.foo);
                },
                'should not modify deep objects that are the same': function (topic) {
                    assert.deepEqual(deep2.foo, deep2copy.foo);
                },
                'should properly traverse the object more than one level': function (topic) {
                    assert.deepEqual(deep1.foo2, deepmerged.foo2);
                }
            },
            'with a deep copy request on a nested child array': {
                topic: nquery.extend(true, {}, nestedarray).arr,
                'should clone the child array': function (topic) {
                    assert.notStrictEqual(topic, arr);
                }
            },
            // jQuery issue #5991
            'with a deep copy request and a nested array second parmeter that is the same name as an object of the first parameter': {
                topic: nquery.extend(true, { arr: {} }, nestedarray).arr,
                'should clone the array': function (topic) {
                    assert.isArray(topic);
                }
            },
            'with a deep copy request and a nested object second parameter that is the same name as a nested array of the first parameter': {
                topic: nquery.extend(true, { arr: arr }, { arr: {} }).arr,
                'should clone the plain object': function (topic) {
                  assert.isTrue(nquery.isPlainObject(topic));  
                }
            },
            'with a deep copy request and a second parameter that has a length property': {
                topic: function () {
                    var empty   = {},
                        optionsWithLength   = { foo: { length: -1 } };
                        
                    nquery.extend(true, empty, optionsWithLength);
                    return {
                        one: empty.foo,
                        two: optionsWithLength.foo
                    };
                },
                'should copy the length property correctly': function (topic) {
                    assert.deepEqual(topic.one, topic.two);
                }
            },
            'with a deep copy request and a second parameter that has a date property': {
                topic: function () {
                    var empty   = {},
                        optionsWithDate = { foo: { date: new Date() } };
                        
                    nquery.extend(true, empty, optionsWithDate);
                    return {
                        one: empty.foo.date,
                        two: optionsWithDate.foo.date
                    };
                },
                'should copy the date property correctly': function (topic) {
                    assert.deepEqual(topic.one, topic.two);
                }
            },
            'with a deep copy request and a custom object as a second parameter': {
                topic: function () {
                    var myKlass = function() {},
                        custom  = new myKlass(),
                        optionsWithCustomObject = { foo: { date: custom } },
                        empty   = {};
                        
                    nquery.extend(true, empty, optionsWithCustomObject);
                    
                    return {
                        'foo': empty.foo,
                        'custom': custom
                    };
                },
                'should copy the objects correctly (no methods)': function (topic) {
                    assert.isObject(topic.foo);
                    assert.deepEqual(topic.foo.date, topic.custom);
                }
            },
            'with a deep copy request and a custom object with methods as a 2nd parameter': {
                topic: function () {
                    var myKlass = function() {},
                        empty   = {},
                        custom, optionsWithCustomObject;
                        
                    myKlass.prototype       = { someMethod: function(){} };
                    custom                  = new myKlass();
                    optionsWithCustomObject = { foo: { date: custom } };
                    
                    nquery.extend(true, empty, optionsWithCustomObject);
                    
                    return {
                        'foo': empty.foo,
                        'custom': custom
                    };
                },
                'should copy the objects correctly (with methods)': function (topic) {
                    assert.isObject(topic.foo);
                    assert.deepEqual(topic.foo.date, topic.custom);
                }
            },
            'with nested null parameters': {
                topic: nquery.extend({}, options, { xnumber2: null, xnumber0: null }),
                'should copy the null value': function (topic) {
                    assert.isNull(topic.xnumber2);
                },
                'should insert a null value': function (topic) {
                    assert.isNull(topic.xnumber0);
                }
            },
            'with nested undefined parameters': {
                topic: function () {
                    var nullUndef       = nquery.extend(nullUndef, options, { xnumber2: undefined });
                    return nullUndef;
                },
                'should ignore the undefined value': function (topic) {
                    assert.strictEqual(topic.xnumber2, options.xnumber2);
                }
            },
            'with a recursive nested parameter': {
                topic: function () {
                    var target  = {},
                        recursive   = { foo: target, bar: 5 };
                        
                    nquery.extend(true, target, recursive);
                    
                    return target;
                },
                'should skip the recursive property and not go into a never-ending loop': function (topic) {
                    assert.deepEqual(topic, { bar: 5 });
                }
            },
            'with a nested falsy parameter': {
                topic: nquery.extend(true, { foo: [] }, { foo: [0] } ),
                'should copy over the falsy value': function (topic) {
                    assert.strictEqual(topic.foo.length, 1);
                }
            },
            'with equal by coersion values': {
                topic: nquery.extend(true, { foo: "1,2,3" }, { foo: [1,2,3] } ),
                'should overwrite properly': function (topic) {
                    assert.isArray(topic.foo);
                }
            },
            'with a deep copy request and a nested null overwrite value jQuery issue #1908': {
                topic: nquery.extend(true, { foo: "bar" }, { foo: null } ),
                'should not crash': function (topic) {
                    assert.isTrue((topic.foo !== undefined));
                    assert.strictEqual(topic.foo, null);
                }
            },
            'with a null that should be overridden': {
                topic: function () {
                    var obj = { foo: null };
                    nquery.extend(true, obj, { foo:"notnull"} );
                    return obj;
                },
                'should overwrite the null value': function (topic) {
                    assert.strictEqual(topic.foo, "notnull");
                }
            },
            'with a function to be extended by an object': {
                topic: function () {
                    function func() {}
                    nquery.extend(func, { key: "value" } );
                    return func;
                },
                'should properly extend the function': function (topic) {
                    assert.strictEqual(topic.key, "value");
                }
            },
            'with four parameters': (function () {
                var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
                    defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
                    options1 = { xnumber2: 1, xstring2: "x" },
                    options1Copy = { xnumber2: 1, xstring2: "x" },
                    options2 = { xstring2: "xx", xxx: "newstringx" },
                    options2Copy = { xstring2: "xx", xxx: "newstringx" },
                    merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };
                    
                return {
                    topic: nquery.extend({}, defaults, options1, options2),
                    'should return a properly merged object': function (topic) {
                        assert.deepEqual(topic, merged2);
                    },
                    'should not modify the other parameters': function (topic) {
                        assert.deepEqual(defaults, defaultsCopy);
                        assert.deepEqual(options1, options1Copy);
                        assert.deepEqual(options2, options2Copy);
                    }
                };
            }())
        }).export(module);
    }());
 }());