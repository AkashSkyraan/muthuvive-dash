import React from "react";
import CreatePlan from "../pages/plan/CreatePlan";
import PlanList from "../pages/plan/PlanList";



const planRoutes = [
  {
    path: "plans/create",
    element: <CreatePlan />,
  },
  {
    path: "plans/edit/:id",
    element: <CreatePlan />,
  },
  {
    path: "plans/list",
    element: <PlanList />,
  },
];

export default planRoutes;