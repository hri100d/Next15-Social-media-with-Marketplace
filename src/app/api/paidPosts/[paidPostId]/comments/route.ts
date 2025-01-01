import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  CommentsPage,
  getCommentsDataInclude,
  getPaidCommentsDataInclude,
  PaidCommentsPage,
} from "@/lib/types";
import { pages } from "next/dist/build/templates/app-page";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { paidPostId } }: { params: { paidPostId: string } }
) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 5;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.paidPostComment.findMany({
      where: { paidPostId },
      include: getPaidCommentsDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const previousCursor = comments.length > pageSize ? comments[0].id : null;

    const data: PaidCommentsPage = {
      paidComments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
