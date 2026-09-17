import axiosInstance from "./axios";

export const postUpload = async (file = []) => {
  const formData = new FormData();

  formData.append("files", file);

  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
