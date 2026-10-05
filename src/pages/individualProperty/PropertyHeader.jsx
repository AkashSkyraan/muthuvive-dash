import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import icons from "../../config/Icons.jsx";
// import { useAboutUs } from "../../../context/AboutusContext.jsx";
import { showStatusMessage } from "../../components/common/MessagePopup.jsx";
// import { postBookmark } from "../../../api/getProperties.api.js";

import { IndianRupee } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
// import { useLoginModal } from "../../../context/LoginModalContext.jsx";

const PropertyHeader = ({ data = {} }) => {
  const { title, propertyId, location, bookmark, price, area, category } = data;

  //   const { aboutUs } = useAboutUs();
  const { user } = useAuth();
  //   const { openLoginModal } = useLoginModal();

  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    setShowPrice([1, 2].includes(Number(category)));
  }, [category]);

  //   const contactNumber = 9876543210;

  // ============================================================
  // BOOKMARK STATE
  // ============================================================

  const [isBookmarked, setIsBookmarked] = useState(Number(bookmark) === 0);

  // Sync local bookmark state when API data arrives/changes
  useEffect(() => {
    setIsBookmarked(Number(bookmark) === 1);
  }, [bookmark]);

  // ============================================================
  // COPY URL
  // ============================================================

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      showStatusMessage({
        type: "success",
        text: "Link copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy URL:", error);

      showStatusMessage({
        type: "error",
        text: "Failed to copy link",
      });
    }
  };

  // ============================================================
  // SHARE PROPERTY
  // ============================================================

  const handleShare = async () => {
    const shareData = {
      title: title || "Property",
      text: title
        ? `Check out this property: ${title}`
        : "Check out this property",
      url: window.location.href,
    };

    // Copy URL first so it is available in clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.error("Failed to copy URL before sharing:", error);
    }

    // Browser/device supports native sharing
    if (navigator.share) {
      try {
        // Optional validation when canShare is available
        if (navigator.canShare && !navigator.canShare(shareData)) {
          return;
        }

        await navigator.share(shareData);

        // Native share sheet handled the share action
      } catch (error) {
        // User closing/cancelling the native share sheet
        // is not an application error.
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Failed to share property:", error);
      }

      return;
    }

    // Browser does not support navigator.share
    showStatusMessage({
      type: "success",
      text: "Link copied to clipboard",
    });
  };

  // ============================================================
  // BOOKMARK
  // ============================================================

  const handleBookmark = async () => {
    const next = !isBookmarked;
    if (!user) {
      //   openLoginModal();
      return;
    }
    try {
      //   const response = await postBookmark({
      //     user_id: user?.id,
      //     prop_id: propertyId,
      //   });

      // console.log(response);

      if (response?.success !== 1) {
        showStatusMessage({
          type: "error",
          text: next
            ? "Failed to bookmark propertyaaaaa"
            : "Failed to remove bookmark",
        });

        return;
      }

      // Change icon only after successful API response
      setIsBookmarked(next);

      showStatusMessage({
        type: "success",
        text: next ? "Property bookmarked" : "Property removed from bookmarks",
      });
    } catch (error) {
      console.error("Bookmark API failed:", error);

      showStatusMessage({
        type: "error",
        text: next
          ? "Failed to bookmark property"
          : "Failed to remove bookmark",
      });
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="max-w-[1400px] py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* ============================================================
              LEFT - Property Information
              ============================================================ */}

          <div className="min-w-0">
            {/* Property Title */}
            <h1 className="text-xl sm:text-2xl text-start font-semibold text-gray-950 leading-tight">
              {title}
            </h1>

            {/* Property Price */}
            {showPrice && (
              <div className="flex items-center">
                <IndianRupee className="text-black w-4 h-4" />

                <p className="text-base sm:text-lg text-start font-semibold text-gray-900 mt-1">
                  {Number(price).toLocaleString("en-IN")}
                  {" - "}
                  {area}
                </p>
              </div>
            )}

            {/* Property Location */}
            <div className="flex items-center gap-x-2 mt-2">
              <EnvironmentOutlined className="text-sm text-gray-800 shrink-0" />

              <span className="text-sm sm:text-base text-secondary">
                {location}
              </span>
            </div>
          </div>

          {/* ============================================================
              RIGHT - Property ID + Actions + Contact Seller
              ============================================================ */}

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            {/* Property ID + Action Icons */}
            <div className="flex items-center justify-end gap-x-5">
              {/* Property ID */}
              <p className="text-sm text-gray-500 whitespace-nowrap">
                Property ID :{" "}
                <span className="font-medium text-gray-900">{propertyId}</span>
              </p>

              {/* Copy */}
              <button
                type="button"
                className="flex items-center justify-center text-gray-800 hover:text-secondary transition-colors duration-200 cursor-pointer w-5"
                aria-label="Copy property URL"
                onClick={handleCopyUrl}
              >
                <img src={icons.copyIcon} alt="Copy" />
              </button>

              {/* Share */}
              <button
                type="button"
                className="flex items-center justify-center text-gray-800 hover:text-secondary transition-colors duration-200 cursor-pointer w-5"
                aria-label="Share property"
                onClick={handleShare}
              >
                <img src={icons.sentIcon} alt="Share" />
              </button>

              {/* Bookmark */}
              {/* <button
                type="button"
                className="flex items-center justify-center cursor-pointer w-5"
                aria-label={
                  isBookmarked ? "Remove bookmark" : "Bookmark property"
                }
                onClick={handleBookmark}
              > */}
              {/* <span className="relative w-5 h-5"> */}
              {/* Outline bookmark */}
              {/* <img
                    src={icons.bookmarkIcon2}
                    alt="Bookmark"
                    className={`absolute inset-0 w-5 h-5 transition-all duration-200 ease-out ${
                      isBookmarked
                        ? "opacity-0 scale-90"
                        : "opacity-100 scale-100"
                    }`}
                  /> */}

              {/* Filled bookmark */}
              {/* <img
                    src={icons.bookmarkIconFilled}
                    alt=""
                    className={`absolute inset-0 w-5 h-5 transition-all duration-200 ease-out ${
                      isBookmarked
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-90"
                    }`}
                  /> */}
              {/* </span> */}
              {/* </button> */}
            </div>

            {/* Contact Seller */}
            {/* <a
              href={contactNumber ? `tel:+91${contactNumber}` : "#"}
              className="w-full sm:w-auto"
            >
              <Button
                type="primary"
                className="
                  !bg-secondary
                  !border-secondary
                  !h-9
                  !px-10
                  !text-sm md:!text-base
                  w-full
                  sm:w-auto
                  mt-3
                "
              >
                Contact Seller
              </Button>
            </a> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyHeader;
