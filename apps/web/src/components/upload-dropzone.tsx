import { XCircleIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/kibo-ui/dropzone";
import { useUploadThing } from "@/hooks/uploadthing";
import { cn } from "@/lib/utils";
import { Spinner } from "./kibo-ui/spinner";

type Uploaded = { url: string; key?: string | null; name?: string };

type Props = {
    endpoint?: "imageUploader" | (string & {});
    value?: string | null; // form stuff
    onChange?: (uploaded: Uploaded[] | null) => void; // form stuff
    className?: string;
    maxFiles?: number;
};

export type ImageUploadDropzoneRef = {
    upload: () => Promise<any>;
    hasFile: () => boolean;
};

export const ImageUploadDropzone = forwardRef<ImageUploadDropzoneRef, Props>(
    ({ endpoint = "imageUploader", value = null, onChange, className, maxFiles }, ref) => {
        const [files, setFiles] = useState<File[]>([]);
        const [previewUrls, setPreviewUrls] = useState<string[] | null>(value ? [value] : null);
        const [progress, setProgress] = useState<number>(0);

        useEffect(() => setPreviewUrls(value ? [value] : null), [value]);

        useEffect(() => {
            if (!files.length) {
                setPreviewUrls(null);
                return;
            }

            const urls = files.map((file) => URL.createObjectURL(file));
            setPreviewUrls(urls);

            return () => urls.forEach((url) => URL.revokeObjectURL(url));
        }, [files]);

        const { startUpload, isUploading, routeConfig } = useUploadThing(endpoint, {
            onUploadProgress: (progress) => setProgress(progress),
            onClientUploadComplete: (res) => {
                setProgress(100);
                const uploaded = res.map((file) => ({
                    url: file.ufsUrl,
                    key: file.key,
                    name: file.name,
                }));
                onChange?.(uploaded);
                setFiles([]);
                toast.success("Upload successful!");
            },
            onUploadError: (err) => {
                setProgress(0);
                toast.error("Upload failed: " + err.message);
            },
        });

        const handleDrop = useCallback(
            (droppedFiles: File[]) => {
                if (!droppedFiles?.length) return;

                setFiles((prev) => {
                    const effectiveMax = maxFiles ?? routeConfig?.image?.maxFileCount ?? 1;
                    const combined = [...prev, ...droppedFiles];
                    return combined.slice(0, effectiveMax);
                });
                setProgress(0);
            },
            [maxFiles, routeConfig],
        );

        const handleUpload = useCallback(async () => {
            if (!files.length) {
                throw new Error("No files selected");
            }
            // rename files to random stuff
            const hashedFiles = files.map((file) => {
                const extension = file.name.split(".").pop();
                const hashedName = `${crypto.randomUUID()}.${extension}`;
                return new File([file], hashedName, { type: file.type });
            });
            return await startUpload(hashedFiles);
        }, [files, startUpload]);

        useImperativeHandle(
            ref,
            () => ({
                upload: handleUpload,
                hasFile: () => files.length > 0,
            }),
            [handleUpload, files],
        );

        const effectiveMaxFiles = maxFiles ?? routeConfig?.image?.maxFileCount ?? 1;
        const effectiveMaxSize = routeConfig?.image?.maxFileSize ?? "10MB";
        const maxSizeBytes =
            typeof effectiveMaxSize === "string"
                ? parseInt(effectiveMaxSize) * 1024 * 1024
                : effectiveMaxSize;

        return (
            <div className={cn("space-y-3", className)}>
                <Dropzone
                    accept={{ "image/*": [] }}
                    maxFiles={effectiveMaxFiles}
                    maxSize={maxSizeBytes}
                    disabled={isUploading}
                    onDropAccepted={handleDrop}
                >
                    <div className="flex w-full flex-col items-center justify-center gap-3">
                        <div className="text-sm text-muted-foreground">
                            Drag and drop or click to upload
                        </div>

                        {isUploading ? (
                            <div className="flex justify-center items-center w-full max-w-xs text-xs text-muted-foreground">
                                <Spinner className="mr-2" variant="throbber" />
                                <span>Uploading… {progress}%</span>
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground">
                                Accepts image/* up to {effectiveMaxSize} (max {effectiveMaxFiles}{" "}
                                file
                                {effectiveMaxFiles > 1 ? "s" : ""})
                            </div>
                        )}
                    </div>
                </Dropzone>
                {previewUrls && previewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {previewUrls.map((url, index) => (
                            <div
                                key={url}
                                className="relative flex items-center justify-center size-16"
                            >
                                <XCircleIcon
                                    className="absolute size-6 cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => {
                                        const newFiles = files.filter((_, i) => i !== index);
                                        setFiles(newFiles);

                                        if (newFiles.length === 0) {
                                            onChange?.(null);
                                        }
                                    }}
                                />
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="size-full rounded-md object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

ImageUploadDropzone.displayName = "ImageUploadDropzone";
