const neo4j = require('neo4j-driver').v1;

const driver = ({uri, username, password}, ...configs) => {
    return neo4j.driver(uri, neo4j.auth.basic(username, password), Object.assign({}, {disableLosslessIntegers: true}, ...configs));
};

module.exports = driver;