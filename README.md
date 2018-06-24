# Neo4j Schema

A dead-simple client for neo4j in Javascript.

[API](https://hastingsyoung.github.io/neo4j-schema/)

## Features
1. Mongoose-like syntax, flat learning curve, bootstrap Javascript developers to access Neo4J in minutes.
2. Resource pooling, automatically reuse connection resources to cut down network overhead.
3. Support schema validation with built-in Joi-schema.
4. Support ES6, ES7 syntax.

## Example
```javascript
const Neo4JDB = require('neo4j-schema');
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
            console.log(docs);   // Node {
                                 //      labels: ['Person'],
                                 //      properties: {name: 'foo', age: 25, tags: ['group A', 'group B', 'group C'], isAdmin: false, createdAt: 1529831729}
                                 // }
        }).catch(e => {
             console.error(e);
        });
```