import axiosInstance from "./axios";

export const postGallery = async (payload = {}) => {
  const response = await axiosInstance.post("/gallery/add-gallery", payload);
  return response.data;
};

export const getGallery = async (filters = {}) => {
  const response = await axiosInstance.get("/gallery/get-gallery", {
    params: filters,
  });
  return response.data.data;
};
