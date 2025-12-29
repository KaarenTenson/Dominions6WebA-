import type { FileMetaData } from "../types";

export const uploadFile = async(file: File):Promise<FileMetaData> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/files", {
      method: "POST",
      body: form,
    });

    return await res.json() as FileMetaData;
}