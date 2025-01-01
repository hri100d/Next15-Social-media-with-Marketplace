import kyInstance from "@/lib/ky";
import { CommentsPage, PaidCommentsPage, PaidPostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";

interface PaidCommentsProps {
  paidpost: PaidPostData;
}

export default function Comments({ paidpost }: PaidCommentsProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["paid-comments", paidpost.id],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/paidPosts/${paidpost.id}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {}
          )
          .json<PaidCommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
    });

  const comments = data?.pages.flatMap((page) => page.paidComments) || [];

  return (
    <div className="space-y-3">
      <CommentInput paidpost={paidpost} />
      {hasNextPage && (
        <Button
          variant="link"
          className="mx-auto block"
          disabled={isFetching}
          onClick={() => fetchNextPage()}
        >
          Load previous comments
        </Button>
      )}
      {status === "pending" && <Loader2 className="mx-auto animate-spin" />}
      {status === "success" && !comments.length && (
        <p className="text-center text-muted-foreground">No comments yet.</p>
      )}
      {status === "error" && (
        <p className="text-center text-destructive">
          An error occurred while loading comments.
        </p>
      )}
      <div className="divide-y">
        {comments.map((paidComment) => (
          <Comment key={paidComment.id} paidComment={paidComment} />
        ))}
      </div>
    </div>
  );
}
