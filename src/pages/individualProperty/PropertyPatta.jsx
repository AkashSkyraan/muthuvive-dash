import React, { useState } from "react";
import { Modal } from "antd";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./PropertyGallery.css";

const Patta = ({ title = "Layout", fields = [] }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // ============================================================
  // OPEN PATTA PREVIEW
  // ============================================================

  const openPreview = (patta, index) => {
    if (!patta) return;

    setPreviewIndex(index);
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
      currentIndex === fields.length - 1 ? currentIndex : currentIndex + 1,
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
          PATTA IMAGE LIST
          ======================================================== */}

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-3 px-5 py-5 sm:px-6">
          {fields.map((patta, index) => (
            <button
              key={patta.id ?? index}
              type="button"
              onClick={() => openPreview(patta, index)}
              className="h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-lg border border-gray-200 min-w-0 min-h-0"
            >
              <img
                src={patta.url}
                alt={patta.alt || `Patta ${index + 1}`}
                className="block h-full w-full object-cover"
              />
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
            <span>Patta Preview</span>

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
              disabled={previewIndex === 0 || fields.length <= 1}
            >
              <LeftOutlined />
            </button>

            {/* Current Image */}

            {fields[previewIndex] && (
              <img
                src={fields[previewIndex].url}
                alt={fields[previewIndex].alt || `Preview ${previewIndex + 1}`}
                className="image-preview-image"
              />
            )}

            {/* Next */}

            <button
              type="button"
              className="image-preview-arrow image-preview-arrow-right"
              onClick={showNextImage}
              disabled={
                previewIndex === fields.length - 1 || fields.length <= 1
              }
            >
              <RightOutlined />
            </button>
          </div>

          {/* ==================================================
              COUNTER
              ================================================== */}

          <div className="image-preview-count">
            {previewIndex + 1} / {fields.length}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Patta;
