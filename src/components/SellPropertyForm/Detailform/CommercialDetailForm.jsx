import React, { useEffect, useState } from "react";
import { Form, Input, Select } from "antd";
import {
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import FormNavigationButtons from "../../formNavButtons";
import { useSellProperty } from "../../../context/SellPropertyContext";
import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";
import { useAuth } from "../../../context/UserContext";

// ---------------------------------------------------------
// Options
// ---------------------------------------------------------

const roadPlanOptions = [
  { value: "on", label: "On road" },
  { value: "off", label: "Interior" },
];

const yesNoOptions = [
  { value: 1, label: "Yes" },
  { value: 0, label: "No" },
];

const facingOptions = [
  { value: 1, label: "North" },
  { value: 2, label: "South" },
  { value: 3, label: "East" },
  { value: 4, label: "West" },
  { value: 5, label: "North East" },
  { value: 6, label: "North West" },
  { value: 7, label: "South East" },
  { value: 8, label: "South West" },
];

const availabilityStatusOptions = [
  { value: 1, label: "Ready to move" },
  { value: 2, label: "Under Construction" },
];

const areaUnitOptions = [
  { value: "acres", label: "Acres" },
  { value: "cents", label: "Cents" },
  { value: "sqft", label: "Sqft" },
];

const lengthUnitOptions = [
  { value: "ft", label: "Ft" },
  // { value: "feet", label: "Feet" },
  { value: "m", label: "M" },
];

// ---------------------------------------------------------
// BHK Options
// ---------------------------------------------------------

const bhkOptions = [
  { value: 1, label: "1BHK" },
  { value: 2, label: "2BHK" },
  { value: 3, label: "3BHK" },
  { value: 4, label: "4BHK+" },
];

// ---------------------------------------------------------
// Whole Number Validator
// ---------------------------------------------------------

const wholeNumberValidator = (fieldName) => ({
  validator: (_, value) => {
    if (value === undefined || value === null || value === "") {
      return Promise.resolve();
    }

    if (!/^\d+$/.test(String(value))) {
      return Promise.reject(
        new Error(`${fieldName} must contain only numbers`),
      );
    }

    if (Number(value) < 1) {
      return Promise.reject(new Error(`${fieldName} must be greater than 0`));
    }

    return Promise.resolve();
  },
});

// ---------------------------------------------------------
// Toggle Group
// ---------------------------------------------------------

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

// ---------------------------------------------------------
// Input styles
// ---------------------------------------------------------

const inputClassName =
  "!bg-transparent !border-none !shadow-none !px-5 !py-3 !text-sm !text-gray-900 [&.ant-input-status-error]:!text-gray-900 [&.ant-input-status-error]:placeholder:!text-gray-400";

const selectSelectorClassName =
  "[&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!px-5 [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-item]:!leading-[48px] [&_.ant-select-selection-placeholder]:!leading-[48px]";

// ---------------------------------------------------------
// Unit Field
// ---------------------------------------------------------

const UnitField = ({
  label,
  valueName,
  unitName,
  unitOptions,
  defaultUnit,
  rules = [],
  onRemove,
  onValueChange,
  onUnitChange,
}) => {
  const form = Form.useFormInstance();

  useEffect(() => {
    const currentUnit = form.getFieldValue(unitName);

    if (
      currentUnit === undefined ||
      currentUnit === null ||
      currentUnit === ""
    ) {
      form.setFieldValue(unitName, defaultUnit);
      onUnitChange?.(defaultUnit);
    }
  }, [form, unitName, defaultUnit]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">{label}</p>

        {onRemove && (
          <button type="button" onClick={onRemove}>
            <MinusCircleOutlined className="text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      <div className="flex items-center rounded-xl bg-[#f3f3f3] overflow-hidden">
        {/* Value */}
        <Form.Item
          name={valueName}
          rules={rules}
          className="!mb-0 flex-1"
          getValueFromEvent={(e) => e.target.value}
        >
          <Input
            placeholder="200"
            variant="borderless"
            className={inputClassName}
            onChange={(e) => {
              onValueChange?.(e.target.value);
            }}
            autoComplete="off"
          />
        </Form.Item>

        <div className="w-px h-6 bg-gray-500 shrink-0" />

        {/* Unit */}
        <Form.Item name={unitName} noStyle>
          <Select
            variant="borderless"
            suffixIcon={<DownOutlined className="!text-gray-500 text-sm" />}
            className="!w-24 shrink-0 small-unit-select"
            options={unitOptions}
            onChange={(value) => {
              onUnitChange?.(value);
            }}
          />
        </Form.Item>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Label
// ---------------------------------------------------------

const fieldLabel = (text) => (
  <span className="text-sm font-semibold text-gray-900">{text}</span>
);

// ---------------------------------------------------------
// Commercial Property Details Form
// ---------------------------------------------------------

const CommercialPropertyDetailsForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { formData, updateFormData, propertyId, category, mode } =
    useSellProperty();

  const [hasBuildUpArea, setHasBuildUpArea] = useState(true);
  const [hasSuperBuildUpArea, setHasSuperBuildUpArea] = useState(true);

  // -------------------------------------------------------
  // Check whether BHK should be shown
  // -------------------------------------------------------

  const showBHK = Number(category) === 8;

  // -------------------------------------------------------
  // Watch conditional fields
  // -------------------------------------------------------

  const roadPlan = Form.useWatch("road_plan", form);
  const pathwayAvailable = Form.useWatch("pathway", form);
  const totalFloor = Form.useWatch("total_floor", form);
  const availabilityStatus = Form.useWatch("avail_status", form);

  const isOnRoad = roadPlan === "on";
  const isInterior = roadPlan === "off";

  const showPathwayDimension = isInterior && pathwayAvailable === 1;

  // -------------------------------------------------------
  // Next Button Disabled State
  // -------------------------------------------------------

  const formValues = Form.useWatch([], form);

  const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && value.trim() === "");

  const isNextDisabled =
    // Property Name
    isEmpty(formValues?.prop_name) ||
    // BHK - only required for category 7
    (showBHK && isEmpty(formValues?.bhk)) ||
    // Carpet Area
    isEmpty(formValues?.carpet_area) ||
    // Build-Up Area - required when added
    (hasBuildUpArea && isEmpty(formValues?.build)) ||
    // Super Build-Up Area - required when added
    (hasSuperBuildUpArea && isEmpty(formValues?.super_build)) ||
    // Total Floor
    isEmpty(formValues?.total_floor) ||
    // Road Plan
    isEmpty(formValues?.road_plan) ||
    // Road Length - only required when On Road
    (isOnRoad && isEmpty(formValues?.road_length)) ||
    // Pathway - only required when Interior
    (isInterior && isEmpty(formValues?.pathway)) ||
    // Pathway Length and Width
    // only required when Interior + Pathway Yes
    (showPathwayDimension && isEmpty(formValues?.pathway_length)) ||
    (showPathwayDimension && isEmpty(formValues?.pathway_width)) ||
    // Property Facing
    isEmpty(formValues?.facing) ||
    // Availability Status
    isEmpty(formValues?.avail_status);

  // -------------------------------------------------------
  // Floor Options
  // -------------------------------------------------------

  const floorOptions = totalFloor
    ? Array.from(
        {
          length: Number(totalFloor) || 0,
        },
        (_, index) => ({
          value: index + 1,
          label: String(index + 1),
        }),
      )
    : [];

  // -------------------------------------------------------
  // Restore saved Context data
  // -------------------------------------------------------

  useEffect(() => {
    const savedDetails = formData.propertyDetails;

    if (!savedDetails || Object.keys(savedDetails).length === 0) {
      return;
    }

    form.setFieldsValue({
      ...savedDetails,

      avail_status:
        savedDetails.avail_status !== undefined &&
        savedDetails.avail_status !== null &&
        savedDetails.avail_status !== ""
          ? Number(savedDetails.avail_status)
          : savedDetails.avail_status,
    });
  }, [formData.propertyDetails, form]);

  // -------------------------------------------------------
  // Save field into Context
  // -------------------------------------------------------

  const handleFieldChange = (key, value) => {
    updateFormData("propertyDetails", key, value);
  };

  // -------------------------------------------------------
  // Road Plan Change
  // -------------------------------------------------------

  const handleRoadPlanChange = (value) => {
    form.setFieldsValue({
      road_plan: value,
      pathway: undefined,
      pathway_length: undefined,
      pathway_length_unit: undefined,
      pathway_width: undefined,
      pathway_width_unit: undefined,
      road_length: undefined,
      road_length_unit: undefined,
    });

    updateFormData("propertyDetails", "road_plan", value);

    updateFormData("propertyDetails", "pathway", undefined);

    updateFormData("propertyDetails", "pathway_length", undefined);

    updateFormData("propertyDetails", "pathway_length_unit", undefined);

    updateFormData("propertyDetails", "pathway_width", undefined);

    updateFormData("propertyDetails", "pathway_width_unit", undefined);

    updateFormData("propertyDetails", "road_length", undefined);

    updateFormData("propertyDetails", "road_length_unit", undefined);
  };

  // -------------------------------------------------------
  // Pathway Change
  // -------------------------------------------------------

  const handlePathwayChange = (value) => {
    form.setFieldsValue({
      pathway: value,

      pathway_length:
        value === "yes" ? form.getFieldValue("pathway_length") : undefined,

      pathway_width:
        value === "yes" ? form.getFieldValue("pathway_width") : undefined,
    });

    updateFormData("propertyDetails", "pathway", value);

    if (value !== "yes") {
      updateFormData("propertyDetails", "pathway_length", undefined);

      updateFormData("propertyDetails", "pathway_width", undefined);

      updateFormData("propertyDetails", "pathway_length_unit", undefined);

      updateFormData("propertyDetails", "pathway_width_unit", undefined);
    }
  };

  // -------------------------------------------------------
  // Remove Build-Up Area
  // -------------------------------------------------------

  const handleRemoveBuildUpArea = () => {
    setHasBuildUpArea(false);

    form.setFieldsValue({
      build: undefined,
      build_unit: undefined,
    });

    updateFormData("propertyDetails", "build", undefined);

    updateFormData("propertyDetails", "build_unit", undefined);
  };

  // -------------------------------------------------------
  // Add Build-Up Area
  // -------------------------------------------------------

  const handleAddBuildUpArea = () => {
    setHasBuildUpArea(true);

    form.setFieldsValue({
      build_unit: "acres",
    });

    updateFormData("propertyDetails", "build_unit", "acres");
  };

  // -------------------------------------------------------
  // Remove Super Build-Up Area
  // -------------------------------------------------------

  const handleRemoveSuperBuildUpArea = () => {
    setHasSuperBuildUpArea(false);

    form.setFieldsValue({
      super_build: undefined,
      super_build_unit: undefined,
    });

    updateFormData("propertyDetails", "super_build", undefined);

    updateFormData("propertyDetails", "super_build_unit", undefined);
  };

  // -------------------------------------------------------
  // Add Super Build-Up Area
  // -------------------------------------------------------

  const handleAddSuperBuildUpArea = () => {
    setHasSuperBuildUpArea(true);

    form.setFieldsValue({
      super_build_unit: "acres",
    });

    updateFormData("propertyDetails", "super_build_unit", "acres");
  };

  // -------------------------------------------------------
  // Next
  // -------------------------------------------------------

  const handleNext = async () => {
    try {
      // ---------------------------------------------------
      // Validate using AntD
      // ---------------------------------------------------

      await form.validateFields();

      // ---------------------------------------------------
      // IMPORTANT:
      // Use Context as the source of payload.
      // Do NOT use form values as payload.
      // ---------------------------------------------------

      const propertyDetails = {
        ...formData.propertyDetails,
      };

      // ---------------------------------------------------
      // Convert numeric fields before API
      // ---------------------------------------------------

      const convertedPropertyDetails = {
        ...propertyDetails,

        carpet_area:
          propertyDetails.carpet_area !== undefined &&
          propertyDetails.carpet_area !== ""
            ? Number(propertyDetails.carpet_area)
            : propertyDetails.carpet_area,

        build:
          propertyDetails.build !== undefined && propertyDetails.build !== ""
            ? Number(propertyDetails.build)
            : propertyDetails.build,

        super_build:
          propertyDetails.super_build !== undefined &&
          propertyDetails.super_build !== ""
            ? Number(propertyDetails.super_build)
            : propertyDetails.super_build,

        total_floor:
          propertyDetails.total_floor !== undefined &&
          propertyDetails.total_floor !== ""
            ? Number(propertyDetails.total_floor)
            : propertyDetails.total_floor,

        your_floor:
          propertyDetails.your_floor !== undefined &&
          propertyDetails.your_floor !== ""
            ? Number(propertyDetails.your_floor)
            : propertyDetails.your_floor,

        road_length:
          propertyDetails.road_length !== undefined &&
          propertyDetails.road_length !== ""
            ? Number(propertyDetails.road_length)
            : propertyDetails.road_length,

        pathway_length:
          propertyDetails.pathway_length !== undefined &&
          propertyDetails.pathway_length !== ""
            ? Number(propertyDetails.pathway_length)
            : propertyDetails.pathway_length,

        pathway_width:
          propertyDetails.pathway_width !== undefined &&
          propertyDetails.pathway_width !== ""
            ? Number(propertyDetails.pathway_width)
            : propertyDetails.pathway_width,

        avail_status:
          propertyDetails.avail_status !== undefined &&
          propertyDetails.avail_status !== ""
            ? Number(propertyDetails.avail_status)
            : propertyDetails.avail_status,
      };

      // ---------------------------------------------------
      // Update Context with converted values
      // ---------------------------------------------------

      Object.entries(convertedPropertyDetails).forEach(([key, value]) => {
        updateFormData("propertyDetails", key, value);
      });

      // ---------------------------------------------------
      // Check Property ID
      // ---------------------------------------------------

      if (!propertyId) {
        console.error("Property ID is missing");
        return;
      }

      // ---------------------------------------------------
      // API Payload
      // ---------------------------------------------------

      const payload = {
        step: 2,
        user_id: user?.id,
        prop_id: propertyId,

        ...convertedPropertyDetails,
      };

      // console.log("Commercial Step 2 Payload:", payload);

      // ---------------------------------------------------
      // API Call
      // ---------------------------------------------------

      const response = await postSellPropertyForm(payload);

      // console.log("Commercial Step 2 Response:", response);

      if (response?.success === 0) {
        console.error(
          "Failed to update commercial property details:",
          response?.error,
        );
        return;
      }

      // ---------------------------------------------------
      // Next Step
      // ---------------------------------------------------

      if (mode === "edit") {
        navigate(`/edit-property/${propertyId}/features`);
      } else {
        navigate("/add-property/features");
      }
    } catch (error) {
      // AntD validation error
      // console.log("Commercial property details validation failed:", error);
    }
  };

  const handlePrevious = async () => {
    if (mode === "edit") {
      navigate(`/edit-property/${propertyId}`);
    } else {
      navigate("/add-property/location");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="flex flex-col gap-6"
      >
        {/* -------------------------------------------------
            Property Name
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Property Name")}
          name="prop_name"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please enter property name",
            },
            {
              type: "string",
              message: "Property name must be text",
            },
          ]}
        >
          <Input
            placeholder="Muthvive's Commercial Property for sale"
            className="!rounded-xl !bg-[#f3f3f3] !border-gray-200 !px-5 !py-3 !text-sm !text-gray-900"
            onChange={(e) => handleFieldChange("prop_name", e.target.value)}
            autoComplete="off"
          />
        </Form.Item>

        {/* -------------------------------------------------
            BHK
            Only visible when category = 7
        ------------------------------------------------- */}

        {showBHK && (
          <Form.Item
            label={fieldLabel("Select BHK Paln")}
            name="bhk"
            className="!mb-0"
            rules={[
              {
                required: true,
                message: "Please select BHK",
              },
            ]}
          >
            <ToggleGroup
              options={bhkOptions}
              onChange={(value) => handleFieldChange("bhk", value)}
            />
          </Form.Item>
        )}

        {/* -------------------------------------------------
            Carpet Area
        ------------------------------------------------- */}

        <UnitField
          label="Carpet Area"
          valueName="carpet_area"
          unitName="carp_unit"
          unitOptions={areaUnitOptions}
          defaultUnit="acres"
          rules={[
            {
              required: true,
              message: "Please enter carpet area",
            },
            wholeNumberValidator("Carpet area"),
          ]}
          onValueChange={(value) => handleFieldChange("carpet_area", value)}
          onUnitChange={(value) => handleFieldChange("carp_unit", value)}
        />

        {/* -------------------------------------------------
            Build-Up Area
        ------------------------------------------------- */}

        {hasBuildUpArea && (
          <UnitField
            label="Build-Up Area"
            valueName="build"
            unitName="build_unit"
            unitOptions={areaUnitOptions}
            defaultUnit="acres"
            rules={[
              {
                required: true,
                message: "Please enter build-up area",
              },
              wholeNumberValidator("Build-up area"),
            ]}
            onRemove={handleRemoveBuildUpArea}
            onValueChange={(value) => handleFieldChange("build", value)}
            onUnitChange={(value) => handleFieldChange("build_unit", value)}
          />
        )}

        {!hasBuildUpArea && (
          <button
            type="button"
            onClick={handleAddBuildUpArea}
            className="flex items-center gap-x-1 text-sm text-secondary font-medium self-start"
          >
            <PlusOutlined />
            Add Build-Up Area
          </button>
        )}

        {/* -------------------------------------------------
            Super Build-Up Area
        ------------------------------------------------- */}

        {hasSuperBuildUpArea && (
          <UnitField
            label="Super Build-Up Area"
            valueName="super_build"
            unitName="super_build_unit"
            unitOptions={areaUnitOptions}
            defaultUnit="acres"
            rules={[
              {
                required: true,
                message: "Please enter super build-up area",
              },
              wholeNumberValidator("Super build-up area"),
            ]}
            onRemove={handleRemoveSuperBuildUpArea}
            onValueChange={(value) => handleFieldChange("super_build", value)}
            onUnitChange={(value) =>
              handleFieldChange("super_build_unit", value)
            }
          />
        )}

        {!hasSuperBuildUpArea && (
          <button
            type="button"
            onClick={handleAddSuperBuildUpArea}
            className="flex items-center gap-x-1 text-sm text-secondary font-medium self-start"
          >
            <PlusOutlined />
            Add Super Build-Up Area
          </button>
        )}

        {/* -------------------------------------------------
            Floor Plan
        ------------------------------------------------- */}

        <div>
          <p className="text-sm text-start font-semibold text-gray-900 mb-3">
            Floor Plan
          </p>

          <div className="flex flex-col gap-4">
            <Form.Item
              label={
                <span className="text-sm font-semibold text-gray-700">
                  Total Floor
                </span>
              }
              name="total_floor"
              className="!mb-0"
              getValueFromEvent={(e) => e.target.value}
              rules={[
                {
                  required: true,
                  message: "Please enter total floors",
                },
                wholeNumberValidator("Total floor"),
              ]}
            >
              <Input
                placeholder="20"
                maxLength={5}
                inputMode="numeric"
                className="!rounded-xl !bg-gray-100 !border-gray-200 !px-5 !py-3 !text-sm !text-gray-900"
                onChange={(e) => {
                  const value = e.target.value;

                  // Allow only digits and a maximum of 5 digits
                  const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

                  handleFieldChange("total_floor", digitsOnly);

                  // Keep AntD Form value in sync with the restricted value
                  form.setFieldValue("total_floor", digitsOnly);
                }}
                autoComplete="off"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-sm font-semibold text-gray-700">
                  Your Floor (Optional)
                </span>
              }
              name="your_floor"
              className="!mb-0"
            >
              <Select
                placeholder="Select your floor"
                suffixIcon={<DownOutlined className="text-gray-700" />}
                className={`w-full ${selectSelectorClassName}`}
                classNames={{
                  popup: {
                    root: "property-category-dropdown",
                  },
                }}
                options={floorOptions}
                notFoundContent="Enter total floors first"
                onChange={(value) => handleFieldChange("your_floor", value)}
              />
            </Form.Item>
          </div>
        </div>

        {/* -------------------------------------------------
            Road Plan
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Road Plan")}
          name="road_plan"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select road plan",
            },
          ]}
        >
          <ToggleGroup
            options={roadPlanOptions}
            onChange={handleRoadPlanChange}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Road Length
        ------------------------------------------------- */}

        {isOnRoad && (
          <UnitField
            label="Road Length"
            valueName="road_length"
            unitName="road_length_unit"
            unitOptions={lengthUnitOptions}
            defaultUnit="ft"
            rules={[
              {
                required: true,
                message: "Please enter road length",
              },
              wholeNumberValidator("Road length"),
            ]}
            onValueChange={(value) => handleFieldChange("road_length", value)}
            onUnitChange={(value) =>
              handleFieldChange("road_length_unit", value)
            }
          />
        )}

        {/* -------------------------------------------------
            Interior Pathway
        ------------------------------------------------- */}

        {isInterior && (
          <>
            <Form.Item
              label={fieldLabel("Pathway Available")}
              name="pathway"
              className="!mb-0"
              rules={[
                {
                  required: true,
                  message: "Please select pathway availability",
                },
              ]}
            >
              <ToggleGroup
                options={yesNoOptions}
                onChange={handlePathwayChange}
              />
            </Form.Item>

            {showPathwayDimension && (
              <>
                <p className="text-sm font-semibold text-gray-900 -mb-4">
                  Pathway Dimension
                </p>

                <UnitField
                  label="Length"
                  valueName="pathway_length"
                  unitName="pathway_length_unit"
                  unitOptions={lengthUnitOptions}
                  defaultUnit="ft"
                  rules={[
                    {
                      required: true,
                      message: "Please enter pathway length",
                    },
                    wholeNumberValidator("Pathway length"),
                  ]}
                  onValueChange={(value) =>
                    handleFieldChange("pathway_length", value)
                  }
                  onUnitChange={(value) =>
                    handleFieldChange("pathway_length_unit", value)
                  }
                />

                <UnitField
                  label="Width"
                  valueName="pathway_width"
                  unitName="pathway_width_unit"
                  unitOptions={lengthUnitOptions}
                  defaultUnit="ft"
                  rules={[
                    {
                      required: true,
                      message: "Please enter pathway width",
                    },
                    wholeNumberValidator("Pathway width"),
                  ]}
                  onValueChange={(value) =>
                    handleFieldChange("pathway_width", value)
                  }
                  onUnitChange={(value) =>
                    handleFieldChange("pathway_width_unit", value)
                  }
                />
              </>
            )}
          </>
        )}

        {/* -------------------------------------------------
            Property Facing
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Property Facing")}
          name="facing"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select property facing",
            },
          ]}
        >
          <Select
            placeholder="Select facing"
            suffixIcon={<DownOutlined className="text-gray-700" />}
            className={`w-full py-2.5! bg-[#f3f3f3]! ${selectSelectorClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={facingOptions}
            onChange={(value) => handleFieldChange("facing", value)}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Availability Status
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Availability Status ?")}
          name="avail_status"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select availability status",
            },
          ]}
        >
          <ToggleGroup
            options={availabilityStatusOptions}
            value={
              availabilityStatus !== undefined && availabilityStatus !== null
                ? Number(availabilityStatus)
                : availabilityStatus
            }
            onChange={(value) => {
              form.setFieldValue("avail_status", value);
              handleFieldChange("avail_status", value);
            }}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Navigation
        ------------------------------------------------- */}

        <FormNavigationButtons
          onNext={handleNext}
          onPrevious={handlePrevious}
          disableNext={isNextDisabled}
        />
      </Form>
    </div>
  );
};

export default CommercialPropertyDetailsForm;
