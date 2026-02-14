import { z } from "zod";

export const ChunkMetadataSchema = z.object({
  page: z.number().optional(),
  section: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export const ChunkRecordSchema = z.object({
  _id: z.string(),
  docId: z.string(),
  chunkIndex: z.number(),
  chromaId: z.string(),
  text: z.string(),
  textPreview: z.string().optional(),
  tokenApprox: z.number().optional(),
  metadata: ChunkMetadataSchema.optional(),
});

export type ChunkMetadata = z.infer<typeof ChunkMetadataSchema>;
export type ChunkRecord = z.infer<typeof ChunkRecordSchema>;
