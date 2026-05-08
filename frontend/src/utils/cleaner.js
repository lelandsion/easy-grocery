require('dotenv').config({

    path: require('path').resolve(__dirname, '../../../.env')

});

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGODB_URI; // consistent naming
const DB_NAME = "grocery_data";
const COLLECTION = "products";

// Guard (prevents your earlier crash)
if (!MONGO_URI) {
    throw new Error(" MONGODB_URI is not defined in .env");
}

// ---------------- CORE ----------------

async function withClient(fn) {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION);

        return await fn(collection);

    } catch (err) {
        console.error("❌ Mongo error:", err);
    } finally {
        await client.close();
    }
}

// ---------------- CLEANERS ----------------

async function cleanStore(storeId) {
    return withClient(async (collection) => {
        const result = await collection.deleteMany({ store: storeId });

        console.log(`🧹 Deleted ${result.deletedCount} items for store: ${storeId}`);
    });
}

async function wipeAll() {
    return withClient(async (collection) => {
        const result = await collection.deleteMany({});

        console.log(`Wiped ${result.deletedCount} total products`);
    });
}

// ---------------- RUNNER ----------------

async function main() {
    const arg = process.argv[2];

    if (!arg) {
        console.log("Usage:");
        console.log("  node cleaner.js <store-id>");
        console.log("  node cleaner.js --all");
        process.exit(1);
    }

    if (arg === "--all") {
        await wipeAll();
    } else {
        await cleanStore(arg);
    }

    process.exit(0); // clean exit
}

main();