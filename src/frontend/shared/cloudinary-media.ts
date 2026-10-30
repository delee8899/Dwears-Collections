/** Build a delivery URL for a public Cloudinary image id. Never put API secrets here. */
export function cloudinaryImage(
  publicId: string | undefined,
  fallback: string,
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const cleanId = publicId?.trim().replace(/^\/+|\/+$/g, "");
  if (
    !cloudName ||
    !/^[a-zA-Z0-9_-]+$/.test(cloudName) ||
    !cleanId ||
    cleanId.split("/").some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))
  )
    return fallback;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${cleanId}`;
}
