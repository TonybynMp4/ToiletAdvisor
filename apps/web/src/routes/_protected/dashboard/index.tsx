import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadDropzone, type ImageUploadDropzoneRef } from "@/components/upload-dropzone";

export default function Dashboard() {
    const uploadRef = useRef<ImageUploadDropzoneRef>(null);

    const handleUploadClick = async () => {
        if (!uploadRef.current?.hasFile()) {
            return;
        }

        try {
            const result = await uploadRef.current.upload();
            console.log("Upload result:", result);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    return (
        <div>
            <ImageUploadDropzone
                className="w-64 mx-auto"
                ref={uploadRef}
                onChange={(uploaded) => console.log(uploaded)}
            />
            <Button onClick={handleUploadClick}>Upload</Button>
        </div>
    );
}
