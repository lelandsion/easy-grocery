require('dotenv').config({
    path: require('path').resolve(__dirname, '../../../.env')
});

const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "grocery_data";
const COLLECTION = "products";

if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
}

/* ================= CORE ================= */

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

/* ================= CLEANERS ================= */

// remove products with missing/0 price
async function removeZeroPriceProducts() {

    return withClient(async (collection) => {

        const result = await collection.deleteMany({
            $or: [
                { price: 0 },
                { price: "0" },
                { price: null },
                { price: { $exists: false } }
            ]
        });

        console.log(`🧹 Removed ${result.deletedCount} zero-price products`);
    });
}

async function removeAllProducts() {

    return withClient(async (collection) => {

        const result = await collection.deleteMany({});

        console.log(
            `🧹 Removed ${result.deletedCount} products`
        );
    });
}

// remove duplicates
async function removeDuplicates() {

    return withClient(async (collection) => {

        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: {
                        name: "$name",
                        store: "$store",
                        quantity: "$quantity"
                    },

                    ids: { $push: "$_id" },

                    count: { $sum: 1 }
                }
            },

            {
                $match: {
                    count: { $gt: 1 }
                }
            }

        ]).toArray();

        let totalDeleted = 0;

        for (const dup of duplicates) {

            // keep first document
            const idsToDelete = dup.ids.slice(1);

            if (idsToDelete.length > 0) {

                const result = await collection.deleteMany({
                    _id: { $in: idsToDelete }
                });

                totalDeleted += result.deletedCount;
            }
        }

        console.log(`🧹 Removed ${totalDeleted} duplicate products`);
    });
}

async function removeStoreProducts(storeId) {

    return withClient(async (collection) => {

        const result = await collection.deleteMany({
            store: new ObjectId(storeId)
        });

        console.log(
            `🧹 Removed ${result.deletedCount} products from store ${storeId}`
        );
    });
}

/* ================= RUNNER ================= */

async function main() {

    const arg = process.argv[2];

    if (!arg) {

        console.log("Usage:");
        console.log("  node cleaner.js --duplicates");
        console.log("  node cleaner.js --zero");
        console.log("  node cleaner.js --all-clean");

        process.exit(1);
    }

    if (arg === "--duplicates") {

        await removeDuplicates();

    } else if (arg === "--zero") {

        await removeZeroPriceProducts();

    } else if (arg === "--all-clean") {

        await removeZeroPriceProducts();
        await removeDuplicates();

    }
    else if (arg === "--store") {

        const storeId = process.argv[3];

        if (!storeId) {
            console.log("Usage:");
            console.log("node cleaner.js --store <storeId>");
            process.exit(1);
        }

        await removeStoreProducts(storeId);
    }
    else if (arg === "--all-products") {

        await removeAllProducts();
    } else {

        console.log("Unknown command");
    }

    process.exit(0);
}

main();