const {expect} = require('chai');
const Neo4JDB = require('../src/index');

describe('DB Test', function () {

    describe('DB Connection', function () {

        it('should be able to connect to NEO4J Database', function (done) {

            const db = new Neo4JDB({
                username: 'neo4j-dev',
                password: 'neo4j-dev'
            }).connect();

            db.run(`RETURN 1;`)
                .then(docs => {
                    expect(docs.records).to.be.an('array');
                    done();
                }).catch(e => {
                    console.error(e);
                });
        });

    });

});