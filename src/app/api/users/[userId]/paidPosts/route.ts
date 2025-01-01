import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getPaidPostDataInclude,
  getPostDataInclude,
  PaidPostsPage,
  PostsPage,
} from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = await context.params;
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.paidPost.findMany({
      where: { userId },
      include: getPaidPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PaidPostsPage = {
      paidposts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}