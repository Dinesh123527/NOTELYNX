// eslint-disable-next-line no-unused-vars
import moment from "moment";
import { useContext, useState } from "react";
import { MdClose, MdCreate, MdDelete, MdOutlinePushPin } from "react-icons/md";
import Modal from "react-modal";
import { ThemeContext } from "../../context/ThemeProvider";

const NoteCard = ({
  title,
  date,
  content,
  tags,
  mood,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
  _id,
  isAnimating,
  searchQuery,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

  const highlightText = (text) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span
          key={index}
          className="bg-red-400 dark:bg-green-400 font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderMoodEmoji = (mood) => {
    const moodEmojis = {
      Happy: "😊",
      Sad: "😢",
      Angry: "😡",
      Excited: "😄",
      Relaxed: "😌",
      Romantic: "💕",
    };
    return moodEmojis[mood] || null;
  };

  const truncatedContent =
    content?.length > 60 ? content?.slice(0, 60) + "..." : content;

  const handleCardClick = () => {
    if (content.length > 60 || title.length > 60) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      id={_id}
      className={`border rounded p-4 dark:bg-gray-600 bg-zinc-200 hover:shadow-2xl dark:hover:shadow-slate-500 transition-all ease-in-out ${
        isAnimating ? "animate-snap" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium text-black dark:text-white">
            {highlightText(title)}
          </h6>
          <span className="text-xs text-slate-700 dark:text-slate-200">
            {moment(date).format("Do MMM YYYY")}
          </span>
        </div>

        <MdOutlinePushPin
          className={`icon-btn ${
            isPinned ? "text-primary" : "text-slate-700 dark:text-slate-300"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onPinNote();
          }}
        />
      </div>

      <p
        className="text-xs text-slate-800 dark:text-slate-100 mt-2 overflow-hidden 
      whitespace-nowrap text-ellipsis"
      >
        {highlightText(truncatedContent)}
      </p>

      <div className="flex items-center justify-between mt-2">
        {tags.length > 0 ? (
          <div className="text-xs text-slate-700 dark:text-slate-200">
            {tags.map((item) => `#${item} `)}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-xl">{renderMoodEmoji(mood)}</span>
          </div>
        )}
      </div>

      {tags?.length > 0 && (
        <div className="flex items-center mt-2">
          <span className="text-xl">{renderMoodEmoji(mood)}</span>
        </div>
      )}

      <div className="flex justify-end items-center gap-2 mt-2">
        <MdCreate
          className="icon-btn text-slate-700 dark:text-slate-200 
            hover:text-green-700 dark:hover:text-green-400"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        />
        <MdDelete
          className="icon-btn text-slate-700 dark:text-slate-200
            hover:text-red-700 dark:hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "1000",
            position: "absolute",
            overflowX: "scroll",
          },
          content: {
            margin: "auto",
            padding: "20px",
            width: "50%",
            borderRadius: "20px",
            maxWidth: "90%",
            minHeight: "75px",
            maxHeight: "50vh",
            overflowX: "scroll",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            backgroundColor: isDarkMode ? "#475569" : "#e4e4e7",
          },
        }}
      >
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center absolute 
          top-4 right-4 hover:bg-slate-400 dark:hover:bg-red-400"
          
        >
          <MdClose className="text-2xl text-slate-800 dark:text-slate-300" 
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
          />
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {highlightText(title)}
            </h2>
            <span className="text-xs text-slate-700 dark:text-slate-200">
              {moment(date).format("Do MMM YYYY")}
            </span>
          </div>

          <MdOutlinePushPin
            className={`icon-btn absolute top-10 right-14 ${
              isPinned ? "text-primary" : "text-slate-700 dark:text-slate-300"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onPinNote();
            }}
          />
        </div>

        <p className="mt-4 text-sm text-slate-800 dark:text-slate-100">
          {highlightText(content)}
        </p>

        <div className="flex items-center justify-between mt-2">
          {tags.length > 0 ? (
            <div className="text-xs text-slate-700 dark:text-slate-200">
              {tags.map((item) => `#${item} `)}
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-xl">{renderMoodEmoji(mood)}</span>
            </div>
          )}
        </div>

        {tags?.length > 0 && (
          <div className="flex items-center mt-2">
            <span className="text-xl">{renderMoodEmoji(mood)}</span>
          </div>
        )}

        <div className="flex justify-end items-center gap-2 mt-2">
          <MdCreate
            className="icon-btn text-slate-700 dark:text-slate-200 
            hover:text-green-700 dark:hover:text-green-400"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              handleCloseModal();
            }}
          />
          <MdDelete
            className="icon-btn text-slate-700 dark:text-slate-200
            hover:text-red-700 dark:hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default NoteCard;
