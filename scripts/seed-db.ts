/**
 * Seed the Turso database with 50 popular NSE tickers.
 * Usage: npx tsx scripts/seed-db.ts
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const NSE_TICKERS = [
    { ticker: 'RELIANCE', name: 'Reliance Industries Ltd' },
    { ticker: 'TCS', name: 'Tata Consultancy Services Ltd' },
    { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd' },
    { ticker: 'INFY', name: 'Infosys Ltd' },
    { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd' },
    { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Ltd' },
    { ticker: 'SBIN', name: 'State Bank of India' },
    { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd' },
    { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd' },
    { ticker: 'ITC', name: 'ITC Ltd' },
    { ticker: 'LT', name: 'Larsen & Toubro Ltd' },
    { ticker: 'AXISBANK', name: 'Axis Bank Ltd' },
    { ticker: 'WIPRO', name: 'Wipro Ltd' },
    { ticker: 'HCLTECH', name: 'HCL Technologies Ltd' },
    { ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd' },
    { ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd' },
    { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd' },
    { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd' },
    { ticker: 'TITAN', name: 'Titan Company Ltd' },
    { ticker: 'ASIANPAINT', name: 'Asian Paints Ltd' },
    { ticker: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd' },
    { ticker: 'NTPC', name: 'NTPC Ltd' },
    { ticker: 'POWERGRID', name: 'Power Grid Corporation of India Ltd' },
    { ticker: 'ULTRACEMCO', name: 'UltraTech Cement Ltd' },
    { ticker: 'ADANIENT', name: 'Adani Enterprises Ltd' },
    { ticker: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd' },
    { ticker: 'COALINDIA', name: 'Coal India Ltd' },
    { ticker: 'JSWSTEEL', name: 'JSW Steel Ltd' },
    { ticker: 'TATASTEEL', name: 'Tata Steel Ltd' },
    { ticker: 'TECHM', name: 'Tech Mahindra Ltd' },
    { ticker: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd' },
    { ticker: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd" },
    { ticker: 'NESTLEIND', name: 'Nestle India Ltd' },
    { ticker: 'DIVISLAB', name: "Divi's Laboratories Ltd" },
    { ticker: 'CIPLA', name: 'Cipla Ltd' },
    { ticker: 'EICHERMOT', name: 'Eicher Motors Ltd' },
    { ticker: 'GRASIM', name: 'Grasim Industries Ltd' },
    { ticker: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd' },
    { ticker: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd' },
    { ticker: 'BPCL', name: 'Bharat Petroleum Corporation Ltd' },
    { ticker: 'BRITANNIA', name: 'Britannia Industries Ltd' },
    { ticker: 'M&M', name: 'Mahindra & Mahindra Ltd' },
    { ticker: 'INDUSINDBK', name: 'IndusInd Bank Ltd' },
    { ticker: 'SBILIFE', name: 'SBI Life Insurance Company Ltd' },
    { ticker: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd' },
    { ticker: 'TATACONSUM', name: 'Tata Consumer Products Ltd' },
    { ticker: 'HINDALCO', name: 'Hindalco Industries Ltd' },
    { ticker: 'UPL', name: 'UPL Ltd' },
    { ticker: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd' },
    { ticker: 'VEDL', name: 'Vedanta Ltd' },
];

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        console.error('❌ TURSO_DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const client = createClient({ url, authToken });

    let inserted = 0;
    let skipped = 0;

    for (const t of NSE_TICKERS) {
        try {
            await client.execute({
                sql: `INSERT OR IGNORE INTO popular_tickers (ticker, company_name, search_count, updated_at) VALUES (?, ?, 1, datetime('now'))`,
                args: [t.ticker, t.name],
            });
            // Check if actually inserted
            const result = await client.execute({
                sql: 'SELECT search_count FROM popular_tickers WHERE ticker = ?',
                args: [t.ticker],
            });
            if (result.rows.length > 0 && Number(result.rows[0].search_count) === 1) {
                inserted++;
            } else {
                skipped++;
            }
        } catch {
            skipped++;
        }
    }

    const total = await client.execute('SELECT COUNT(*) AS count FROM popular_tickers');
    console.log(`✅ Seeded ${inserted} tickers (${skipped} already existed)`);
    console.log(`📊 Total tickers in database: ${total.rows[0].count}`);

    client.close();
}

main().catch((err) => {
    console.error('❌ Failed to seed database:', err);
    process.exit(1);
});
