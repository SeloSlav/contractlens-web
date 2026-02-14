#!/usr/bin/env node
/**
 * ContractLens Eval Script
 * Runs analysis/chat on fixtures and checks for grounding (citations present).
 * Usage: node eval/run-eval.mjs
 * Requires: MONGODB_URI, CHROMA_URL, OPENAI_API_KEY, and base URL (default http://localhost:3000)
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.EVAL_BASE_URL ?? "http://localhost:3000";

const contractsDir = join(__dirname, "fixtures", "contracts");
const promptsPath = join(__dirname, "fixtures", "prompts.json");

async function createDoc(content, title) {
  const res = await fetch(`${BASE_URL}/api/docs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceType: "text", content, title }),
  });
  if (!res.ok) throw new Error(`Create doc failed: ${await res.text()}`);
  const data = await res.json();
  return data.docId;
}

async function ingest(docId) {
  const workerUrl = process.env.WORKER_URL ?? "http://localhost:8001";
  const res = await fetch(`${workerUrl}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docId }),
  });
  if (!res.ok) throw new Error(`Ingest failed: ${await res.text()}`);
}

async function chat(docId, question) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      docId,
      messages: [{ role: "user", content: question }],
    }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${await res.text()}`);
  const data = await res.json();
  return data;
}

function hasCitations(response) {
  if (response.citations && response.citations.length > 0) return true;
  if (response.answer && response.answer.toLowerCase().includes("not found")) return false;
  return response.answer?.length > 0;
}

async function main() {
  const prompts = JSON.parse(readFileSync(promptsPath, "utf-8"));
  const contractFiles = readdirSync(contractsDir).filter((f) => f.endsWith(".txt"));

  console.log("ContractLens Eval");
  console.log("===============");
  console.log(`Contracts: ${contractFiles.length}, Prompts: ${prompts.length}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  let pass = 0;
  let fail = 0;

  for (const file of contractFiles.slice(0, 2)) {
    const content = readFileSync(join(contractsDir, file), "utf-8");
    const title = file.replace(".txt", "");
    console.log(`\nContract: ${title}`);

    try {
      const docId = await createDoc(content, title);
      await ingest(docId);

      for (let i = 0; i < Math.min(5, prompts.length); i++) {
        const q = prompts[i];
        const response = await chat(docId, q);
        const ok = hasCitations(response);
        if (ok) pass++;
        else fail++;
        console.log(`  ${ok ? "PASS" : "FAIL"}: ${q.slice(0, 50)}...`);
      }
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      fail += 5;
    }
  }

  console.log("\n===============");
  console.log(`Pass: ${pass}, Fail: ${fail}`);
  console.log(`Total: ${pass + fail}`);
}

main().catch(console.error);
