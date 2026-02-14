export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureIndexes } = await import("./lib/mongodb");
    try {
      await ensureIndexes();
    } catch (err) {
      console.warn("MongoDB indexes ensure failed (DB may not be running):", err);
    }
  }
}
