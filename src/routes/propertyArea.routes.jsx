import CreatePropertyArea from "../pages/proparea/CreatePropertyArea";
import PropertyAreaList from "../pages/proparea/PropertyAreaList";

const propertyAreaRoutes = [
  {
    path: "property-area/create",
    element: <CreatePropertyArea />,
  },
  {
    path: "property-area/edit/:id",
    element: <CreatePropertyArea />,
  },
  {
    path: "property-area/list",
    element: <PropertyAreaList />,
  },
];

export default propertyAreaRoutes;