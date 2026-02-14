import { z } from "zod";

export const RunTypeSchema = z.enum(["analysis", "chat"]);

export const TokenUsageSchema = z.object({
  prompt: z.number().optional(),
  completion: z.number().optional(),
  total: z.number().optional(),
});

export const RunRecordSchema = z.object({
  _id: z.string(),
  docId: z.string(),
  type: RunTypeSchema,
  createdAt: z.date(),
  provider: z.string().optional(),
  model: z.string().optional(),
  durationMs: z.number().optional(),
  tokenUsage: TokenUsageSchema.optional(),
  costUsdApprox: z.number().optional(),
  inputs: z.record(z.unknown()).optional(),
  outputs: z.record(z.unknown()).optional(),
  events: z.array(z.unknown()).optional(),
});

export type RunType = z.infer<typeof RunTypeSchema>;
export type TokenUsage = z.infer<typeof TokenUsageSchema>;
export type RunRecord = z.infer<typeof RunRecordSchema>;
