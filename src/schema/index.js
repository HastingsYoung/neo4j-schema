const Query = require('../query');
const Joi = require('joi');
const _ = require('lodash');
const {SCHEMA_TYPES, SCHEMA_PROP_DEFS} = require('../constants');

class Schema {

    constructor(obj) {
        this._methods = {};
        this._schema = Object.assign({}, Schema.transpile(obj));
    }

    /**
     * Transpile lean object to Joi schema.
     * @param {Object} obj
     * @example
     * {
     *      id: {type: String, required: true},
     *      group: {type: String, default: 'User', enum: ['Admin', 'User']},
     *      age: {type: Number},
     *      createdAt: {type: Date, default: Date.now}
     * }
     * @returns {JoiSchema}
     */
    static transpile(obj) {
        const keys = Object.keys(obj);
        const schema = {};
        keys.forEach(k => {
            // as String
            if (_.isEqual(obj[k], SCHEMA_TYPES.STRING)) {
                schema[k] = Joi.string();
                return;
            }
            // as Number
            if (_.isEqual(obj[k], SCHEMA_TYPES.NUMBER)) {
                schema[k] = Joi.number();
                return;
            }
            // as Boolean
            if (_.isEqual(obj[k], SCHEMA_TYPES.BOOLEAN)) {
                schema[k] = Joi.boolean();
                return;
            }
            // as Date string
            if (_.isEqual(obj[k], SCHEMA_TYPES.DATE)) {
                schema[k] = Joi.date();
                return;
            }
            // as array of String
            if (_.isEqual(obj[k], SCHEMA_TYPES.ARRAY_OF_STR)) {
                schema[k] = Joi.array().items(Joi.string());
                return;
            }
            // as array of Number
            if (_.isEqual(obj[k], SCHEMA_TYPES.ARRAY_OF_NUM)) {
                schema[k] = Joi.array().items(Joi.number());
                return;
            }
            // as array of Boolean
            if (_.isEqual(obj[k], SCHEMA_TYPES.ARRAY_OF_BOOL)) {
                schema[k] = Joi.array().items(Joi.boolean());
                return;
            }
            // as array of Date
            if (_.isEqual(obj[k], SCHEMA_TYPES.ARRAY_OF_DATE)) {
                schema[k] = Joi.array().items(Joi.date());
                return;
            }
            // as array of Object
            if (_.isArray(obj[k]) && _.isObjectLike(obj[k][0])) {
                const [itemType] = obj[k];
                // invalid prop
                if (!itemType.hasOwnProperty(SCHEMA_PROP_DEFS.TYPE)) {
                    return;
                }

                let s = Schema.transpile({k: itemType[SCHEMA_PROP_DEFS.TYPE]}).k;

                if (itemType[SCHEMA_PROP_DEFS.REQUIRED]) {
                    s = s.required();
                }

                if (itemType.hasOwnProperty(SCHEMA_PROP_DEFS.DEFAULT)) {
                    const def = itemType[SCHEMA_PROP_DEFS.DEFAULT];
                    if (_.isFunction(def)) {
                        def.description = k.toString();
                    }
                    s = s.default(def);
                }

                if (obj[k].hasOwnProperty(SCHEMA_PROP_DEFS.ENUM)) {
                    s = s.allow(itemType[SCHEMA_PROP_DEFS.ENUM]);
                }

                schema[k] = Joi.array().items(s);
            }
            // as Object
            if (_.isObjectLike(obj[k])) {
                // invalid prop
                if (!obj[k].hasOwnProperty(SCHEMA_PROP_DEFS.TYPE)) {
                    return;
                }

                let s = Schema.transpile({k: obj[k][SCHEMA_PROP_DEFS.TYPE]}).k;

                if (obj[k].hasOwnProperty(SCHEMA_PROP_DEFS.DEFAULT)) {
                    const def = obj[k][SCHEMA_PROP_DEFS.DEFAULT];
                    if (_.isFunction(def)) {
                        def.description = k.toString();
                    }
                    s = s.default(def);
                }

                if (obj[k].hasOwnProperty(SCHEMA_PROP_DEFS.ENUM)) {
                    s = s.allow(obj[k][SCHEMA_PROP_DEFS.ENUM]);
                }

                if (obj[k][SCHEMA_PROP_DEFS.REQUIRED]) {
                    s = s.required();
                }
                schema[k] = s;
            }
        });
        return schema;
    }

    /**
     * Return a model function.
     * @param {DB} db The DB instance such model should inherit from.
     * @returns {Model} The compiled model function.
     */
    model(db) {
        return this.compile(db, this._methods);
    }

    setDefaultMethods(db, model) {

        Object.defineProperties(model, {
            match: {
                value: args => new Query(db, model).match(args),
                writable: false,
                enumerable: true
            },
            create: {
                value: args => new Query(db, model).create(args),
                writable: false,
                enumerable: true
            },
            validate: {
                value: obj => {
                    const result = Joi.validate(obj, this._schema);
                    if (result.error)
                        throw result.error;
                    return result.value;
                },
                writable: false,
                enumerable: true
            }
        });
        return model;
    }

    /**
     * Return a model function.
     * @param db
     * @param methods
     * @returns {Model}
     */
    compile(db, methods) {

        const model = (function (self, db) {
            return function () {
                this._db = db;
                this._schema = self;
            };
        }(this, db));

        model.prototype = Object.create(Schema.prototype);

        this.setDefaultMethods(db, model);

        if (_.isArray(methods))
            Object.defineProperties(model, methods.map(m => {
                const method = {};
                method[m.name] = m;
                return m;
            }));

        return model;
    }
}

module.exports = Schema;