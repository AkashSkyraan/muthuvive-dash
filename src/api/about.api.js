import axiosInstance from "./axios";

export const createConsultant = async (formData) => {
  const response = await axiosInstance.post("/about/add-consultant", formData);

  return response.data;
};

export const getConsultantById = async (id) => {
  const response = await axiosInstance.get(`/about/consultant`);

  return response.data;
};

export const uploadMedia = async (formData) => {
  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
