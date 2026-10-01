import React from "react";
import { useSellProperty } from "../../context/SellPropertyContext";
import { sellPropertyFormConfig, categoryConfigMap } from "./FormConfig";
import { useNavigate } from "react-router-dom";

const PropertyMedia = () => {
  const { category } = useSellProperty();
  const navigate = useNavigate();

  const categoryKey = categoryConfigMap[category];
  const MediaForm = sellPropertyFormConfig[categoryKey]?.media;
  if (!MediaForm) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 text-sm">
          Property media form not available. Redirecting you to the starting
          step...
        </p>
        <button
          onClick={() => navigate("/sell-property")}
          className="px-4 py-2 rounded-full bg-secondary text-white hover:bg-secondary/80 transition"
        >
          Go to Step 1 Now
        </button>
      </div>
    );
  }

  return <MediaForm />;
};

export default PropertyMedia;
