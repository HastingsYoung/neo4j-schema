const Query = require('../query');
const Errors = require('../errors');
const _ = require('lodash');

class Queryable {

    static newQuery(...args) {
        return new Query(...args);
    }

    static async run(conn, query) {

        if (!(_.isString(query)) || query.length < 1) {
            throw Errors.ERR_INVALID_QUERY;
        }

        const {records} = await conn.run(query);
        return records;
    }
}

module.exports = Queryable;