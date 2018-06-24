const _ = require('lodash');
const ERRORS = require('../errors');
const {KEYWORDS} = require('./syntax');

const translateFilterToQuery = (sub, fts = {}) => {

    const query = [];

    if (!(_.isObjectLike(fts))) {
        throw new Error(ERRORS.ERR_INVALID_FILTERS);
    }

    Object.keys(fts).forEach(k => {
        const target = fts[k];
        switch (typeof target) {
        case 'string':
            query.push(`${sub}.${k} = '${target}'`);
            break;
        case 'number':
            query.push(`${sub}.${k} = ${target}`);
            break;
        case 'object':
            if (_.isArray(target)) {
                query.push(`${sub}.${k} ${KEYWORDS.IN} [${target.map(tv => _.isString(tv) ? `"${tv}"`: tv).join(',')}]`);
            } else {
                Object.keys(target).forEach(tk => {
                    switch (tk) {
                    case '$gt':
                        query.push(`${sub}.${k} > ${target[tk]}`);
                        break;
                    case '$lt':
                        query.push(`${sub}.${k} < ${target[tk]}`);
                        break;
                    case '$lte':
                        query.push(`${sub}.${k} <= ${target[tk]}`);
                        break;
                    case '$gte':
                        query.push(`${sub}.${k} >= ${target[tk]}`);
                        break;
                    case '$eq':
                        query.push(`${sub}.${k} <= ${target[tk]}`);
                        break;
                    case '$ne':
                        query.push(`${sub}.${k} <> ${target[tk]}`);
                        break;
                    case '$in':
                        query.push(`${sub}.${k} ${KEYWORDS.IN} [${target[tk].map(tv => _.isString(tv) ? `"${tv}"`: tv).join(',')}]`);
                        break;
                    case '$nin':
                        query.push(`${KEYWORDS.NOT} ${sub}.${k} ${KEYWORDS.IN} [${target[tk].map(tv => _.isString(tv) ? `"${tv}"`: tv).join(',')}]`);
                        break;
                    default:
                    }
                });
            }
            break;
        default:
        }
    });

    return query.join(` ${KEYWORDS.AND} `);
};

module.exports = {
    translateFilterToQuery
};