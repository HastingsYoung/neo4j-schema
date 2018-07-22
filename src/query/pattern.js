const _ = require('lodash');
const util = require('util');
const {genAlphabet} = require('./query_utils');
const Errors = require('../errors');
const REGEXP_PATTERN_STR = /^(\w+)?((?:(?::?)\w+)*)(?:\s*)({.*})?/i;

/**
 * The pattern used to match nodes in the graph.
 */
class Pattern {

    /**
     * @param {Object | String} args
     * @param {String} args.variable Variable name.
     * @param {String | Array<String>} args.label Label(s) of node.
     * @param {Object} args.props Node properties map.
     * @param {Function<String>} alphabet Generate alphabet series.
     */
    constructor(args, alphabet) {

        this.args = Object.assign({}, Pattern.decode(args));
        this._alphabet = _.isFunction(alphabet) ? new alphabet() : new (genAlphabet(1))();
    }

    get alphabet() {
        return this._alphabet;
    }

    set alphabet(vars) {
        this._alphabet = vars;
    }

    static decode(args) {

        const pattern = {};

        if (_.isString(args)) {
            if (!REGEXP_PATTERN_STR.test(args))
                throw new Error(Errors.ERR_INVALID_PATTERN_STR);

            const match = args.match(REGEXP_PATTERN_STR);

            if (match.length < 3)
                throw new Error(Errors.ERR_INVALID_PATTERN_STR);

            if (match[1]) {
                pattern.variable = match[1];
            }

            if (match[2]) {
                pattern.label = match[2].split(':').filter(label => !!label);
            }

            if (match[3]) {
                pattern.props = JSON.parse(match[3]);
            }

            return pattern;
        }

        if (args.variable) {
            pattern.variable = args.variable;
        }

        if (args.label) {
            pattern.label = _.isArray(args.label) ? args.label : args.label.split(':').filter(label => !!label);
        }

        if (args.props) {
            pattern.props = args.props;
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
        const pattern = this.args;
        return `${pattern.variable || this._alphabet.pop()}${pattern.hasOwnProperty('label') ? ':' + pattern.label.join(':') : ''}`;
    }

    toMapString() {
        const pattern = this.args;
        return `${pattern.variable || this._alphabet.pop()}${pattern.props ? ' ' + util.inspect(pattern.props) : ''}`;
    }

    toString() {
        const pattern = this.args;
        return `${pattern.variable || this._alphabet.pop()}${pattern.hasOwnProperty('label') ? ':' + pattern.label.join(':') : ''}${pattern.props ? ' ' + util.inspect(pattern.props) : ''}`;
    }

    toStringInParenthesis() {
        return `(${this.toString()})`;
    }
}

module.exports = Pattern;