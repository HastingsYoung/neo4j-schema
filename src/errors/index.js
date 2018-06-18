const DB_NOT_ALIVE = 'DB connection is not alive: please reconnect to continue.';
const ERR_INVALID_SCHEMA = 'Schema invalid: please pass in a schema instance to continue.';
const ERR_INVALID_MODEL_NAME = 'Model name invalid: please pass in a string as model name.';
const ERR_INVALID_QUERY = 'Query invalid: please pass in an instance of Query to continue.';
const ERR_EMPTY_QUERY = 'Query invalid: Query to be executed must not be empty.';
const ERR_INVALID_PATTERN_STR = 'Pattern invalid: pattern must accept a valid Cypher pattern string.';
const ERR_INVALID_RETURN_FIELDS = 'Pattern invalid: Return fields must be an array of string specifying desired fields to return from a query.';
const ERR_INVALID_FILTERS = 'Pattern invalid: to translate a query the filter passed in must be compliant with Filter interface.';

module.exports = {
    DB_NOT_ALIVE,
    ERR_INVALID_SCHEMA,
    ERR_INVALID_MODEL_NAME,
    ERR_INVALID_QUERY,
    ERR_EMPTY_QUERY,
    ERR_INVALID_PATTERN_STR,
    ERR_INVALID_RETURN_FIELDS,
    ERR_INVALID_FILTERS
};