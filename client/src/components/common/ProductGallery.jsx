import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./ProductGallery.css";

const normalizeImages = (value) => {
  const source = Array.isArray(value)
    ? value
    : [value];

  return source
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return item?.url || item?.secure_url || "";
    })
    .filter(Boolean);
};

const ProductGallery = ({
  images,
  productName = "Product",
}) => {
  const productImages = useMemo(
    () => normalizeImages(images),
    [images]
  );

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  const touchStartX = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const showPrevious = () => {
    if (!productImages.length) {
      return;
    }

    setActiveIndex((current) =>
      current === 0
        ? productImages.length - 1
        : current - 1
    );
  };

  const showNext = () => {
    if (!productImages.length) {
      return;
    }

    setActiveIndex((current) =>
      current === productImages.length - 1
        ? 0
        : current + 1
    );
  };

  useEffect(() => {
    if (!lightboxOpen) {
      return undefined;
    }

    const handleKeyboard = (event) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  });

  const handleTouchStart = (event) => {
    touchStartX.current =
      event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX =
      event.changedTouches?.[0]?.clientX ??
      touchStartX.current;

    const difference =
      touchStartX.current - endX;

    if (Math.abs(difference) > 45) {
      if (difference > 0) {
        showNext();
      } else {
        showPrevious();
      }
    }

    touchStartX.current = null;
  };

  const activeImage =
    productImages[activeIndex] || "";

  if (!productImages.length) {
    return (
      <div className="product-gallery product-gallery--empty">
        No product image available
      </div>
    );
  }

  return (
    <>
      <div className="product-gallery">
        <div
          className="product-gallery__main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {productImages.length > 1 ? (
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--left"
              onClick={showPrevious}
              aria-label="Previous product image"
            >
              &#10094;
            </button>
          ) : null}

          <button
            type="button"
            className="product-gallery__image-button"
            onClick={() =>
              setLightboxOpen(true)
            }
          >
            <img
              src={activeImage}
              alt={`${productName} ${
                activeIndex + 1
              }`}
            />
          </button>

          {productImages.length > 1 ? (
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--right"
              onClick={showNext}
              aria-label="Next product image"
            >
              &#10095;
            </button>
          ) : null}

          <span className="product-gallery__counter">
            {activeIndex + 1} /{" "}
            {productImages.length}
          </span>
        </div>

        {productImages.length > 1 ? (
          <>
            <div className="product-gallery__thumbs">
              {productImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      activeIndex === index
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveIndex(index)
                    }
                  >
                    <img
                      src={image}
                      alt={`${productName} thumbnail ${
                        index + 1
                      }`}
                    />
                  </button>
                )
              )}
            </div>

            <div className="product-gallery__dots">
              {productImages.map(
                (_, index) => (
                  <button
                    type="button"
                    key={index}
                    className={
                      activeIndex === index
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Open image ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          </>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="product-gallery-lightbox"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="product-gallery-lightbox__close"
            onClick={() =>
              setLightboxOpen(false)
            }
          >
            Close
          </button>

          {productImages.length > 1 ? (
            <button
              type="button"
              className="product-gallery-lightbox__arrow product-gallery-lightbox__arrow--left"
              onClick={showPrevious}
            >
              &#10094;
            </button>
          ) : null}

          <img
            src={activeImage}
            alt={`${productName} large view`}
          />

          {productImages.length > 1 ? (
            <button
              type="button"
              className="product-gallery-lightbox__arrow product-gallery-lightbox__arrow--right"
              onClick={showNext}
            >
              &#10095;
            </button>
          ) : null}

          <span>
            {activeIndex + 1} /{" "}
            {productImages.length}
          </span>
        </div>
      ) : null}
    </>
  );
};

export default ProductGallery;