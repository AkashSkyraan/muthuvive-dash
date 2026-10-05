import PropertyDetails from "../pages/individualProperty/Index";

const propertyRoutes = [
  {
    path: "/property/:propertyId",
    element: <PropertyDetails />,
  },
];

export default propertyRoutes;
