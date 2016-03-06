(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has'], factory);
    }
})(function (require, exports) {
    var has_1 = require('./has');
    var slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * Type guard that ensures that the value can be coerced to Object
     * to weed out host objects that do not derive from Object.
     * This function is used to check if we want to deep copy an object or not.
     * Note: In ES6 it is possible to modify an object's Symbol.toStringTag property, which will
     * change the value returned by `toString`. This is a rare edge case that is difficult to handle,
     * so it is not handled here.
     * @param  value The value to check
     * @return       If the value is coercible into an Object
     */
    function shouldDeepCopyObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }
    function copyArray(array, inherited) {
        return array.map(function (item) {
            if (Array.isArray(item)) {
                return copyArray(item, inherited);
            }
            return !shouldDeepCopyObject(item) ?
                item :
                _mixin({
                    deep: true,
                    inherited: inherited,
                    sources: [item],
                    target: {}
                });
        });
    }
    function _mixin(kwArgs) {
        var deep = kwArgs.deep;
        var inherited = kwArgs.inherited;
        var target = kwArgs.target;
        for (var _i = 0, _a = kwArgs.sources; _i < _a.length; _i++) {
            var source = _a[_i];
            for (var key in source) {
                if (inherited || hasOwnProperty.call(source, key)) {
                    var value = source[key];
                    if (deep) {
                        if (Array.isArray(value)) {
                            value = copyArray(value, inherited);
                        }
                        else if (shouldDeepCopyObject(value)) {
                            value = _mixin({
                                deep: true,
                                inherited: inherited,
                                sources: [value],
                                target: {}
                            });
                        }
                    }
                    target[key] = value;
                }
            }
        }
        return target;
    }
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    exports.assign = has_1.default('object-assign') ?
        Object.assign :
        function (target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            return _mixin({
                deep: false,
                inherited: false,
                sources: sources,
                target: target
            });
        };
    /**
     * Creates a new object from the given prototype, and copies all enumerable own properties of one or more
     * source objects to the newly created target object.
     *
     * @param prototype The prototype to create a new object from
     * @param mixins Any number of objects whose enumerable own properties will be copied to the created object
     * @return The new object
     */
    function create(prototype) {
        var mixins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mixins[_i - 1] = arguments[_i];
        }
        if (!mixins.length) {
            throw new RangeError('lang.create requires at least one mixin object.');
        }
        var args = mixins.slice();
        args.unshift(Object.create(prototype));
        return exports.assign.apply(null, args);
    }
    exports.create = create;
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object,
     * recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    function deepAssign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: true,
            inherited: false,
            sources: sources,
            target: target
        });
    }
    exports.deepAssign = deepAssign;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object, recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable properties will be copied to the target object
     * @return The modified target object
     */
    function deepMixin(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: true,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.deepMixin = deepMixin;
    /**
     * Creates a new object using the provided source's prototype as the prototype for the new object, and then
     * deep copies the provided source's values into the new target.
     *
     * @param source The object to duplicate
     * @return The new object
     */
    function duplicate(source) {
        var target = Object.create(Object.getPrototypeOf(source));
        return deepMixin(target, source);
    }
    exports.duplicate = duplicate;
    /**
     * Determines whether two values are the same value.
     *
     * @param a First value to compare
     * @param b Second value to compare
     * @return true if the values are the same; false otherwise
     */
    function isIdentical(a, b) {
        return a === b ||
            /* both values are NaN */
            (a !== a && b !== b);
    }
    exports.isIdentical = isIdentical;
    /**
     * Returns a function that binds a method to the specified object at runtime. This is similar to
     * `Function.prototype.bind`, but instead of a function it takes the name of a method on an object.
     * As a result, the function returned by `lateBind` will always call the function currently assigned to
     * the specified property on the object as of the moment the function it returns is called.
     *
     * @param instance The context object
     * @param method The name of the method on the context object to bind to itself
     * @param suppliedArgs An optional array of values to prepend to the `instance[method]` arguments list
     * @return The bound function
     */
    function lateBind(instance, method) {
        var suppliedArgs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            suppliedArgs[_i - 2] = arguments[_i];
        }
        return suppliedArgs.length ?
            function () {
                var args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
                // TS7017
                return instance[method].apply(instance, args);
            } :
            function () {
                // TS7017
                return instance[method].apply(instance, arguments);
            };
    }
    exports.lateBind = lateBind;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object.
     *
     * @return The modified target object
     */
    function mixin(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        return _mixin({
            deep: false,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.mixin = mixin;
    /**
     * Returns a function which invokes the given function with the given arguments prepended to its argument list.
     * Like `Function.prototype.bind`, but does not alter execution context.
     *
     * @param targetFunction The function that needs to be bound
     * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
     * @return The bound function
     */
    function partial(targetFunction) {
        var suppliedArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            suppliedArgs[_i - 1] = arguments[_i];
        }
        return function () {
            var args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
            return targetFunction.apply(this, args);
        };
    }
    exports.partial = partial;
    /**
     * Returns an object with a destroy method that, when called, calls the passed-in destructor.
     * This is intended to provide a unified interface for creating "remove" / "destroy" handlers for
     * event listeners, timers, etc.
     *
     * @param destructor A function that will be called when the handle's `destroy` method is invoked
     * @return The handle object
     */
    function createHandle(destructor) {
        return {
            destroy: function () {
                this.destroy = function () { };
                destructor.call(this);
            }
        };
    }
    exports.createHandle = createHandle;
    /**
     * Returns a single handle that can be used to destroy multiple handles simultaneously.
     *
     * @param handles An array of handles with `destroy` methods
     * @return The handle object
     */
    function createCompositeHandle() {
        var handles = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            handles[_i - 0] = arguments[_i];
        }
        return createHandle(function () {
            for (var _i = 0; _i < handles.length; _i++) {
                var handle = handles[_i];
                handle.destroy();
            }
        });
    }
    exports.createCompositeHandle = createCompositeHandle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sYW5nLnRzIl0sIm5hbWVzIjpbInNob3VsZERlZXBDb3B5T2JqZWN0IiwiY29weUFycmF5IiwiX21peGluIiwiY3JlYXRlIiwiZGVlcEFzc2lnbiIsImRlZXBNaXhpbiIsImR1cGxpY2F0ZSIsImlzSWRlbnRpY2FsIiwibGF0ZUJpbmQiLCJtaXhpbiIsInBhcnRpYWwiLCJjcmVhdGVIYW5kbGUiLCJjcmVhdGVDb21wb3NpdGVIYW5kbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUEsb0JBQWdCLE9BQU8sQ0FBQyxDQUFBO0lBR3hCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO0lBQ3BDLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0lBRXZEOzs7Ozs7Ozs7T0FTRztJQUNILDhCQUE4QixLQUFVO1FBQ3ZDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxpQkFBaUJBLENBQUNBO0lBQ3BFQSxDQUFDQTtJQUVELG1CQUFzQixLQUFVLEVBQUUsU0FBa0I7UUFDbkRDLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLFVBQVVBLElBQU9BO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQVEsU0FBUyxDQUFPLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBRUQsTUFBTSxDQUFDLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO2dCQUNqQyxJQUFJO2dCQUNKLE1BQU0sQ0FBQztvQkFDTixJQUFJLEVBQUUsSUFBSTtvQkFDVixTQUFTLEVBQUUsU0FBUztvQkFDcEIsT0FBTyxFQUFhLENBQUUs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T0FBTyxFQUFFLENBQUM7YUFDakI7UUFDRixDQUFDLENBQUNBLENBQUNBO0lBQ0pBLENBQUNBO0lBTmUsNkJBQXFCLHdCQU1wQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGhhcyBmcm9tICcuL2hhcyc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5jb25zdCBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbmNvbnN0IGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUeXBlIGd1YXJkIHRoYXQgZW5zdXJlcyB0aGF0IHRoZSB2YWx1ZSBjYW4gYmUgY29lcmNlZCB0byBPYmplY3RcbiAqIHRvIHdlZWQgb3V0IGhvc3Qgb2JqZWN0cyB0aGF0IGRvIG5vdCBkZXJpdmUgZnJvbSBPYmplY3QuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gY2hlY2sgaWYgd2Ugd2FudCB0byBkZWVwIGNvcHkgYW4gb2JqZWN0IG9yIG5vdC5cbiAqIE5vdGU6IEluIEVTNiBpdCBpcyBwb3NzaWJsZSB0byBtb2RpZnkgYW4gb2JqZWN0J3MgU3ltYm9sLnRvU3RyaW5nVGFnIHByb3BlcnR5LCB3aGljaCB3aWxsXG4gKiBjaGFuZ2UgdGhlIHZhbHVlIHJldHVybmVkIGJ5IGB0b1N0cmluZ2AuIFRoaXMgaXMgYSByYXJlIGVkZ2UgY2FzZSB0aGF0IGlzIGRpZmZpY3VsdCB0byBoYW5kbGUsXG4gKiBzbyBpdCBpcyBub3QgaGFuZGxlZCBoZXJlLlxuICogQHBhcmFtICB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm4gICAgICAgSWYgdGhlIHZhbHVlIGlzIGNvZXJjaWJsZSBpbnRvIGFuIE9iamVjdFxuICovXG5mdW5jdGlvbiBzaG91bGREZWVwQ29weU9iamVjdCh2YWx1ZTogYW55KTogdmFsdWUgaXMgT2JqZWN0IHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufVxuXG5mdW5jdGlvbiBjb3B5QXJyYXk8VD4oYXJyYXk6IFRbXSwgaW5oZXJpdGVkOiBib29sZWFuKTogVFtdIHtcblx0cmV0dXJuIGFycmF5Lm1hcChmdW5jdGlvbiAoaXRlbTogVCk6IFQge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG5cdFx0XHRyZXR1cm4gIDxhbnk+IGNvcHlBcnJheSg8YW55PiBpdGVtLCBpbmhlcml0ZWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAhc2hvdWxkRGVlcENvcHlPYmplY3QoaXRlbSkgP1xuXHRcdFx0aXRlbSA6XG5cdFx0XHRfbWl4aW4oe1xuXHRcdFx0XHRkZWVwOiB0cnVlLFxuXHRcdFx0XHRpbmhlcml0ZWQ6IGluaGVyaXRlZCxcblx0XHRcdFx0c291cmNlczogPEFycmF5PFQ+PiBbIGl0ZW0gXSxcblx0XHRcdFx0dGFyZ2V0OiA8VD4ge31cblx0XHRcdH0pO1xuXHR9KTtcbn1cblxuaW50ZXJmYWNlIE1peGluQXJnczxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4ge1xuXHRkZWVwOiBib29sZWFuO1xuXHRpbmhlcml0ZWQ6IGJvb2xlYW47XG5cdHNvdXJjZXM6IFVbXTtcblx0dGFyZ2V0OiBUO1xufVxuXG5mdW5jdGlvbiBfbWl4aW48VCBleHRlbmRzIHt9LCBVIGV4dGVuZHMge30+KGt3QXJnczogTWl4aW5BcmdzPFQsIFU+KTogVCZVIHtcblx0Y29uc3QgZGVlcCA9IGt3QXJncy5kZWVwO1xuXHRjb25zdCBpbmhlcml0ZWQgPSBrd0FyZ3MuaW5oZXJpdGVkO1xuXHRjb25zdCB0YXJnZXQgPSBrd0FyZ3MudGFyZ2V0O1xuXG5cdGZvciAobGV0IHNvdXJjZSBvZiBrd0FyZ3Muc291cmNlcykge1xuXHRcdGZvciAobGV0IGtleSBpbiBzb3VyY2UpIHtcblx0XHRcdGlmIChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcblx0XHRcdFx0bGV0IHZhbHVlOiBhbnkgPSAoPGFueT4gc291cmNlKVtrZXldO1xuXG5cdFx0XHRcdGlmIChkZWVwKSB7XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IGNvcHlBcnJheSh2YWx1ZSwgaW5oZXJpdGVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoc2hvdWxkRGVlcENvcHlPYmplY3QodmFsdWUpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IF9taXhpbih7XG5cdFx0XHRcdFx0XHRcdGRlZXA6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGluaGVyaXRlZDogaW5oZXJpdGVkLFxuXHRcdFx0XHRcdFx0XHRzb3VyY2VzOiA8VVtdPiBbIHZhbHVlIF0sXG5cdFx0XHRcdFx0XHRcdHRhcmdldDoge31cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdCg8YW55PiB0YXJnZXQpW2tleV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gPFQmVT4gdGFyZ2V0O1xufVxuXG5pbnRlcmZhY2UgT2JqZWN0QXNzaWduQ29uc3RydWN0b3IgZXh0ZW5kcyBPYmplY3RDb25zdHJ1Y3RvciB7XG5cdGFzc2lnbjxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4odGFyZ2V0OiBULCAuLi5zb3VyY2VzOiBVW10pOiBUJlU7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYWxsIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgb2Ygb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgdG8gdGhlIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCB0byByZWNlaXZlIHZhbHVlcyBmcm9tIHNvdXJjZSBvYmplY3RzXG4gKiBAcGFyYW0gc291cmNlcyBBbnkgbnVtYmVyIG9mIG9iamVjdHMgd2hvc2UgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgYXNzaWduID0gaGFzKCdvYmplY3QtYXNzaWduJykgP1xuXHQoPE9iamVjdEFzc2lnbkNvbnN0cnVjdG9yPiBPYmplY3QpLmFzc2lnbiA6XG5cdGZ1bmN0aW9uPFQgZXh0ZW5kcyB7fSwgVSBleHRlbmRzIHt9PiAodGFyZ2V0OiBULCAuLi5zb3VyY2VzOiBVW10pOiBUJlUge1xuXHRcdHJldHVybiBfbWl4aW4oe1xuXHRcdFx0ZGVlcDogZmFsc2UsXG5cdFx0XHRpbmhlcml0ZWQ6IGZhbHNlLFxuXHRcdFx0c291cmNlczogc291cmNlcyxcblx0XHRcdHRhcmdldDogdGFyZ2V0XG5cdFx0fSk7XG5cdH07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gcHJvdG90eXBlLCBhbmQgY29waWVzIGFsbCBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlXG4gKiBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgbmV3bHkgY3JlYXRlZCB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBwcm90b3R5cGUgVGhlIHByb3RvdHlwZSB0byBjcmVhdGUgYSBuZXcgb2JqZWN0IGZyb21cbiAqIEBwYXJhbSBtaXhpbnMgQW55IG51bWJlciBvZiBvYmplY3RzIHdob3NlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0XG4gKiBAcmV0dXJuIFRoZSBuZXcgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGU8VCBleHRlbmRzIHt9LCBVIGV4dGVuZHMge30+KHByb3RvdHlwZTogVCwgLi4ubWl4aW5zOiBVW10pOiBUJlUge1xuXHRpZiAoIW1peGlucy5sZW5ndGgpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcignbGFuZy5jcmVhdGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIG1peGluIG9iamVjdC4nKTtcblx0fVxuXG5cdGNvbnN0IGFyZ3MgPSBtaXhpbnMuc2xpY2UoKTtcblx0YXJncy51bnNoaWZ0KE9iamVjdC5jcmVhdGUocHJvdG90eXBlKSk7XG5cblx0cmV0dXJuIGFzc2lnbi5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byB0aGUgdGFyZ2V0IG9iamVjdCxcbiAqIHJlY3Vyc2l2ZWx5IGNvcHlpbmcgYWxsIG5lc3RlZCBvYmplY3RzIGFuZCBhcnJheXMgYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IHRvIHJlY2VpdmUgdmFsdWVzIGZyb20gc291cmNlIG9iamVjdHNcbiAqIEBwYXJhbSBzb3VyY2VzIEFueSBudW1iZXIgb2Ygb2JqZWN0cyB3aG9zZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIHdpbGwgYmUgY29waWVkIHRvIHRoZSB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIFRoZSBtb2RpZmllZCB0YXJnZXQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQXNzaWduPFQgZXh0ZW5kcyB7fSwgVSBleHRlbmRzIHt9Pih0YXJnZXQ6IFQsIC4uLnNvdXJjZXM6IFVbXSk6IFQmVSB7XG5cdHJldHVybiBfbWl4aW4oe1xuXHRcdGRlZXA6IHRydWUsXG5cdFx0aW5oZXJpdGVkOiBmYWxzZSxcblx0XHRzb3VyY2VzOiBzb3VyY2VzLFxuXHRcdHRhcmdldDogdGFyZ2V0XG5cdH0pO1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGFsbCBlbnVtZXJhYmxlIChvd24gb3IgaW5oZXJpdGVkKSBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIHRoZVxuICogdGFyZ2V0IG9iamVjdCwgcmVjdXJzaXZlbHkgY29weWluZyBhbGwgbmVzdGVkIG9iamVjdHMgYW5kIGFycmF5cyBhcyB3ZWxsLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gcmVjZWl2ZSB2YWx1ZXMgZnJvbSBzb3VyY2Ugb2JqZWN0c1xuICogQHBhcmFtIHNvdXJjZXMgQW55IG51bWJlciBvZiBvYmplY3RzIHdob3NlIGVudW1lcmFibGUgcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVlcE1peGluPFQgZXh0ZW5kcyB7fSwgVSBleHRlbmRzIHt9Pih0YXJnZXQ6IFQsIC4uLnNvdXJjZXM6IFVbXSk6IFQmVSB7XG5cdHJldHVybiBfbWl4aW4oe1xuXHRcdGRlZXA6IHRydWUsXG5cdFx0aW5oZXJpdGVkOiB0cnVlLFxuXHRcdHNvdXJjZXM6IHNvdXJjZXMsXG5cdFx0dGFyZ2V0OiB0YXJnZXRcblx0fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBvYmplY3QgdXNpbmcgdGhlIHByb3ZpZGVkIHNvdXJjZSdzIHByb3RvdHlwZSBhcyB0aGUgcHJvdG90eXBlIGZvciB0aGUgbmV3IG9iamVjdCwgYW5kIHRoZW5cbiAqIGRlZXAgY29waWVzIHRoZSBwcm92aWRlZCBzb3VyY2UncyB2YWx1ZXMgaW50byB0aGUgbmV3IHRhcmdldC5cbiAqXG4gKiBAcGFyYW0gc291cmNlIFRoZSBvYmplY3QgdG8gZHVwbGljYXRlXG4gKiBAcmV0dXJuIFRoZSBuZXcgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkdXBsaWNhdGU8VCBleHRlbmRzIHt9Pihzb3VyY2U6IFQpOiBUIHtcblx0Y29uc3QgdGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2Yoc291cmNlKSk7XG5cblx0cmV0dXJuIGRlZXBNaXhpbih0YXJnZXQsIHNvdXJjZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHR3byB2YWx1ZXMgYXJlIHRoZSBzYW1lIHZhbHVlLlxuICpcbiAqIEBwYXJhbSBhIEZpcnN0IHZhbHVlIHRvIGNvbXBhcmVcbiAqIEBwYXJhbSBiIFNlY29uZCB2YWx1ZSB0byBjb21wYXJlXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlcyBhcmUgdGhlIHNhbWU7IGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGljYWwoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIGEgPT09IGIgfHxcblx0XHQvKiBib3RoIHZhbHVlcyBhcmUgTmFOICovXG5cdFx0KGEgIT09IGEgJiYgYiAhPT0gYik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgYmluZHMgYSBtZXRob2QgdG8gdGhlIHNwZWNpZmllZCBvYmplY3QgYXQgcnVudGltZS4gVGhpcyBpcyBzaW1pbGFyIHRvXG4gKiBgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRgLCBidXQgaW5zdGVhZCBvZiBhIGZ1bmN0aW9uIGl0IHRha2VzIHRoZSBuYW1lIG9mIGEgbWV0aG9kIG9uIGFuIG9iamVjdC5cbiAqIEFzIGEgcmVzdWx0LCB0aGUgZnVuY3Rpb24gcmV0dXJuZWQgYnkgYGxhdGVCaW5kYCB3aWxsIGFsd2F5cyBjYWxsIHRoZSBmdW5jdGlvbiBjdXJyZW50bHkgYXNzaWduZWQgdG9cbiAqIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkgb24gdGhlIG9iamVjdCBhcyBvZiB0aGUgbW9tZW50IHRoZSBmdW5jdGlvbiBpdCByZXR1cm5zIGlzIGNhbGxlZC5cbiAqXG4gKiBAcGFyYW0gaW5zdGFuY2UgVGhlIGNvbnRleHQgb2JqZWN0XG4gKiBAcGFyYW0gbWV0aG9kIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgb24gdGhlIGNvbnRleHQgb2JqZWN0IHRvIGJpbmQgdG8gaXRzZWxmXG4gKiBAcGFyYW0gc3VwcGxpZWRBcmdzIEFuIG9wdGlvbmFsIGFycmF5IG9mIHZhbHVlcyB0byBwcmVwZW5kIHRvIHRoZSBgaW5zdGFuY2VbbWV0aG9kXWAgYXJndW1lbnRzIGxpc3RcbiAqIEByZXR1cm4gVGhlIGJvdW5kIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXRlQmluZChpbnN0YW5jZToge30sIG1ldGhvZDogc3RyaW5nLCAuLi5zdXBwbGllZEFyZ3M6IGFueVtdKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkge1xuXHRyZXR1cm4gc3VwcGxpZWRBcmdzLmxlbmd0aCA/XG5cdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgYXJnczogYW55W10gPSBhcmd1bWVudHMubGVuZ3RoID8gc3VwcGxpZWRBcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpIDogc3VwcGxpZWRBcmdzO1xuXG5cdFx0XHQvLyBUUzcwMTdcblx0XHRcdHJldHVybiAoPGFueT4gaW5zdGFuY2UpW21ldGhvZF0uYXBwbHkoaW5zdGFuY2UsIGFyZ3MpO1xuXHRcdH0gOlxuXHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIFRTNzAxN1xuXHRcdFx0cmV0dXJuICg8YW55PiBpbnN0YW5jZSlbbWV0aG9kXS5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKTtcblx0XHR9O1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGFsbCBlbnVtZXJhYmxlIChvd24gb3IgaW5oZXJpdGVkKSBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIHRoZVxuICogdGFyZ2V0IG9iamVjdC5cbiAqXG4gKiBAcmV0dXJuIFRoZSBtb2RpZmllZCB0YXJnZXQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaXhpbjxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4odGFyZ2V0OiBULCAuLi5zb3VyY2VzOiBVW10pOiBUJlUge1xuXHRyZXR1cm4gX21peGluKHtcblx0XHRkZWVwOiBmYWxzZSxcblx0XHRpbmhlcml0ZWQ6IHRydWUsXG5cdFx0c291cmNlczogc291cmNlcyxcblx0XHR0YXJnZXQ6IHRhcmdldFxuXHR9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gd2hpY2ggaW52b2tlcyB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzIHByZXBlbmRlZCB0byBpdHMgYXJndW1lbnQgbGlzdC5cbiAqIExpa2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kYCwgYnV0IGRvZXMgbm90IGFsdGVyIGV4ZWN1dGlvbiBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXRGdW5jdGlvbiBUaGUgZnVuY3Rpb24gdGhhdCBuZWVkcyB0byBiZSBib3VuZFxuICogQHBhcmFtIHN1cHBsaWVkQXJncyBBbiBvcHRpb25hbCBhcnJheSBvZiBhcmd1bWVudHMgdG8gcHJlcGVuZCB0byB0aGUgYHRhcmdldEZ1bmN0aW9uYCBhcmd1bWVudHMgbGlzdFxuICogQHJldHVybiBUaGUgYm91bmQgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpYWwodGFyZ2V0RnVuY3Rpb246ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCAuLi5zdXBwbGllZEFyZ3M6IGFueVtdKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkge1xuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGNvbnN0IGFyZ3M6IGFueVtdID0gYXJndW1lbnRzLmxlbmd0aCA/IHN1cHBsaWVkQXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSA6IHN1cHBsaWVkQXJncztcblxuXHRcdHJldHVybiB0YXJnZXRGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmdzKTtcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGEgZGVzdHJveSBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIGNhbGxzIHRoZSBwYXNzZWQtaW4gZGVzdHJ1Y3Rvci5cbiAqIFRoaXMgaXMgaW50ZW5kZWQgdG8gcHJvdmlkZSBhIHVuaWZpZWQgaW50ZXJmYWNlIGZvciBjcmVhdGluZyBcInJlbW92ZVwiIC8gXCJkZXN0cm95XCIgaGFuZGxlcnMgZm9yXG4gKiBldmVudCBsaXN0ZW5lcnMsIHRpbWVycywgZXRjLlxuICpcbiAqIEBwYXJhbSBkZXN0cnVjdG9yIEEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBoYW5kbGUncyBgZGVzdHJveWAgbWV0aG9kIGlzIGludm9rZWRcbiAqIEByZXR1cm4gVGhlIGhhbmRsZSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhhbmRsZShkZXN0cnVjdG9yOiAoKSA9PiB2b2lkKTogSGFuZGxlIHtcblx0cmV0dXJuIHtcblx0XHRkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7fTtcblx0XHRcdGRlc3RydWN0b3IuY2FsbCh0aGlzKTtcblx0XHR9XG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHNpbmdsZSBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBkZXN0cm95IG11bHRpcGxlIGhhbmRsZXMgc2ltdWx0YW5lb3VzbHkuXG4gKlxuICogQHBhcmFtIGhhbmRsZXMgQW4gYXJyYXkgb2YgaGFuZGxlcyB3aXRoIGBkZXN0cm95YCBtZXRob2RzXG4gKiBAcmV0dXJuIFRoZSBoYW5kbGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb3NpdGVIYW5kbGUoLi4uaGFuZGxlczogSGFuZGxlW10pOiBIYW5kbGUge1xuXHRyZXR1cm4gY3JlYXRlSGFuZGxlKGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKGxldCBoYW5kbGUgb2YgaGFuZGxlcykge1xuXHRcdFx0aGFuZGxlLmRlc3Ryb3koKTtcblx0XHR9XG5cdH0pO1xufVxuIl19