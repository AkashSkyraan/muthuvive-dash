import React from "react";
import { useSellProperty } from "../../context/SellPropertyContext";
import { sellPropertyFormConfig, categoryConfigMap } from "./FormConfig";
import { useNavigate } from "react-router-dom";

const Location = () => {
  const { category } = useSellProperty();
  const navigate = useNavigate();
  const categoryKey = categoryConfigMap[category];
  const LocationForm = sellPropertyFormConfig[categoryKey]?.location;

  if (!LocationForm) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 text-sm">
          Location form not available. Redirecting you to the starting step...
        </p>
        <button
          onClick={() => navigate("/dashboard/add-property")}
          className="px-4 py-2 rounded-full bg-secondary text-white hover:bg-secondary/80 transition"
        >
          Go to Step 1 Now
        </button>
      </div>
    );
  }

  return <LocationForm />;
};

export default Location;
