import TestimonialsList from "../pages/testimonials/ListTestimonials";
import AddTestimonials from "../pages/testimonials/AddTestimonials";

const testimonialsRoutes = [
  {
    path: "testimonial/list",
    element: <TestimonialsList />,
  },
  {
    path: "testimonial/add",
    element: <AddTestimonials />,
  },
];

export default testimonialsRoutes;
