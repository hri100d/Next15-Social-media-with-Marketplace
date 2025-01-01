import { CommentData, PaidCommentData } from "@/lib/types";
import UserTooltip from "../../UserTooltip";
import Link from "next/link";
import UserAvatar from "../../UserAvatar";
import { formatRelativeData } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import CommentMoreButton from "./CommentMoreButton";

interface PaidCommentProps {
  paidComment: PaidCommentData;
}

export default function Comment({ paidComment }: PaidCommentProps) {
  const { user } = useSession();

  return (
    <div className="flex gap-3 py-3 group/comment">
      <span className="hidden sm:inline">
        <UserTooltip user={paidComment.user}>
          <Link href={`/users/${paidComment.user.username}`}>
            <UserAvatar avatarUrl={paidComment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </span>
      <div>
        <div className="flex items-center gap-1 text-sm">
          <UserTooltip user={paidComment.user}>
            <Link
              href={`/users/${paidComment.user.username}`}
              className="font-medium hover:underline"
            >
              {paidComment.user.displayName}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground">
            {formatRelativeData(paidComment.createdAt)}
          </span>
        </div>
        <div>{paidComment.content}</div>
      </div>
      {paidComment.user.id === user.id && (
        <CommentMoreButton
          paidComment={paidComment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
