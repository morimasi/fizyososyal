import { z } from "zod";

export const postSchema = z.object({
  type: z.enum(["post", "reels", "carousel"]),
  mediaUrl: z.string().url("Geçerli bir medya URL'si girin"),
  caption: z.string().optional(),
  settings: z.record(z.string(), z.any()).optional(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
});

export type PostData = z.infer<typeof postSchema>;
