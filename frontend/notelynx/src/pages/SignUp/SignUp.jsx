import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import Navbar from "../../components/Navbar/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  validateEmail,
  validateName,
  validateUserName,
} from "../../utils/helper";

const calculatePasswordStrength = (password) => {
  const regex = {
    lower: /[a-z]/,
    upper: /[A-Z]/,
    number: /\d/,
    special: /[!@#$%^&*]/,
    minLength: /.{8,}/,
  };

  let strength = 0;
  if (regex.lower.test(password)) strength += 1;
  if (regex.upper.test(password)) strength += 1;
  if (regex.number.test(password)) strength += 1;
  if (regex.special.test(password)) strength += 1;
  if (regex.minLength.test(password)) strength += 1;

  return strength;
};

const checkPasswordRequirements = (password) => {
  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*]/.test(password) &&
    password.length >= 8
  );
};

const SignUp = () => {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordTyping, setIsPasswordTyping] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setIsCardVisible(true);
    }, 100);
  }, []);

  const handleBackButtonClick = () => {
    setIsRollingBack(true);
    setTimeout(() => {
      navigate("/welcome");
    }, 600);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Please enter your name");
      return;
    }

    if (name?.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (name?.length > 40) {
      setError("Name must not exceed 40 characters");
      return;
    }

    if (!validateName(name)) {
      setError("Please enter a valid name");
      return;
    }

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

    if (!email) {
      setError("Please enter email id");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email id");
      return;
    }

    if (!password) {
      setError("Please enter password");
      return;
    }

    if (!checkPasswordRequirements(password)) {
      setError("Password does not meet the required criteria");
      return;
    }

    setError("");

    // Sign Up API call
    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        userName: userName,
        email: email,
        password: password,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("username", userName);
        localStorage.setItem("signedUp", "true");
        navigate("/onboarding");
      }
    } catch (error) {
      //Handle registration error
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

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    setPasswordStrength(calculatePasswordStrength(inputPassword));
    setIsPasswordTyping(inputPassword.length > 0);
    if (error) setError("");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError("");
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
    if (error) setError("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
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
          } hover:animate-hover-scale hover:shadow-2xl `}
        >
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7 dark:text-white">Create Account</h4>

            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={handleNameChange}
            />

            <input
              type="text"
              placeholder="Username"
              className="input-box"
              value={userName}
              onChange={handleUserNameChange}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={handleEmailChange}
            />

            <PasswordInput value={password} onChange={handlePasswordChange} />

            {isPasswordTyping && (
              <div className="mb-4">
                <div className="text-sm dark:text-white">Password Strength</div>
                <div className="w-full h-1 bg-gray-300 rounded">
                  <div
                    className={`h-full rounded transition-all ${
                      passwordStrength === 5
                        ? "bg-green-500"
                        : passwordStrength >= 3
                        ? "bg-yellow-500"
                        : passwordStrength >= 2
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <ul className="list-disc ml-5 text-sm mb-4 dark:text-white">
              <li
                className={
                  password.match(/[a-z]/) && password.match(/[A-Z]/)
                    ? "text-green-500"
                    : ""
                }
              >
                Lowercase & Uppercase
              </li>
              <li className={password.match(/\d/) ? "text-green-500" : ""}>
                Number (0-9)
              </li>
              <li
                className={password.match(/[!@#$%^&*]/) ? "text-green-500" : ""}
              >
                Special Character (!@#$%^&*)
              </li>
              <li className={password.length >= 8 ? "text-green-500" : ""}>
                At least 8 characters
              </li>
            </ul>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-full font-semibold text-lg shadow-md
             bg-gradient-to-r from-green-500 to-teal-500 text-white dark:from-yellow-400 dark:to-yellow-600
             hover:shadow-[0_0_15px_rgba(72,187,120,0.5)] dark:hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
             dark:text-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              Create Account
            </button>

            <p className="text-sm text-center mt-4 dark:text-white flex items-center justify-center">
              <span className="mr-2">Already has account?</span>
              <Link
                to="/login"
                className="font-large font-bold text-primary transition-all duration-300 transform hover:scale-105
                hover:underline bg-gradient-to-r from-purple-500 to-blue-600 dark:from-yellow-400 
                dark:to-yellow-600 text-transparent bg-clip-text"
              >
                Login
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
    </>
  );
};

export default SignUp;
