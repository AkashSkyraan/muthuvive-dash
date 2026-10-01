import React, { useEffect, useState } from "react";
import { Form, Select, Input } from "antd";
import { DownOutlined } from "@ant-design/icons";
import FormNavigationButtons from "../../formNavButtons";
import { useNavigate } from "react-router-dom";
import { getLocationCategories } from "../../../api/propertyFormDropdown.api";
import { useSellProperty } from "../../../context/SellPropertyContext";

import { postSellPropertyForm } from "../../../api/sellPropertyForm.api";
import { useAuth } from "../../../context/UserContext";

// Dynamic data - replace with API response
const countries = [{ value: "india", label: "India" }];

const selectClassName =
  "!h-12 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!bg-gray-100 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!px-5 [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-item]:!leading-[48px] [&_.ant-select-selection-placeholder]:!leading-[48px]";

const LocationForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    formData,
    updateFormData,
    propertyId,
    setPropertyId,
    mode,
    resetFormData,
  } = useSellProperty();

  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [stateSearchText, setStateSearchText] = useState("");
  const [districtSearchText, setDistrictSearchText] = useState("");
  const [citySearchText, setCitySearchText] = useState("");

  const [locationParams, setLocationParams] = useState({
    country: "india",
    state: "",
    district: "",
  });

  // ============================================================
  // Save default country to Context
  // ============================================================

  useEffect(() => {
    updateFormData("location", "country", "india");
  }, []);

  // ============================================================
  // Restore saved location data from Context
  // ============================================================

  useEffect(() => {
    const savedLocation = formData.location;

    if (!savedLocation) {
      return;
    }

    form.setFieldsValue({
      country: savedLocation.country || "india",
      state: savedLocation.state || undefined,
      district: savedLocation.district || undefined,
      city: savedLocation.city || undefined,
      map: savedLocation.map || undefined,
    });

    setLocationParams({
      country: savedLocation.country || "india",
      state: savedLocation.state || "",
      district: savedLocation.district || "",
    });
  }, [formData.location, form]);

  const country = Form.useWatch("country", form);
  const state = Form.useWatch("state", form);
  const district = Form.useWatch("district", form);
  const city = Form.useWatch("city", form);
  const map = Form.useWatch("map", form);

  const isStateEnabled = Boolean(country);
  const isDistrictEnabled = Boolean(state);
  const isCityEnabled = Boolean(district);

  // Next only enables once every field actually has a value
  const isAllFieldsFilled = Boolean(country && state && district && city);

  // ============================================================
  // Filter State Options
  // ============================================================

  const filteredStateOptions =
    stateSearchText.trim().length >= 3
      ? stateOptions.filter((option) =>
          option.state
            ?.toLowerCase()
            .includes(stateSearchText.trim().toLowerCase()),
        )
      : [];

  // ============================================================
  // Filter District Options
  // ============================================================

  const filteredDistrictOptions =
    districtSearchText.trim().length >= 3
      ? districtOptions.filter((option) =>
          option.district
            ?.toLowerCase()
            .includes(districtSearchText.trim().toLowerCase()),
        )
      : [];

  // ============================================================
  // Filter City Options
  // ============================================================

  const filteredCityOptions =
    citySearchText.trim().length >= 3
      ? cityOptions.filter((option) =>
          option.city
            ?.toLowerCase()
            .includes(citySearchText.trim().toLowerCase()),
        )
      : [];

  // ============================================================
  // Fetch states when country changes
  // ============================================================

  useEffect(() => {
    if (!locationParams.country) {
      setStateOptions([]);
      return;
    }

    const fetchStates = async () => {
      try {
        const data = await getLocationCategories({
          country: locationParams?.country,
        });

        setStateOptions(data);
      } catch (error) {
        console.error("Failed to fetch states:", error);
        setStateOptions([]);
      }
    };

    fetchStates();
  }, [locationParams.country]);

  // ============================================================
  // Fetch districts when state changes
  // ============================================================

  useEffect(() => {
    if (!locationParams.state) {
      setDistrictOptions([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const data = await getLocationCategories({
          country: locationParams.country,
          state: locationParams.state,
        });

        setDistrictOptions(data);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        setDistrictOptions([]);
      }
    };

    fetchDistricts();
  }, [locationParams.country, locationParams.state]);

  // ============================================================
  // Fetch cities when district changes
  // ============================================================

  useEffect(() => {
    if (!locationParams.district) {
      setCityOptions([]);
      return;
    }

    const fetchCities = async () => {
      try {
        const data = await getLocationCategories({
          country: locationParams.country,
          state: locationParams.state,
          district: locationParams.district,
        });

        setCityOptions(data);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        setCityOptions([]);
      }
    };

    fetchCities();
  }, [locationParams.country, locationParams.state, locationParams.district]);

  // ============================================================
  // Handle country change
  // ============================================================

  const handleCountryChange = (value) => {
    form.setFieldsValue({
      state: undefined,
      district: undefined,
      city: undefined,
    });

    setStateOptions([]);
    setDistrictOptions([]);
    setCityOptions([]);

    setStateSearchText("");
    setDistrictSearchText("");
    setCitySearchText("");

    setLocationParams({
      country: value,
      state: "",
      district: "",
    });

    // Save country to Context
    updateFormData("location", "country", value);

    // Clear dependent values from Context
    updateFormData("location", "state", undefined);

    updateFormData("location", "district", undefined);

    updateFormData("location", "city", undefined);
  };

  // ============================================================
  // Handle state change
  // ============================================================

  const handleStateChange = (value) => {
    form.setFieldsValue({
      district: undefined,
      city: undefined,
    });

    setDistrictOptions([]);
    setCityOptions([]);

    setDistrictSearchText("");
    setCitySearchText("");

    setLocationParams((prev) => ({
      ...prev,
      state: value,
      district: "",
    }));

    // Save state
    updateFormData("location", "state", value);

    // Clear dependent values
    updateFormData("location", "district", undefined);

    updateFormData("location", "city", undefined);
  };

  // ============================================================
  // Handle district change
  // ============================================================

  const handleDistrictChange = (value) => {
    form.setFieldValue("city", undefined);

    setCityOptions([]);
    setCitySearchText("");

    setLocationParams((prev) => ({
      ...prev,
      district: value,
    }));

    // Save district
    updateFormData("location", "district", value);

    // Clear dependent city
    updateFormData("location", "city", undefined);
  };

  // ============================================================
  // Handle city change
  // ============================================================

  const handleCityChange = (value) => {
    updateFormData("location", "city", value);
  };

  const fieldLabel = (text, enabled) => (
    <span
      className={`text-base font-semibold ${
        enabled ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {text}
    </span>
  );

  // ============================================================
  // Handle Next
  // ============================================================

  const handleNext = async () => {
    const values = await form.validateFields();

    // Make sure the latest values are stored in Context
    updateFormData("location", "country", values.country || "india");
    updateFormData("location", "state", values.state);
    updateFormData("location", "district", values.district);
    updateFormData("location", "city", values.city);
    updateFormData("location", "map", values.map);

    // ============================================================
    // Prepare payload
    // ============================================================

    const payload = {
      step: 1,
      user_id: user?.id,
      type: "admin",

      ...formData.category,

      // Use latest form values
      country: values.country || "india",
      state: values.state,
      district: values.district,
      city: values.city,
      map_link: values.map,

      // Add property_id only when propertyId already exists
      ...(propertyId !== null && {
        prop_id: propertyId,
      }),
    };

    try {
      const response = await postSellPropertyForm(payload);

      // If creating a new property, store the returned property ID
      if (propertyId === null) {
        setPropertyId(response?.data?.prop_id);
      }

      if (response.success === 0) {
        throw new Error("Failed to save property location");
      }

      // Move to next step only after successful API call
      if (mode === "edit") {
        navigate(`/dashboard/edit-property/${propertyId}/details`);
      } else {
        navigate("/dashboard/add-property/details");
      }
    } catch (error) {
      console.error("Failed to save property:", error);

      // Add your existing status message here if you want:
      //
      // showStatusMessage({
      //   type: "error",
      //   text: "Failed to save property",
      // });
    }
  };

  // ============================================================
  // Handle Previous
  // ============================================================

  const handlePrevious = async () => {
    if (mode === "edit") {
      resetFormData();

      navigate("/dashboard/list-property");
    } else {
      navigate("/dashboard/add-property");
    }
  };

  return (
    <div className="w-full max-w-xl">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ country: "india" }}
      >
        {/* ======================================================
            COUNTRY
        ====================================================== */}

        <Form.Item label={fieldLabel("Country", true)} name="country">
          <Select
            placeholder="Select your Category"
            suffixIcon={<DownOutlined className="text-gray-400" />}
            className={`w-full bg-[#f3f3f3]! !text-base ${selectClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={countries}
            value="india"
            disabled
          />
        </Form.Item>

        {/* ======================================================
            STATE
        ====================================================== */}

        <Form.Item
          label={fieldLabel("State", isStateEnabled)}
          name="state"
          rules={[
            {
              required: true,
              message: "Please select a state",
            },
          ]}
        >
          <Select
            placeholder="Type at least 3 letters to search"
            showSearch
            filterOption={false}
            searchValue={stateSearchText}
            onSearch={setStateSearchText}
            notFoundContent={
              stateSearchText.trim().length < 3
                ? "Type at least 3 letters"
                : "No matching states"
            }
            suffixIcon={
              <DownOutlined
                className={isStateEnabled ? "text-gray-700" : "text-gray-400"}
              />
            }
            disabled={!isStateEnabled}
            className={`w-full bg-[#f3f3f3]! !text-base ${selectClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={filteredStateOptions}
            fieldNames={{
              label: "state",
              value: "state",
            }}
            onChange={handleStateChange}
          />
        </Form.Item>

        {/* ======================================================
            DISTRICT
        ====================================================== */}

        <Form.Item
          label={fieldLabel("District", isDistrictEnabled)}
          name="district"
          rules={[
            {
              required: true,
              message: "Please select a district",
            },
          ]}
        >
          <Select
            placeholder="Type at least 3 letters to search"
            showSearch
            filterOption={false}
            searchValue={districtSearchText}
            onSearch={setDistrictSearchText}
            notFoundContent={
              districtSearchText.trim().length < 3
                ? "Type at least 3 letters"
                : "No matching districts"
            }
            suffixIcon={
              <DownOutlined
                className={
                  isDistrictEnabled ? "text-gray-700" : "text-gray-400"
                }
              />
            }
            disabled={!isDistrictEnabled}
            className={`w-full bg-[#f3f3f3]! !text-base ${selectClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={filteredDistrictOptions}
            fieldNames={{
              label: "district",
              value: "district",
            }}
            onChange={handleDistrictChange}
          />
        </Form.Item>

        {/* ======================================================
            CITY
        ====================================================== */}

        <Form.Item
          label={fieldLabel("Area", isCityEnabled)}
          name="city"
          rules={[
            {
              required: true,
              message: "Please select a city",
            },
          ]}
        >
          <Select
            placeholder="Type at least 3 letters to search"
            showSearch
            filterOption={false}
            searchValue={citySearchText}
            onSearch={setCitySearchText}
            notFoundContent={
              citySearchText.trim().length < 3
                ? "Type at least 3 letters"
                : "No matching cities"
            }
            suffixIcon={
              <DownOutlined
                className={isCityEnabled ? "text-gray-700" : "text-gray-400"}
              />
            }
            disabled={!isCityEnabled}
            className={`w-full bg-[#f3f3f3]! !text-base ${selectClassName}`}
            classNames={{
              popup: {
                root: "property-category-dropdown",
              },
            }}
            options={filteredCityOptions}
            fieldNames={{
              label: "city",
              value: "city",
            }}
            onChange={handleCityChange}
          />
        </Form.Item>

        <Form.Item label={fieldLabel("Map link", true)} name="map">
          <Input
            placeholder="Enter or paste map link"
            className="!h-12 !rounded-xl !bg-gray-100 !border-gray-200 !px-5 !text-base"
            onChange={(e) => {
              updateFormData("location", "map", e.target.value);
            }}
          />
        </Form.Item>

        <FormNavigationButtons
          onPrevious={handlePrevious}
          onNext={handleNext}
          disableNext={!isAllFieldsFilled}
          showPrevious={mode === "edit" ? false : true}
        />
      </Form>
    </div>
  );
};

export default LocationForm;
