const Queryable = require('../querable');
const {SESSION_STATES} = require('../constants');

class Session {

    static createSessionFactory(driver) {
        return {
            create: () => {
                return driver.session();
            },
            destroy: (res) => {
                return res.close();
            }
        };
    }

    constructor(conn, db) {
        this._db = db;
        this._conn = conn;
        this._state = SESSION_STATES.CONNECTED;
    }

    run(query) {
        return Queryable.run(this._conn, query);
    }

    model(name, schema) {
        return this._db.model(name, schema);
    }

    getConnection() {
        return this._conn;
    }

    release() {
        this._state = SESSION_STATES.DISCONNECTING;
        return this._db.releaseSession(this)
            .then(() => {
                this._state = SESSION_STATES.DISCONNECTED;
            })
            .catch(e => {
                this._state = SESSION_STATES.ERROR;
                throw e;
            });
    }

    close() {
        this._state = SESSION_STATES.DISCONNECTING;
        return this._db.closeSession(this._conn)
            .then(() => {
                this._state = SESSION_STATES.CLOSED;
            })
            .catch(e => {
                this._state = SESSION_STATES.ERROR;
                throw e;
            });
    }
}

module.exports = Session;