import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import ThemeToggleButton from "../ThemeToggleButton";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <main className="flex flex-col h-screen items-center justify-center p-5 gap-2">
      <ThemeToggleButton />
      <div className="flex h-full max-h-[40rem] w-full max-w-[48rem] overflow-hidden rounded-sm bg-card shadow-2xl justify-center flex-col items-stretch overflow-y-auto p-10 md:w-1/2">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold">Sign up to MyCraft</h1>
          <p className="text-muted-foreground">
            A place where <span className="italic">you</span> can find
            everything.
          </p>
        </div>
        <div className="space-y-5">
          <SignUpForm />
          <Link href="/login" className="block text-center hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
