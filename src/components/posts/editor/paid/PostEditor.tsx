"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { ClipboardEvent, useRef } from "react";
import { useSubmitPaidPostMutation } from "./mutations";
import "../styles.css";
import useMediaUpload, { Attachment } from "../useMediaUpload";
import { useDropzone } from "@uploadthing/react";
import { count } from "console";

export default function PaidPostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPaidPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const titleEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Title of the product",
      }),
    ],
  });

  const contentEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Description of the product",
      }),
    ],
  });

  const priceEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Price: 0,00",
      }),
    ],
  });

  const countEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Available quantity: 0",
      }),
    ],
  });

  function onSubmit() {
    const priceText = priceEditor?.getText() || "0";
    const countText = countEditor?.getText() || "0";

    const price = parseFloat(priceText);
    const count = parseInt(countText, 10);

    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price greater than or equal to 0.");
      return;
    }

    if (isNaN(count) || count < 0) {
      alert("Please enter a valid count greater than or equal to 0.");
      return;
    }

    mutation.mutate(
      {
        title: titleEditor?.getText() || "",
        content:
          contentEditor?.getText({
            blockSeparator: "\n",
          }) || "",
        price,
        count,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          titleEditor?.commands.clearContent();
          contentEditor?.commands.clearContent();
          priceEditor?.commands.clearContent();
          countEditor?.commands.clearContent();
          resetMediaUploads();
        },
      }
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind == "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  return (
    <div className="flex flex-col gap-5 rounded-sm bg-card p-5 shadow-sm">
      {user.stripeConnectedLinked && (
        <div className="flex gap-5">
          <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
          <div {...rootProps} className="w-full flex flex-col gap-3">
            <EditorContent
              editor={titleEditor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-sm bg-background px-5 py-3",
                isDragActive && "outline-dashed"
              )}
            />
            <EditorContent
              editor={contentEditor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-sm bg-background px-5 py-3",
                isDragActive && "outline-dashed"
              )}
              onPaste={onPaste}
            />
            <EditorContent
              editor={priceEditor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-sm bg-background px-5 py-3",
                isDragActive && "outline-dashed"
              )}
            />
            <EditorContent
              editor={countEditor}
              className={cn(
                "max-h-[20rem] w-full overflow-y-auto rounded-sm bg-background px-5 py-3",
                isDragActive && "outline-dashed"
              )}
            />
            <input {...getInputProps()} />
          </div>
        </div>
      )}
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      {user.stripeConnectedLinked ? (
        <div className="flex items-center justify-end gap-3">
          {isUploading && (
            <>
              <span className="text-sm">{uploadProgress ?? 0}%</span>
              <Loader2 className="size-5 animate-spin text-primary" />
            </>
          )}
          <AddAttachmentsButton
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
          <LoadingButton
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={
              (!titleEditor?.isEmpty &&
                !contentEditor?.isEmpty &&
                priceEditor?.isEmpty &&
                countEditor?.isEmpty &&
                attachments.length === 0) ||
              isUploading
            }
            className="min-w-20"
          >
            Post
          </LoadingButton>
        </div>
      ) : (
        <p className="text-sm font-semibold break-words">
          Please go to your profile and link your stripe account.
        </p>
      )}
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

export function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

export function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-sm"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-sm">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
