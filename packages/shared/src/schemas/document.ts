import { z } from "zod";

export const DocumentStatusSchema = z.enum([
  "queued",
  "processing",
  "ready",
  "failed",
]);

export const SourceTypeSchema = z.enum(["pdf", "text", "url"]);

export const DocumentStatsSchema = z.object({
  numChunks: z.number().optional(),
  numTokensApprox: z.number().optional(),
  ingestMs: z.number().optional(),
});

export const DocumentCreateSchema = z.object({
  sourceType: SourceTypeSchema,
  content: z.string().optional(),
  url: z.string().url().optional(),
  title: z.string().optional(),
});

export const DocumentRecordSchema = z.object({
  _id: z.string(),
  title: z.string().optional(),
  sourceType: SourceTypeSchema,
  sourceUrl: z.string().optional(),
  createdAt: z.date(),
  status: DocumentStatusSchema,
  stats: DocumentStatsSchema.optional(),
});

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
export type DocumentStats = z.infer<typeof DocumentStatsSchema>;
export type DocumentCreate = z.infer<typeof DocumentCreateSchema>;
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;
