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

    close() {
        return this._db.closeSession(this);
    }
}

module.exports = Session;