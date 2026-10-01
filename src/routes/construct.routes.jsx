import React from "react";
import ConstructionConsultantList from "../pages/construct/ConstructionList";
import ConstructionConsultantForm from "../pages/construct/ConstructForm";

const constructionConsultantRoutes = [
  {
    path: "const-consultants/create",
    element: <ConstructionConsultantForm />,
  },
  {
    path: "const-consultants/list",
    element: <ConstructionConsultantList />,
  },
  {
    path: "const-consultants/edit/:id",
    element: <ConstructionConsultantForm />,
  },
];

export default constructionConsultantRoutes;
