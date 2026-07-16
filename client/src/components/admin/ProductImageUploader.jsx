import { useMemo, useRef, useState } from "react";
import "./ProductImageUploader.css";

const CLOUD_NAME =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "";

const UPLOAD_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const normalizeImages = (value) => {
  const source = Array.isArray(value)
    ? value
    : String(value || "").split("\n");

  return source
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return item?.url || item?.secure_url || "";
    })
    .filter(Boolean);
};

const ProductImageUploader = ({
  value,
  onChange,
  onMessage,
}) => {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const images = useMemo(
    () => normalizeImages(value),
    [value]
  );

  const updateImages = (nextImages) => {
    onChange(nextImages.join("\n"));
  };

  const uploadSingleImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data?.error?.message ||
          `Unable to upload ${file.name}`
      );
    }

    return data.secure_url;
  };

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      onMessage(
        "Cloudinary configuration is missing in Vercel."
      );

      event.target.value = "";
      return;
    }

    if (
      images.length + selectedFiles.length >
      MAX_IMAGES
    ) {
      onMessage(
        `Maximum ${MAX_IMAGES} product images are allowed.`
      );

      event.target.value = "";
      return;
    }

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        onMessage(
          `${file.name} must be JPG, PNG or WEBP.`
        );

        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        onMessage(
          `${file.name} must be smaller than 5 MB.`
        );

        event.target.value = "";
        return;
      }
    }

    try {
      setUploading(true);
      onMessage("Uploading product images...");

      const uploadedUrls = [];

      for (
        let index = 0;
        index < selectedFiles.length;
        index += 1
      ) {
        const file = selectedFiles[index];

        setUploadStatus(
          `Uploading ${index + 1} of ${
            selectedFiles.length
          }: ${file.name}`
        );

        const imageUrl =
          await uploadSingleImage(file);

        uploadedUrls.push(imageUrl);
      }

      updateImages([
        ...images,
        ...uploadedUrls,
      ]);

      onMessage(
        `${uploadedUrls.length} image(s) uploaded successfully.`
      );
    } catch (error) {
      onMessage(
        error.message ||
          "Unable to upload product images."
      );
    } finally {
      setUploading(false);
      setUploadStatus("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (imageIndex) => {
    const nextImages = images.filter(
      (_, index) => index !== imageIndex
    );

    updateImages(nextImages);
  };

  const moveImage = (
    currentIndex,
    direction
  ) => {
    const nextIndex =
      currentIndex + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= images.length
    ) {
      return;
    }

    const nextImages = [...images];

    [
      nextImages[currentIndex],
      nextImages[nextIndex],
    ] = [
      nextImages[nextIndex],
      nextImages[currentIndex],
    ];

    updateImages(nextImages);
  };

  return (
    <section className="product-image-uploader">
      <div className="product-image-uploader__head">
        <div>
          <strong>Product Images</strong>

          <p>
            Choose up to {MAX_IMAGES} photos.
            The first photo will be the main
            product image.
          </p>
        </div>

        <label className="product-image-uploader__button">
          {uploading
            ? "Uploading..."
            : "Choose Photos"}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={handleFiles}
          />
        </label>
      </div>

      {uploadStatus ? (
        <p className="product-image-uploader__status">
          {uploadStatus}
        </p>
      ) : null}

      {images.length > 0 ? (
        <div className="product-image-uploader__grid">
          {images.map((image, index) => (
            <article
              className="product-image-uploader__item"
              key={`${image}-${index}`}
            >
              <div className="product-image-uploader__media">
                <img
                  src={image}
                  alt={`Product preview ${
                    index + 1
                  }`}
                />

                {index === 0 ? (
                  <span className="product-image-uploader__main">
                    Main Image
                  </span>
                ) : null}

                <span className="product-image-uploader__number">
                  {index + 1}
                </span>
              </div>

              <div className="product-image-uploader__actions">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() =>
                    moveImage(index, -1)
                  }
                >
                  Left
                </button>

                <button
                  type="button"
                  disabled={
                    index === images.length - 1
                  }
                  onClick={() =>
                    moveImage(index, 1)
                  }
                >
                  Right
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    removeImage(index)
                  }
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="product-image-uploader__empty">
          No product images selected.
        </div>
      )}

      <details className="product-image-uploader__manual">
        <summary>
          Or paste image URLs manually
        </summary>

        <textarea
          rows="4"
          value={String(value || "")}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Paste one image URL per line"
        />
      </details>
    </section>
  );
};

export default ProductImageUploader;