import { useEffect, useState } from "react";
import { FaSearch, FaStickyNote, FaThumbtack } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import axiosInstance from "../../utils/axiosInstance";

const Onboarding = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [noteCount, setNoteCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
    fetchNotesCount();
    const storedUsername = localStorage.getItem("username");
    const storedUser = localStorage.getItem("user");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const fetchNotesCount = async () => {
    try {
      const response = await axiosInstance.get("/get-notes-count");
      if (response.data && response.data.count) {
        setNoteCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching counts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/dashboard");
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div></div>;
  }

  return (
    <>
      <Navbar userInfo={userInfo} showProfileOnly={true} />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-5xl font-extrabold mb-6 dark:text-white">
          Welcome, {username || user}!
        </h2>
        <p className="text-lg mb-6 dark:text-gray-300">
          We are excited to have you on board.
        </p>

        <div className="flex items-center justify-center ">
          <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-blue-600 dark:text-yellow-500 text-center">
                Notes
              </h3>
              <div
                className="bg-zinc-200 dark:bg-gray-600 shadow-lg rounded-lg p-8 
        transform hover:scale-105 transition-transform duration-300 flex flex-col items-center"
              >
                <div className="flex flex-col justify-center items-center mb-4 space-y-4">
                  <div className="flex space-x-6">
                    <FaStickyNote
                      size={40}
                      className="text-blue-500 dark:text-yellow-400"
                    />
                    <FaSearch
                      size={40}
                      className="text-pink-500 dark:text-purple-400"
                    />
                    <FaThumbtack
                      size={40}
                      className="text-green-500 dark:text-indigo-400"
                    />
                  </div>
                </div>
                <p
                  className={`text-5xl font-bold ${
                    noteCount === 0 ? "text-red-500" : "text-green-600"
                  } dark:${
                    noteCount === 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {noteCount}
                </p>

                <button
                  onClick={handleProceed}
                  className="mt-4 px-10 py-4 font-semibold rounded-full shadow-lg transition-all duration-300
          bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-400 dark:to-yellow-600
          text-white dark:text-gray-900 transform hover:scale-105
          hover:shadow-[0_0_20px_#3b82f6] dark:hover:shadow-[0_0_20px_#facc15]"
                >
                  Explore Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
