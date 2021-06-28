import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import { isMobile } from "react-device-detect";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();
  const mobileHeight = window.innerHeight - 115;
  let mainStyle = {};
  if (isMobile) {
    mainStyle = {
      height: `${mobileHeight}px`,
    };
  }
  return (
    <Route
      {...rest}
      render={(props) => {
        return currentUser ? (
          <>
            <Header />
            <main style={mainStyle}>
              <Component {...props} />
            </main>
          </>
        ) : (
          <Redirect to="/login" />
        );
      }}
    ></Route>
  );
};

export default PrivateRoute;
