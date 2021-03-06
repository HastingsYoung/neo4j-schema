const driver = require('./driver');
const genericPool = require('generic-pool');
const Session = require('./session');
const Schema = require('./schema');
const Query = require('./query');
const Pattern = require('./query/pattern');
const Defs = require('./constants');
const Errors = require('./errors');
const _ = require('lodash');

class DB {

    /**
     * Database constructor.
     * @param {Object} options DB options.
     * @param {Object} options.conn Connection options (uri: `<String>`, username: `<String>`, password: `<String>`).
     * @param {Integer} options.maxSessionCount Maximum in-parallel sessions running inside the DB instance.
     * @param {Integer} options.maxWaitingCount Maximum requests waiting in queue to acquire session.
     * @example
     * const db = new Neo4JDB({conn: {uri: 'bolt://localhost:7474', username: 'neo4j', password: 'neo4j'}}).connect();
     * @returns {DB}
     */
    constructor(options) {
        this._options = Object.assign({}, DB.DefaultOptions, options);
        this._pool = null;
        this._driver = null;
        this._schemas = {};
    }

    static Schema(args) {
        return new Schema(args);
    }

    static get DefaultOptions() {
        return {
            maxSessionCount: Defs.DEFAULT_DB_OPTIONS.MAX_SESSION_COUNT,
            maxWaitingCount: Defs.DEFAULT_DB_OPTIONS.MAX_WAITING_COUNT,
            uri: 'bolt://localhost',
            username: 'neo4j',
            password: 'neo4j'
        };
    }

    /**
     * Connect to database.
     * @param {...Object} configs
     * @returns {DB}
     */
    connect(...configs) {
        const {uri, username, password} = this._options;
        this._driver = driver({uri, username, password}, ...configs);

        const {
            maxSessionCount,
            maxWaitingCount
        } = this._options;

        this._pool = genericPool.createPool(Session.createSessionFactory(this._driver), {
            max: maxSessionCount,
            maxWaitingClients: maxWaitingCount,
        });
        return this;
    }

    async run(query) {
        return (await this.newSession()).run(query);
    }

    /**
     * Create a new session and push it into the session pool.
     * @returns {Promise<Session>}
     */
    async newSession() {

        if (this.isAlive()) {
            return new Session(await this._pool.acquire(), this);
        } else if (this.hasConnection()) {
            this.connect(this._options.conn);
            return new Session(await this._pool.acquire(), this);
        }

        throw new Error(Errors.DB_NOT_ALIVE);
    }

    async releaseSession(session) {
        await this._pool.release(session.getConnection());
    }

    async closeSession(session) {
        await this._pool.destroy(session);
    }

    /**
     * Defines a model in database.
     * @param {String} name Name of model as marked in DB.
     * @param {Schema} schema The data schema such model should be compliant with.
     * @example
     * const Neo4j = require('neo4j-schema');
     * let person = Neo4j.model(
     *      'person',
     *      Neo4j.Schema({
     *          name: String,
     *          age: Number,
     *          group: [String]
     *      })
     * );
     * @returns {Model}
     */
    model(name, schema) {
        if (!(schema instanceof Schema)) {
            throw new Error(Errors.ERR_INVALID_SCHEMA);
        }
        if (!(_.isString(name))) {
            throw new Error(Errors.ERR_INVALID_MODEL_NAME);
        }
        this._schemas[name] = schema;
        return schema.model(this);
    }

    isAlive() {
        return !!this._driver && !!this._pool;
    }

    hasConnection() {
        return /^(bolt:\/\/.*)|(http:\/\/\w+)/gi.test(this._options.conn.uri);
    }

    close() {
        this._driver.close();
        this._driver = null;
        this._pool = null;
        this._schemas = null;
    }
}

exports = module.exports = DB;

exports.Session = Session;
exports.Query = Query;
exports.Pattern = Pattern;
