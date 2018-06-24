const _ = require('lodash');
const util = require('util');
const Errors = require('../errors');
const {KEYWORDS, SORTING_KEYS} = require('./syntax');
const {translateFilterToQuery} = require('./filters');

const REGEXP_PATTERN_STR = /^(\w+)?(?::?)(\w+)?(?:\s*)({.*})?/i;

const genAlphabet = (n = 26) => {
    const alphabet = [];
    let i = 0;
    while (i < n) {
        alphabet.push('_x' + i);
        i++;
    }
    return alphabet;
};

class Pattern {

    constructor(args) {

        if (_.isString(args)) {
            if (!REGEXP_PATTERN_STR.test(args))
                throw new Error(Errors.ERR_INVALID_PATTERN_STR);
            this.args = Object.assign({}, Pattern.decode(args));
            return;
        }

        this.args = Object.assign({}, args);
    }

    static decode(str) {
        const match = str.match(REGEXP_PATTERN_STR);

        if (match.length < 3)
            throw new Error(Errors.ERR_INVALID_PATTERN_STR);

        const pattern = {};

        if (match[1]) {
            pattern.variable = match[1];
        }

        if (match[2]) {
            pattern.label = match[2];
        }

        if (match[3]) {
            pattern.props = match[3];
        }

        return pattern;
    }

    get variable() {
        return this.args.variable;
    }

    get label() {
        return this.args.label;
    }

    get props() {
        return this.args.props;
    }

    toLabelString() {
        const pattern = this.args,
            alphabet = genAlphabet(1);
        return `${pattern.variable || alphabet.pop()}${pattern.hasOwnProperty('label') ? ':' + pattern.label : ''}`;
    }

    toMapString() {
        const pattern = this.args,
            alphabet = genAlphabet(1);
        return `${pattern.variable || alphabet.pop()}${pattern.props ? ' ' + util.inspect(pattern.props) : ''}`;
    }

    toString() {
        const pattern = this.args,
            alphabet = genAlphabet(1);

        return `${pattern.variable || alphabet.pop()}${pattern.hasOwnProperty('label') ? ':' + pattern.label : ''}${pattern.props ? ' ' + util.inspect(pattern.props) : ''}`;
    }
}

class Query {

    static get DefaultOptions() {
        return {};
    }

    static isQuery(q) {
        return q instanceof Query;
    }

    /**
     * The Query constructor used for building queries. This could be instantiated by calling Model behavioural functions such as `Model.match()`.
     * @param {DB | Session} callee The callee to run such query when it's been constructed.
     * @param {Model} model The model of which such query should be constrained to.
     * @param {Object} opts
     */
    constructor(callee, model, opts) {
        this._callee = callee;
        this._model = model;
        this._options = Object.assign({}, Query.DefaultOptions, opts);
        this._stack = [];
    }

    /**
     * Match clause.
     * @param {Object<Pattern> | String} pattern
     * @example match('patternStr' | {label: 'str', variable: 'n'});
     * @returns {Query}
     */
    match(pattern) {
        this._stack.push(`${KEYWORDS.MATCH} (${new Pattern(pattern).toString()})`);
        return this;
    }

    /**
     * Basic relation clause, also known as `--`.
     * @param {Object<Pattern> | String} pattern
     * @returns {Query}
     */
    hasRelation(pattern) {
        this._stack.push(`-${pattern ? '[' + new Pattern(pattern).toString() + ']' : ''}-`);
        return this;
    }

    /**
     * Directed relation clause, also known as `-->`.
     * @param {Object<Pattern> | String} pattern
     * @returns {Query}
     */
    hasDirectedRelation(pattern) {
        this._stack.push(`-${pattern ? '[' + new Pattern(pattern).toString() + ']' : ''}->`);
        return this;
    }

    /**
     * Reverse directed relation clause, also known as `<--`.
     * @param {Object<Pattern> | String} pattern
     * @returns {Query}
     */
    hasReverseDirectedRelation(pattern) {
        this._stack.push(`<-${pattern ? '[' + new Pattern(pattern).toString() + ']' : ''}-`);
        return this;
    }

    /**
     * The node such query should point to.
     * @param {Object<Pattern> | String} pattern
     * @returns {Query}
     */
    toNode(pattern) {
        this._stack.push(`(${new Pattern(pattern).toString()})`);
        return this;
    }

    /**
     * Where clause.
     * @param {Object<Filters>} filters A filters map object that bears exactly the same APIs as in MongoDB.
     * @param options
     * @example
     * .where({
     *      user: {
     *           name: {
     *              $in: ['Tom', 'Jack', 'House']
     *           },
     *           age: {
     *              $gte: 20,
     *              $lte: 40
     *           }
     *     }
     * })
     * @returns {Query}
     */
    where(filters, options) {
        this._stack.push(`${KEYWORDS.WHERE} ${Object.keys(filters).map(f => translateFilterToQuery(f.toString(), filters[f], options)).join(` ${KEYWORDS.AND} `)}`);
        return this;
    }

