import { useContext, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeProvider";
import ProfileInfo from "../Cards/ProfileInfo";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = ({
  userInfo,
  onSearchNote,
  handleClearSearch,
  showProfileOnly,
  disabled,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/feedback");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 shadow-md ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <h2 className="text-xl font-medium text-black dark:text-white py-2">
        Note Lynx
      </h2>

      {!showProfileOnly && userInfo && (
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => {
            setSearchQuery(target.value);
          }}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      )}

      <div className="flex items-center">
        <button
          onClick={!disabled ? toggleTheme : null}
          className="relative w-16 h-8 bg-zinc-200 dark:bg-gray-600 rounded-full flex items-center 
          justify-between px-1 transition-colors"
        >
          <div
            className={`absolute transition-transform duration-700 ease-out transform ${
              isDarkMode
                ? "translate-x-8 rotate-[360deg] scale-125"
                : "translate-x-0 rotate-[0deg] scale-110"
            }`}
            style={{
              transition: "transform 0.7s ease, color 0.7s ease",
              filter: isDarkMode
                ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))"
                : "drop-shadow(0 0 6px rgba(100, 100, 100, 0.7))",
              color: isDarkMode ? "#FFD700" : "#4A5568",
            }}
          >
            {isDarkMode ? (
              <FaSun style={{ fontSize: "1.5rem" }} />
            ) : (
              <FaMoon style={{ fontSize: "1.5rem" }} />
            )}
          </div>
        </button>
      </div>
      {userInfo && (
        <ProfileInfo
          userInfo={userInfo}
          onLogout={showProfileOnly ? null : onLogout}
        />
      )}
    </div>
  );
};

export default Navbar;
