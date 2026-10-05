import React, { useState } from "react";
import { Modal } from "antd";
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import "./PropertyGallery.css";

const defaultDocuments = [
  {
    id: 1,
    url: "/docs/land-certificate.jpg",
    alt: "Land certificate",
  },
  {
    id: 2,
    url: "/docs/stamp-paper-1.jpg",
    alt: "Stamp paper page 1",
  },
  {
    id: 3,
    url: "/docs/stamp-paper-2.jpg",
    alt: "Stamp paper page 2",
  },
];

const Documents = ({ title = "Documents", fields = [] }) => {
  // console.log(fields);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // ============================================================
  // CHECK WHETHER DOCUMENT IS PDF
  // ============================================================

  const isPdf = (document) => {
    if (!document) return false;

    // API mime type
    if (document.mime_type === "application/pdf") {
      return true;
    }

    // Generic type
    if (document.type === "pdf") {
      return true;
    }

    // URL extension fallback
    const url = document.url?.split("?")[0]?.toLowerCase() || "";

    return url.endsWith(".pdf");
  };

  // ============================================================
  // ONLY IMAGE DOCUMENTS FOR IMAGE PREVIEW
  // ============================================================

  const imageDocuments = fields.filter((document) => !isPdf(document));

  // ============================================================
  // OPEN DOCUMENT
  //
  // IMAGE -> EXISTING IMAGE MODAL
  // PDF   -> NEW TAB
  // ============================================================

  const openPreview = (document, index) => {
    if (!document) return;

    // PDF -> open in a new tab
    if (isPdf(document)) {
      window.open(document.url, "_blank", "noopener,noreferrer");

      return;
    }

    // Image -> existing image preview modal
    const imageIndex = imageDocuments.findIndex(
      (image) => image.id === document.id && image.url === document.url,
    );

    setPreviewIndex(imageIndex >= 0 ? imageIndex : index);

    setPreviewVisible(true);
  };

  // ============================================================
  // PREVIOUS IMAGE
  // ============================================================

  const showPreviousImage = () => {
    setPreviewIndex((currentIndex) =>
      currentIndex === 0 ? currentIndex : currentIndex - 1,
    );
  };

  // ============================================================
  // NEXT IMAGE
  // ============================================================

  const showNextImage = () => {
    setPreviewIndex((currentIndex) =>
      currentIndex === imageDocuments.length - 1
        ? currentIndex
        : currentIndex + 1,
    );
  };

  return (
    <div className="w-full text-start rounded-xl border border-gray-300 bg-white">
      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      {/* ========================================================
          DOCUMENT LIST
          ======================================================== */}

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-3 px-5 py-5 sm:px-6">
          {fields.map((doc, index) => (
            <button
              key={doc.id ?? index}
              type="button"
              onClick={() => openPreview(doc, index)}
              className="h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-lg border border-gray-200 min-w-0 min-h-0"
            >
              {isPdf(doc) ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <FilePdfOutlined className="text-4xl !text-red-500" />
                </div>
              ) : (
                <img
                  src={doc.url}
                  alt={doc.alt || `Document ${index + 1}`}
                  className="block h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================
          IMAGE PREVIEW MODAL
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
          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="image-preview-header">
            <span>Document Preview</span>

            <button
              type="button"
              className="image-preview-close"
              onClick={() => setPreviewVisible(false)}
            >
              <CloseOutlined />
            </button>
          </div>

          {/* ==================================================
              IMAGE + ARROWS
              ================================================== */}

          <div className="image-preview-row">
            {/* Previous */}

            <button
              type="button"
              className="image-preview-arrow image-preview-arrow-left"
              onClick={showPreviousImage}
              disabled={previewIndex === 0 || imageDocuments.length <= 1}
            >
              <LeftOutlined />
            </button>

            {/* Current Image */}

            {imageDocuments[previewIndex] && (
              <img
                src={imageDocuments[previewIndex].url}
                alt={
                  imageDocuments[previewIndex].alt ||
                  `Preview ${previewIndex + 1}`
                }
                className="image-preview-image"
              />
            )}

            {/* Next */}

            <button
              type="button"
              className="image-preview-arrow image-preview-arrow-right"
              onClick={showNextImage}
              disabled={
                previewIndex === imageDocuments.length - 1 ||
                imageDocuments.length <= 1
              }
            >
              <RightOutlined />
            </button>
          </div>

          {/* ==================================================
              COUNTER
              ================================================== */}

          <div className="image-preview-count">
            {previewIndex + 1} / {imageDocuments.length}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