    /**
     * Order By clause.
     * @param {Object} params Sort the matched documents by properties.
     * @example
     * .orderBy({
     *      name: 1     // sort by field "name" in alphanumeric order
     *      age: -1     // and then sort by field "age" in descendant order.
     * })
     * @returns {Query}
     */
    orderBy(params) {
        this._stack.push(`${KEYWORDS.ORDER_BY} ${Object.keys(params)
            .map(k => `${k}${params[k] < 0 || params[k].toUpperCase() === SORTING_KEYS.DESC ? (' ' + SORTING_KEYS.DESC) : ''}`)
            .join(', ')}`);
        return this;
    }

    /**
     * Skip clause.
     * @param {Number} num
     * @returns {Query}
     */
    skip(num) {
        this._stack.push(`${KEYWORDS.SKIP} ${num}`);
        return this;
    }

    /**
     * Limit clause.
     * @param {Number} num
     * @returns {Query}
     */
    limit(num) {
        this._stack.push(`${KEYWORDS.LIMIT} ${num}`);
        return this;
    }

    /**
     * Delete clause.
     * @param {Array<String>} vars Variable names of nodes/relationships to delete from database.
     * @param {Object} opts
     * @param {Boolean} opts.isDetach Decide if the matched instances should also remove all existing relationships during their deletion.
     * @returns {Query}
     */
    delete(vars, opts) {
        this._stack.push(`${opts.isDetach ? KEYWORDS.DETACH + ' ' : ''}${KEYWORDS.DELETE} ${vars.join(', ')}`);
        return this;
    }

    /**
     * Detach Delete clause. This method is equivalent to delete(vars, {isDetach: true}).
     * @param {Array<String>} vars Variable names of nodes/relationships to delete from database.
     * @returns {Query}
     */
    detachDelete(vars) {
        return this.delete(vars, {isDetach: true});
    }

    /**
     * Remove clause.
     * @param {Object<Pattern> | String} pattern
     * @returns {Query}
     */
    remove(pattern) {
        this._stack.push(`${KEYWORDS.REMOVE} ${new Pattern(pattern).toLabelString()}`);
        return this;
    }

    /**
     * Remove property of matched instance.
     * @param {String} variable Variable name.
     * @param {String} property Property name.
     * @returns {Query}
     */
    removeProperty(variable, property) {
        this._stack.push(`${KEYWORDS.REMOVE} ${variable}.${property}`);
        return this;
    }

    /**
     * Return clause.
     * @param {Array<String>} fields The fields to return in a query.
     * @returns {Query}
     */
    return(fields) {
        if (!(_.isArray(fields))) {
            throw new Error(Errors.ERR_INVALID_RETURN_FIELDS);
        }
        this._stack.push(`${KEYWORDS.RETURN} ${fields.join(',')}`);
        return this;
    }

    /**
     * Count clause.
     * @returns {Query}
     */
    count() {
        this._stack.push(`${KEYWORDS.RETURN} count(*)`);
        return this;
    }

    /**
     * Union clause.
     * @returns {Query}
     */
    union() {
        this._stack.push(` ${KEYWORDS.UNION} `);
        return this;
    }

    /**
     * Create clause.
     * @param {Object<Pattern> | String} pattern The pattern specifying which instance to create.
     * @returns {Query}
     */
    create(pattern) {
        this._stack.push(`${KEYWORDS.CREATE} (${new Pattern(_.isString(pattern) ? pattern : Object.assign({}, pattern, {
            props: this._model.validate(pattern.props)
        })).toString()})`);
        return this;
    }

    /**
     * Merge clause.
     * @param {Object<Pattern> | String} pattern The pattern specifying which instance to merge (update or create).
     * @returns {Query}
     */
    merge(pattern) {
        this._stack.push(`${KEYWORDS.MERGE} (${new Pattern(_.isString(pattern) ? pattern : Object.assign({}, pattern, {
            props: this._model.validate(pattern.props)
        })).toString()})`);
        return this;
    }

    /**
     * Set clause.
     * @param {Object<Pattern> | String} pattern The pattern specifying which instance to update.
     * @param {Boolean} upSert Decide if the properties of node matched should be created if doesn't exist.
     * @returns {Query}
     */
    set(pattern, upSert = true) {
        const p = new Pattern(pattern);
        const final = [];

        this._model.validate(p.props);

        if (p.props) {
            final.push(`${p.variable} ${upSert ? '+=' : '='} ${util.inspect(p.props)}`);
        }

        if (p.label) {
            final.push(`${p.toLabelString()}`);
        }

        this._stack.push(`${KEYWORDS.SET} ${final.join(', ')}`);
        return this;
    }

    /**
     * Return a string of constructed query.
     * @returns {String}
     */
    construct() {
        return this._stack.join(' ') + ';';
    }

    /**
     * Return a promise, the first argument of which includes the results resolved from the query.
     * @returns {Promise<Array<Node>>}
     */
    async exec() {
        const result = await this._callee.run(this.construct());
        return result.records.map(rec => rec._fields);
    }
}

module.exports = exports = Query;