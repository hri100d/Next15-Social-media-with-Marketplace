"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPaidPostDataInclude, getPostDataInclude } from "@/lib/types";
import { redirect } from "next/navigation";

export async function deletePost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(user.id),
  });

  return deletedPost;
}

export async function deletePaidPost(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const post = await prisma.paidPost.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== user.id) throw new Error("Unauthorized");

  const deletedPaidPost = await prisma.paidPost.delete({
    where: { id },
    include: getPaidPostDataInclude(user.id),
  });

  return deletedPaidPost;
}

export async function BuyProduct(formData: FormData) {
  const paidPostId = formData.get("id") as string;
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  const data = await prisma.paidPost.findUnique({
    where: {
      id: paidPostId,
    },
    include: getPaidPostDataInclude(user.id),
  });

  if (!data) throw new Error("Post not found");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round((data?.price as number) * 100),
          product_data: {
            name: data?.title as string,
            description: data?.content,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.round((data?.price as number) * 100) * 0.1,
      transfer_data: {
        destination: user.connectedAccountId as string,
      },
    },
    success_url: "http://localhost:3000/payment/success",
    cancel_url: "http://localhost:3000/payment/cancel",
  });

  if (session.lastResponse.statusCode === 200 && data.count === 1) {
    await prisma.paidPost.delete({
      where: {
        id: paidPostId,
      },
    });
  }

  if (session.lastResponse.statusCode === 200 && data.count !== 1) {
    await prisma.paidPost.update({
      where: {
        id: paidPostId,
      },
      data: {
        count: data.count - 1,
      },
    });
  }

  return redirect(session.url as string);
}
