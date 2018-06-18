const {expect} = require('chai');
const Joi = require('joi');
const Schema = require('../src/schema');

describe('Schema Test', function () {

    describe('transpile()', function () {

        it('should transpile simple schema defs to Joi schema objects.', function (done) {

            const schema = Schema.transpile({
                string: String,
                number: Number,
                boolean: Boolean,
                date: Date,
                arrOfStr: [String],
                arrOfNum: [Number],
                arrOfBool: [Boolean],
                arrOfDate: [Date],
            });

            const value = {
                string: 'str',
                number: 0,
                boolean: true,
                date: new Date(),
                arrOfStr: ['str', 'str', 'str'],
                arrOfNum: [0, 1, 2, 3],
                arrOfBool: [true, false, true, false],
                arrOfDate: [new Date()]
            };

            Joi.validate(value, schema, null, function (err, val) {
                if (err) throw err;
                expect(!err).to.be.equal(true);
                expect(val).to.be.deep.equal(value);
                done();
            });
        });

        it('should transpile simple schema defs to Joi schema objects and identifies unmatched types.', function (done) {

            const schema = Schema.transpile({
                string: String,
                number: Number,
                boolean: Boolean,
                date: Date,
                arrOfStr: [String],
                arrOfNum: [Number],
                arrOfBool: [Boolean],
                arrOfDate: [Date]
            });

            const value1 = {
                string: 0
            };

            const value2 = {
                number: 'str'
            };

            const value3 = {
                boolean: 0
            };

            const value4 = {
                date: 'str',
            };

            const value5 = {
                arrOfStr: ['str', 'str', 0]
            };

            const value6 = {
                arrOfNum: [0, 1, true, 3]
            };

            const value7 = {
                arrOfBool: [true, 'str', true, false]
            };

            const value8 = {
                arrOfDate: ['str']
            };

            Joi.validate(value1, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value2, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value3, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value4, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value5, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value6, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value7, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value8, schema, null, function (err, val) {
                expect(err).to.be.an('error');
                done();
            });
        });

        it('should transpile composite schema defs to Joi schema objects.', function (done) {

            const schema = Schema.transpile({
                string: {type: String, default: 'empty'},
                number: {type: Number, enum: [0, 1, 2, 3]},
                boolean: {type: Boolean},
                date: {type: Date, default: Date.now},
                arrOfStr: {type: [String], required: true},
                arrOfNum: {type: [Number], enum: [[0, 1, 2, 3], [1, 2, 3, 4]]},
                arrOfBool: {type: [Boolean]},
                arrOfDate: {type: [Date]}
            });

            const value1 = {
                number: 0,
                boolean: true,
                arrOfStr: ['str', 'str', 'str'],
                arrOfNum: [0, 1, 2, 3],
                arrOfBool: [true, false, true, false]
            };

            const value2 = {
                arrOfNum: [4, 5, 6, 7]
            };

            const value3 = {
                number: 4
            };

            Joi.validate(value1, schema, null, function (err, val) {
                if (err) throw err;
                expect(val).to.have.a.property('date').that.is.a('number');
                expect(val).to.have.a.property('string').and.equal('empty');
            });

            Joi.validate(value2, schema, null, function (err, val) {
                expect(err).to.be.an('error');
            });

            Joi.validate(value3, schema, null, function (err, val) {
                expect(err).to.be.an('error');
                done();
            });
        });
    });
});