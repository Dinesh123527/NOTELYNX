import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import SmileDark from "../../../src/assets/images/darkSmile.png";
import Smile from "../../../src/assets/images/smile.png";
import Navbar from "../../components/Navbar/Navbar";
import { ThemeContext } from "../../context/ThemeProvider";

const LogOut = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleWelcomeRedirect = () => { 
    navigate("/");
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-zinc-200 dark:bg-gray-600 py-12 px-16 rounded-lg shadow-lg text-center w-full max-w-2xl">
          <div className="flex items-center justify-center mb-6">
            <img
              src={isDarkMode ? SmileDark : Smile}
              alt="Logout Success"
              className="w-16 h-16 px-4 py-4"
            />
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">
              You have been logged out
            </h1>
          </div>
          <p className="text-green-700 dark:text-green-400 mb-6">
            Thank you for using <strong>Notelynx</strong>!
          </p>
          <button
            onClick={handleLoginRedirect}
            className="mt-6 inline-block font-semibold rounded-full px-10 py-4 text-center shadow-lg
             bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-400 dark:to-yellow-600
             text-white dark:text-gray-900 transform transition-all duration-300
             hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] dark:hover:shadow-[0_0_20px_#facc15]"
          >
            Login again
          </button>

          <div className="my-8">
            <button
              onClick={handleWelcomeRedirect}
              className="inline-block font-semibold rounded-full px-10 py-4 text-center shadow-lg
               bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-400 dark:to-teal-500
               text-white dark:text-gray-900 transform transition-all duration-300
               hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] dark:hover:shadow-[0_0_20px_#facc15]"
            >
              Back to Welcome
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogOut;
