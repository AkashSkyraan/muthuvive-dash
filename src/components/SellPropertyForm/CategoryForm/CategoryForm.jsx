import React, { useEffect, useState } from "react";
import { Form, Select, Modal } from "antd";
import { DownOutlined } from "@ant-design/icons";
import FormNavigationButtons from "../../formNavButtons";
import { useNavigate } from "react-router-dom";
import { useSellProperty } from "../../../context/SellPropertyContext";
import { getPropertyCategories } from "../../../api/propertyFormDropdown.api";
// import { deleteProperty } from "../../../api/property.api";

const selectClassName =
  "!h-12 [&_.ant-select-selector]:!rounded-full [&_.ant-select-selector]:!bg-gray-500 [&_.ant-select-selector]:!px-5 [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-item]:!leading-[48px] [&_.ant-select-selection-placeholder]:!leading-[48px] [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-placeholder]:!text-white";

const PropertyCategoryForm = ({ onPrevious }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    category,
    setCategory,
    formData,
    updateFormData,
    propertyId,
    setPropertyId,
    resetCategoryDependentData,
  } = useSellProperty();

  // ============================================================
  // STATE
  // ============================================================

  const [propertyCategories, setPropertyCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ============================================================
  // WATCHED FORM VALUE
  // ============================================================

  const categoryValue = Form.useWatch("category", form);

  // ============================================================
  // FILTER CATEGORIES
  // ============================================================
  // IDs 5 and 6 should not be shown to the user
  // ============================================================

  const filteredPropertyCategories = propertyCategories.filter(
    (item) => item.id <= 2,
  );

  // ============================================================
  // RESTORE PREVIOUSLY ENTERED CATEGORY FROM CONTEXT
  // ============================================================

  useEffect(() => {
    const savedCategory = formData.category;

    if (!savedCategory) {
      return;
    }

    if (savedCategory.category) {
      form.setFieldsValue({
        category: savedCategory.category,
      });
    }
  }, [formData.category, form]);

  // ============================================================
  // FETCH MAIN PROPERTY CATEGORIES
  // ============================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await getPropertyCategories();

        setPropertyCategories(data);
      } catch (error) {
        console.error("Failed to fetch property categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ============================================================
  // HANDLE CATEGORY SELECTION
  // ============================================================

  const handleCategoryChange = (value) => {
    const selectedCategory = propertyCategories.find(
      (category) => category.id === value,
    );

    // Existing saved category
    const savedCategory = formData.category?.category;

    // ==========================================================
    // If propertyId does NOT exist:
    // No need to show confirmation modal.
    // ==========================================================

    if (!propertyId) {
      setCategory(value);

      updateFormData("category", "category", value);

      return;
    }

    // ==========================================================
    // If selected category is the same as existing category:
    // No modal required.
    // ==========================================================

    if (savedCategory === value) {
      return;
    }

    // ==========================================================
    // Existing property + category changed
    // Show confirmation modal.
    // ==========================================================

    // Put the old category back in the Form immediately.
    // This prevents the UI from changing before confirmation.
    form.setFieldValue("category", savedCategory);

    Modal.confirm({
      title: "Change Property Category ?",

      content: (
        <p className="mt-2 text-base leading-6 text-gray-500">
          Changing the property category will erase the previously entered
          property details and features. Do you want to continue?
        </p>
      ),

      centered: true,
      okText: "Yes",
      cancelText: "No",

      onOk: async () => {
        try {
          // ======================================================
          // Delete existing property
          // ======================================================

          // Replace this with your actual delete API.
          //
          // await deleteProperty({
          //   property_id: propertyId,
          // });

          // ======================================================
          // Clear category-dependent frontend data
          // ======================================================

          resetCategoryDependentData();

          // Clear old property ID
          setPropertyId(null);

          // ======================================================
          // Set newly selected category
          // ======================================================

          form.setFieldValue("category", value);

          setCategory(value);

          updateFormData("category", "category", value);
        } catch (error) {
          console.error("Failed to change property category:", error);

          // Restore old category if delete failed
          form.setFieldValue("category", savedCategory);
        }
      },
    });
  };

  // ============================================================
  // HANDLE NEXT
  // ============================================================

  const handleNext = async () => {
    const values = await form.validateFields();

    // Keep the category state because you are using it
    // to determine which next form should be rendered.
    setCategory(values.category);

    // Save only category into Context
    updateFormData("category", "category", values.category);

    // Step 1 moves to Step 2
    navigate("/add-property/location");
  };

  const isNextDisabled = !categoryValue;

  return (
    <div className="w-full max-w-xl">
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          label={
            <span className="text-base font-semibold text-gray-900">
              Select Category
            </span>
          }
          name="category"
          rules={[
            {
              required: true,
              message: "Please select a category",
            },
          ]}
        >
          <Select
            placeholder="Select your Category"
            suffixIcon={<DownOutlined className="text-gray-900!" />}
            className={`w-full bg-[#f3f3f3]! !text-base    
             ${selectClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={filteredPropertyCategories}
            fieldNames={{
              label: "name",
              value: "id",
            }}
            onChange={handleCategoryChange}
          />
        </Form.Item>

        {/* Reusable navigation buttons */}
        <FormNavigationButtons
          // onPrevious={handlePrevious}
          onNext={handleNext}
          disableNext={isNextDisabled}
          showPrevious={false}
        />
      </Form>
    </div>
  );
};

export default PropertyCategoryForm;
