import { Metadata } from "next";
import Bookmarks from "./Bookmarks";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaidBookmarks from "./PaidBookmarks";

export const metadata: Metadata = {
  title: "Booksmarks",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-sm bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Tabs defaultValue="post">
          <TabsList>
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="paid-post">Paid Post</TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <Bookmarks />
          </TabsContent>
          <TabsContent value="paid-post">
            <PaidBookmarks />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
