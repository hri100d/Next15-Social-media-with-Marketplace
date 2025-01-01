import { PaidPostData, PostData } from "@/lib/types";
import { useState } from "react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";
import { useSubmitPaidCommentMutation } from "./mutation";

interface PaidCommentInputProps {
  paidpost: PaidPostData;
}

export default function CommentInput({ paidpost }: PaidCommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitPaidCommentMutation(paidpost.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        paidpost: paidpost,
        content: input,
      },
      {
        onSuccess: () => setInput(""),
      }
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
