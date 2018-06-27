# Neo4j Schema
[![npm version](https://badge.fury.io/js/neo4j-schema.svg)](https://badge.fury.io/js/neo4j-schema)

A dead-simple client for neo4j in Javascript.

## Features
1. Mongoose-like syntax, flat learning curve, bootstrap Javascript developers to access Neo4J in minutes.
2. Resource pooling, automatically reuse connection resources to cut down network overhead.
3. Support schema validation with built-in Joi-schema.
4. Support ES6, ES7 syntax.

## Documentation
* [API](https://hastingsyoung.github.io/neo4j-schema/)
* [Guide]()

## Installation
```sh
npm install --save neo4j-schema
```

## Example
```javascript
const Neo4JDB = require('neo4j-schema');
const Query = Neo4JDB.Query;
const db = new Neo4JDB({
    uri: 'bolt://localhost',
    username: 'neo4j',
    password: 'neo4j'
}).connect();

const PersonSchema = Neo4JDB.Schema({
            name: String,
            age: Number,
            isAdmin: {type: Boolean, default: false},
            tags: [String],
            createdAt: {type: Date, default: Date.now}
        });
const Person = db.model('person', PersonSchema);

// Create
Person.create({
          variable: 'n',
          label: 'Person',
          props: {
              name: 'foo',
              age: 25,
              tags: ['group A', 'group B', 'group C']
          }
      }).return(['*'])
        .exec()
        .then(docs => {
            console.log(docs);   // [Node {
                                 //      labels: ['Person'],
                                 //      properties: {
                                 //         name: 'foo',
                                 //         age: 25,
                                 //         tags: ['group A', 'group B', 'group C'],
                                 //         isAdmin: false,
                                 //         createdAt: 1529831729
                                 //      }
                                 // }]
        }).catch(e => {
             console.error(e);
        });

// Match
let query = new Query(db);      // alternatively, use Person.match()
query.match({
          variable: 'n',
          label: 'Person'
        })
        .where({
            name: 'foo',
            age: {$gt: 20}
        })
        .return(['*'])
        .exec()
        .then(docs => {
            console.log(docs);  // [Node {
                                //      labels: ['Person'],
                                //      properties: {
                                //          name: 'foo',
                                //          age: 25,
                                //          tags: ['group A', 'group B', 'group C'],
                                //          isAdmin: false,
                                //          createdAt: 1529831729
                                //      }
                                // }]
        }).catch(e => {
            console.error(e);
        });

// Set
Person.match({
    variable: 'n',
    label: 'Admin'
}).set({
    variable: 'n',
    props: {
        name: 'bar',
        age: 30
    }
}).return(['*'])
    .exec()
    .then(docs => {
        console.log(docs);   // [Node {
                             //      labels: ['Person', 'Admin'],
                             //      properties: {
                             //         name: 'bar',
                             //         age: 30,
                             //         tags: ['group A', 'group B', 'group C'],
                             //         isAdmin: false,
                             //         createdAt: 1529831729
                             //      }
                             // }]
    });

// Remove Label
Person.match({variable: 'n', label: 'Admin'})
    .remove({variable: 'n', label: 'Admin'})
    .return(['*'])
    .exec()
    .then(docs => {
        console.log(docs);   // [Node {
                             //      labels: ['Person'],
                             //      properties: {
                             //         name: 'bar',
                             //         age: 30,
                             //         tags: ['group A', 'group B', 'group C'],
                             //         isAdmin: false,
                             //         createdAt: 1529831729
                             //      }
                             // }]
    });

// Delete
Person.match({
    variable: 'n',
    label: 'Person'
}).detachDelete(['n'])
    .exec()
    .then(docs => {
        console.log(docs);   // Node deleted
    });


```