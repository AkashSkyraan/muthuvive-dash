import axiosInstance from "./axios";

export const postAmenity = async (payload = {}) => {
  const response = await axiosInstance.post("/src/add-amenities", payload);
  return response.data;
};

export const getAmenity = async (filters = {}) => {
  const response = await axiosInstance.get("/src/get-amenities", {
    params: filters,
  });
  return response.data.data;
};
