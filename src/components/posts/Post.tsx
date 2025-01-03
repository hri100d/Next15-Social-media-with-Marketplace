"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeData } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import Comments from "../comments/posts/Comments";
import { Button } from "../ui/button";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-sm bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeData(post.createdAt)}
            </Link>
          </div>
        </div>
        <div className="flex justify-end gap-3 items-center">
          {post.user.id === user.id && (
            <PostMoreButton
              post={post}
              className="opacity-0 transition-opacity group-hover/post:opacity-100"
            />
          )}
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id
              ),
            }}
          />
        </div>
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
      </div>
      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid smf:grid-cols-2"
      )}
    >
      <MediaCarousel mediaFiles={attachments} />
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}

interface MediaCarouselProps {
  mediaFiles: Media[];
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaFiles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaFiles.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto group">
      <div className="overflow-hidden rounded-lg flex items-center justify-center">
        {mediaFiles[currentIndex].type === "IMAGE" ? (
          <Image
            src={mediaFiles[currentIndex].url}
            alt={`Media ${currentIndex + 1}`}
            className="w-auto h-auto max-w-[500px] max-h-[500px] object-contain"
          />
        ) : (
          <video
            src={mediaFiles[currentIndex].url}
            controls
            className="w-auto h-auto max-w-[500px] max-h-[500px] object-contain"
          />
        )}
      </div>

      {mediaFiles.length > 1 && (
        <>
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800/80 hover:bg-gray-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            &lt;
          </Button>
          <Button
            variant="ghost"
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-gray-800/80 hover:bg-gray-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            &gt;
          </Button>
        </>
      )}
    </div>
  );
};
