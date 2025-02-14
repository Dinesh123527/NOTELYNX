import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { ThemeContext } from "../../context/ThemeProvider";
import axiosInstance from "../../utils/axiosInstance";

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [timer, setTimer] = useState(300);
  const [email, setEmail] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const storedEmail = localStorage.getItem("emailForOTP");

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (!resendAvailable) {
      startTimer();
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [resendAvailable]);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(intervalRef.current);
          setResendAvailable(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && index < 5) {
      element.nextSibling.focus();
    } else if (index === 5) {
      element.blur();
    }

    setError("");
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) {
        e.preventDefault();
        setOtp([...otp.map((d, idx) => (idx === index - 1 ? "" : d))]);
        const prevInput = document.querySelector(
          `input[data-index="${index - 1}"]`
        );
        prevInput.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axiosInstance.post("/resend-otp", {
        email: email,
      });

      if (response.data && !response.data.error) {
        alert("A new OTP has been sent to your email");
        setResendAvailable(false);
        setTimer(300);
      }

      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (!otpCode) {
      setError("Please enter OTP");
      return;
    }

    if (otpCode.length < 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/verify-otp", {
        otp: otpCode,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("otpLoggedIn", "true");
        navigate("/onboarding");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("An unexpected error occurred. Please try again ");
        }
      } else {
        setError("An unexpected error occurred. Please try again ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="bg-zinc-200 dark:bg-gray-600 shadow-lg rounded-lg p-10 w-96 transition-transform duration-300"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl
          bg-gradient-to-br ${
            isDarkMode
              ? "from-purple-400 to-indigo-500"
              : "from-teal-400 to-green-500"
          }
          hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out
          transform hover:scale-110
        `}
              >
                <FaLock
                  className="text-3xl"
                  style={{
                    color: isDarkMode ? "#fde68a" : "#1d4ed8",
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-semibold dark:text-white mb-2">
              Enter your OTP
            </h1>
            <p className="text-gray-600 dark:text-gray-200">
              A verification code was sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  data-index={index}
                  className="w-12 h-12 border-2 border-gray-800 dark:border-yellow-400 rounded-lg text-center 
                  text-2xl mx-1 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-500"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="text-center mb-4 dark:text-white">
              {!resendAvailable && (
                <p>
                  Verification code expires in:{" "}
                  <strong>{formatTime(timer)}</strong>
                </p>
              )}
              <button
                type="button"
                onClick={handleResendOtp}
                className={`text-2xl font-bold transition-all duration-300 
                transform ${resendAvailable ? "hover:scale-105 hover:underline bg-gradient-to-r from-purple-500 to-blue-600 dark:from-yellow-400 dark:to-yellow-600" : "cursor-not-allowed text-gray-400"}
                text-transparent bg-clip-text`}
                disabled={!resendAvailable}
              >
                Resend OTP
              </button>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                  loading || resendAvailable
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed dark:text-black"
                    : "bg-gradient-to-r from-green-500 to-teal-500 text-white dark:from-yellow-400 dark:to-yellow-600 hover:shadow-[0_0_15px_rgba(72,187,120,0.5)] dark:hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] dark:text-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out"
                } text-white`}
                disabled={loading || resendAvailable}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 rounded-lg font-semibold transition duration-300 
                bg-gradient-to-r from-red-500 to-red-600 text-white dark:text-black 
                hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] 
                dark:hover:shadow-[0_0_15px_rgba(255,99,71,0.5)] 
                transition-transform transform hover:scale-105 duration-300 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default OtpVerification;
