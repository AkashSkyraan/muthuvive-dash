import React from "react";

import CreateSubAdmin from "../pages/subAdmin/CreateSubAdmin";
import SubAdminList from "../pages/subAdmin/SubAdminList";

const subAdminRoutes = [
  {
    path: "sub-admin/create",
    element: <CreateSubAdmin />,
  },
  {
    path: "sub-admin/list",
    element: <SubAdminList />,
  },

  {
    path: "sub-admin/edit/:id",
    element: <CreateSubAdmin />,
  },
];

export default subAdminRoutes;
