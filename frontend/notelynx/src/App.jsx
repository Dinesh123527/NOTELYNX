import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { ThemeProvider } from "../src/context/ThemeProvider";
import FeedBack from "./pages/FeedBack/FeedBack";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import LogOut from "./pages/LogOut/LogOut";
import Onboarding from "./pages/OnBoarding/OnBoarding";
import OtpVerification from "./pages/OtpVerification/OtpVerification";
import SignUp from "./pages/SignUp/SignUp";
import Welcome from "./pages/Welcome/Welcome";

const AppRoutes = () => {
  const location = useLocation();

  const isInOtpFlow = () => {
    return localStorage.getItem("emailForOTP") !== null;
  };

  const isSignedUp = () => {
    return localStorage.getItem("signedUp") === "true";
  };


  const isLoggedIn = () => {
    return localStorage.getItem("loggedIn") === "true";
  }

  const isOTPLoggedIn = () => {
    return localStorage.getItem("otpLoggedIn") === "true";
  }
  
  const navigateTo = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      window.history.pushState(null, location.pathname);
      const handlePopState = () => {
        window.location.replace(location.pathname);
      };

      window.addEventListener("popstate", () => {
        history.go(1);
      });

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [location, navigateTo]);

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/verify-otp"
        element={isInOtpFlow() ? <OtpVerification /> : <Navigate to="/" />}
      />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route
        path="/onboarding"
        element={isSignedUp() || isLoggedIn() || isOTPLoggedIn() 
          ? <Onboarding /> : <Navigate to="/" />}
      />
      <Route path="/feedback" element={<FeedBack />} />
      <Route path="/logout" element={<LogOut/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
};

export default App;
