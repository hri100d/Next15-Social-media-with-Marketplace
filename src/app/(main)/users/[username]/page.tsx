import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPaidPosts from "./UserPaidPost";

interface PageProps {
  params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUser={loggedInUser} />
        <div className="rounded-sm bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </div>
        <Tabs defaultValue="user-posts">
          <TabsList>
            <TabsTrigger value="user-posts">Posts</TabsTrigger>
            <TabsTrigger value="user-paid-posts">Paid Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="user-posts">
            <UserPosts userId={user.id} />
          </TabsContent>
          <TabsContent value="user-paid-posts">
            <UserPaidPosts userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  loggedInUser: User;
  user: UserData;
}

import { CreateStripeAccountLink, GetStripeDashboardLink } from "./actions"; // Make sure the action is imported
import { Button } from "@/components/ui/button";
import { User } from "lucia";

async function UserProfile({ user, loggedInUser }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-sm bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>

        {user.id === loggedInUser.id ? (
          <div className="flex gap-3">
            {loggedInUser.stripeConnectedLinked ? (
              <form action={GetStripeDashboardLink}>
                <div>
                  <Button type="submit">View Dashboard</Button>
                </div>
              </form>
            ) : (
              <form action={CreateStripeAccountLink}>
                <div>
                  <Button type="submit">Connect Stripe</Button>
                </div>
              </form>
            )}
            <EditProfileButton user={user} />
          </div>
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
