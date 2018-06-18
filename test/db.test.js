const {expect} = require('chai');
const Neo4JDB = require('../src/index');

describe('DB Test', function () {

    describe('DB Connection', function () {

        it('should be able to connect to NEO4J Database', function (done) {

            const db = new Neo4JDB().connect();
            const FooSchema = Neo4JDB.Schema();
            const FooModel = db.model('foo', FooSchema);

            FooModel.match({
                variable: 'n',
                label: 'FileSystem'
            }).return(['*'])
                .exec()
                .then(docs => {
                    expect(docs).to.be.an('array');
                    done();
                }).catch(e => {
                    console.error(e);
                });
        });

    });

});