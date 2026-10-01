import axiosInstance from "./axios";

export const postSellPropertyForm = async (payload = {}) => {
  const response = await axiosInstance.post("/form/properties/step", payload);
  return response.data;
};
