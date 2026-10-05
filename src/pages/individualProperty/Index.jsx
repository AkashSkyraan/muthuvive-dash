import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PropertyHeader from "./PropertyHeader.jsx";
import PropertyGallery from "./PropertyGallery.jsx";
// import TabListing from "../properties/TabListing.jsx";

import OverviewSection from "./OverviewSection.jsx";
import LocationSection from "./LocationSection.jsx";
import AmenitiesSection from "./AmenitiesSection.jsx";
import HighlightsSection from "./HighlightsSection.jsx";
// import PriceDetailsSection from "./PriceDetailsSection.jsx";
import DocumentSection from "./PropertyDocument.jsx";
import PattaSection from "./PropertyPatta.jsx";
// import NearbyProperties from "../../../components/cards/NearByProperties.jsx";

// import Enquiry from "./Enquiry.jsx";
// import PostInformation from "./PostInformation.jsx";
// import PlanDetails from "../../../components/cards/SubscriptionCard.jsx";

// import PaidAndPost from "./PaidAndPost.jsx";

// import images from "../../../config/Images.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

import { getIndividualProperties } from "../../api/getProperties.api.js";
import StatusMessage from "../../components/common/MessagePopup.jsx";

// Replace this with your actual plan API
// import { getSubscriptionPlans } from "../../../api/subscriptionPlans.api.js";
// import PlanActivity from "./PlanActivity.jsx";
// import PropertyActivity from "./PropertyActivity.jsx";

