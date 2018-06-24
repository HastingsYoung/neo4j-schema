const KEYWORDS = Object.freeze({
    MATCH: 'MATCH',
    WHERE: 'WHERE',
    WITH: 'WITH',
    ORDER_BY: 'ORDER BY',
    SKIP: 'SKIP',
    LIMIT: 'LIMIT',
    RETURN: 'RETURN',
    REMOVE: 'REMOVE',
    CREATE: 'CREATE',
    MERGE: 'MERGE',
    SET: 'SET',
    IN: 'IN',
    AND: 'AND',
    NOT: 'NOT',
    DETACH: 'DETACH',
    DELETE: 'DELETE',
    UNION: 'UNION'
});

const SORTING_KEYS = Object.freeze({
    ASC: 'ASC',
    DESC: 'DESC'
});

module.exports = {
    KEYWORDS,
    SORTING_KEYS
};