const KEYWORDS = Object.freeze({
    MATCH: 'MATCH',
    WHERE: 'WHERE',
    WITH: 'WITH',
    ORDER_BY: 'ORDER BY',
    SKIP: 'SKIP',
    LIMIT: 'LIMIT',
    RETURN: 'RETURN',
    CREATE: 'CREATE',
    IN: 'IN',
    AND: 'AND',
    NOT: 'NOT'
});

const SORTING_KEYS = Object.freeze({
    ASC: 'ASC',
    DESC: 'DESC'
});

module.exports = {
    KEYWORDS,
    SORTING_KEYS
};