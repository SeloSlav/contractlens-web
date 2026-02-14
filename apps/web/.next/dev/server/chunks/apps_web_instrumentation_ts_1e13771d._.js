module.exports = [
"[project]/apps/web/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        const { ensureIndexes } = await __turbopack_context__.A("[project]/apps/web/lib/mongodb.ts [instrumentation] (ecmascript, async loader)");
        try {
            await ensureIndexes();
        } catch (err) {
            console.warn("MongoDB indexes ensure failed (DB may not be running):", err);
        }
    }
}
}),
];

//# sourceMappingURL=apps_web_instrumentation_ts_1e13771d._.js.map