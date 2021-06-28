import Signup from "./Signup";
import Home from "./Home";
import Ratings from "./Ratings";
import Admin from "./Admin";
import Login from "./Login";
import UserInfo from "./UserInfo";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
  const openLink = () => {
    window.open("https://www.linkedin.com/in/alb-imeri-026814b1/", "_blank");
  };
  return (
    <Router>
      <AuthProvider>
        <>
          <Switch>
            <PrivateRoute exact path="/" component={Home} />
            <PrivateRoute exact path="/ratings" component={Ratings} />
            <PrivateRoute exact path="/user-info" component={UserInfo} />
            <PrivateRoute exact path="/admin" component={Admin} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="*" component={Login} />
          </Switch>
          <footer
            className="text-center text-white fixed-bottom "
            style={{ backgroundColor: "#212529" }}
          >
            <div className="text-center p-3">
              <a onClick={openLink} className="text-white cursor-pointer">
                © 2021 Powered by Alb Imeri. Design by Orion Krasniqi
              </a>
            </div>
          </footer>
        </>
      </AuthProvider>
    </Router>
  );
};

export default App;
