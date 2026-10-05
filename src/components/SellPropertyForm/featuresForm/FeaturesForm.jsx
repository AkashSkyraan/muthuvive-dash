import React, { useEffect, useState } from "react";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import FormNavigationButtons from "../../formNavButtons";
import { useSellProperty } from "../../../context/SellPropertyContext";
import {
  getAmenity,
  getPropertyHighlight,
} from "../../../api/propertyFormDropdown.api";
import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";
import { useAuth } from "../../../context/AuthContext";

const VISIBLE_COUNT = 7;

// Multi-select group of pill buttons
const ExpandableMultiSelect = ({ options, value = [], onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const hasMore = options.length > VISIBLE_COUNT;

  const visibleOptions = expanded ? options : options.slice(0, VISIBLE_COUNT);

  const toggleOption = (optionValue) => {
    const isSelected = value.includes(optionValue);

    const nextValue = isSelected
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange?.(nextValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {visibleOptions.map((option) => {
        const isSelected = value.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              isSelected
                ? "bg-blue-50 border-secondary text-secondary"
                : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {option.label}
          </button>
        );
      })}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-secondary shrink-0 cursor-pointer"
        >
          {expanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

const sectionLabel = (text) => (
  <span className="text-base font-semibold text-gray-900">{text}</span>
);

const PropertyFeaturesForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { formData, propertyId, updateFormData, mode } = useSellProperty();

  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [propertyHighlightsOptions, setPropertyHighlightsOptions] = useState(
    [],
  );

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPropertyHighlights, setSelectedPropertyHighlights] = useState(
    [],
  );

  // -------------------------------------------------------
  // EDIT FLOW
  // Restore selected amenities and property highlights
  // -------------------------------------------------------

  useEffect(() => {
    if (mode !== "edit") return;

    const savedFeatures = formData.propertyFeatures;

    if (!savedFeatures) return;

    const savedAmenities = (savedFeatures.amenities || []).map(Number);

    const savedPropertyHighlights = (savedFeatures.prop_highs || []).map(
      Number,
    );

    setSelectedAmenities(savedAmenities);
    setSelectedPropertyHighlights(savedPropertyHighlights);

    form.setFieldsValue({
      amenities: savedAmenities,
      propHighs: savedPropertyHighlights,
    });
  }, [mode, formData.propertyFeatures, form]);

  // -------------------------------------------------------
  // Next Button Disabled State
  // Both categories must have at least one selection
  // -------------------------------------------------------

  const isNextDisabled =
    selectedAmenities.length === 0 || selectedPropertyHighlights.length === 0;

  // -------------------------------------------------------
  // Fetch Amenities
  // -------------------------------------------------------

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await getAmenity();

        if (response?.success === 0) {
          console.error("Failed to fetch amenities:", response?.error);
          return;
        }

        const amenities = response || [];

        const formattedAmenities = amenities.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setAmenitiesOptions(formattedAmenities);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    fetchAmenities();
  }, []);

  // -------------------------------------------------------
  // Fetch Property Highlights
  // -------------------------------------------------------

  useEffect(() => {
    const fetchPropertyHighlights = async () => {
      try {
        const response = await getPropertyHighlight();

        if (response?.success === 0) {
          console.error(
            "Failed to fetch property highlights:",
            response?.error,
          );
          return;
        }

        const propertyHighlights = response || [];

        const formattedPropertyHighlights = propertyHighlights.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setPropertyHighlightsOptions(formattedPropertyHighlights);
      } catch (error) {
        console.error("Error fetching property highlights:", error);
      }
    };

    fetchPropertyHighlights();
  }, []);

  // -------------------------------------------------------
  // Amenities Selection
  // -------------------------------------------------------

  const handleAmenitiesChange = (values) => {
    setSelectedAmenities(values);

    updateFormData("propertyFeatures", "amenities", values);
  };

  // -------------------------------------------------------
  // Property Highlights Selection
  // -------------------------------------------------------

  const handlePropertyHighlightsChange = (values) => {
    setSelectedPropertyHighlights(values);

    updateFormData("propertyFeatures", "prop_highs", values);
  };

  // -------------------------------------------------------
  // Next
  // -------------------------------------------------------

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      const latestFeatures = {
        amenities: values.amenities || [],
        prop_highs: values.propHighs || [],
      };

      updateFormData("propertyFeatures", "amenities", latestFeatures.amenities);

      updateFormData(
        "propertyFeatures",
        "prop_highs",
        latestFeatures.prop_highs,
      );

      const payload = {
        step: 3,
        user_id: user?.id,
        prop_id: propertyId,
        amenities: latestFeatures.amenities,
        prop_highs: latestFeatures.prop_highs,
      };

      const response = await postSellPropertyForm(payload);

      if (response?.success === 0) {
        throw new Error("Failed to save property features");
      }

      // EDIT FLOW
      if (mode === "edit") {
        navigate(`/edit-property/${propertyId}/media`);
      } else {
        // EXISTING ADD FLOW
        navigate("/add-property/media");
      }
    } catch (error) {
      console.error("Property features validation failed:", error);
    }
  };

  // -------------------------------------------------------
  // Previous
  // -------------------------------------------------------

  const handlePrevious = async () => {
    // EDIT FLOW
    if (mode === "edit") {
      navigate(`/edit-property/${propertyId}/details`);
    } else {
      // EXISTING ADD FLOW
      navigate("/add-property/details");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="flex flex-col gap-8"
      >
        <Form.Item
          label={sectionLabel("Amenities")}
          name="amenities"
          className="!mb-0"
        >
          <ExpandableMultiSelect
            options={amenitiesOptions}
            value={selectedAmenities}
            onChange={handleAmenitiesChange}
          />
        </Form.Item>

        <Form.Item
          label={sectionLabel("Property Highlights")}
          name="propHighs"
          className="!mb-0"
        >
          <ExpandableMultiSelect
            options={propertyHighlightsOptions}
            value={selectedPropertyHighlights}
            onChange={handlePropertyHighlightsChange}
          />
        </Form.Item>

        <FormNavigationButtons
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={isNextDisabled}
        />
      </Form>
    </div>
  );
};

export default PropertyFeaturesForm;
