import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import ThemeToggleButton from "../ThemeToggleButton";

export const metadata: Metadata = {
  title: "Login page",
};

export default function Page() {
  return (
    <main className="flex flex-col h-screen items-center justify-center p-5 gap-2">
      <ThemeToggleButton />
      <div className="flex h-full max-h-[40rem] w-full max-w-[48rem] overflow-hidden rounded-sm bg-card shadow-2xl justify-center flex-col items-stretch overflow-y-auto p-10 md:w-1/2">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold">Login to Mycraft</h1>
        </div>
        <div className="space-y-5">
          <LoginForm />
          <Link href="/signup" className="block text-center hover:underline">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
