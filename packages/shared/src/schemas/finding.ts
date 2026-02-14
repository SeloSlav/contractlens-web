import { z } from "zod";

export const RiskLevelSchema = z.enum(["low", "medium", "high"]);

export const FindingCategorySchema = z.enum([
  "termination",
  "liability",
  "indemnity",
  "privacy",
  "payment",
  "renewal",
  "jurisdiction",
  "IP",
  "confidentiality",
  "warranty",
  "limitation_of_liability",
  "assignment",
  "dispute_resolution",
  "SLA",
]);

export const CitationSchema = z.object({
  docId: z.string(),
  chunkId: z.string(),
  snippet: z.string(),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
});

export const FindingSchema = z.object({
  risk_level: RiskLevelSchema,
  category: FindingCategorySchema,
  title: z.string(),
  description: z.string(),
  why_it_matters: z.string(),
  suggested_questions: z.array(z.string()),
  suggested_redline: z.string().optional(),
  citations: z.array(CitationSchema),
  confidence: z.number().min(0).max(1),
});

export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type FindingCategory = z.infer<typeof FindingCategorySchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type Finding = z.infer<typeof FindingSchema>;
