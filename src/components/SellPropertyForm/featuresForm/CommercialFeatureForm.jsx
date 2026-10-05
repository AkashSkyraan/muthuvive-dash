import React, { useEffect, useState } from "react";
import { Form } from "antd";
import FormNavigationButtons from "../../formNavButtons";
import { useNavigate } from "react-router-dom";
import { useSellProperty } from "../../../context/SellPropertyContext";
import {
  getAmenity,
  getPropertyHighlight,
} from "../../../api/propertyFormDropdown.api";
import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";
import { useAuth } from "../../../context/UserContext";

const roomCountOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4+" },
];

const availabilityOptions = [
  { value: 1, label: "Available" },
  { value: 0, label: "Not Available" },
];

const VISIBLE_COUNT = 7;

// Single-select pill group
const ToggleGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((option) => {
      const isSelected = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
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
  </div>
);

// Multi-select pill group
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

const CommercialPropertyFeaturesForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { formData, propertyId, updateFormData, mode } = useSellProperty();

  const [amenitiesOptions, setAmenitiesOptions] = useState([]);
  const [propertyHighlightsOptions, setPropertyHighlightsOptions] = useState(
    [],
  );

  // const [selectedAmenities, setSelectedAmenities] = useState([]);
  // const [selectedPropertyHighlights, setSelectedPropertyHighlights] = useState(
  //   [],
  // );

  /*
   * Next Button Disabled State
   */
  const numberOfRooms = Form.useWatch("numberOfRooms", form);
  const lift = Form.useWatch("lift", form);
  const washroomAvailable = Form.useWatch("washroomAvailable", form);
  const amenities = Form.useWatch("amenities", form);
  const propertyHighlights = Form.useWatch("propertyHighlights", form);

  const isNextDisabled =
    numberOfRooms === undefined ||
    numberOfRooms === null ||
    numberOfRooms === "" ||
    lift === undefined ||
    lift === null ||
    washroomAvailable === undefined ||
    washroomAvailable === null ||
    !amenities ||
    amenities.length === 0 ||
    !propertyHighlights ||
    propertyHighlights.length === 0;

  /*
   * Get Amenities
   */
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

  /*
   * Get Property Highlights
   */
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

  /*
   * Restore saved Context data
   */
  useEffect(() => {
    const savedFeatures = formData.propertyFeatures;

    if (!savedFeatures || Object.keys(savedFeatures).length === 0) {
      return;
    }

    const savedAmenities = savedFeatures.amenities || [];

    const savedPropertyHighlights = savedFeatures["prop_highs"] || [];

    // setSelectedAmenities(savedAmenities);

    // setSelectedPropertyHighlights(savedPropertyHighlights);

    form.setFieldsValue({
      numberOfRooms:
        savedFeatures.rooms !== undefined
          ? String(savedFeatures.rooms)
          : undefined,

      lift: savedFeatures.lift !== undefined ? savedFeatures.lift : undefined,

      washroomAvailable:
        savedFeatures.washroom !== undefined
          ? savedFeatures.washroom
          : undefined,

      amenities: savedAmenities,

      propertyHighlights: savedPropertyHighlights,
    });
  }, [formData.propertyFeatures, form]);

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.numberOfRooms !== undefined) {
      const rooms =
        allValues.numberOfRooms === "4" ? 4 : Number(allValues.numberOfRooms);

      updateFormData("propertyFeatures", "rooms", rooms);
    }

    if (changedValues.lift !== undefined) {
      updateFormData("propertyFeatures", "lift", allValues.lift);
    }

    if (changedValues.washroomAvailable !== undefined) {
      updateFormData(
        "propertyFeatures",
        "washroom",
        allValues.washroomAvailable,
      );
    }

    if (changedValues.amenities !== undefined) {
      updateFormData(
        "propertyFeatures",
        "amenities",
        allValues.amenities || [],
      );
    }

    if (changedValues.propertyHighlights !== undefined) {
      updateFormData(
        "propertyFeatures",
        "prop_highs",
        allValues.propertyHighlights || [],
      );
    }
  };

  /*
   * Next
   */
  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      const latestFeatures = {
        rooms:
          values.numberOfRooms === undefined || values.numberOfRooms === ""
            ? values.numberOfRooms
            : values.numberOfRooms === "4"
              ? 4
              : Number(values.numberOfRooms),

        lift: values.lift,

        washroom: values.washroomAvailable,

        amenities: values.amenities || [],

        prop_highs: values.propertyHighlights || [],
      };

      /*
       * Store everything in Context
       */
      Object.entries(latestFeatures).forEach(([key, value]) => {
        updateFormData("propertyFeatures", key, value);
      });

      /*
       * Payload
       */
      const payload = {
        step: 3,
        user_id: user?.id,
        prop_id: propertyId,

        rooms: latestFeatures.rooms,
        lift: latestFeatures.lift,
        washroom: latestFeatures.washroom,

        amenities: latestFeatures.amenities,

        prop_highs: latestFeatures["prop_highs"],
      };

      // console.log("Commercial property features payload:", payload);
      // console.log("payload", payload);

      const response = await postSellPropertyForm(payload);

      if (response?.success === 0) {
        console.error("Failed to update property features:", response?.error);
        return;
      }

      if (mode === "edit") {
        navigate(`/edit-property/${propertyId}/media`);
      } else {
        // EXISTING ADD FLOW
        navigate("/add-property/media");
      }
    } catch (error) {
      console.error("Commercial property features validation failed:", error);
    }
  };

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
        className="flex flex-col gap-6"
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label={sectionLabel("Number of Rooms")}
          name="numberOfRooms"
          className="!mb-0"
        >
          <ToggleGroup options={roomCountOptions} />
        </Form.Item>

        <Form.Item label={sectionLabel("Lift")} name="lift" className="!mb-0">
          <ToggleGroup options={availabilityOptions} />
        </Form.Item>

        <Form.Item
          label={sectionLabel("Washroom Available")}
          name="washroomAvailable"
          className="!mb-0"
        >
          <ToggleGroup options={availabilityOptions} />
        </Form.Item>

        <Form.Item
          label={sectionLabel("Amenities")}
          name="amenities"
          className="!mb-0"
        >
          <ExpandableMultiSelect options={amenitiesOptions} />
        </Form.Item>

        <Form.Item
          label={sectionLabel("Property Highlights")}
          name="propertyHighlights"
          className="!mb-0"
        >
          <ExpandableMultiSelect options={propertyHighlightsOptions} />
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

export default CommercialPropertyFeaturesForm;
