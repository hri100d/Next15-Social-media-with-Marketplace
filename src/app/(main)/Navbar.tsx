import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="max-w-7x1 mx-auto flex items-center justify-center flex-wrap gap-5 px-5 py-3">
        <Link href="/" className="text-2x1 font-bold text-primary">
          MyCraft
        </Link>
        <SearchField />
        <UserButton className="sm:ms-auto"/>
      </div>
    </header>
  );
}
