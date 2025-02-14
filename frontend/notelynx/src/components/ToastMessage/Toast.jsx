import { useEffect, useState } from "react";
import { LuCheck } from "react-icons/lu";
import { MdClose, MdDeleteOutline } from "react-icons/md";

const Toast = ({ isShown, message, type, onClose }) => {
  const [progressWidth, setProgressWidth] = useState(100);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isShown) {
      setProgressWidth(100);
      setIsClosing(false);
      return;
    }

    setIsClosing(false);

    const intervalId = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev > 0) {
          return prev - 0.5;
        } else {
          clearInterval(intervalId);
          setIsClosing(true);
          return 0;
        }
      });
    }, 15);

    return () => clearInterval(intervalId);
  }, [isShown]);

  useEffect(() => {
    if (isClosing) {
      const fadeTimeoutId = setTimeout(() => {
        onClose();
      }, 500);

      return () => clearTimeout(fadeTimeoutId);
    }
  }, [isClosing, onClose]);

  const isError = type === "error";
  const isDelete = type === "delete";
  const toastBackground = "bg-zinc-200 dark:bg-gray-600";
  const iconColor = isDelete || isError ? "text-red-800 dark:text-red-400" : "text-green-800 dark:text-green-400";
  const progressColor = isDelete || isError ? "bg-red-800 dark:bg-red-400" : "bg-green-800 dark:bg-green-400";

  return (
    <div
      className={`fixed top-20 right-6 z-[9999] transition-opacity duration-500 ${
        isShown && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      <div
        className={`min-w-52 border shadow-2xl rounded-md relative overflow-hidden ${toastBackground} border`}
      >
        <div className="flex items-center gap-3 py-2 px-4">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              isDelete ? "bg-red-50" : isError ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {isDelete ? (
              <MdDeleteOutline className={`text-xl ${iconColor}`} />
            ) : isError ? (
              <MdClose className={`text-xl ${iconColor}`} />
            ) : (
              <LuCheck className={`text-xl ${iconColor}`} />
            )}
          </div>

          <p className="text-sm dark:text-white truncate">{message}</p>
        </div>
        <div className="relative w-full h-[4px] bg-gray-200 rounded-b-md overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${progressColor}`}
            style={{
              width: `${progressWidth}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
