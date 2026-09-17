import AmenitiesList from "../pages/amenities/ListAmenities";
import AddAmenities from "../pages/amenities/AddAmenities";

const amenitiesRoutes = [
  {
    path: "amenities/list",
    element: <AmenitiesList />,
  },
  {
    path: "amenities/add",
    element: <AddAmenities />,
  },
];

export default amenitiesRoutes;
