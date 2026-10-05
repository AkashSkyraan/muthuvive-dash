import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import FormNavigationButtons from "../../formNavButtons";
import { useNavigate } from "react-router-dom";
import { useSellProperty } from "../../../context/SellPropertyContext";
import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";
import { useAuth } from "../../../context/AuthContext";

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
// Reusable Toggle Group
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
  "!bg-transparent !border-none !shadow-none !px-5 !py-3 !text-sm";

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
  onValueChange,
  onUnitChange,
}) => {
  const form = Form.useFormInstance();

  // -------------------------------------------------------
  // Set default unit
  // -------------------------------------------------------

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
      <p className="text-base text-start font-semibold text-gray-900 mb-2">
        {label}
      </p>

      <div className="flex items-stretch rounded-xl bg-[#f3f3f3] overflow-hidden border-2 border-gray-200">
        <Form.Item name={valueName} noStyle rules={rules}>
          <Input
            placeholder="200"
            variant="outlined"
            className={`flex-1 ${inputClassName}`}
            onChange={(e) => {
              onValueChange?.(e.target.value);
            }}
            autoComplete="off"
          />
        </Form.Item>

        <div className="w-px h-6 self-center !bg-gray-500 shrink-0" />

        <Form.Item name={unitName} noStyle>
          <Select
            variant="borderless"
            suffixIcon={<DownOutlined className="!text-gray-500 text-sm" />}
            className="!w-24 shrink-0 !h-auto small-unit-select"
            options={unitOptions}
            onChange={(value) => {
              onUnitChange?.(value);
            }}
          />
        </Form.Item>
      </div>

      <Form.Item shouldUpdate noStyle>
        {() => {
          const errors = form.getFieldError(valueName);

          if (!errors.length) return null;

          return <p className="text-xs text-red-500 mt-1">{errors[0]}</p>;
        }}
      </Form.Item>
    </div>
  );
};

// ---------------------------------------------------------
// Label
// ---------------------------------------------------------

const fieldLabel = (text) => (
  <span className="text-base font-semibold text-gray-900">{text}</span>
);

// ---------------------------------------------------------
// Property Details Form
// ---------------------------------------------------------

const PropertyDetailsForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { formData, updateFormData, propertyId, mode } = useSellProperty();

  // -------------------------------------------------------
  // Watch conditional fields only
  // -------------------------------------------------------

  const roadPlan = Form.useWatch("road_plan", form);
  const pathwayAvailable = Form.useWatch("pathway", form);

  // -------------------------------------------------------
  // Conditional fields
  // -------------------------------------------------------

  const isOnRoad = roadPlan === "on";
  const isInterior = roadPlan === "off";

  const showPathwayDimension = isInterior && pathwayAvailable === 1;

  // -------------------------------------------------------
  // Next button disabled state
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
    // Property Area
    isEmpty(formValues?.prop_area) ||
    // Total Plots
    isEmpty(formValues?.total_plots) ||
    // Road Plan
    isEmpty(formValues?.road_plan) ||
    // Road Length - only required when On Road
    (isOnRoad && isEmpty(formValues?.road_length)) ||
    // Pathway - only required when Interior
    (isInterior && isEmpty(formValues?.pathway)) ||
    // Pathway dimensions - only required when pathway is available
    (showPathwayDimension && isEmpty(formValues?.length)) ||
    (showPathwayDimension && isEmpty(formValues?.width)) ||
    // Facing
    isEmpty(formValues?.facing) ||
    // Price per cent
    isEmpty(formValues?.price_per_cent_from) ||
    isEmpty(formValues?.price_per_cent_to);

  // -------------------------------------------------------
  // Restore saved Context data
  // -------------------------------------------------------

  useEffect(() => {
    const savedDetails = formData.propertyDetails;

    if (!savedDetails || Object.keys(savedDetails).length === 0) {
      return;
    }

    form.setFieldsValue(savedDetails);
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
      length: undefined,
      length_unit: undefined,
      width: undefined,
      width_unit: undefined,
      road_length: undefined,
      road_length_unit: undefined,
    });

    updateFormData("propertyDetails", "road_plan", value);

    updateFormData("propertyDetails", "pathway", undefined);

    updateFormData("propertyDetails", "length", undefined);

    updateFormData("propertyDetails", "length_unit", undefined);

    updateFormData("propertyDetails", "width", undefined);

    updateFormData("propertyDetails", "width_unit", undefined);

    updateFormData("propertyDetails", "road_length", undefined);

    updateFormData("propertyDetails", "road_length_unit", undefined);
  };

  // -------------------------------------------------------
  // Next
  // -------------------------------------------------------

  const handleNext = async () => {
    try {
      // AntD validates every currently mounted Form.Item.
      const values = await form.validateFields();

      // ---------------------------------------------------
      // Convert numeric strings to numbers before API
      // ---------------------------------------------------

      const { price_per_cent_from, price_per_cent_to, ...otherValues } = values;

      const convertedValues = {
        ...otherValues,

        prop_area:
          values.prop_area !== undefined && values.prop_area !== ""
            ? Number(values.prop_area)
            : values.prop_area,

        plots:
          values.total_plots !== undefined && values.total_plots !== ""
            ? Number(values.total_plots)
            : values.total_plots,

        min_price:
          price_per_cent_from !== undefined && price_per_cent_from !== ""
            ? Number(price_per_cent_from)
            : price_per_cent_from,

        max_price:
          price_per_cent_to !== undefined && price_per_cent_to !== ""
            ? Number(price_per_cent_to)
            : price_per_cent_to,

        road_length:
          values.road_length !== undefined && values.road_length !== ""
            ? Number(values.road_length)
            : values.road_length,

        length:
          values.length !== undefined && values.length !== ""
            ? Number(values.length)
            : values.length,

        width:
          values.width !== undefined && values.width !== ""
            ? Number(values.width)
            : values.width,

        hp:
          values.hp !== undefined && values.hp !== ""
            ? Number(values.hp)
            : values.hp,
      };

      // ---------------------------------------------------
      // Latest property details
      // ---------------------------------------------------

      const {
        c_well,
        i_well,
        electricity,
        hp,
        construct,
        construct_type,
        other_type,
        price_per_cent_from: savedPriceFrom,
        price_per_cent_to: savedPriceTo,
        ...savedPropertyDetails
      } = formData.propertyDetails;

      const latestPropertyDetails = {
        ...savedPropertyDetails,
        ...convertedValues,
      };

      // ---------------------------------------------------
      // Update Context
      // ---------------------------------------------------

      Object.entries(convertedValues).forEach(([key, value]) => {
        updateFormData("propertyDetails", key, value);
      });

      // ---------------------------------------------------
      // Also save the UI price fields into Context
      // ---------------------------------------------------

      updateFormData(
        "propertyDetails",
        "price_per_cent_from",
        price_per_cent_from,
      );

      updateFormData("propertyDetails", "price_per_cent_to", price_per_cent_to);

      // ---------------------------------------------------
      // Property ID
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
        ...latestPropertyDetails,
      };

      // console.log("Step 2 Payload:", payload);

      // ---------------------------------------------------
      // API Call
      // ---------------------------------------------------

      const response = await postSellPropertyForm(payload);

      // console.log("Step 2 Response:", response);

      if (response?.success === 0) {
        console.error("Failed to update property details:", response?.error);
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
      // AntD validation errors come here.
      // console.log("Property details validation failed:", error);
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
            placeholder="Muthvive's Agriculture Land for sale"
            className="!rounded-xl bg-[#f3f3f3]! !px-5 !py-3 !text-sm"
            onChange={(e) => handleFieldChange("prop_name", e.target.value)}
            autoComplete="off"
          />
        </Form.Item>

        {/* -------------------------------------------------
            Property Area
        ------------------------------------------------- */}

        <UnitField
          label="Property Area"
          valueName="prop_area"
          unitName="area_unit"
          unitOptions={areaUnitOptions}
          defaultUnit="acres"
          rules={[
            {
              required: true,
              message: "Please enter property area",
            },
            wholeNumberValidator("Property area"),
          ]}
          onValueChange={(value) => handleFieldChange("prop_area", value)}
          onUnitChange={(value) => handleFieldChange("area_unit", value)}
        />

        {/* -------------------------------------------------
            Total Plots
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Total Plots")}
          name="total_plots"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please enter total plots",
            },
            wholeNumberValidator("Total plots"),
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            controls
            parser={(value) => value?.replace(/\D/g, "")}
            placeholder="10"
            className="!w-full !h-12 !rounded-xl !bg-[#f3f3f3] !border-gray-200 !text-sm"
            onChange={(value) => handleFieldChange("total_plots", value)}
          />
        </Form.Item>

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
                onChange={(value) => handleFieldChange("pathway", value)}
              />
            </Form.Item>

            {showPathwayDimension && (
              <>
                <p className="text-base font-semibold text-gray-900 -mb-4">
                  Pathway Dimension
                </p>

                <UnitField
                  label="Length"
                  valueName="length"
                  unitName="length_unit"
                  unitOptions={lengthUnitOptions}
                  defaultUnit="ft"
                  rules={[
                    {
                      required: true,
                      message: "Please enter pathway length",
                    },
                    wholeNumberValidator("Pathway length"),
                  ]}
                  onValueChange={(value) => handleFieldChange("length", value)}
                  onUnitChange={(value) =>
                    handleFieldChange("length_unit", value)
                  }
                />

                <UnitField
                  label="Width"
                  valueName="width"
                  unitName="width_unit"
                  unitOptions={lengthUnitOptions}
                  defaultUnit="ft"
                  rules={[
                    {
                      required: true,
                      message: "Please enter pathway width",
                    },
                    wholeNumberValidator("Pathway width"),
                  ]}
                  onValueChange={(value) => handleFieldChange("width", value)}
                  onUnitChange={(value) =>
                    handleFieldChange("width_unit", value)
                  }
                />
              </>
            )}
          </>
        )}

        {/* -------------------------------------------------
            Facing
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Property Facing")}
          name="facing"
          className="mb-0!"
          rules={[
            {
              required: true,
              message: "Please select property facing",
            },
          ]}
        >
          <Select
            placeholder="Select facing"
            suffixIcon={<DownOutlined className="text-black!" />}
            onChange={(value) => handleFieldChange("facing", value)}
            className="w-full py-2.5!
              [&_.ant-select-selector]:!rounded-xl
              [&_.ant-select-selector]:!border-gray-200
              [&_.ant-select-selector]:!px-5
              [&_.ant-select-selector]:!h-12
              [&_.ant-select-selection-item]:!leading-[48px]
              [&_.ant-select-selection-placeholder]:!leading-[48px]"
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            style={{
              backgroundColor: "#f3f3f3",
            }}
            options={facingOptions}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Price Per Cent
        ------------------------------------------------- */}

        <div>
          <p className="text-base font-semibold text-gray-900 mb-2 text-start">
            Price per cent
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2 text-start">
                From
              </p>

              <Form.Item
                name="price_per_cent_from"
                className="!mb-0"
                rules={[
                  {
                    required: true,
                    message: "Please enter starting price",
                  },
                  wholeNumberValidator("Price"),
                ]}
              >
                <Input
                  placeholder="Price Starting From"
                  inputMode="numeric"
                  className="!rounded-xl !bg-[#f3f3f3] !border-gray-200 !px-5 !py-3 !text-sm"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    form.setFieldValue("price_per_cent_from", value);

                    // Save into Context so it survives
                    // navigation to the next/previous step.
                    handleFieldChange("price_per_cent_from", value);
                  }}
                  autoComplete="off"
                />
              </Form.Item>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2 text-start">
                To
              </p>

              <Form.Item
                name="price_per_cent_to"
                className="!mb-0"
                rules={[
                  {
                    required: true,
                    message: "Please enter ending price",
                  },
                  wholeNumberValidator("Price"),
                ]}
              >
                <Input
                  placeholder="Price Ending to"
                  inputMode="numeric"
                  className="!rounded-xl !bg-[#f3f3f3] !border-gray-200 !px-5 !py-3 !text-sm"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    form.setFieldValue("price_per_cent_to", value);

                    // Save into Context so it survives
                    // navigation to the next/previous step.
                    handleFieldChange("price_per_cent_to", value);
                  }}
                  autoComplete="off"
                />
              </Form.Item>
            </div>
          </div>
        </div>

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

export default PropertyDetailsForm;
