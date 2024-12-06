import { sql } from "../src/utils/db";

async function clearTransactions(bridgeName: string) {
    // First, let's check what tables exist in the bridges schema
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'bridges';
    `;
    console.log("Available tables:", tables.map(t => t.table_name));

    // Now let's clear the data
    try {
        await sql`
            DELETE FROM bridges.transactions 
            WHERE bridge_id IN (
                SELECT id 
                FROM bridges.config 
                WHERE bridge_name = ${bridgeName}
            );
        `;
        console.log("Cleared bridges.transactions");

        await sql`
            DELETE FROM bridges.hourly_aggregated 
            WHERE bridge_id IN (
                SELECT id 
                FROM bridges.config 
                WHERE bridge_name = ${bridgeName}
            );
        `;
        console.log("Cleared bridges.hourly_aggregated");

        await sql`
            DELETE FROM bridges.daily_aggregated 
            WHERE bridge_id IN (
                SELECT id 
                FROM bridges.config 
                WHERE bridge_name = ${bridgeName}
            );
        `;
        console.log("Cleared bridges.daily_aggregated");

    } catch (error) {
        console.error("Error while clearing data:", error);
    }

    console.log(`Finished clearing data for ${bridgeName}`);
}

// Usage: ts-node scripts/clearTransactions.ts squidrouter
const bridgeName = process.argv[2];
if (!bridgeName) {
    console.error("Please provide a bridge name");
    process.exit(1);
}

clearTransactions(bridgeName).catch(console.error);