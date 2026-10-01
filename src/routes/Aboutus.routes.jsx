import AboutUsList from "../pages/aboutus/AboutUsList";
import CreateAboutUs from "../pages/aboutus/CreateAbout";

const aboutUsRoutes = [
  {
    path: "aboutus/create",
    element: <CreateAboutUs />,
  },
  {
    path: "aboutus/edit/:id",
    element: <CreateAboutUs />,
  },
  {
    path: "aboutus/list",
    element: <AboutUsList />,
  },
];

export default aboutUsRoutes;
