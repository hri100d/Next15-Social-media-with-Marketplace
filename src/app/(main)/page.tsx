import PostEditor from "@/components/posts/editor/post/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import ForYouFeed from "./ForYouFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import PaidPostEditor from "@/components/posts/editor/paid/PostEditor";
import PaidForYouFeed from "./PaidForYouFeed";

export default async function Home() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Tabs defaultValue="post">
          <TabsList>
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="paid-post">Paid Post</TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <PostEditor />
          </TabsContent>
          <TabsContent value="paid-post">
            <PaidPostEditor />
          </TabsContent>
        </Tabs>
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>

            <TabsTrigger value="paid-for-you">Paid For you</TabsTrigger>
            <TabsTrigger value="paid-following">Paid Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <ForYouFeed />
          </TabsContent>
          <TabsContent value="following">
            <FollowingFeed />
          </TabsContent>
          <TabsContent value="paid-for-you">
            <PaidForYouFeed />
          </TabsContent>
          <TabsContent value="paid-following">
            <ForYouFeed />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
