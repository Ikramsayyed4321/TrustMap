import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    business: z.string().min(1),
    rating: z.number().min(1).max(5),
    title: z.string().min(3).max(140),
    text: z.string().min(10).max(5000),
    photos: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional()
  })
});
