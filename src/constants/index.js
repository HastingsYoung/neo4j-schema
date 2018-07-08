const DEFAULT_DB_OPTIONS = Object.freeze({
    MAX_SESSION_COUNT: 20,
    MAX_WAITING_COUNT: 20
});

const SCHEMA_TYPES = Object.freeze({
    STRING: String,
    NUMBER: Number,
    BOOLEAN: Boolean,
    DATE: Date,
    ARRAY: Array,
    OBJECT: Object,
    ARRAY_OF_STR: [String],
    ARRAY_OF_NUM: [Number],
    ARRAY_OF_BOOL: [Boolean],
    ARRAY_OF_DATE: [Date]
});

const SCHEMA_PROP_DEFS = Object.freeze({
    TYPE: 'type',
    REQUIRED: 'required',
    DEFAULT: 'default',
    ENUM: 'enum'
});

const SESSION_STATES = Object.freeze({
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTING: 'disconnecting',
    DISCONNECTED: 'disconnected',
    CLOSED: 'closed',
    ERROR: 'error'
});

module.exports = {
    DEFAULT_DB_OPTIONS,
    SCHEMA_TYPES,
    SCHEMA_PROP_DEFS,
    SESSION_STATES
};