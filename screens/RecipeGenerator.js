//remove this,redundant page

import React from "react";
import RecipePageNavigator from "./RecipePageNavigator";

function RecipeGenerator(route) {
  const loggedInUserID = route.route.params.loggedInUserID;
  return <RecipePageNavigator loggedInUserID={loggedInUserID} />;
}
export default RecipeGenerator;
