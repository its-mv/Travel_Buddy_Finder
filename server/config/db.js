// Dual DB connector: prefer Postgres (Supabase) when PG_CONNECTION_STRING is provided,
// otherwise fallback to existing MySQL connection. Export a compatible `query` API
// so existing code using `db.query(sql, params, cb)` continues to work.

const mysql = require("mysql");
const { Pool } = (() => {
    try {
        return require('pg');
    } catch (e) {
        return { Pool: null };
    }
})();

let usePg = false;
let pgPool = null;
let mysqlDb = null;

if (process.env.PG_CONNECTION_STRING || process.env.SUPABASE_DB_URL) {
    let conn = process.env.PG_CONNECTION_STRING || process.env.SUPABASE_DB_URL;
    // Remove surrounding quotes if present
    conn = conn.replace(/^['"]|['"]$/g, '');
    
    if (Pool) {
        usePg = true;
        pgPool = new Pool({
            connectionString: conn,
            ssl: {
                rejectUnauthorized: false // Required for Supabase
            }
        });
        pgPool.on('error', (err) => {
            console.error('Unexpected Postgres error', err);
        });
        pgPool.connect()
            .then(client => {
                return client.query('SELECT 1').then(() => client.release());
            })
            .then(() => console.log('Connected to Postgres ✅'))
            .catch(err => console.error('Postgres connection failed ❌ :', err.message || err));
    } else {
        console.warn('pg package not installed; Postgres support unavailable. Install `pg` to use Supabase/Postgres.');
    }
}

if (!usePg) {
    // fallback to MySQL (existing behaviour)
    mysqlDb = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    mysqlDb.connect((err) => {
        if (err) {
            console.error("MySQL Database Connection Failed ❌ :", err);
            return;
        }
        console.log("Connected to MySQL database ✅");
    });
}

// Expose a query function compatible with mysql's `db.query(sql, params, cb)`
function query(sql, params, cb) {
    if (usePg && pgPool) {
        // Normalize signatures: db.query(sql, cb) or db.query(sql, params, cb)
        if (typeof params === 'function' && typeof cb === 'undefined') {
            cb = params;
            params = [];
        }
        
        // Ensure params is an array
        if (!Array.isArray(params) && params !== undefined) {
            params = [params];
        }

        // Handle MySQL bulk insert: VALUES ? 
        // Convert to Postgres format: VALUES ($1,$2),($3,$4),...
        let flatParams = params || [];
        if (sql.includes('VALUES ?') && params && params.length > 0 && Array.isArray(params[0])) {
            const bulkData = params[0]; // Array of arrays: [[1,2], [3,4], ...]
            const valuesPerRow = bulkData[0].length;
            
            // Flatten the array
            flatParams = bulkData.flat();
            
            // Build VALUES clause: ($1,$2),($3,$4),...
            const valueClauses = [];
            for (let i = 0; i < bulkData.length; i++) {
                const placeholders = [];
                for (let j = 0; j < valuesPerRow; j++) {
                    placeholders.push(`$${i * valuesPerRow + j + 1}`);
                }
                valueClauses.push(`(${placeholders.join(',')})`);
            }
            
            sql = sql.replace('VALUES ?', `VALUES ${valueClauses.join(',')}`);
        }

        // Convert MySQL placeholders (?) to Postgres placeholders ($1, $2, etc.)
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

        // Quote reserved keywords (like "user" table)
        // Postgres reserved keywords that need quoting
        const reservedKeywords = ['user', 'group', 'order', 'table', 'index', 'key'];
        reservedKeywords.forEach(keyword => {
            // Match table names: FROM user, INTO user, UPDATE user, JOIN user
            const regex = new RegExp(`\\b(FROM|JOIN|INTO|UPDATE)\\s+${keyword}\\b`, 'gi');
            pgSql = pgSql.replace(regex, (match, prefix) => `${prefix} "${keyword}"`);
        });

        // If callback-style requested, use promise and call cb
        if (typeof cb === 'function') {
            pgPool.query(pgSql, flatParams || [])
                .then(res => {
                    cb(null, res.rows);
                })
                .catch(err => {
                    console.error('❌ Query Error:', err.message);
                    cb(err);
                });
            return;
        }

        // Promise style
        return pgPool.query(pgSql, flatParams || []).then(res => res.rows);
    }

    // MySQL path expects callback style
    if (mysqlDb) {
        return mysqlDb.query(sql, params, cb);
    }

    const err = new Error('No database client available');
    if (typeof cb === 'function') return cb(err);
    return Promise.reject(err);
}

module.exports = {
    query,
    // expose raw clients for advanced use when needed
    _pgPool: pgPool,
    _mysql: mysqlDb
};


// const mysql = require("mysql");
// require("dotenv").config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "travel_buddy_finder"
// });


// db.connect((err) => {
//     if (err) {
//         console.error("❌ Database Connection Failed:", err.code, err.sqlMessage);
//         return;
//     }
//     console.log("✅ Connected to database");
// });

// module.exports = db;
