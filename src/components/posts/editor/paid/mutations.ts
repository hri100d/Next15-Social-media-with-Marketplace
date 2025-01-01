import { useSession } from "@/app/(main)/SessionProvider";
import { PaidPostsPage } from "@/lib/types";
import {
  InfiniteData,
  Query,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { submitPaidPost } from "./actions";

export function useSubmitPaidPostMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { user } = useSession();

  const mutation = useMutation({
    mutationFn: submitPaidPost,
    onSuccess: async (newPaidPost) => {
      const queryFilter = {
        queryKey: ["paid-post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("paid-for-you") ||
            (query.queryKey.includes("paid-user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters<
        InfiniteData<PaidPostsPage, string | null>,
        Error
      >;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PaidPostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  paidposts: [newPaidPost, ...firstPage.paidposts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return (
            queryFilter.predicate(
              query as Query<
                InfiniteData<PaidPostsPage, string | null>,
                Error,
                InfiniteData<PaidPostsPage, string | null>,
                QueryKey
              >
            ) && !query.state.data
          );
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
