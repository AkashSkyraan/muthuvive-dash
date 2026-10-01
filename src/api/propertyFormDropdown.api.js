import axiosInstance from "./axios";

export const getPropertyCategories = async (filters = {}) => {
  const response = await axiosInstance.get("/property/properties", {
    params: filters,
  });
  return response.data.data;
};

export const getSubPropertyCategories = async (filters = {}) => {
  const response = await axiosInstance.get("/property/get-sub-prop", {
    params: filters,
  });
  return response.data.data;
};

export const getLocationCategories = async (filters = {}) => {
  const response = await axiosInstance.get("/src/get-pincode-details", {
    params: filters,
  });
  return response.data.data;
};

export const getAmenity = async (filters = {}) => {
  const response = await axiosInstance.get("/src/get-amenities", {
    params: filters,
  });
  return response.data.data;
};

export const getPropertyHighlight = async (filters = {}) => {
  const response = await axiosInstance.get("/src/get-prop-highlights", {
    params: filters,
  });
  return response.data.data;
};
