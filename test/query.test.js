const {expect} = require('chai');
const Neo4JDB = require('../src/index');
const Query = require('../src/query');

describe('Query Test', function () {

    describe('Construct simple read query', function () {

        it('should be able to construct a match & return query', function (done) {

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

        it('should be able to construct a match & where & return query', function (done) {

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

    });

    describe('Construct simple write query', function () {

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

        it('should be able to construct a create & return query', function (done) {

            Person.create(nodeObj)
                .return(['*'])
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