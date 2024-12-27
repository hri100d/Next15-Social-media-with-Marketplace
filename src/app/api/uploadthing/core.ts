import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      console.log("Middleware executed. User:", user);

      if (!user) {
        console.error("Middleware error: Unauthorized");
        throw new UploadThingError("Unauthorized");
      }

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
        )[1];
        await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      );

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      return { avatarUrl: newAvatarUrl };
    }),
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      console.log("Attachment middleware executed. User:", user);

      if (!user) {
        console.error("Attachment middleware error: Unauthorized");
        throw new UploadThingError("Unauthorized");
      }

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Attachment onUploadComplete triggered. File:", file);

      const fileUrl = file.appUrl.replace(
        `/f/${file.key}`,
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      );
      const media = await prisma.media.create({
        data: {
          url: fileUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      console.log("Media created:", media);

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
