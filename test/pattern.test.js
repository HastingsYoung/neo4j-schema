const {expect} = require('chai');
const Neo4JDB = require('../src/index');
const Query = Neo4JDB.Query;
const Pattern = Query.Pattern;

describe('Pattern Test', function () {

    describe('Initialize with constructor properties', function () {

        it('should capture simple variable, labels and property maps from string', function (done) {

            const pattern = new Pattern('n:Person:Admin:Customer:Teacher {"age": 10, "name": "Mike"}');

            expect(pattern.toString()).to.be.equal('n:Person:Admin:Customer:Teacher { age: 10, name: \'Mike\' }');

            done();
        });

        it('should capture simple variable, labels and property maps from object map', function (done) {

            const pattern = new Pattern({
                variable: 'n',
                label: ['Person', 'Admin', 'Customer', 'Teacher'],
                props: {age: 10, name: 'Mike'}
            });

            expect(pattern.toString()).to.be.equal('n:Person:Admin:Customer:Teacher { age: 10, name: \'Mike\' }');

            done();
        });
    });

});