const PropertyDetails = () => {
  // ==========================================================
  // PROPERTY ID FROM URL
  // ==========================================================

  const { propertyId } = useParams();
  const { user } = useAuth();
  const currentPropertyId = propertyId;

  // ==========================================================
  // PAGE DATA
  // ==========================================================

  const [propertyData, setPropertyData] = useState({});
  const [showPriceDetails, setShowPriceDetails] = useState(null);

  // Nearby properties
  const [nearByFields, setNearByFields] = useState([]);

  // Plan details visibility
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // Plan details data
  const [planDetailsData, setPlanDetailsData] = useState(null);

  // right section condition based so theese are the states
  const [propertyStatus, setPropertyStatus] = useState(null);
  const [propertyUserId, setPropertyUserId] = useState(null);

  const [propertyActivityData, setPropertyActivityData] = useState(null);

  // ==========================================================
  // TABS
  // ==========================================================

  const tabs = [
    {
      key: "overview",
      label: "Overview",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "amenities",
      label: "Amenities",
    },
    {
      key: "property-highlight",
      label: "Property Highlight",
    },
    // {
    //   key: "price-details",
    //   label: "Price Details",
    // },
    {
      key: "document",
      label: "Document",
    },
    {
      key: "layout",
      label: "Layout",
    },
    {
      key: "Near-by-properties",
      label: "Near By Properties",
    },
  ];

  // ==========================================================
  // FETCH INDIVIDUAL PROPERTY
  // THEN CONDITIONALLY FETCH PLAN
  // THEN FETCH NEARBY
  // ==========================================================

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!currentPropertyId) {
        console.error("Property ID not found in URL");
        return;
      }

      // Clear old nearby properties when property changes
      setNearByFields([]);

      // Clear old plan data when property changes
      setShowPlanDetails(false);
      setPlanDetailsData(null);

      setPropertyStatus(null);
      setPropertyUserId(null);

      try {
        // ======================================================
        // 1. INDIVIDUAL PROPERTY API
        // ======================================================

        const response = await getIndividualProperties({
          prop_id: currentPropertyId,
          user_id: user?.id,
        });

        const apiData = response;

        const property = apiData;

        setShowPriceDetails(property);

        setPropertyActivityData(property);

        setPropertyStatus(property?.status ?? null);
        setPropertyUserId(property?.user_id ?? null);

        // ======================================================
        // 2. CHECK PLAN DETAILS
        // ======================================================

        const hasPlanDetails =
          property?.user_id != null && property?.status === "approved";

        if (hasPlanDetails) {
          setShowPlanDetails(true);

          try {
            // ==================================================
            // 3. PLAN API
            // ==================================================

            // const planResponse = await getSubscriptionPlans();
            // console.log("Plan response:", planResponse);

            setPlanDetailsData([planResponse[0]]);
          } catch (planError) {
            console.error("Failed to fetch plan details:", planError);

            setShowPlanDetails(false);
            setPlanDetailsData(null);
          }
        } else {
          setShowPlanDetails(false);
          setPlanDetailsData(null);
        }

        // ======================================================
        // HEADING
        // ======================================================

        const Heading = {
          title: property?.prop_name,

          propertyId: property?.prop_id?.toString(),

          location: [property?.city, property?.district, property?.state]
            .filter(Boolean)
            .join(", "),

          bookmark: property?.is_bookmarked,

          price: property?.min_price,

          area: property?.area_unit,

          category: property?.category,
        };

        // ======================================================
        // IMAGES
        // ======================================================

        const apiImages = [];

        // Cover image
        if (property?.media?.cover) {
          apiImages.push({
            id: property?.media?.cover?.id || "cover",

            url: property?.media?.cover?.url,

            alt: "Property cover",
          });
        }

        // Property images
        if (Array.isArray(property?.media?.images)) {
          property.media.images.forEach((image, index) => {
            const imageUrl = image?.url;

            if (imageUrl) {
              apiImages.push({
                id: image?.id ?? `image-${index + 1}`,

                url: imageUrl,

                alt: `Property image ${index + 1}`,
              });
            }
          });
        }

        const mockPropertyImages = apiImages.length > 0 ? apiImages : "";

        // ======================================================
        // VIDEOS
        // ======================================================

        const apiVideos = [];

        if (Array.isArray(property?.media?.videos)) {
          property.media.videos.forEach((video, index) => {
            const videoUrl = video?.url || video?.path;

            if (videoUrl) {
              apiVideos.push({
                id: video?.id ?? `video-${index + 1}`,

                url: videoUrl,

                alt: `Property video ${index + 1}`,

                mime_type: video?.mime_type,

                media_type: video?.media_type || "video",
              });
            }
          });
        }

        const mockPropertyVideos = apiVideos;

        // ======================================================
        // OVERVIEW
        // ======================================================

        const overviewFields = [
          {
            label: "Project Name",
            value: property?.prop_name || "",
          },
          {
            label: "Property Category",
            value:
              property?.category === 1
                ? "Farm Land"
                : property?.category === 2
                  ? "DTCP Approved"
                  : property?.category === 3
                    ? "Agriculture Land"
                    : property?.category === 4
                      ? "Commercial Land"
                      : property?.category === 6
                        ? "Investment Land"
                        : property?.category === 7
                          ? "Commercial Buildings"
                          : property?.category === 8
                            ? "Residential Buildings"
                            : "",
          },
          {
            label: "Area Unit",
            value: property?.area_unit || "NA",
          },
          {
            label: "Property Area",
            value: property?.prop_area ?? property?.property_area ?? "NA",
          },
          {
            label: "Road Plan",
            value:
              property?.road_plan === "on"
                ? "On Road"
                : property?.road_plan === "off"
                  ? "Interior"
                  : property?.road_plan || "NA",
          },
          {
            label: "Pathway Available",
            value:
              property?.path_way === 1
                ? "Available"
                : property?.path_way === 0
                  ? "Not Available"
                  : property?.path_way || "NA",
          },
          {
            label: "Pathway Length",
            value: property?.length
              ? `${property.length} ${property?.length_unit || ""}`
              : "NIL",
          },
          {
            label: "Road Length",
            value: property?.road_length
              ? `${property.road_length} ${property?.road_length_unit || ""}`
              : "NIL",
          },
          {
            label: "HP (Horsepower)",
            value: property?.hp ? `${property.hp}HP` : "NIL",
          },
          {
            label: "Electricity Available",
            value:
              property?.electricity === 1
                ? "Individual"
                : property?.electricity === 0
                  ? "Not Available"
                  : property?.electricity === 2
                    ? "Common"
                    : property?.electricity || "",
          },
          {
            label: "Construction",
            value:
              property?.construct === 0
                ? property?.construct_type || "NA"
                : property?.construct === 1
                  ? "shed"
                  : property?.construct === 2
                    ? "Commercial Building"
                    : property?.construct === 3
                      ? "Home"
                      : property?.construct || "others",
          },
          {
            label: "Property Facing",
            value:
              property?.facing === 1
                ? "North"
                : property?.facing === 2
                  ? "South"
                  : property?.facing === 3
                    ? "East"
                    : property?.facing === 4
                      ? "West"
                      : property?.facing === 5
                        ? "North East"
                        : property?.facing === 6
                          ? "North West"
                          : property?.facing === 7
                            ? "South East"
                            : property?.facing === 8
                              ? "South West"
                              : "",
          },

          ...([1, 2].includes(Number(property?.category))
            ? [
                {
                  label: "Price",
                  value: property?.min_price
                    ? `${Number(property.min_price).toLocaleString("en-IN")}`
                    : "NIL",
                },
              ]
            : []),
        ];

        // ======================================================
        // LOCATION
        // ======================================================

        const locationFields = [
          {
            label: "State",
            value: property?.state || "",
          },
          {
            label: "District",
            value: property?.district || "",
          },
          {
            label: "City",
            value: property?.city || "",
          },
          {
            label: "Country",
            value: property?.country || "India",
          },
          {
            label: "Map",
            value: property?.map || null,
          },
        ];

        // ======================================================
        // AMENITIES
        // ======================================================

        const amenitiesFields = Array.isArray(property?.amenities)
          ? property.amenities
              .map((item) => (typeof item === "object" ? item?.name : item))
              .filter(Boolean)
          : [];

        // ======================================================
        // PROPERTY HIGHLIGHTS
        // ======================================================

        const highlightsFields = Array.isArray(property?.property_highs)
          ? property.property_highs
              .map((item) => {
                if (typeof item === "object") {
                  return {
                    value: item?.name || "",
                  };
                }

                return {
                  label: "Highlight",
                  value: item,
                };
              })
              .filter((item) => item.value)
          : [];

        // ======================================================
        // PRICE DETAILS
        // ======================================================

        const priceDetailsFields = [
          {
            label: "Expected Price",
            value: property?.expected_price ?? property?.price ?? "",
          },
          {
            label: "Price Per Acre",
            value: property?.price_per_acre ?? "",
          },
          {
            label: "Price Negotiable",
            value: property?.price_negotiable ?? "",
          },
          {
            label: "Additional Charges",
            value: property?.additional_charges ?? "",
          },
        ];

        // ======================================================
        // DOCUMENTS
        // ======================================================

        const documentsFields = Array.isArray(property?.media?.documents)
          ? property.media.documents.map((document, index) => ({
              id: document?.id ?? index + 1,

              url: document?.url || document?.path || document,

              alt: "Document",

              mime_type: document?.mime_type,

              media_type: document?.media_type,
            }))
          : [];

        const pattaFields = Array.isArray(property?.media?.patta)
          ? property.media.patta.map((patta, index) => ({
              id: patta?.id ?? index + 1,

              url: patta?.url || patta?.path || patta,

              alt: "Patta",

              mime_type: patta?.mime_type,

              media_type: patta?.media_type,
            }))
          : [];

        // ======================================================
        // 4. NEARBY PROPERTY API
        // ======================================================

        try {
          const nearbyResponse = await getNearByProperties({
            prop_id: currentPropertyId,
          });

          setNearByFields(Array.isArray(nearbyResponse) ? nearbyResponse : []);
        } catch (nearbyError) {
          console.error("Failed to fetch nearby properties:", nearbyError);

          setNearByFields([]);
        }

        // ======================================================
        // UPDATE COMPLETE PROPERTY PAGE DATA
        // ======================================================

        setPropertyData((prev) => ({
          ...prev,

          Heading,

          mockPropertyImages,

          mockPropertyVideos,

          overviewFields,

          locationFields,

          amenitiesFields,

          highlightsFields,

          priceDetailsFields,

          documentsFields,

          pattaFields,
        }));
      } catch (error) {
        console.error("Failed to fetch property details:", error);

        setNearByFields([]);

        setShowPlanDetails(false);

        setPlanDetailsData(null);
        setPropertyActivityData(null);
      }
    };

    fetchPropertyDetails();
  }, [currentPropertyId]);

  // ==========================================================
  // EXTRACT DATA
  // ==========================================================

  const {
    Heading,
    mockPropertyImages,
    mockPropertyVideos,
    overviewFields,
    locationFields,
    amenitiesFields,
    highlightsFields,
    priceDetailsFields,
    documentsFields,
    pattaFields,
  } = propertyData;

  // ==========================================================
  // TAB SCROLL
  // ==========================================================

  const handleTabChange = (key) => {
    const section = document.getElementById(key);

    const header = document.getElementById("main-header");

    if (!section) return;

    const headerHeight = header?.getBoundingClientRect().height ?? 0;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: sectionTop - headerHeight,
      behavior: "smooth",
    });
  };

  const showEnquiry =
    user?.id != null &&
    propertyUserId != null &&
    Number(user?.id) !== Number(propertyUserId);

  const showPropertyActivity =
    user?.id != null &&
    propertyUserId != null &&
    Number(user?.id) === Number(propertyUserId);

  const showPaidAndPost =
    (user?.id != null &&
      propertyUserId != null &&
      Number(user.id) === Number(propertyUserId) &&
      propertyStatus === "approved") ||
    propertyStatus === "expired";

  const showPlanActivity =
    (user?.id != null &&
      propertyUserId != null &&
      Number(user?.id) === Number(propertyUserId) &&
      propertyStatus === "posted") ||
    propertyStatus === "expired" ||
    propertyStatus === "sold";

  return (
    <main className="w-[90%] mx-auto min-h-screen bg-white">
      <StatusMessage placement="top-right" />

      {/* ============================================================
          PROPERTY HEADER
          ============================================================ */}

      <PropertyHeader data={Heading} />

      {/* ============================================================
          PROPERTY GALLERY
          ============================================================ */}

      <PropertyGallery data={mockPropertyImages} videos={mockPropertyVideos} />

      {/* ============================================================
          PROPERTY TABS
          ============================================================ */}

      {/* <TabListing categories={tabs} onChange={handleTabChange} /> */}

      {/* ============================================================
          MAIN PROPERTY CONTENT
          ============================================================ */}

      <section className="w-full">
        <div className="w-[95%] lg:w-[90%] max-w-[1300px] mx-auto py-5">
          <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-4">
            {/* flex flex-col lg:flex-row gap-4 lg:gap-5 */}
            {/* ========================================================
                LEFT SIDE - 65%
                ======================================================== */}

            <div className="w-full flex flex-col gap-4">
              {/* Property Overview */}

              <div id="overview">
                <OverviewSection fields={overviewFields} />
              </div>

              {/* Property Location */}

              <div id="location">
                <LocationSection fields={locationFields} />
              </div>

              {/* Amenities */}

              <div id="amenities">
                <AmenitiesSection fields={amenitiesFields} />
              </div>

              {/* Property Highlights */}

              <div id="property-highlight">
                <HighlightsSection fields={highlightsFields} />
              </div>

              {/* Price Details */}

              {/* {PriceDetails && (
                <div id="price-details">
                  <PriceDetailsSection
                    fields={priceDetailsFields}
                  />
                </div>
              )} */}

              {/* Gallery / Documents */}

              <div id="document">
                <DocumentSection fields={documentsFields} />
              </div>

              <div id="layout">
                <PattaSection fields={pattaFields} />
              </div>
            </div>

            {/* ========================================================
                RIGHT SIDE - 35%
                ======================================================== */}

            <aside className="w-full lg:w-[45%] xl:w-[35%] flex flex-col gap-4 items-end">
              {/* Enquiry Form */}

              {/* {showEnquiry && <Enquiry propertyId={propertyId} />} */}

              {/* Plan Activity */}
              {/* {showPropertyActivity && (
                <PropertyActivity activities={propertyActivityData} />
              )} */}

              {/* Paid and Post Button */}
              {/* {showPaidAndPost && <PaidAndPost type={propertyStatus} />} */}

              {/* Plan Activity */}
              {/* {showPlanActivity && <PlanActivity prop_id={currentPropertyId} />} */}

              {/* Property Post Information */}

              {/* <PostInformation /> */}

              {/* Plan Details */}

              {/* {showPlanDetails && <PlanDetails plans={planDetailsData} />} */}
            </aside>
          </div>

          {/* ==========================================================
              NEARBY PROPERTIES
              ========================================================== */}

          {/* {Array.isArray(nearByFields) && nearByFields.length > 0 && (
            <div id="Near-by-properties">
              <NearbyProperties properties={nearByFields} />
            </div>
          )} */}
        </div>
      </section>
    </main>
  );
};

export default PropertyDetails;
