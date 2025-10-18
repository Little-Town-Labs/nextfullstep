-- ================================================================
-- Database Inspection Queries for NeonDB (PostgreSQL)
-- ================================================================

-- 1. List all tables in the current database
SELECT
    table_schema,
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    table_schema, table_name;

-- 2. List all tables with row counts (useful for identifying empty tables)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM
    pg_tables
WHERE
    schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    size_bytes DESC;

-- 3. Get detailed table information including columns
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM
    information_schema.tables t
    INNER JOIN information_schema.columns c
        ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
WHERE
    t.table_schema = 'public'
ORDER BY
    t.table_name, c.ordinal_position;

-- 4. List all foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY
    tc.table_name;

-- 5. List all indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename, indexname;
