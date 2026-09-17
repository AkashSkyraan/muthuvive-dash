import HighlightsList from "../pages/propertyHighlights/ListHighlights";
import AddHighlights from "../pages/propertyHighlights/AddHighlights";

const highlightsRoutes = [
  {
    path: "highlights/list",
    element: <HighlightsList />,
  },
  {
    path: "highlights/add",
    element: <AddHighlights />,
  },
];

export default highlightsRoutes;
