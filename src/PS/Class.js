/**
 * A base function that creates Classes. It accepts two parameters. The first
 * parameter should be an object defining the prototype of the class that we
 * want to create. The second parameter should be reference to another Class
 * that we want to extend (Sub Class). If the class has an init property that
 * is function that property is taken as constructor of the class. If not an
 * empty function is used instead.
 *
 * @example
 * PS.Example.Animal = PS.Class({
 *      name: '',
 *      init: function(name) {
 *          this.name = name;
 *      },
 *      getName: function() {
 *          return this.name;
 *      }
 * });
 * var UnkingdomedAnimal = new PS.Example.Animal('Ameba');
 * @example
 * PS.Example.Cat = PS.Class({
 *      sounds: 'meow',
 *      hasClaws: true,
 *      init: function(name) {
 *          PS.Example.Animal.apply(this, [name]);
 *      }
 * }, PS.Example.Animal);
 * var Tom = new PS.Example.Cat('Tom');
 * @example
 * PS.Example.Dog = PS.Example.Animal.extend({
 *      sounds: 'woof',
 *      hasClaws: true,
 *      owner: null,
 *      init: function(owner, name) {
 *          this.owner = owner;
 *          PS.Example.Animal.apply(this, [name]);
 *      }
 * });
 * var Bob = new PS.Example.Dog('John Doe', 'Bob');
 *
 * @param {Object} arg1 - Prototype boject
 * @param {PS.Class} [arg2] - Class
 * @returns {PS.Class}
 */
PS.Class = function(prototype, extending) {

    var constructor;
    if (prototype.init) {
        constructor = prototype.init;
    } else if (extending && extending.prototype.init) {
        var parentConstructor = extending.prototype.init;
        constructor = function() { parentConstructor.apply(this, arguments); };
    } else {
        constructor = function() {};
    }

    if (extending) {
        constructor.prototype = Object.create(extending.prototype);
        Object.merge(constructor.prototype, prototype);
    } else {
        constructor.prototype = prototype;
    }

    constructor.extend = PS.Class.$$extend;
    constructor.static = PS.Class.$$static;
    constructor.constructor = constructor;

    return constructor;

};

PS.Class.$$extend = function(newPrototype) {
    return PS.Class(newPrototype, this);
};

PS.Class.$$static = function(staticPrototype) {
    Object.merge(this, staticPrototype);
};

/**
 *
 * @namespace Object
 */
if (typeof Object.create != 'function') {
  /**
    * Polyfill that adds Object.create functionality to browsers
    * that dont have Object.create create functionality. It basically creates new
    * instance of the prototype without calling it's constructor.
    *
    * This polyfill is borrowed from {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill }
    *
    * @function
    * @name Create
    * @memberof Object
    * @param {Object} prototype - The prototype from which we want to create new object
    * @returns {Object} the new instance of the object
    */
    Object.create = (function() {
        var Obj = function() {};
        return function (prototype) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (typeof prototype != 'object') {
                throw TypeError('Argument must be an object');
            }
            Obj.prototype = prototype;
            var result = new Obj();
            Obj.prototype = null;
            return result;
        };
    })();
}

/**
 *
 * @namespace Object
 */
if (typeof Object.merge != 'function') {
    Object.merge = function(destination, source) {
        for(var x in source) {
            destination[x] = source[x];
        }
    };
}