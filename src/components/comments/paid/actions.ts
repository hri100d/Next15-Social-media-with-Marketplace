"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getCommentsDataInclude,
  getPaidCommentsDataInclude,
  PaidPostData,
  PostData,
} from "@/lib/types";
import { createCommenSchema } from "@/lib/validation";

export async function submitPaidComment({
  paidpost,
  content,
}: {
  paidpost: PaidPostData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommenSchema.parse({ content });

  const [newComment] = await prisma.$transaction([
    prisma.paidPostComment.create({
      data: {
        content: contentValidated,
        paidPostId: paidpost.id,
        userId: user.id,
      },
      include: getPaidCommentsDataInclude(user.id),
    }),
    ...(paidpost.user.id !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: paidpost.user.id,
              paidPostId: paidpost.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deletePaidComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.paidPostComment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found.");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  const deletedComment = await prisma.paidPostComment.delete({
    where: { id },
    include: getPaidCommentsDataInclude(user.id),
  });

  return deletedComment;
}
