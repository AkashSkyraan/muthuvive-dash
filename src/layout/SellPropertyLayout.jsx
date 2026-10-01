import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Modal } from "antd";
import { LeftOutlined } from "@ant-design/icons";

import PropertyStepper from "../components/SellPropertyForm/stepper/Stepper.jsx";
import {
  SellPropertyProvider,
  useSellProperty,
} from "../context/SellPropertyContext.jsx";
// import { AboutUsProvider } from "../context/AboutusContext.jsx";
import { getIndividualProperties } from "../api/getProperties.api.js";

const SellPropertyContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { prop_id } = useParams();
  const { setMode, setPropertyId, setFormData, setCategory, resetFormData } =
    useSellProperty();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getIndividualProperties({
          prop_id,
        });

        setMode("edit");
        setPropertyId(data.prop_id);
        setCategory(data.category);

        setFormData((prev) => ({
          ...prev,

          category: {
            category: data.category,
            sub_category: data.sub_category,
          },

          location: {
            country: data.country,
            state: data.state,
            district: data.district,
            city: data.city,
            map: data.map,
          },

          propertyDetails: {
            prop_name: data.prop_name,
            prop_area: data.prop_area,
            area_unit: data.area_unit,

            total_plots: data.plots,

            road_plan: data.road_plan,
            road_length: data.road_length,
            road_length_unit: data.road_length_unit,

            carpet_area: data.carpet_area,
            carp_unit: data.carp_unit,
            build: data.build,
            build_unit: data.build_unit,
            super_build: data.super_build,
            super_build_unit: data.super_build_unit,

            total_floor: data.total_floor,
            your_floor: data.your_floor,

            avail_status: data.avail_status,

            pathway: data.path_way,
            length: data.length,
            length_unit: data.length_unit,
            width: data.width,
            width_unit: data.width_unit,

            price_per_cent_from: data.min_price,
            price_per_cent_to: data.max_price,

            c_well: data.c_well,
            i_well: data.i_well,
            electricity: data.electricity,
            hp: data.hp,
            facing: data.facing,
            construct: data.construct,
            construct_type: data.construct_type,
            other_type: data.other_type,
          },

          propertyFeatures: {
            amenities: (data.amenities || []).map((item) => item.id),
            prop_highs: (data.property_highs || []).map((item) => item.id),

            rooms: data.rooms,
            lift: data.lift,
            washroom: data.washroom,
          },
          media: {
            cover: data.media?.cover || null,
            images: data.media?.images || [],
            videos: data.media?.videos || [],
            patta: data.media?.patta || [],
            documents: data.media?.documents || [],
          },
        }));
      } catch (error) {
        console.error("Failed to fetch property:", error);
      }
    };

    if (prop_id) {
      fetchProperty();
    }
  }, [prop_id]);

  // Check whether current route is the first step
  const isFirstStep = location.pathname === "/dashboard/add-property";
  const isEditFirstStep = location.pathname.match(
    /^\/dashboard\/edit-property\/[^/]+$/,
  );

  // Controls the confirmation modal
  const [showBackModal, setShowBackModal] = useState(false);

  // Open confirmation modal only for first step
  const handleBackClick = () => {
    if (isFirstStep || isEditFirstStep) {
      setShowBackModal(true);
    } else {
      navigate(-1);
    }
  };

  // Close modal and stay on current form
  const handleCancelBack = () => {
    setShowBackModal(false);
  };

  // Confirm back navigation
  const handleConfirmBack = () => {
    setShowBackModal(false);
    resetFormData();

    // Go to home page

    if (isFirstStep) {
      navigate("/dashboard");
    } else if (isEditFirstStep) {
      navigate("/dashboard/list-property");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ==================== Header ==================== */}
      {/* <Header /> */}

      {/* ==================== Page Content ==================== */}
      <main className="flex-1 w-[90%] md:w-[80%] mx-auto">
        {/* ---------- Page Heading ---------- */}
        <section className="container mx-auto px-4 py-8 text-start">
          {/* Back / Previous Button */}
          <button
            type="button"
            onClick={handleBackClick}
            className="
              mb-5
              inline-flex items-center gap-x-1
              text-sm font-medium text-gray-600
              transition-colors duration-200
              hover:text-gray-900
              focus:outline-none
              cursor-pointer
            "
          >
            <LeftOutlined className="text-base" />

            <span className="text-base">
              {isFirstStep || isEditFirstStep ? "Back" : "Previous"}
            </span>
          </button>

          <h1 className="text-2xl font-semibold">Sell Your Property</h1>

          <p className="mt-2 text-base text-gray-500">
            Fill in your property details, photos, documents, and other required
            information. Then submit the request for review.
          </p>
        </section>

        {/* ---------- Stepper + Form ---------- */}
        <section className="container mx-auto px-4 pb-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:h-[80vh]">
            {/* Stepper */}
            <aside
              className="
                lg:w-[380px]
                lg:h-full
                lg:overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
              "
            >
              <PropertyStepper />
            </aside>

            {/* Dynamic Form */}
            <section
              className="
                flex-1
                px-0 sm:px-7
                lg:h-full
                lg:overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
              "
            >
              <Outlet />
            </section>
          </div>
        </section>
      </main>

      {/* ==================== Footer ==================== */}
      {/* <Footer /> */}

      {/* ==================== Back Confirmation Modal ==================== */}
      <Modal
        open={showBackModal}
        onCancel={handleCancelBack}
        centered
        footer={null}
        styles={{
          content: {
            width: "80%",
            maxWidth: "420px",
          },
        }}
      >
        <div className="px-1 py-2 text-center sm:px-3">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900">
            Leave this form?
          </h2>

          {/* Description */}
          <p className="mt-2 text-base leading-6 text-gray-500">
            If you go back, the details you have entered in this form will be
            erased. Are you sure you want to leave?
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancelBack}
              className="
                w-full sm:w-auto
                rounded-md
                border border-gray-300
                bg-white
                px-5 py-2.5
                text-base font-medium text-gray-700
                transition-colors duration-200
                hover:bg-gray-50
                focus:outline-none
                cursor-pointer
              "
            >
              Cancel
            </button>

            {/* Confirm */}
            <button
              type="button"
              onClick={handleConfirmBack}
              className="
                w-full sm:w-auto
                rounded-md
                bg-red-500
                px-5 py-2.5
                text-base font-medium text-white
                transition-colors duration-200
                hover:bg-red-600
                focus:outline-none
                cursor-pointer
              "
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SellPropertyLayout = () => {
  return (
    <SellPropertyProvider>
      <SellPropertyContent />
    </SellPropertyProvider>
  );
};

export default SellPropertyLayout;
