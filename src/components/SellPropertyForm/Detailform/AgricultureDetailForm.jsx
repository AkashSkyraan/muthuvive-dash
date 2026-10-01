import React, { useEffect } from "react";
import { Form, Input, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import FormNavigationButtons from "../../formNavButtons";
import { useNavigate } from "react-router-dom";
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

const wellOptions = [
  { value: 0, label: "Not-Available" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

const electricityOptions = [
  { value: 0, label: "Not-Available" },
  { value: 1, label: "Individual Electricity" },
  { value: 2, label: "Common Electricity" },
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

const constructionTypeOptions = [
  { value: 1, label: "Shed" },
  { value: 2, label: "Commercial Building" },
  { value: 3, label: "Home" },
  { value: 0, label: "Others" },
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
        new Error(`${fieldName} must contain only whole numbers`),
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

      {/*
        The value Form.Item above is noStyle (needed so the input/select
        can sit inside one combined box), so it never renders its own
        error text. This reads the live validation error for the same
        field straight from the form store and renders it here instead —
        this is what actually surfaces the wholeNumberValidator message.
      */}
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
  const electricityAvailable = Form.useWatch("electricity", form);
  const constructionDone = Form.useWatch("construct", form);
  const constructionType = Form.useWatch("construct_type", form);

  // -------------------------------------------------------
  // Conditional fields
  // -------------------------------------------------------

  const isOnRoad = roadPlan === "on";
  const isInterior = roadPlan === "off";

  const showPathwayDimension = isInterior && pathwayAvailable === 1;

  const showHorsepower =
    electricityAvailable !== undefined &&
    electricityAvailable !== null &&
    electricityAvailable !== 0;

  const showConstructionType = constructionDone === 1;

  const showOthersDescription = constructionType === 0;

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
    // Road Plan
    isEmpty(formValues?.road_plan) ||
    // Road Length - only required when On Road
    (isOnRoad && isEmpty(formValues?.road_length)) ||
    // Pathway - only required when Interior
    (isInterior && isEmpty(formValues?.pathway)) ||
    // Pathway dimensions - only required when pathway is available
    (showPathwayDimension && isEmpty(formValues?.length)) ||
    (showPathwayDimension && isEmpty(formValues?.width)) ||
    // Common Well
    isEmpty(formValues?.c_well) ||
    // Individual Well
    isEmpty(formValues?.i_well) ||
    // Electricity
    isEmpty(formValues?.electricity) ||
    // Horsepower - only required when electricity is available
    (showHorsepower && isEmpty(formValues?.hp)) ||
    // Facing
    isEmpty(formValues?.facing) ||
    // Construction
    isEmpty(formValues?.construct) ||
    // Construction Type - only when construction is done
    (showConstructionType && isEmpty(formValues?.construct_type)) ||
    // Other Construction Description - only for Others
    (showOthersDescription && isEmpty(formValues?.other_type));

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
  // Electricity Change
  // -------------------------------------------------------

  const handleElectricityChange = (value) => {
    form.setFieldsValue({
      electricity: value,
      hp: value === 0 ? undefined : form.getFieldValue("hp"),
    });

    updateFormData("propertyDetails", "electricity", value);

    if (value === 0) {
      updateFormData("propertyDetails", "hp", undefined);
    }
  };

  // -------------------------------------------------------
  // Construction Done Change
  // -------------------------------------------------------

  const handleConstructionDoneChange = (value) => {
    form.setFieldsValue({
      construct: value,

      construct_type:
        value === 1 ? form.getFieldValue("construct_type") : undefined,

      other_type: value === 1 ? form.getFieldValue("other_type") : undefined,
    });

    updateFormData("propertyDetails", "construct", value);

    if (value !== 1) {
      updateFormData("propertyDetails", "construct_type", undefined);

      updateFormData("propertyDetails", "other_type", undefined);
    }
  };

  // -------------------------------------------------------
  // Construction Type Change
  // -------------------------------------------------------

  const handleConstructionTypeChange = (value) => {
    form.setFieldsValue({
      construct_type: value,

      other_type: value === 0 ? form.getFieldValue("other_type") : undefined,
    });

    updateFormData("propertyDetails", "construct_type", value);

    if (value !== 0) {
      updateFormData("propertyDetails", "other_type", undefined);
    }
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

      const convertedValues = {
        ...values,

        prop_area:
          values.prop_area !== undefined && values.prop_area !== ""
            ? Number(values.prop_area)
            : values.prop_area,

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

      const latestPropertyDetails = {
        ...formData.propertyDetails,
        ...convertedValues,
      };

      // ---------------------------------------------------
      // Update Context
      // ---------------------------------------------------

      Object.entries(convertedValues).forEach(([key, value]) => {
        updateFormData("propertyDetails", key, value);
      });

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
        navigate(`/dashboard/edit-property/${propertyId}/features`);
      } else {
        navigate("/dashboard/add-property/features");
      }
    } catch (error) {
      // AntD validation errors come here.
      // console.log("Property details validation failed:", error);
    }
  };

  const handlePrevious = async () => {
    if (mode === "edit") {
      navigate(`/dashboard/edit-property/${propertyId}`);
    } else {
      navigate("/dashboard/add-property/location");
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
            Common Well
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Common well Available ?")}
          name="c_well"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select common well availability",
            },
          ]}
        >
          <ToggleGroup
            options={wellOptions}
            onChange={(value) => handleFieldChange("c_well", value)}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Individual Well
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Individual well Available ?")}
          name="i_well"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select individual well availability",
            },
          ]}
        >
          <ToggleGroup
            options={wellOptions}
            onChange={(value) => handleFieldChange("i_well", value)}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Electricity
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Electricity Available ?")}
          name="electricity"
          className="!mb-0"
          rules={[
            {
              required: true,
              message: "Please select electricity availability",
            },
          ]}
        >
          <ToggleGroup
            options={electricityOptions}
            onChange={handleElectricityChange}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Horsepower
        ------------------------------------------------- */}

        {showHorsepower && (
          <Form.Item
            label={
              <span className="text-sm text-gray-900">
                <span className="font-semibold">(HP)</span> Horsepower
              </span>
            }
            name="hp"
            className="!mb-0"
            rules={[
              {
                required: true,
                message: "Please enter horsepower",
              },
              wholeNumberValidator("Horsepower"),
            ]}
          >
            <Input
              placeholder="200"
              className="!rounded-xl !bg-gray-100 !border-gray-200 !px-5 !py-3 !text-sm"
              onChange={(e) => handleFieldChange("hp", e.target.value)}
              autoComplete="off"
            />
          </Form.Item>
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
            Construction Done
        ------------------------------------------------- */}

        <Form.Item
          label={fieldLabel("Any Construction done on this property ?")}
          name="construct"
          className="mb-0!"
          rules={[
            {
              required: true,
              message: "Please select construction availability",
            },
          ]}
        >
          <ToggleGroup
            options={yesNoOptions}
            onChange={handleConstructionDoneChange}
          />
        </Form.Item>

        {/* -------------------------------------------------
            Construction Type
        ------------------------------------------------- */}

        {showConstructionType && (
          <Form.Item
            label={fieldLabel("What type of construction has been done ?")}
            name="construct_type"
            className="!mb-0"
            rules={[
              {
                required: true,
                message: "Please select construction type",
              },
            ]}
          >
            <ToggleGroup
              options={constructionTypeOptions}
              onChange={handleConstructionTypeChange}
            />
          </Form.Item>
        )}

        {/* -------------------------------------------------
            Other Construction Description
        ------------------------------------------------- */}

        {showOthersDescription && (
          <Form.Item
            label={fieldLabel("Please describe the construction")}
            name="other_type"
            className="!mb-0"
            rules={[
              {
                required: true,
                message: "Please describe the construction",
              },
              {
                type: "string",
                message: "Construction description must be text",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Describe the construction here..."
              maxLength={500}
              showCount
              rows={4}
              className="!rounded-xl !bg-[#f3f3f3] !border-gray-200 !px-5 !py-3 !text-sm"
              onChange={(e) => handleFieldChange("other_type", e.target.value)}
              autoComplete="off"
            />
          </Form.Item>
        )}

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
