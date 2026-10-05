import React, { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./PropertyGallery.css";

const PropertyGallery = ({ data = [], videos = [] }) => {
  // console.log("from_gallery_images", data);
  // console.log("from_gallery_videos", videos);

  // ============================================================
  // MEDIA TYPE CHECK
  // ============================================================

  const isVideo = (media) => {
    if (!media) return false;

    if (media.media_type === "video") {
      return true;
    }

    if (media.mime_type?.startsWith("video/")) {
      return true;
    }

    if (media.type === "video") {
      return true;
    }

    const url = media.url?.split("?")[0]?.toLowerCase() || "";

    return (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.endsWith(".mov")
    );
  };

  // ============================================================
  // PREVIEW
  // ============================================================

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // ============================================================
  // MOBILE / TABLET SCROLL
  // ============================================================

  const scrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ============================================================
  // MEDIA ARRANGEMENT
  //
  // data:
  //   data[0] = cover image
  //   data[1...] = property images
  //
  // videos:
  //   all videos
  //
  // Final order:
  //   cover
  //   property images
  //   videos
  // ============================================================

  const coverImage = data[0];

  const propertyImages = data.slice(1);

  const galleryMedia = [
    ...propertyImages,
    ...(Array.isArray(videos) ? videos : []),
  ];

  // Complete media list used by preview modal
  const allMedia = [
    ...(Array.isArray(data) ? data : []),
    ...(Array.isArray(videos) ? videos : []),
  ];

  // ============================================================
  // DESKTOP VISIBLE MEDIA
  //
  // Cover = 1
  // Gallery slots = 4
  //
  // galleryMedia[0] -> bottom wide
  // galleryMedia[1] -> top
  // galleryMedia[2] -> top
  // galleryMedia[3] -> top
  //
  // IMPORTANT:
  // Because galleryMedia contains all images first and videos
  // afterward, images will always occupy the top slots first.
  // ============================================================

  const desktopGalleryVisible = galleryMedia.slice(0, 4);

  // Total media remaining after:
  // cover + 4 gallery media
  const remainingCount = Math.max(allMedia.length - 5, 0);

  // Mobile/tablet keeps the existing behavior
  const visible = allMedia.slice(0, 5);

  // ============================================================
  // OPEN PREVIEW
  // ============================================================

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  // ============================================================
  // PREVIEW NAVIGATION
  // ============================================================

  const showPreviousImage = () => {
    setPreviewIndex((current) => (current === 0 ? current : current - 1));
  };

  const showNextImage = () => {
    setPreviewIndex((current) =>
      current === allMedia.length - 1 ? current : current + 1,
    );
  };

  // ============================================================
  // MOBILE / TABLET SCROLL TRACKING
  // ============================================================

  const checkCurrentSlide = () => {
    const el = scrollRef.current;

    if (!el) return;

    const slides = Array.from(el.children);

    if (!slides.length) return;

    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - el.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentSlide(closestIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    checkCurrentSlide();

    el.addEventListener("scroll", checkCurrentSlide);
    window.addEventListener("resize", checkCurrentSlide);

    return () => {
      el.removeEventListener("scroll", checkCurrentSlide);
      window.removeEventListener("resize", checkCurrentSlide);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length]);

  // ============================================================
  // MOBILE / TABLET STRIP NAVIGATION
  // ============================================================

  const scrollStripTo = (index) => {
    const el = scrollRef.current;

    if (!el) return;

    const slides = el.children;

    if (!slides[index]) return;

    const targetSlide = slides[index];

    el.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: "smooth",
    });

    setCurrentSlide(index);
  };

  const scrollStripBy = (direction) => {
    const nextIndex =
      direction === "left" ? currentSlide - 1 : currentSlide + 1;

    if (nextIndex < 0 || nextIndex >= visible.length) {
      return;
    }

    scrollStripTo(nextIndex);
  };

  const isAtStart = currentSlide === 0;
  const isAtEnd = currentSlide === visible.length - 1;

  // ============================================================
  // NO MEDIA
  // ============================================================

  if (!allMedia.length || !coverImage) {
    return null;
  }

  return (
    <div className="w-full mb-10">
      {/* ========================================================
          MOBILE & TABLET
          ======================================================== */}

      <div className="relative lg:hidden w-[90%] mx-auto">
        <button
          type="button"
          onClick={() => scrollStripBy("left")}
          disabled={isAtStart}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
            isAtStart ? "bg-gray-300 cursor-not-allowed" : "bg-secondary"
          }`}
        >
          <LeftOutlined className="text-base" />
        </button>

        <button
          type="button"
          onClick={() => scrollStripBy("right")}
          disabled={isAtEnd}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
            isAtEnd ? "bg-gray-300 cursor-not-allowed" : "bg-secondary"
          }`}
        >
          <RightOutlined className="text-base" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((media, index) => {
            const showOverlay =
              index === visible.length - 1 && remainingCount > 0;

            return (
              <button
                key={media.id ?? `${media.url}-${index}`}
                type="button"
                onClick={() => openPreview(index)}
                className="relative h-64 sm:h-72 w-full shrink-0 snap-start overflow-hidden rounded-lg min-w-0 min-h-0"
              >
                {isVideo(media) ? (
                  <video
                    src={media.url}
                    className="block h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={media.alt || "Property"}
                    className="block h-full w-full object-cover"
                  />
                )}

                {showOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-lg font-semibold text-white">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          DESKTOP
          COVER LEFT
          FIRST GALLERY MEDIA BELOW
          NEXT 3 MEDIA ON TOP
          ======================================================== */}

      <div className="hidden lg:grid lg:grid-cols-2 gap-2 lg:h-96">
        {/* ======================================================
            COVER IMAGE
            ====================================================== */}

        <button
          type="button"
          onClick={() => openPreview(0)}
          className="relative h-full w-full min-w-0 min-h-0 overflow-hidden rounded-lg"
        >
          {isVideo(coverImage) ? (
            <video
              src={coverImage.url}
              className="block h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={coverImage.url}
              alt={coverImage.alt || "Property"}
              className="block h-full w-full object-cover"
            />
          )}
        </button>

        {/* ======================================================
            RIGHT SIDE GALLERY
            ====================================================== */}

        {desktopGalleryVisible.length > 0 && (
          <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full min-h-0">
            {/* ==================================================
                TOP ROW
                galleryMedia[1]
                galleryMedia[2]
                galleryMedia[3]

                Because galleryMedia contains:
                images first, then videos,

                images will fill these slots first.

                If there are only 3 property images:
                image2 + image3 + video1

                If there are more images:
                image2 + image3 + image4
                ================================================== */}

            {desktopGalleryVisible.slice(1, 4).map((media, i) => {
              // galleryMedia starts after cover
              //
              // galleryMedia[0] = allMedia[1]
              // galleryMedia[1] = allMedia[2]
              // galleryMedia[2] = allMedia[3]
              // galleryMedia[3] = allMedia[4]

              const galleryIndex = i + 1;

              const previewIndex = galleryIndex + 1;

              const topMedia = desktopGalleryVisible.slice(1, 4);

              const isLastTopMedia = i === topMedia.length - 1;

              const showOverlay = isLastTopMedia && remainingCount > 0;

              return (
                <button
                  key={media.id ?? `${media.url}-${previewIndex}`}
                  type="button"
                  onClick={() => openPreview(previewIndex)}
                  className="relative min-w-0 min-h-0 overflow-hidden rounded-lg"
                >
                  {isVideo(media) ? (
                    <video
                      src={media.url}
                      className="block h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={media.alt || "Property"}
                      className="block h-full w-full object-cover"
                    />
                  )}

                  {showOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-lg font-semibold text-white">
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* ==================================================
                BOTTOM ROW
                FIRST GALLERY MEDIA
                ================================================== */}

            {desktopGalleryVisible[0] && (
              <button
                type="button"
                onClick={() => openPreview(1)}
                className="relative col-span-3 min-w-0 min-h-0 overflow-hidden rounded-lg"
              >
                {isVideo(desktopGalleryVisible[0]) ? (
                  <video
                    src={desktopGalleryVisible[0].url}
                    className="block h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={desktopGalleryVisible[0].url}
                    alt={desktopGalleryVisible[0].alt || "Property"}
                    className="block h-full w-full object-cover"
                  />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          PREVIEW MODAL
          ======================================================== */}

      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        closable={false}
        centered
        width="fit-content"
        className="image-preview-modal"
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.65)",
          },

          content: {
            padding: 0,
            margin: 0,
            background: "transparent",
            boxShadow: "none",
            borderRadius: 0,
          },

          body: {
            padding: 0,
            margin: 0,
          },
        }}
      >
        <div className="image-preview-shell">
          {/* Header */}

          <div className="image-preview-header">
            <span>
              {isVideo(allMedia[previewIndex])
                ? "Video Preview"
                : "Image Preview"}
            </span>

            <button
              type="button"
              className="image-preview-close"
              onClick={() => setPreviewVisible(false)}
            >
              <CloseOutlined />
            </button>
          </div>

          {/* ==================================================
              MEDIA + ARROWS
              ================================================== */}

          <div className="image-preview-row">
            {/* Previous */}

            <button
              type="button"
              className="image-preview-arrow image-preview-arrow-left"
              onClick={showPreviousImage}
              disabled={previewIndex === 0}
            >
              <LeftOutlined />
            </button>

            {/* ==================================================
                IMAGE
                ================================================== */}

            {allMedia[previewIndex] && !isVideo(allMedia[previewIndex]) && (
              <img
                key={allMedia[previewIndex].id ?? previewIndex}
                src={allMedia[previewIndex].url}
                alt={`Preview ${previewIndex + 1}`}
                className="image-preview-image"
              />
            )}

            {/* ==================================================
                VIDEO
                ================================================== */}

            {allMedia[previewIndex] && isVideo(allMedia[previewIndex]) && (
              <video
                key={allMedia[previewIndex].id ?? previewIndex}
                src={allMedia[previewIndex].url}
                className="video-preview-player"
                controls
                playsInline
                preload="metadata"
              />
            )}

            {/* Next */}

            <button
              type="button"
              className="image-preview-arrow image-preview-arrow-right"
              onClick={showNextImage}
              disabled={previewIndex === allMedia.length - 1}
            >
              <RightOutlined />
            </button>
          </div>

          {/* Counter */}

          <div className="image-preview-count">
            {previewIndex + 1} / {allMedia.length}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyGallery;
