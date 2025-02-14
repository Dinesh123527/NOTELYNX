import { useContext } from "react";
import LogOffDark from "../../assets/images/logout-dark.png";
import LogOff from "../../assets/images/logout-light.png";
import { ThemeContext } from "../../context/ThemeProvider";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  const { isDarkMode } = useContext(ThemeContext);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full 
      text-black dark:text-white font-medium bg-slate-200 dark:bg-slate-500"
      >
        {getInitials(userInfo.fullName)}
      </div>

      <p className="text-sm font-bold font-xl dark:text-white ml-2">
        {userInfo.fullName}
      </p>

      {onLogout && (
        <div className="flex items-center ml-16">
          <img
            className="w-12 h-12 object-fit cursor-pointer"
            src={isDarkMode ? LogOffDark : LogOff}
            alt="Logout"
            onClick={onLogout}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
