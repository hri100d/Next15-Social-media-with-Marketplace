import { count } from "console";
import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed"
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z
  .object({
    content: z.string().optional(),
    mediaIds: z
      .array(z.string())
      .max(5, "Cannot have more than 5 attachments")
      .optional(),
  })
  .refine(
    (data) => data.content?.trim()?.length || (data.mediaIds?.length ?? 0) > 0,
    {
      message: "Either content or at least one media attachment is required",
      path: ["content"],
    }
  );

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommenSchema = z.object({
  content: requiredString,
});

export const createPaidPostSchema = z.object({
  title: requiredString,
  content: z.string().min(1).max(1000),
  price: z.coerce.number().gte(1).lte(999999),
  count: z.coerce.number().gte(1).lte(999999),
  mediaIds: z
    .array(z.string())
    .max(5, "Cannot have more than 5 attachments")
    .min(1, "Should have atleast one image or video"),
});
