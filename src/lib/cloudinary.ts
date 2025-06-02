interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResult> => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Dosya boyutu 5MB'dan büyük olamaz",
      };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Sadece resim dosyaları yüklenebilir",
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qr-menu-preset");
    formData.append("folder", "qr-menu-images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data: CloudinaryUploadResponse = await response.json();

    return {
      success: true,
      url: data.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: "Görsel yükleme sırasında hata oluştu",
    };
  }
};

export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  } = {}
): string => {
  const { width = 400, height = 300, quality = 80, format = "auto" } = options;

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/${publicId}`;
};

export const optimizeCloudinaryUrl = (
  url: string,
  width: number = 400,
  height: number = 300,
  quality: number = 80
): string => {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  if (url.includes("/w_") || url.includes("/h_")) {
    return url;
  }

  const parts = url.split("/upload/");
  if (parts.length === 2) {
    const baseUrl = parts[0];
    const publicId = parts[1];
    return `${baseUrl}/upload/w_${width},h_${height},c_fill,q_${quality},f_auto/${publicId}`;
  }

  return url;
};

export const handleDragAndDrop = (
  e: React.DragEvent<HTMLDivElement>,
  onFileSelect: (file: File) => void
) => {
  e.preventDefault();
  e.stopPropagation();

  const files = Array.from(e.dataTransfer.files);
  const imageFile = files.find((file) => file.type.startsWith("image/"));

  if (imageFile) {
    onFileSelect(imageFile);
  }
};
