import { Metadata } from "next";
import TrendsSidebar from "@/components/TrendsSidebar";
import Notifications from "./Notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-sm bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Notifications />
      </div>
      <TrendsSidebar />
    </main>
  );
}
