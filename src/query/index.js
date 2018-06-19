const _ = require('lodash');
const util = require('util');
const Errors = require('../errors');
const {KEYWORDS} = require('./syntax');
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
     * @param {Pattern | String} pattern
     * @example match('patternStr' | {label: 'str', variable: 'n'});
     * @returns {Query}
     */
    match(pattern) {
        this._stack.push(`${KEYWORDS.MATCH} (${new Pattern(pattern).toString()})`);
        return this;
    }

    /**
     * Basic relation clause, also known as `--`.
     * @param {Pattern | String} pattern
     * @returns {Query}
     */
    hasRelation(pattern) {
        this._stack.push(`-${pattern ? '[' + new Pattern(pattern).toString() + ']': ''}-`);
        return this;
    }

    /**
     * Directed relation clause, also known as `-->`.
     * @param {Pattern | String} pattern
     * @returns {Query}
     */
    hasDirectedRelation(pattern) {
        this._stack.push(`-${pattern ? '[' + new Pattern(pattern).toString() + ']': ''}->`);
        return this;
    }

    /**
     * Reverse directed relation clause, also known as `<--`.
     * @param {Pattern | String} pattern
     * @returns {Query}
     */
    hasReverseDirectedRelation(pattern) {
        this._stack.push(`<-${pattern ? '[' + new Pattern(pattern).toString() + ']': ''}-`);
        return this;
    }

    /**
     * The node such query should point to.
     * @param {Pattern | String} pattern
     * @returns {Query}
     */
    toNode(pattern) {
        this._stack.push(`(${new Pattern(pattern).toString()})`);
        return this;
    }

    /**
     * Where clause.
     * @param filters
     * @param options
     * @returns {Query}
     */
    where(filters, options) {
        this._stack.push(`${KEYWORDS.WHERE} ${Object.keys(filters).map(f => translateFilterToQuery(f.toString(), filters[f], options)).join(` ${KEYWORDS.AND} `)}`);
        return this;
    }

    orderBy(args) {
        return this;
    }

    skip(args) {
        return this;
    }

    limit(args) {
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
        this._stack.push(`${KEYWORDS.RETURN} ${fields.join(',')};`);
        return this;
    }

    count() {
        return this;
    }

    /**
     * Create clause.
     * @param {Object} nodeObj The object instance to create.
     * @returns {Query}
     */
    create(nodeObj) {
        this._stack.push(`${KEYWORDS.CREATE} (${new Pattern({
            variable: 'n',
            props: this._model.validate(nodeObj)
        }).toString()})`);
        return this;
    }

    /**
     * Return a string of constructed query.
     * @returns {String}
     */
    construct() {
        return this._stack.join(' ');
    }

    /**
     * Return a promise, the first argument of which includes the results resolved from the query.
     * @returns {Promise}
     */
    exec() {
        return this._callee.run(this.construct());
    }
}

module.exports = Query;