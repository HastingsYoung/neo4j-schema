const driver = require('./driver');
const genericPool = require('generic-pool');
const Session = require('./session');
const Schema = require('./schema');
const Defs = require('./constants');
const Errors = require('./errors');
const _ = require('lodash');

class DB {

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
            conn: {
                uri: 'bolt://localhost',
                username: 'neo4j-dev',
                password: 'neo4j-dev'
            }
        };
    }

    connect(...configs) {

        this._driver = driver(this._options.conn, ...configs);

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

    async closeSession(session) {
        await this._pool.destroy(session);
    }

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

module.exports = DB;