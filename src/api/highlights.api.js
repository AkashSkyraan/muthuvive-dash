import axiosInstance from "./axios";

export const postHighlights = async (payload = {}) => {
  const response = await axiosInstance.post(
    "/src/add-prop-highlights",
    payload,
  );
  return response.data;
};

export const getHighlights = async (filters = {}) => {
  const response = await axiosInstance.get("/src/get-prop-highlights", {
    params: filters,
  });
  return response.data.data;
};
