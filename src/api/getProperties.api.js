import axiosInstance from "./axios";

export const getIndividualProperties = async (filters = {}) => {
  const response = await axiosInstance.get("/form/get-prop-byid", {
    params: filters,
  });
  return response.data.data;
};
