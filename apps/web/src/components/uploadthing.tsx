import { env } from "@toiletadvisor/env/web";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton({
	url: env.VITE_FILE_URL + "/api/uploadthing",
});

export const UploadDropzone = generateUploadDropzone({
	url: env.VITE_FILE_URL + "/api/uploadthing",
});
