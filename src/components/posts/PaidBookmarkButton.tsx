import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark, Heart } from "lucide-react";

interface PaidBookmarkButtonProps {
  paidpostId: string;
  initialState: BookmarkInfo;
}

export default function PaidBookmarkButton({
  paidpostId,
  initialState,
}: PaidBookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["paid-bookmark-info", paidpostId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/paidPosts/${paidpostId}/bookmark`)
        .json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/paidPosts/${paidpostId}/bookmark`)
        : kyInstance.post(`/api/paidPosts/${paidpostId}/bookmark`),
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`,
      });
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.log(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary"
        )}
      />
    </button>
  );
}
