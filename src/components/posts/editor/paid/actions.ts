"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPaidPostDataInclude } from "@/lib/types";
import { createPaidPostSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export async function submitPaidPost(input: {
  title: string;
  content: string;
  price: number;
  count: number;
  mediaIds?: string[];
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const validatedInput = createPaidPostSchema.parse(input);

  const { title, content, price, count, mediaIds } = validatedInput;

  const newPaidPost = await prisma.paidPost.create({
    data: {
      title: title,
      content: content,
      price: price,
      count: count,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })) || [],
      },
    },
    include: getPaidPostDataInclude(user.id),
  });

  return newPaidPost;
}