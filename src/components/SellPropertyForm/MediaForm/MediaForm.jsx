import React, { useEffect, useRef, useState } from "react";
import { Modal, Slider } from "antd";
import {
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";

import FormNavigationButtons from "../../formNavButtons";

import { postUpload } from "../../../api/upload.api";
import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";

import { useSellProperty } from "../../../context/SellPropertyContext";

import "../mediaForm/MediaForm.css";
import { useNavigate } from "react-router-dom";
import StatusMessage, { showStatusMessage } from "../../common/MessagePopup";
import { useAuth } from "../../../context/UserContext";

// ============================================================
// FILE SIZE LIMITS
// ============================================================

const IMAGE_MAX_SIZE = 3 * 1024 * 1024;
const VIDEO_MAX_SIZE = 20 * 1024 * 1024;
const DOCUMENT_MAX_SIZE = 5 * 1024 * 1024;
const PATTA_MAX_SIZE = 5 * 1024 * 1024;

// ============================================================
// MEDIA COUNT LIMITS
// ============================================================

const IMAGE_MIN_COUNT = 3;
const IMAGE_MAX_COUNT = 5;

const VIDEO_MIN_COUNT = 1;
const VIDEO_MAX_COUNT = 2;

const DOCUMENT_MIN_COUNT = 1;
const DOCUMENT_MAX_COUNT = 2;

const PATTA_MIN_COUNT = 1;
const PATTA_MAX_COUNT = 5;

// ============================================================
// COVER IMAGE CROP SETTINGS
// ============================================================

const COVER_IMAGE_WIDTH = 1200;
const COVER_IMAGE_HEIGHT = 675;

const COVER_ASPECT_RATIO = COVER_IMAGE_WIDTH / COVER_IMAGE_HEIGHT;

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;
const ROTATE_STEP = 90;

// ============================================================
// HELPERS
// ============================================================

const formatFileSize = (bytes) => {
  if (!bytes) return "";

  const mb = bytes / (1024 * 1024);

  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
};

const getSizeError = (file, maxSize, type) => {
  if (!file) return null;

  if (file.size > maxSize) {
    return `${type} exceeds the allowed size`;
  }

  return null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeRotation = (deg) => {
  let d = deg % 360;

  if (d > 180) d -= 360;
  if (d < -180) d += 360;

  return d;
};

// ============================================================
// EXISTING MEDIA HELPERS
// ============================================================

const isPdfUrl = (url) => {
  if (!url) return false;

  return url.toLowerCase().split("?")[0].endsWith(".pdf");
};

const getExistingMediaName = (media, fallback) => {
  if (media?.file?.name) {
    return media.file.name;
  }

  return fallback;
};

// ============================================================
// COVER IMAGE CROP MODAL
// ============================================================

const CoverCropModal = ({ open, imageFile, onCancel, onSave }) => {
  const frameRef = useRef(null);
  const imgElRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);

  const [naturalSize, setNaturalSize] = useState({
    w: 0,
    h: 0,
  });

  const [frameSize, setFrameSize] = useState({
    w: 0,
    h: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });

  const dragState = useRef(null);

  // ----------------------------------------------------------
  // LOAD IMAGE
  // ----------------------------------------------------------

  useEffect(() => {
    if (!open || !imageFile) {
      setImageSrc(null);

      setNaturalSize({
        w: 0,
        h: 0,
      });

      setFrameSize({
        w: 0,
        h: 0,
      });

      setZoom(1);
      setRotation(0);

      setPos({
        x: 0,
        y: 0,
      });

      return;
    }

    let cancelled = false;

    const reader = new FileReader();

    reader.onload = () => {
      if (cancelled) return;

      setImageSrc(reader.result);
    };

    reader.onerror = () => {
      if (cancelled) return;

      setImageSrc(null);

      showStatusMessage({
        type: "error",
        text: "Unable to load the cover image",
      });
    };

    reader.readAsDataURL(imageFile);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [open, imageFile]);

  // ----------------------------------------------------------
  // IMAGE LOADED
  // ----------------------------------------------------------

  const handleImageLoad = (e) => {
    const img = e.currentTarget;

    setNaturalSize({
      w: img.naturalWidth,
      h: img.naturalHeight,
    });
  };

  // ----------------------------------------------------------
  // MEASURE FRAME
  // ----------------------------------------------------------

  const measureFrame = () => {
    if (!frameRef.current) return;

    const rect = frameRef.current.getBoundingClientRect();

    setFrameSize({
      w: rect.width,
      h: rect.height,
    });
  };

  // ----------------------------------------------------------
  // MEASURE FRAME WHEN MODAL OPENS
  // ----------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      measureFrame();
    }, 50);

    const observer = new ResizeObserver(() => {
      measureFrame();
    });

    if (frameRef.current) {
      observer.observe(frameRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [open]);

  // ----------------------------------------------------------
  // CALCULATE BASE SCALE
  // ----------------------------------------------------------

  const computeBaseScale = (rotationDeg) => {
    if (!naturalSize.w || !frameSize.w) {
      return 0;
    }

    const rad = (rotationDeg * Math.PI) / 180;

    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    const bboxWAtScale1 = naturalSize.w * cos + naturalSize.h * sin;

    const bboxHAtScale1 = naturalSize.w * sin + naturalSize.h * cos;

    return Math.max(frameSize.w / bboxWAtScale1, frameSize.h / bboxHAtScale1);
  };

  const baseScale = computeBaseScale(rotation);

  const effectiveScale = baseScale * zoom;

  // ----------------------------------------------------------
  // GET ROTATED BOUNDING BOX
  // ----------------------------------------------------------

  const getBBoxSize = (scale, rotationDeg) => {
    if (!naturalSize.w || !scale) {
      return {
        w: 0,
        h: 0,
      };
    }

    const rad = (rotationDeg * Math.PI) / 180;

    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));

    return {
      w: (naturalSize.w * cos + naturalSize.h * sin) * scale,

      h: (naturalSize.w * sin + naturalSize.h * cos) * scale,
    };
  };

  const bboxSize = getBBoxSize(effectiveScale, rotation);

  // ----------------------------------------------------------
  // RESET CROP
  // ----------------------------------------------------------

  useEffect(() => {
    if (!naturalSize.w || !naturalSize.h || !frameSize.w || !frameSize.h) {
      return;
    }

    const scale = computeBaseScale(0);

    const dispW = naturalSize.w * scale;

    const dispH = naturalSize.h * scale;

    setZoom(1);

    setRotation(0);

    setPos({
      x: (frameSize.w - dispW) / 2,
      y: (frameSize.h - dispH) / 2,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize.w, naturalSize.h, frameSize.w, frameSize.h]);

  // ----------------------------------------------------------
  // CLAMP POSITION
  // ----------------------------------------------------------

  const clampPos = (candidate, zoomValue, rotationValue) => {
    const scale = computeBaseScale(rotationValue) * zoomValue;

    const { w: bboxW, h: bboxH } = getBBoxSize(scale, rotationValue);

    const minX = frameSize.w - bboxW;

    const minY = frameSize.h - bboxH;

    return {
      x: clamp(candidate.x, Math.min(minX, 0), 0),

      y: clamp(candidate.y, Math.min(minY, 0), 0),
    };
  };

  // ----------------------------------------------------------
  // ZOOM
  // ----------------------------------------------------------

  const handleZoomChange = (value) => {
    setZoom(value);

    setPos((prev) => clampPos(prev, value, rotation));
  };

  const handleZoomOut = () => {
    const next = clamp(zoom - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);

    setZoom(next);

    setPos((prev) => clampPos(prev, next, rotation));
  };

  const handleZoomIn = () => {
    const next = clamp(zoom + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);

    setZoom(next);

    setPos((prev) => clampPos(prev, next, rotation));
  };

  // ----------------------------------------------------------
  // ROTATION
  // ----------------------------------------------------------

  const handleRotateChange = (value) => {
    setRotation(value);

    setPos((prev) => clampPos(prev, zoom, value));
  };

  const handleRotateLeft = () => {
    const next = normalizeRotation(rotation - ROTATE_STEP);

    setRotation(next);

    setPos((prev) => clampPos(prev, zoom, next));
  };

  const handleRotateRight = () => {
    const next = normalizeRotation(rotation + ROTATE_STEP);

    setRotation(next);

    setPos((prev) => clampPos(prev, zoom, next));
  };

  // ----------------------------------------------------------
  // DRAG
  // ----------------------------------------------------------

  const handlePointerDown = (e) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: pos,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) {
      return;
    }

    const dx = e.clientX - dragState.current.startX;

    const dy = e.clientY - dragState.current.startY;

    const next = {
      x: dragState.current.startPos.x + dx,

      y: dragState.current.startPos.y + dy,
    };

    setPos(clampPos(next, zoom, rotation));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  // ----------------------------------------------------------
  // SAVE CROPPED IMAGE
  // ----------------------------------------------------------

  const handleSave = () => {
    if (
      !imgElRef.current ||
      !frameSize.w ||
      !frameSize.h ||
      !naturalSize.w ||
      !naturalSize.h ||
      !imageFile
    ) {
      showStatusMessage({
        type: "error",
        text: "Unable to process the cover image",
      });

      return;
    }

    const outputScale = COVER_IMAGE_WIDTH / frameSize.w;

    const canvas = document.createElement("canvas");

    canvas.width = COVER_IMAGE_WIDTH;

    canvas.height = COVER_IMAGE_HEIGHT;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      showStatusMessage({
        type: "error",
        text: "Unable to process the cover image",
      });

      return;
    }

    ctx.save();

    ctx.translate(pos.x * outputScale, pos.y * outputScale);

    ctx.translate(
      (bboxSize.w * outputScale) / 2,
      (bboxSize.h * outputScale) / 2,
    );

    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = naturalSize.w * effectiveScale * outputScale;

    const drawH = naturalSize.h * effectiveScale * outputScale;

    ctx.drawImage(imgElRef.current, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          showStatusMessage({
            type: "error",
            text: "Unable to create the cropped image",
          });

          return;
        }

        const croppedFile = new File([blob], imageFile.name || "cover.jpg", {
          type: "image/jpeg",
        });

        onSave(croppedFile);
      },
      "image/jpeg",
      0.92,
    );
  };

  // ----------------------------------------------------------
  // RENDER CROP MODAL
  // ----------------------------------------------------------

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Edit Cover Image"
      okText="Save"
      cancelText="Cancel"
      onOk={handleSave}
      width={620}
      centered
      destroyOnHidden
      afterOpenChange={(isOpen) => {
        if (isOpen) {
          requestAnimationFrame(() => {
            measureFrame();
          });
        }
      }}
    >
      <div
        ref={frameRef}
        className="
          relative
          w-full
          overflow-hidden
          rounded-lg
          bg-black
          touch-none
          select-none
          cursor-move
        "
        style={{
          aspectRatio: COVER_ASPECT_RATIO,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {imageSrc && (
          <div
            className="
              absolute
              top-0
              left-0
              pointer-events-none
            "
            style={{
              width: bboxSize.w || undefined,

              height: bboxSize.h || undefined,

              transform: `translate(${pos.x}px, ${pos.y}px)`,
            }}
          >
            <img
              ref={imgElRef}
              src={imageSrc}
              alt="crop preview"
              draggable={false}
              onLoad={handleImageLoad}
              className="
                absolute
                top-1/2
                left-1/2
                block
              "
              style={{
                width: naturalSize.w * effectiveScale || undefined,

                height: naturalSize.h * effectiveScale || undefined,

                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,

                maxWidth: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* Zoom */}

      <div className="flex items-center gap-x-3 mt-4">
        <button
          type="button"
          onClick={handleZoomOut}
          className="
            text-gray-500
            hover:text-gray-700
            shrink-0
          "
        >
          <MinusOutlined />
        </button>

        <Slider
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          onChange={handleZoomChange}
          className="flex-1"
          tooltip={{
            open: false,
          }}
        />

        <button
          type="button"
          onClick={handleZoomIn}
          className="
            text-gray-500
            hover:text-gray-700
            shrink-0
          "
        >
          <PlusOutlined />
        </button>
      </div>

      {/* Rotate */}

      <div className="flex items-center gap-x-3 mt-3">
        <button
          type="button"
          onClick={handleRotateLeft}
          className="
            text-gray-500
            hover:text-gray-700
            shrink-0
          "
        >
          <RotateLeftOutlined />
        </button>

        <Slider
          min={-180}
          max={180}
          step={1}
          value={rotation}
          onChange={handleRotateChange}
          className="flex-1"
          tooltip={{
            open: false,
          }}
        />

        <button
          type="button"
          onClick={handleRotateRight}
          className="
            text-gray-500
            hover:text-gray-700
            shrink-0
          "
        >
          <RotateRightOutlined />
        </button>
      </div>
    </Modal>
  );
};

// ============================================================
// MAIN MEDIA UPLOAD FORM
// ============================================================

const MediaUploadForm = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { propertyId, updateFormData, formData, mode } = useSellProperty();

  const [coverImage, setCoverImage] = useState(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [images, setImages] = useState([]);

  const [videos, setVideos] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [pattas, setPattas] = useState([]);

  const [previewVisible, setPreviewVisible] = useState(false);

  const [previewIndex, setPreviewIndex] = useState(0);

  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);

  const [videoPreviewIndex, setVideoPreviewIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const coverInputRef = useRef(null);

  const imagesInputRef = useRef(null);

  const videosInputRef = useRef(null);

  const documentsInputRef = useRef(null);

  const pattaInputRef = useRef(null);

  // ==========================================================
  // RESTORE EXISTING MEDIA IN EDIT MODE
  // ==========================================================

  useEffect(() => {
    if (mode !== "edit") return;

    const savedMedia = formData?.media;

    if (!savedMedia) return;

    // COVER
    if (savedMedia.cover) {
      setCoverImage({
        id: savedMedia.cover.id,
        url: savedMedia.cover.url,
        file: null,
        error: null,
        isExisting: true,
      });
    }

    // IMAGES
    if (Array.isArray(savedMedia.images)) {
      setImages(
        savedMedia.images.map((image) => ({
          id: image.id,
          url: image.url,
          file: null,
          error: null,
          isExisting: true,
        })),
      );
    }

    // VIDEOS
    if (Array.isArray(savedMedia.videos)) {
      setVideos(
        savedMedia.videos.map((video) => ({
          id: video.id,
          url: video.url,
          file: null,
          error: null,
          isExisting: true,
        })),
      );
    }

    // DOCUMENTS
    if (Array.isArray(savedMedia.documents)) {
      setDocuments(
        savedMedia.documents.map((document) => ({
          id: document.id,
          url: document.url,
          file: null,
          error: null,
          isExisting: true,
        })),
      );
    }

    // PATTA
    if (Array.isArray(savedMedia.patta)) {
      setPattas(
        savedMedia.patta.map((patta) => ({
          id: patta.id,
          url: patta.url,
          file: null,
          error: null,
          isExisting: true,
        })),
      );
    }
  }, [mode, formData?.media]);

  // ==========================================================
  // COVER IMAGE
  // ==========================================================

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const error = getSizeError(file, IMAGE_MAX_SIZE, "Cover image");

    if (error) {
      showStatusMessage({
        type: "error",
        text: "Cover image exceeds the allowed size of 3 MB",
      });
    }

    setCoverImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }

      return {
        file,
        url: URL.createObjectURL(file),
        error,
        isExisting: false,
      };
    });

    e.target.value = "";
  };

  // ==========================================================
  // COVER CROP SAVE
  // ==========================================================

  const handleCropSave = (croppedFile) => {
    const error = getSizeError(croppedFile, IMAGE_MAX_SIZE, "Cover image");

    if (error) {
      showStatusMessage({
        type: "error",
        text: "Cropped cover image exceeds the allowed size of 3 MB",
      });
    }

    setCoverImage((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }

      return {
        file: croppedFile,
        url: URL.createObjectURL(croppedFile),
        error,
        isExisting: false,
      };
    });

    setIsCropModalOpen(false);
  };

  // ==========================================================
  // IMAGES
  // ==========================================================

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const remainingSlots = IMAGE_MAX_COUNT - images.length;

    if (remainingSlots <= 0) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${IMAGE_MAX_COUNT} property images are allowed`,
      });

      e.target.value = "";

      return;
    }

    if (files.length > remainingSlots) {
      showStatusMessage({
        type: "error",
        text: `You can upload a maximum of ${IMAGE_MAX_COUNT} property images`,
      });
    }

    const allowedFiles = files.slice(0, remainingSlots);

    const newImages = allowedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,

      file,

      url: URL.createObjectURL(file),

      error: getSizeError(file, IMAGE_MAX_SIZE, "Image"),

      isExisting: false,
    }));

    const hasInvalidImages = newImages.some((image) => image.error);

    if (hasInvalidImages) {
      showStatusMessage({
        type: "error",
        text: "One or more images exceed the allowed size of 3 MB",
      });
    }

    setImages((prev) => [...prev, ...newImages]);

    e.target.value = "";
  };

  // ==========================================================
  // VIDEOS
  // ==========================================================

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const remainingSlots = VIDEO_MAX_COUNT - videos.length;

    if (remainingSlots <= 0) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${VIDEO_MAX_COUNT} property videos are allowed`,
      });

      e.target.value = "";

      return;
    }

    if (files.length > remainingSlots) {
      showStatusMessage({
        type: "error",
        text: `You can upload a maximum of ${VIDEO_MAX_COUNT} property videos`,
      });
    }

    const allowedFiles = files.slice(0, remainingSlots);

    const newVideos = allowedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,

      file,

      url: URL.createObjectURL(file),

      error: getSizeError(file, VIDEO_MAX_SIZE, "Video"),

      isExisting: false,
    }));

    const hasInvalidVideos = newVideos.some((video) => video.error);

    if (hasInvalidVideos) {
      showStatusMessage({
        type: "error",
        text: "One or more videos exceed the allowed size of 20 MB",
      });
    }

    setVideos((prev) => [...prev, ...newVideos]);

    e.target.value = "";
  };

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const remainingSlots = DOCUMENT_MAX_COUNT - documents.length;

    if (remainingSlots <= 0) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${DOCUMENT_MAX_COUNT} property documents are allowed`,
      });

      e.target.value = "";

      return;
    }

    if (files.length > remainingSlots) {
      showStatusMessage({
        type: "error",
        text: `You can upload a maximum of ${DOCUMENT_MAX_COUNT} property documents`,
      });
    }

    const allowedFiles = files.slice(0, remainingSlots);

    const newDocs = allowedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,

      file,

      url: null,

      error: getSizeError(file, DOCUMENT_MAX_SIZE, "Document"),

      isExisting: false,
    }));

    const hasInvalidDocuments = newDocs.some((document) => document.error);

    if (hasInvalidDocuments) {
      showStatusMessage({
        type: "error",
        text: "One or more documents exceed the allowed size of 5 MB",
      });
    }

    setDocuments((prev) => [...prev, ...newDocs]);

    e.target.value = "";
  };

  // ==========================================================
  // PATTA
  // ==========================================================

  const handlePattaChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const remainingSlots = PATTA_MAX_COUNT - pattas.length;

    if (remainingSlots <= 0) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${PATTA_MAX_COUNT} patta images are allowed`,
      });

      e.target.value = "";

      return;
    }

    if (files.length > remainingSlots) {
      showStatusMessage({
        type: "error",
        text: `You can upload a maximum of ${PATTA_MAX_COUNT} patta documents`,
      });
    }

    const allowedFiles = files.slice(0, remainingSlots);

    const newPattas = allowedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,

      file,

      url: URL.createObjectURL(file),

      error: getSizeError(file, PATTA_MAX_SIZE, "Patta"),

      isExisting: false,
    }));

    const hasInvalidPattas = newPattas.some((patta) => patta.error);

    if (hasInvalidPattas) {
      showStatusMessage({
        type: "error",
        text: "One or more patta images exceed the allowed size of 10 MB",
      });
    }

    setPattas((prev) => [...prev, ...newPattas]);

    e.target.value = "";
  };

  // ==========================================================
  // REMOVE COVER
  // ==========================================================

  const removeCover = () => {
    if (coverImage?.url) {
      if (!coverImage.isExisting) {
        URL.revokeObjectURL(coverImage.url);
      }
    }

    setCoverImage(null);
  };

  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removeImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);

      if (imageToRemove?.url && !imageToRemove.isExisting) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  // ==========================================================
  // REMOVE VIDEO
  // ==========================================================

  const removeVideo = (id) => {
    setVideos((prev) => {
      const videoToRemove = prev.find((vid) => vid.id === id);

      if (videoToRemove?.url && !videoToRemove.isExisting) {
        URL.revokeObjectURL(videoToRemove.url);
      }

      return prev.filter((vid) => vid.id !== id);
    });
  };

  // ==========================================================
  // REMOVE DOCUMENT
  // ==========================================================

  const removeDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // ==========================================================
  // REMOVE PATTA
  // ==========================================================

  const removePatta = (id) => {
    setPattas((prev) => {
      const pattaToRemove = prev.find((patta) => patta.id === id);

      if (pattaToRemove?.url && !pattaToRemove.isExisting) {
        URL.revokeObjectURL(pattaToRemove.url);
      }

      return prev.filter((patta) => patta.id !== id);
    });
  };

  // ==========================================================
  // PREVIEW NAVIGATION
  // ==========================================================

  const showPreviousImage = () => {
    setPreviewIndex((current) =>
      current > 0 ? current - 1 : images.length - 1,
    );
  };

  const showNextImage = () => {
    setPreviewIndex((current) =>
      current < images.length - 1 ? current + 1 : 0,
    );
  };

  const showPreviousVideo = () => {
    setVideoPreviewIndex((current) =>
      current > 0 ? current - 1 : videos.length - 1,
    );
  };

  const showNextVideo = () => {
    setVideoPreviewIndex((current) =>
      current < videos.length - 1 ? current + 1 : 0,
    );
  };

  // ==========================================================
  // INVALID MEDIA CHECK
  // ==========================================================

  const hasInvalidMedia =
    Boolean(coverImage?.error) ||
    images.some((image) => image.error) ||
    videos.some((video) => video.error) ||
    documents.some((document) => document.error) ||
    pattas.some((patta) => patta.error);

  // ==========================================================
  // SUBMIT DISABLED CHECK
  // ==========================================================

  const isSubmitDisabled =
    hasInvalidMedia ||
    !coverImage ||
    images.length < IMAGE_MIN_COUNT ||
    images.length > IMAGE_MAX_COUNT ||
    videos.length < VIDEO_MIN_COUNT ||
    videos.length > VIDEO_MAX_COUNT ||
    documents.length < DOCUMENT_MIN_COUNT ||
    documents.length > DOCUMENT_MAX_COUNT ||
    pattas.length < PATTA_MIN_COUNT ||
    pattas.length > PATTA_MAX_COUNT ||
    isSubmitting;

  // ==========================================================
  // UPLOAD ONE FILE
  // ==========================================================

  const uploadSingleFile = async (file) => {
    if (!file) {
      throw new Error("File is missing");
    }

    const response = await postUpload(file);

    if (
      !response?.data ||
      !Array.isArray(response.data) ||
      !response.data.length
    ) {
      throw new Error("Media upload failed");
    }

    return response.data[0].id;
  };

  // ==========================================================
  // FINAL SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    // ------------------------------------------------------
    // INVALID MEDIA
    // ------------------------------------------------------

    if (hasInvalidMedia) {
      showStatusMessage({
        type: "error",
        text: "Please remove or replace the invalid media files",
      });

      return;
    }

    // ------------------------------------------------------
    // COVER
    // ------------------------------------------------------

    if (!coverImage) {
      showStatusMessage({
        type: "error",
        text: "Please upload a cover image",
      });

      return;
    }

    // ------------------------------------------------------
    // PROPERTY IMAGES
    // ------------------------------------------------------

    if (images.length < IMAGE_MIN_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Please upload at least ${IMAGE_MIN_COUNT} property images`,
      });

      return;
    }

    if (images.length > IMAGE_MAX_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${IMAGE_MAX_COUNT} property images are allowed`,
      });

      return;
    }

    // ------------------------------------------------------
    // VIDEOS
    // ------------------------------------------------------

    if (videos.length < VIDEO_MIN_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Please upload at least ${VIDEO_MIN_COUNT} property video`,
      });

      return;
    }

    if (videos.length > VIDEO_MAX_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${VIDEO_MAX_COUNT} property videos are allowed`,
      });

      return;
    }

    // ------------------------------------------------------
    // DOCUMENTS
    // ------------------------------------------------------

    if (documents.length < DOCUMENT_MIN_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Please upload at least ${DOCUMENT_MIN_COUNT} property document`,
      });

      return;
    }

    if (documents.length > DOCUMENT_MAX_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${DOCUMENT_MAX_COUNT} property documents are allowed`,
      });

      return;
    }

    // ------------------------------------------------------
    // PATTA
    // ------------------------------------------------------

    if (pattas.length < PATTA_MIN_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Please upload at least ${PATTA_MIN_COUNT} patta image`,
      });

      return;
    }

    if (pattas.length > PATTA_MAX_COUNT) {
      showStatusMessage({
        type: "error",
        text: `Maximum ${PATTA_MAX_COUNT} patta images are allowed`,
      });

      return;
    }

    // ------------------------------------------------------
    // PREVENT DUPLICATE SUBMIT
    // ------------------------------------------------------

    if (isSubmitting) {
      return;
    }

    // ------------------------------------------------------
    // PROPERTY ID CHECK
    // ------------------------------------------------------

    if (!propertyId) {
      console.error("Property ID is missing");

      showStatusMessage({
        type: "error",
        text: "Property ID is missing",
      });

      return;
    }

    try {
      setIsSubmitting(true);

      // ----------------------------------------------------
      // 1. COVER
      // ----------------------------------------------------

      let coverId = null;

      if (coverImage.isExisting) {
        coverId = coverImage.id;
      } else if (coverImage.file) {
        coverId = await uploadSingleFile(coverImage.file);
      }

      // ----------------------------------------------------
      // 2. PROPERTY IMAGES
      // ----------------------------------------------------

      const imageIds = await Promise.all(
        images.map(async (image) => {
          if (image.isExisting) {
            return image.id;
          }

          return uploadSingleFile(image.file);
        }),
      );

      // ----------------------------------------------------
      // 3. PROPERTY VIDEOS
      // ----------------------------------------------------

      const videoIds = await Promise.all(
        videos.map(async (video) => {
          if (video.isExisting) {
            return video.id;
          }

          return uploadSingleFile(video.file);
        }),
      );

      // ----------------------------------------------------
      // 4. DOCUMENTS
      // ----------------------------------------------------

      const documentIds = await Promise.all(
        documents.map(async (document) => {
          if (document.isExisting) {
            return document.id;
          }

          return uploadSingleFile(document.file);
        }),
      );

      // ----------------------------------------------------
      // 5. PATTA
      // ----------------------------------------------------

      const pattaIds = await Promise.all(
        pattas.map(async (patta) => {
          if (patta.isExisting) {
            return patta.id;
          }

          return uploadSingleFile(patta.file);
        }),
      );

      // ----------------------------------------------------
      // 6. STORE IDS IN CONTEXT
      // ----------------------------------------------------

      updateFormData("media", "cover", coverId);

      updateFormData("media", "pr_img", imageIds);

      updateFormData("media", "pr_vid", videoIds);

      updateFormData("media", "pr_doc", documentIds);

      updateFormData("media", "patta", pattaIds);

      // ----------------------------------------------------
      // 7. FINAL PAYLOAD
      // ----------------------------------------------------

      const now = new Date();

      const requestedAt = now.toISOString().slice(0, 19).replace("T", " ");

      const payload = {
        step: 4,

        user_id: user?.id,

        prop_id: propertyId,

        cover: coverId,

        pr_img: imageIds,

        pr_vid: videoIds,

        pr_doc: documentIds,

        patta: pattaIds,

        status: "requested",

        requested_at: requestedAt,
      };

      // ----------------------------------------------------
      // 8. SAVE PROPERTY
      // ----------------------------------------------------

      const response = await postSellPropertyForm(payload);

      if (response?.success === 0) {
        throw new Error("Failed to save property media");
      }

      navigate("/dashboard/list-property");
    } catch (error) {
      console.error("Media submit failed:", error);

      showStatusMessage({
        type: "error",
        text: "Unable to complete the property submission. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // PREVIOUS
  // ==========================================================

  const handlePrevious = async () => {
    if (mode === "edit") {
      navigate(`/edit-property/${propertyId}/features`);
    } else {
      navigate("/add-property/features");
    }
  };

  return (
    <>
      <StatusMessage placement="top-center" />

      <div className="w-full max-w-4xl">
        {/* ====================================================
            TITLE
        ==================================================== */}

        <h2 className="text-xl font-semibold text-gray-900">
          Add Photos / Videos of Property
        </h2>

        <p className="text-base text-gray-500 mt-1">
          Upload Photos minimum(3) per photo within 3 mb &amp; Video Minimum(1)
          Per video within 20 mb &amp; document within 5 mb &amp; patta within 5
          mb.
        </p>

        {/* ====================================================
            WARNING
        ==================================================== */}

        <div
          className="
            flex
            items-start
            gap-x-2
            bg-[#fff0b9]
            border
            border-yellow-200
            rounded-lg
            p-4
            mt-4
            text-start
          "
        >
          <InfoCircleOutlined
            className="
              text-yellow-700!
              mt-0.5
              shrink-0
            "
          />

          <p className="text-sm">
            Please ensure that your uploaded photos and videos do not contain
            any personal contact information, including phone numbers, email
            addresses, website URLs, social media handles, or other contact
            details.
          </p>
        </div>

        {/* ====================================================
            COVER IMAGE
        ==================================================== */}

        <div className="mt-6">
          <p
            className="
              text-base
              font-semibold
              text-gray-900
              mb-2
            "
          >
            Upload Cover image
          </p>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleCoverUpload}
          />

          {coverImage ? (
            <div
              className={`
                relative
                rounded-lg
                overflow-hidden
                h-40
                sm:h-48
                md:h-56
                w-full
                border-2
                ${coverImage.error ? "border-red-500" : "border-transparent"}
              `}
            >
              <img
                src={coverImage.url}
                alt="cover"
                className="
                  w-full
                  h-full
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  top-3
                  right-3
                  flex
                  items-center
                  gap-x-2
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    if (coverImage.file) {
                      setIsCropModalOpen(true);
                    }
                  }}
                  disabled={!coverImage.file}
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-white/90
                    flex
                    items-center
                    justify-center
                    text-gray-700
                    hover:bg-white
                  "
                >
                  <EditOutlined />
                </button>

                <button
                  type="button"
                  onClick={removeCover}
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-white/90
                    flex
                    items-center
                    justify-center
                    text-red-500
                    hover:bg-white
                  "
                >
                  <DeleteOutlined />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="
                w-full
                h-24
                sm:h-28
                rounded-lg
                border-2
                border-dashed
                border-gray-300
                bg-[#f2f2f2]
                flex
                flex-col
                items-center
                justify-center
                gap-y-1
                hover:border-secondary
                transition-colors
              "
            >
              <PictureOutlined
                className="
                  text-lg
                  text-gray-400
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-secondary
                "
              >
                Upload Photos
              </span>

              <span className="text-xs text-gray-400 font-semibold">
                Support format jpeg, Png
              </span>
            </button>
          )}
        </div>

        {/* ====================================================
            COVER CROP MODAL
        ==================================================== */}

        <CoverCropModal
          open={isCropModalOpen}
          imageFile={coverImage?.file}
          onCancel={() => setIsCropModalOpen(false)}
          onSave={handleCropSave}
        />

        {/* ====================================================
            PROPERTY PHOTOS / VIDEOS
        ==================================================== */}

        <div className="mt-6">
          <p
            className="
              text-base
              font-semibold
              text-gray-900
              mb-2
            "
          >
            Upload property Photos / Videos
          </p>

          <input
            ref={imagesInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={handleImagesChange}
          />

          <input
            ref={videosInputRef}
            type="file"
            accept="video/mp4"
            multiple
            className="hidden"
            onChange={handleVideosChange}
          />

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >
            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              className="
                h-32
                rounded-lg
                border-2
                border-dashed
                border-gray-300
                bg-[#f2f2f2]
                flex
                flex-col
                items-center
                justify-center
                gap-y-1
                hover:border-secondary
                transition-colors
              "
            >
              <PictureOutlined
                className="
                  text-xl
                  text-gray-400
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-secondary
                "
              >
                Upload Photos
              </span>

              <span className="text-xs text-gray-400 font-semibold">
                Support format jpeg, Png
              </span>
            </button>

            <button
              type="button"
              onClick={() => videosInputRef.current?.click()}
              className="
                h-32
                rounded-lg
                border-2
                border-dashed
                border-gray-300
                bg-[#f2f2f2]
                flex
                flex-col
                items-center
                justify-center
                gap-y-1
                hover:border-secondary
                transition-colors
              "
            >
              <VideoCameraOutlined
                className="
                  text-xl
                  text-gray-400
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-secondary
                "
              >
                Upload Videos
              </span>

              <span className="text-xs text-gray-400 font-semibold">
                Support format mp4
              </span>
            </button>
          </div>
        </div>

        {/* ====================================================
            UPLOADED IMAGES
        ==================================================== */}

        {images.length > 0 && (
          <div className="mt-6">
            <p
              className="
                text-base
                font-semibold
                text-gray-900
                mb-3
              "
            >
              Uploaded Images
            </p>

            <div
              className="
                grid
                grid-cols-3
                sm:grid-cols-4
                md:grid-cols-6
                gap-3
              "
            >
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`
                      relative
                      h-24
                      sm:h-28
                      rounded-lg
                      overflow-hidden
                      border-2
                      ${image.error ? "border-red-500" : "border-transparent"}
                    `}
                >
                  <img
                    src={image.url}
                    alt="uploaded"
                    className="
                        w-full
                        h-full
                        object-cover
                        cursor-pointer
                      "
                    onClick={() => {
                      setPreviewIndex(index);

                      setPreviewVisible(true);
                    }}
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      removeImage(image.id);
                    }}
                    className="
                        absolute
                        top-1.5
                        right-1.5
                        z-10
                        w-6
                        h-6
                        rounded-full
                        bg-white/90
                        flex
                        items-center
                        justify-center
                        text-red-500
                      "
                  >
                    <DeleteOutlined className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            {/* IMAGE PREVIEW MODAL */}

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
                <div className="image-preview-header">
                  <span>Image Preview</span>

                  <button
                    type="button"
                    className="image-preview-close"
                    onClick={() => setPreviewVisible(false)}
                  >
                    <CloseOutlined />
                  </button>
                </div>

                <div className="image-preview-row">
                  <button
                    type="button"
                    className="
                      image-preview-arrow
                      image-preview-arrow-left
                    "
                    onClick={showPreviousImage}
                    disabled={images.length <= 1}
                  >
                    <LeftOutlined />
                  </button>

                  {images[previewIndex] && (
                    <img
                      src={images[previewIndex].url}
                      alt={`Preview ${previewIndex + 1}`}
                      className="image-preview-image"
                    />
                  )}

                  <button
                    type="button"
                    className="
                      image-preview-arrow
                      image-preview-arrow-right
                    "
                    onClick={showNextImage}
                    disabled={images.length <= 1}
                  >
                    <RightOutlined />
                  </button>
                </div>

                <div className="image-preview-count">
                  {previewIndex + 1} / {images.length}
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ====================================================
            UPLOADED VIDEOS
        ==================================================== */}

        {videos.length > 0 && (
          <div className="mt-6">
            <p
              className="
                text-base
                font-semibold
                text-gray-900
                mb-3
              "
            >
              Uploaded Videos
            </p>

            <div
              className="
                grid
                grid-cols-3
                sm:grid-cols-4
                md:grid-cols-6
                gap-3
              "
            >
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`
                      relative
                      h-24
                      sm:h-28
                      rounded-lg
                      overflow-hidden
                      bg-black
                      cursor-pointer
                      border-2
                      ${video.error ? "border-red-500" : "border-transparent"}
                    `}
                  onClick={() => {
                    setVideoPreviewIndex(index);

                    setVideoPreviewVisible(true);
                  }}
                >
                  <video
                    src={video.url}
                    className="
                        w-full
                        h-full
                        object-cover
                      "
                    muted
                    preload="metadata"
                  />

                  <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        pointer-events-none
                      "
                  >
                    <PlayCircleOutlined
                      className="
                          text-white
                          text-2xl
                        "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      removeVideo(video.id);
                    }}
                    className="
                        absolute
                        top-1.5
                        right-1.5
                        z-10
                        w-6
                        h-6
                        rounded-full
                        bg-white/90
                        flex
                        items-center
                        justify-center
                        text-red-500
                      "
                  >
                    <DeleteOutlined className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            {/* VIDEO PREVIEW MODAL */}

            <Modal
              open={videoPreviewVisible}
              onCancel={() => setVideoPreviewVisible(false)}
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
                <div className="image-preview-header">
                  <span>Video Preview</span>

                  <button
                    type="button"
                    className="image-preview-close"
                    onClick={() => setVideoPreviewVisible(false)}
                  >
                    <CloseOutlined />
                  </button>
                </div>

                <div className="image-preview-row">
                  <button
                    type="button"
                    className="
                      image-preview-arrow
                      image-preview-arrow-left
                    "
                    onClick={showPreviousVideo}
                    disabled={videos.length <= 1}
                  >
                    <LeftOutlined />
                  </button>

                  {videos[videoPreviewIndex] && (
                    <video
                      src={videos[videoPreviewIndex].url}
                      className="video-preview-player"
                      controls
                      preload="metadata"
                    />
                  )}

                  <button
                    type="button"
                    className="
                      image-preview-arrow
                      image-preview-arrow-right
                    "
                    onClick={showNextVideo}
                    disabled={videos.length <= 1}
                  >
                    <RightOutlined />
                  </button>
                </div>

                <div className="image-preview-count">
                  {videoPreviewIndex + 1} / {videos.length}
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ====================================================
            DOCUMENTS
        ==================================================== */}

        <div className="mt-6">
          <p
            className="
              text-base
              font-semibold
              text-gray-900
              mb-2
            "
          >
            Upload property Documents
          </p>

          <input
            ref={documentsInputRef}
            type="file"
            accept="image/jpeg,application/pdf"
            multiple
            className="hidden"
            onChange={handleDocumentsChange}
          />

          <button
            type="button"
            onClick={() => documentsInputRef.current?.click()}
            className="
              w-full
              h-32
              sm:h-36
              rounded-lg
              border-2
              border-dashed
              border-gray-300
              bg-[#F2F2F2]
              flex
              flex-col
              items-center
              justify-center
              gap-y-1
              hover:border-secondary
              transition-colors
            "
          >
            <FileTextOutlined
              className="
                text-xl
                text-gray-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-secondary
              "
            >
              Upload Document
            </span>

            <span className="text-xs text-gray-400 font-semibold">
              Support format PDF, PPT
            </span>
          </button>

          {documents.length > 0 && (
            <div
              className="
                flex
                flex-col
                gap-y-2
                mt-3
              "
            >
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`
                      flex
                      items-center
                      gap-x-3
                      bg-[#F2F2F2]
                      border
                      rounded-lg
                      px-4
                      py-3
                      ${doc.error ? "border-red-500" : "border-gray-200"}
                    `}
                >
                  <FilePdfOutlined
                    className="
                        text-red-500!
                        text-lg
                        shrink-0
                        border-8
                        border-white
                        rounded-md
                      "
                  />

                  <div
                    className="
                        flex-1
                        min-w-0
                      "
                  >
                    <p
                      className="
                          text-sm
                          text-gray-800
                          truncate
                        "
                    >
                      {getExistingMediaName(doc, "Existing document")}
                    </p>

                    <p
                      className="
                          text-xs
                          text-gray-400
                        "
                    >
                      {doc.file
                        ? formatFileSize(doc.file.size)
                        : "Existing document"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="
                        text-gray-400
                        hover:text-gray-600
                        shrink-0
                      "
                  >
                    <CloseOutlined />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================
            PATTA
        ==================================================== */}

        <div className="mt-6">
          <p
            className="
              text-base
              font-semibold
              text-gray-900
              mb-2
            "
          >
            Upload Property Patta
          </p>

          <input
            ref={pattaInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            multiple
            className="hidden"
            onChange={handlePattaChange}
          />

          <button
            type="button"
            onClick={() => pattaInputRef.current?.click()}
            className="
              w-full
              h-32
              sm:h-36
              rounded-lg
              border-2
              border-dashed
              border-gray-300
              bg-[#F2F2F2]
              flex
              flex-col
              items-center
              justify-center
              gap-y-1
              hover:border-secondary
              transition-colors
            "
          >
            <PictureOutlined
              className="
                text-xl
                text-gray-400
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-secondary
              "
            >
              Upload Patta
            </span>

            <span className="text-xs text-gray-400 font-semibold">
              Support format jpeg, Png and pdf
            </span>
          </button>

          {pattas.length > 0 && (
            <div className="mt-3">
              {/* ==================================================
                  PATTA IMAGES
              ================================================== */}

              {pattas.some(
                (patta) =>
                  patta.file?.type?.startsWith("image/") ||
                  (!patta.file && !isPdfUrl(patta.url)),
              ) && (
                <div>
                  <p
                    className="
                      text-base
                      font-semibold
                      text-gray-900
                      mb-3
                    "
                  >
                    Uploaded Patta Images
                  </p>

                  <div
                    className="
                      grid
                      grid-cols-3
                      sm:grid-cols-4
                      md:grid-cols-6
                      gap-3
                    "
                  >
                    {pattas
                      .filter(
                        (patta) =>
                          patta.file?.type?.startsWith("image/") ||
                          (!patta.file && !isPdfUrl(patta.url)),
                      )
                      .map((patta) => (
                        <div
                          key={patta.id}
                          className={`
                              relative
                              h-24
                              sm:h-28
                              rounded-lg
                              overflow-hidden
                              border-2
                              ${
                                patta.error
                                  ? "border-red-500"
                                  : "border-transparent"
                              }
                            `}
                        >
                          <img
                            src={patta.url}
                            alt="patta"
                            className="
                                w-full
                                h-full
                                object-cover
                              "
                          />

                          <button
                            type="button"
                            onClick={() => removePatta(patta.id)}
                            className="
                                absolute
                                top-1.5
                                right-1.5
                                z-10
                                w-6
                                h-6
                                rounded-full
                                bg-white/90
                                flex
                                items-center
                                justify-center
                                text-red-500
                              "
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ==================================================
                  PATTA PDF DOCUMENTS
              ================================================== */}

              {pattas.some(
                (patta) =>
                  patta.file?.type === "application/pdf" ||
                  (!patta.file && isPdfUrl(patta.url)),
              ) && (
                <div className="mt-4">
                  <p
                    className="
                      text-base
                      font-semibold
                      text-gray-900
                      mb-2
                    "
                  >
                    Uploaded Patta Documents
                  </p>

                  <div
                    className="
                      flex
                      flex-col
                      gap-y-2
                    "
                  >
                    {pattas
                      .filter(
                        (patta) =>
                          patta.file?.type === "application/pdf" ||
                          (!patta.file && isPdfUrl(patta.url)),
                      )
                      .map((patta) => (
                        <div
                          key={patta.id}
                          className={`
                              flex
                              items-center
                              gap-x-3
                              bg-[#F2F2F2]
                              border
                              rounded-lg
                              px-4
                              py-3
                              ${
                                patta.error
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }
                            `}
                        >
                          <FilePdfOutlined
                            className="
                                text-red-500!
                                text-lg
                                shrink-0
                                border-8
                                border-white
                                rounded-md
                              "
                          />

                          <div
                            className="
                                flex-1
                                min-w-0
                              "
                          >
                            <p
                              className="
                                  text-sm
                                  text-gray-800
                                  truncate
                                "
                            >
                              {getExistingMediaName(
                                patta,
                                "Existing patta document",
                              )}
                            </p>

                            <p
                              className="
                                  text-xs
                                  text-gray-400
                                "
                            >
                              {patta.file
                                ? formatFileSize(patta.file.size)
                                : "Existing document"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removePatta(patta.id)}
                            className="
                                text-gray-400
                                hover:text-gray-600
                                shrink-0
                              "
                          >
                            <CloseOutlined />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              FORM NAVIGATION
          ================================================== */}

          <FormNavigationButtons
            nextLabel={isSubmitting ? "Submitting..." : "submit"}
            onNext={handleSubmit}
            disabled={isSubmitDisabled}
            onPrevious={handlePrevious}
          />
        </div>
      </div>
    </>
  );
};

export default MediaUploadForm;
