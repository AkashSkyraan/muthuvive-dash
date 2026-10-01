import React, { createContext, useContext, useState } from "react";

const SellPropertyContext = createContext(null);

export const SellPropertyProvider = ({ children }) => {
  // Used for deciding which property form should be rendered
  const [category, setCategory] = useState(null);

  // Stores the backend property ID after the property is created
  const [propertyId, setPropertyId] = useState(null);

  const [mode, setMode] = useState("add");

  // Step-wise form data
  const [formData, setFormData] = useState({
    category: {},
    location: {},
    propertyDetails: {},
    propertyFeatures: {},
    media: {},
  });

  // Update a single field inside a section
  const updateFormData = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // Reset the complete sell-property form
  const resetFormData = () => {
    setFormData({
      category: {},
      location: {},
      propertyDetails: {},
      propertyFeatures: {},
      media: {},
    });

    setCategory(null);
    setPropertyId(null);
    setMode("add");
  };

  // Reset only the data that depends on the selected category
  const resetCategoryDependentData = () => {
    setFormData((prev) => ({
      ...prev,
      location: {},
      propertyDetails: {},
      propertyFeatures: {},
      media: {},
    }));
  };

  const value = {
    category,
    setCategory,

    propertyId,
    setPropertyId,

    mode,
    setMode,

    formData,
    setFormData,
    updateFormData,
    resetFormData,
    resetCategoryDependentData,
  };

  return (
    <SellPropertyContext.Provider value={value}>
      {children}
    </SellPropertyContext.Provider>
  );
};

export const useSellProperty = () => {
  const context = useContext(SellPropertyContext);

  if (!context) {
    throw new Error("useSellProperty must be used inside SellPropertyProvider");
  }

  return context;
};
