"use client";

import { PaidPostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeData } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import Comments from "../comments/paid/Comments";
import PostMoreButton from "./PaidPostMoreButton";
import PaidPostMoreButton from "./PaidPostMoreButton";
import BookmarkButton from "./BookmarkButton";
import PaidBookmarkButton from "./PaidBookmarkButton";
import LoadingButton from "../LoadingButton";
import { BuyProduct } from "./actions";
import { Span } from "next/dist/trace";

interface PaidPostProps {
  paidpost: PaidPostData;
}

export default function PaidPost({ paidpost }: PaidPostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-sm bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={paidpost.user}>
            <Link href={`/users/${paidpost.user.username}`}>
              <UserAvatar avatarUrl={paidpost.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={paidpost.user}>
              <Link
                href={`/users/${paidpost.user.username}`}
                className="block font-medium hover:underline"
              >
                {paidpost.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/paidPosts/${paidpost.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeData(paidpost.createdAt)}
            </Link>
          </div>
        </div>
        <div className="flex justify-end gap-3 items-center">
          {paidpost.user.id === user.id && (
            <PaidPostMoreButton
              paidpost={paidpost}
              className="opacity-0 transition-opacity group-hover/post:opacity-100"
            />
          )}
          <PaidBookmarkButton
            paidpostId={paidpost.id}
            initialState={{
              isBookmarkedByUser: paidpost.bookmarks.some(
                (bookmark) => bookmark.userId === user.id
              ),
            }}
          />
        </div>
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words text-lg font-bold">
          {paidpost.title}
        </div>
        <div className="whitespace-pre-line break-words">
          {paidpost.content}
        </div>
      </Linkify>
      {!!paidpost.attachments.length && (
        <MediaPreviews attachments={paidpost.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <CommentButton
            paidpost={paidpost}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        {paidpost.user.id !== user.id && user.stripeConnectedLinked ? (
          <form action={BuyProduct} className="flex gap-3 items-center">
            <p className="text-sm font-semibold">Quantity: {paidpost.count}</p>
            <input type="hidden" name="id" value={paidpost.id} />
            <Button type="submit" variant="default">
              Buy for {paidpost.price}$
            </Button>
          </form>
        ) : (
          <div className="flex justify-end gap-3">
            <div className="text-sm font-bold">Quantity: {paidpost.count}</div>
            <div className="text-sm font-bold">Price: {paidpost.price}</div>
          </div>
        )}
      </div>
      {showComments && <Comments paidpost={paidpost} />}
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

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={250}
        height={500}
        className="mx-auto size-fir max-h-[30rem] rounded-sm"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-sm"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  paidpost: PaidPostData;
  onClick: () => void;
}

function CommentButton({ paidpost, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {paidpost._count.comments}{" "}
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
          <img
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
