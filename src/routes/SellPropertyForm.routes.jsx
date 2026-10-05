import { Route } from "react-router-dom";
import SellPropertyLayout from "../layout/SellPropertyLayout";
import CategoryForm from "../components/SellPropertyForm/CategoryForm/CategoryForm";
import LocationForm from "../pages/SellProperty/LocationForm";
import DetailsForm from "../pages/SellProperty/DetailForm";
import FeaturesForm from "../pages/SellProperty/FeaturesForm";
import MediaForm from "../pages/SellProperty/MediaForm";

const sellPropertyRoutes = [
  {
    path: "/add-property",
    // element: <SellPropertyLayout />,
    children: [
      {
        index: true,
        element: <CategoryForm />,
      },
      {
        path: "location",
        element: <LocationForm />,
      },
      {
        path: "details",
        element: <DetailsForm />,
      },
      {
        path: "features",
        element: <FeaturesForm />,
      },
      {
        path: "media",
        element: <MediaForm />,
      },
    ],
  },
  // EDIT PROPERTY ROUTES FLOW
  {
    path: "/edit-property/:prop_id",
    // element: <SellPropertyLayout />,
    children: [
      {
        index: true,
        element: <LocationForm />,
      },
      {
        path: "location",
        element: <LocationForm />,
      },
      {
        path: "details",
        element: <DetailsForm />,
      },
      {
        path: "features",
        element: <FeaturesForm />,
      },
      {
        path: "media",
        element: <MediaForm />,
      },
    ],
  },
];

export default sellPropertyRoutes;
