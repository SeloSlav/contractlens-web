module.exports = [
"[project]/apps/web/lib/mongodb.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureIndexes",
    ()=>ensureIndexes,
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs, [project]/node_modules/mongodb)");
;
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/contractlens";
let client = null;
let clientPromise = null;
function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongodb$29$__["MongoClient"](uri).connect();
    return clientPromise;
}
async function getDb() {
    const c = await getClient();
    return c.db();
}
async function ensureIndexes() {
    const db = await getDb();
    await db.collection("documents").createIndex({
        createdAt: -1
    });
    await db.collection("chunks").createIndex({
        docId: 1
    });
    await db.collection("runs").createIndex({
        docId: 1
    });
    await db.collection("feedback").createIndex({
        runId: 1
    });
}
}),
"[externals]/mongodb [external] (mongodb, cjs, [project]/node_modules/mongodb)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb-438b504308ffa4be", () => require("mongodb-438b504308ffa4be"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__085709f4._.js.map