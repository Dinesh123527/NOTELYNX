import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import Navbar from "../../components/Navbar/Navbar";
import Toast from "../../components/ToastMessage/Toast";
import axiosInstance from "../../utils/axiosInstance";
import { validateEmail, validateUserName } from "../../utils/helper";

const Login = ({ userInfo }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const navigate = useNavigate();

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const handleBackButtonClick = () => {
    setIsRollingBack(true);
    setTimeout(() => {
      navigate("/welcome");
    }, 600);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsCardVisible(true);
    }, 100);
  }, []);

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userName) {
      setError("Please enter username");
      return;
    }

    if (userName?.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (userName?.length > 20) {
      setError("Username must not exceed 20 characters");
      return;
    }

    if (!validateUserName(userName)) {
      setError("Please enter a valid username");
      return;
    }

    if (!password) {
      setError("Please enter password");
      return;
    }

    if (userName && password && email) {
      setError(
        "Please use either username/password or email for OTP, not both"
      );
      return;
    }

    setError(" ");

    //Login API call
    try {
      const response = await axiosInstance.post("/login", {
        userName: userName,
        password: password,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", userName);
        navigate("/onboarding");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again");
      }
    }
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
    if (error) setError("");
    setIsEmailFocused(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
    setIsEmailFocused(false);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    setIsEmailFocused(true);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (userName && password && email) {
      setError(
        "Please use either username/password or email for OTP, not both"
      );
      return;
    }

    try {
      const response = await axiosInstance.post("/request-otp", {
        email: email,
      });

      if (response.data && !response.data.error) {
        localStorage.setItem("emailForOTP", email);
        localStorage.setItem("otpFlow", "true");
        showToastMessage("OTP sent successfully", "Success");
        setTimeout(() => {
          navigate("/verify-otp");
        }, 3000);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleEmailFocus = () => {
    setIsEmailFocused(true);
    setError(null);
    setUserName("");
    setPassword("");
  };

  const handleUsernamePasswordFocus = () => {
    setIsEmailFocused(false);
    setError(null);
    setEmail("");
  };

  const handleEmailBlur = () => {
    if (!email) {
      setIsEmailFocused(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex items-center justify-center min-h-screen mt-4">
        <div
          className={`w-96 border rounded-lg shadow-lg px-7 py-10 bg-zinc-200 dark:bg-gray-600 transform transition-all duration-1000 ease-in-out ${
            isCardVisible
              ? "opacity-100 scale-100"
              : "opacity-0 translate-y-10 rotate-3"
          } hover:animate-hover-scale hover:shadow-2xl -mt-8`}
        >
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl dark:text-white mb-7">Login</h4>

            <input
              type="text"
              placeholder="Username"
              className="input-box"
              value={userName}
              onChange={handleUserNameChange}
              onFocus={handleUsernamePasswordFocus}
            />

            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              onFocus={handleUsernamePasswordFocus}
            />

            <div className="flex items-center justify-center mt-4">
              <span className="border-green-700 dark:text-white mx-8">or</span>
            </div>

            <div className="mt-4">
              <input
                type="email"
                placeholder="Email"
                className="input-box"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onFocus={handleEmailFocus}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {isEmailFocused ? (
              <button
                onClick={handleRequestOTP}
                className="w-full py-3 rounded-full font-semibold text-lg shadow-md
             bg-gradient-to-r from-green-500 to-teal-500 text-white dark:from-yellow-400 dark:to-yellow-600
             hover:shadow-[0_0_15px_rgba(72,187,120,0.5)] dark:hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
             dark:text-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out"
              >
                Login via OTP
              </button>
            ) : (
              <button
                type="submit"
                className="w-full py-3 rounded-full font-semibold text-lg shadow-md
             bg-gradient-to-r from-green-500 to-teal-500 text-white dark:from-yellow-400 dark:to-yellow-600
             hover:shadow-[0_0_15px_rgba(72,187,120,0.5)] dark:hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
             dark:text-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out"
              >
                Login
              </button>
            )}

            <p className="text-sm text-center mt-4 dark:text-white flex items-center justify-center">
              <span className="mr-2">Not registered yet?</span>
              <Link
                to="/signUp"
                className="font-large font-bold text-primary transition-all duration-300 
                transform hover:scale-105 hover:underline bg-gradient-to-r 
                from-purple-500 to-blue-600 dark:from-yellow-400 dark:to-yellow-600 
                text-transparent bg-clip-text"
              >
                Create an Account
              </Link>
            </p>
          </form>
          <button
            onClick={handleBackButtonClick}
            className={`mt-6 inline-block font-semibold rounded-full w-full py-3 text-center shadow-lg
            bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-400 dark:to-yellow-600
            text-white dark:text-gray-900 transform transition-all duration-300
            hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] dark:hover:shadow-[0_0_20px_#facc15]
            ${isRollingBack ? "animate-roll-back" : ""}`}
          >
            Back to welcome
          </button>
        </div>
      </div>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Login;
