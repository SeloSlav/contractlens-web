import { z } from "zod";

export const FeedbackRecordSchema = z.object({
  _id: z.string(),
  runId: z.string(),
  findingId: z.string().optional(),
  rating: z.union([z.literal(1), z.literal(-1)]),
  note: z.string().optional(),
  createdAt: z.date(),
});

export const FeedbackCreateSchema = z.object({
  runId: z.string(),
  findingId: z.string().optional(),
  rating: z.union([z.literal(1), z.literal(-1)]),
  note: z.string().optional(),
});

export type FeedbackRecord = z.infer<typeof FeedbackRecordSchema>;
export type FeedbackCreate = z.infer<typeof FeedbackCreateSchema>;
