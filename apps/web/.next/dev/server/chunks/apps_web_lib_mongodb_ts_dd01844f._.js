module.exports = [
"[project]/apps/web/lib/mongodb.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureIndexes",
    ()=>ensureIndexes,
    "getDb",
    ()=>getDb
]);
(()=>{
    const e = new Error("Cannot find module 'mongodb'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/contractlens";
let client = null;
let clientPromise = null;
function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = new MongoClient(uri).connect();
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
];

//# sourceMappingURL=apps_web_lib_mongodb_ts_dd01844f._.js.map