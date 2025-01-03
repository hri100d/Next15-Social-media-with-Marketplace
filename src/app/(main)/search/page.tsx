import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResults from "./SearchResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchPaidResults from "./SearchPaidResults";

interface PageProps {
  searchParams: { q: string };
}

export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  return {
    title: `Search results for "${q}"`,
  };
}

export default function Page({ searchParams: { q } }: PageProps) {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-sm bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{q}&quot;
          </h1>
        </div>
        <Tabs defaultValue="post">
          <TabsList>
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="paid-post">Paid Post</TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <SearchResults query={q} />
          </TabsContent>
          <TabsContent value="paid-post">
            <SearchPaidResults query={q} />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
