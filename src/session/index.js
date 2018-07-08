const Queryable = require('../querable');

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
        return this._db.releaseSession(this);
    }

    close() {
        return this._db.closeSession(this._conn);
    }
}

module.exports = Session;