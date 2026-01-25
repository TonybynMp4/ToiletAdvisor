import type { OurFileRouter } from "file-server/uploadthing";
import { env } from "@toiletadvisor/env/web";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
	url: env.VITE_FILE_URL + "/api/uploadthing",
});
