import React, { useEffect, useRef, useState } from "react";
import { Steps } from "antd";

import "./Stepper.css";
import { useLocation } from "react-router-dom";

const stepLabels = [
  "Select Land Category",
  "Location",
  "Property Details",
  "Property Features",
  "Add Photo / Video Of Property",
];

const StepCircle = ({ index, current }) => {
  const isCompleted = index < current;
  const isActive = index === current;

  return (
    <div
      className={`
        flex 
        items-center 
        justify-center 
        shrink-0 

        w-11 
        h-11 

        rounded-full 
        border-2 

        text-base 
        font-medium 

        transition-all 
        duration-400
        ease-in-out

        ${
          isCompleted
            ? "bg-blue-600 border-blue-600 text-white shadow-md"
            : isActive
              ? "bg-blue-100 border-blue-600 text-blue-600 shadow-md"
              : "bg-white border-gray-300 text-gray-800 shadow-sm"
        }
      `}
    >
      {index + 1}
    </div>
  );
};

const PropertyStepper = () => {
  const location = useLocation();

  const currentStep =
    location.pathname === "/dashboard/add-property"
      ? 0
      : location.pathname === "/dashboard/add-property/location"
        ? 1
        : location.pathname === "/dashboard/add-property/details"
          ? 2
          : location.pathname === "/dashboard/add-property/features"
            ? 3
            : location.pathname === "/dashboard/add-property/media"
              ? 4
              : location.pathname.match(/^\/dashboard\/edit-property\/[^/]+$/)
                ? 1
                : location.pathname.match(
                      /^\/dashboard\/edit-property\/[^/]+\/location$/,
                    )
                  ? 1
                  : location.pathname.match(
                        /^\/dashboard\/edit-property\/[^/]+\/details$/,
                      )
                    ? 2
                    : location.pathname.match(
                          /^\/dashboard\/edit-property\/[^/]+\/features$/,
                        )
                      ? 3
                      : location.pathname.match(
                            /^\/dashboard\/edit-property\/[^/]+\/media$/,
                          )
                        ? 4
                        : 0;

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 1024px)").matches;
  });

  // Added: reference to the mobile stepper container
  const mobileStepperRef = useRef(null);

  // Added: automatically move horizontal stepper to current step
  useEffect(() => {
    if (isDesktop) {
      return;
    }

    const stepper = mobileStepperRef.current;

    if (!stepper) {
      return;
    }

    const stepItems = stepper.querySelectorAll(".ant-steps-item");

    const currentItem = stepItems[currentStep];

    if (!currentItem) {
      return;
    }

    currentItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentStep, isDesktop]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (event) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const items = stepLabels.map((label, index) => {
    const isCompleted = index < currentStep;
    const isActive = index === currentStep;

    return {
      title: (
        <span
          className={`
            text-base 
            leading-5 
            transition-colors 
            duration-400
            ease-in-out

            ${
              isCompleted
                ? "text-secondary font-medium"
                : "text-gray-800 font-medium"
            }
             ${
               isActive
                 ? "text-secondary font-medium"
                 : "text-gray-800 font-medium"
             } 
          `}
        >
          {label}
        </span>
      ),

      icon: <StepCircle index={index} current={currentStep} />,
    };
  });

  return (
    <div className="property-stepper w-full">
      {/* DESKTOP Vertical Stepper */}

      {isDesktop && (
        <Steps
          direction="vertical"
          current={currentStep}
          items={items}
          className="property-stepper-desktop"
        />
      )}

      {/* MOBILE + TABLET Horizontal Stepper */}

      {!isDesktop && (
        <div
          ref={mobileStepperRef}
          className="
            overflow-x-auto
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          <Steps
            direction="horizontal"
            labelPlacement="vertical"
            current={currentStep}
            items={items}
            responsive={false}
            className="property-stepper-mobile"
          />
        </div>
      )}
    </div>
  );
};

export default PropertyStepper;
