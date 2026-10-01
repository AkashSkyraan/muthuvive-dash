import axiosInstance from "./axios";

export const postTestimonials = async (payload = {}) => {
  const response = await axiosInstance.post(
    "/testimonial/add-testimonial",
    payload,
  );
  return response.data;
};

export const getTestimonials = async (filters = {}) => {
  const response = await axiosInstance.get("/testimonial/testimonials", {
    params: filters,
  });
  return response.data.data;
};
