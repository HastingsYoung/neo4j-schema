const {expect} = require('chai');
const Neo4JDB = require('../src/index');
const Query = require('../src/query');

describe('Query Test', function () {

    describe('Construct simple read query', function () {

        it('should be able to construct a match & return query.', function (done) {

            const query = new Query();

            const construction = query.match('neo4j:Database {"name":"NEO4J"}')
                .hasDirectedRelation('isHostedBy')
                .toNode({
                    variable: 'user',
                    label: 'Admin'
                })
                .hasDirectedRelation({
                    variable: 'isFriendOf',
                    label: 'Relation'
                })
                .toNode({
                    variable: 'user',
                    label: 'Admin'
                })
                .hasReverseDirectedRelation({
                    variable: 'isFriendOf',
                    label: 'Relation'
                })
                .toNode({
                    variable: 'user',
                    label: 'General'
                })
                .return(['*'])
                .construct();

            expect(construction).to.be.a('string');

            done();
        });

        it('should be able to construct a match & where & return query.', function (done) {

            const query = new Query();

            const construction = query.match('neo4j:Database {"name":"NEO4J"}')
                .hasDirectedRelation('isHostedBy')
                .toNode({
                    variable: 'user',
                    label: 'Admin'
                })
                .hasDirectedRelation({
                    variable: 'isFriendOf',
                    label: 'Relation'
                })
                .toNode({
                    variable: 'user',
                    label: 'Admin'
                })
                .hasReverseDirectedRelation({
                    variable: 'isFriendOf',
                    label: 'Relation'
                })
                .toNode({
                    variable: 'user',
                    label: 'General'
                })
                .where({
                    user: {
                        name: {
                            $in: ['Tom', 'Jack', 'House']
                        }, age: {
                            $gte: 20,
                            $lte: 40
                        }
                    },
                    database: {
                        value: {
                            $gt: 10,
                            $lt: 100
                        }
                    }
                })
                .return(['*'])
                .construct();

            expect(construction).to.be.a('string');

            done();
        });

        it('should be able to construct a sorting query.', function (done) {

            const query = new Query();

            const construction = query.match('neo4j:Database {"name":"NEO4J"}')
                .hasDirectedRelation('isHostedBy')
                .toNode({
                    variable: 'user',
                    label: 'Admin'
                })
                .where({
                    user: {
                        name: {
                            $in: ['Tom', 'Jack', 'House']
                        }, age: {
                            $gte: 20,
                            $lte: 40
                        }
                    },
                    database: {
                        value: {
                            $gt: 10,
                            $lt: 100
                        }
                    }
                })
                .return(['*'])
                .orderBy({'user.name': 'desc', 'age': -1})
                .skip(5)
                .limit(10)
                .construct();

            expect(construction).to.be.a('string');

            done();
        });

    });

    describe.only('Construct simple write query.', function () {

        const db = new Neo4JDB().connect();
        const PersonSchema = Neo4JDB.Schema({
            name: String,
            age: Number,
            isAdmin: {type: Boolean, default: false},
            tags: [String],
            createdAt: {type: Date, default: Date.now}
        });
        const Person = db.model('foo', PersonSchema);

        const nodeObj = {
            name: 'foo',
            age: 25,
            tags: ['group A', 'group B', 'group C']
        };

        before(function (done) {
            Person.create({
                variable: 'n',
                label: 'Person',
                props: nodeObj
            })
                .return(['*'])
                .exec()
                .then(docs => {
                    done();
                }).catch(e => {
                    console.error(e);
                });
        });

        after(function (done) {

            Person.match({variable: 'n', label: 'Person'})
                .detachDelete(['n'])
                .exec()
                .then(docs => {
                    done();
                })
                .catch(e => {
                    console.error(e);
                });
        });

        it('should be able to construct a create & return query.', function (done) {

            Person.create({
                variable: 'n',
                label: 'Person',
                props: nodeObj
            })
                .return(['*'])
                .exec()
                .then(docs => {
                    expect(docs).to.be.an('array');
                    done();
                }).catch(e => {
                    console.error(e);
                });
        });

        it('should be able to remove a matched records from the query', function (done) {

            Person.match({variable: 'n', label: 'Person'})
                .detachDelete(['n'])
                .exec()
                .then(docs => {
                    expect(docs).to.be.an('array');
                    done();
                })
                .catch(e => {
                    console.error(e);
                });

        });

        it('should be able to count the number of matched records', function (done) {

            Person.match({variable: 'n', label: 'Person'})
                .count()
                .exec()
                .then(docs => {
                    expect(docs[0]).to.have.property('_fields').that.includes(0);
                    done();
                });
        });

        it('should be able to remove label from matched records', function (done) {

            Person.match({variable: 'n', label: 'Person'})
                .remove({variable: 'n', label: 'Person'})
                .exec()
                .then(docs => {
                    done();
                });
        });

        it('should be able to remove property from matched records', function (done) {

            Person.match({variable: 'n', label: 'Person'})
                .removeProperty('n', 'name')
                .exec()
                .then(docs => {
                    done();
                });
        });

    });

});