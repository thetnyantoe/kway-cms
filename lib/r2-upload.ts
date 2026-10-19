export async function uploadFileToR2(file: File, key: string): Promise<string> {
  const res = await fetch("/api/r2/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentType: file.type }),
  });

  if (!res.ok) {
    throw new Error("Failed to get R2 presigned upload URL");
  }

  const { uploadUrl, error } = await res.json();
  if (error || !uploadUrl) throw new Error(error || "Invalid upload URL");

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to R2 storage");
  }

  return key;
}
