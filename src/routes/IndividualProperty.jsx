import PropertyDetails from "../pages/individualProperty/Index";

const propertyRoutes = [
  {
    path: "/dashboard/property/:propertyId",
    element: <PropertyDetails />,
  },
];

export default propertyRoutes;
