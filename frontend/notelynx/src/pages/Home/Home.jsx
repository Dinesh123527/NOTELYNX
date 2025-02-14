import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import snapSoundUrl from "../../assets/audio/snap-sound.mp3";
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg";
import NoteCard from "../../components/Cards/NoteCard";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import Navbar from "../../components/Navbar/Navbar";
import Toast from "../../components/ToastMessage/Toast";
import axiosInstance from "../../utils/axiosInstance";
import AddEditNotes from "./AddEditNotes";

const snapSound = new Audio(snapSoundUrl);

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allNotes, setAllNotes] = useState([]);
  const [animatingNoteId, setAnimatingNoteId] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollPos, setScrollPos] = useState(0);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      type: "edit",
      data: noteDetails,
    });
  };

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

  let inactivityTimer;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/feedback");
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      showToastMessage(
        "Your session has expired. Please log in again.",
        "error"
      );
      setTimeout(handleLogout, 4000);
    }, 10 * 60 * 1000);
  };

  // Get User Info
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

  // Get all Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      error.message = "An error occurred while fetching notes";
    }
  };

  // Delete Note
  const deleteNote = async (data) => {
    const noteId = data?._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        snapSound.play();

        setAllNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteId)
        );

        const noteElement = document.getElementById(noteId);

        if (noteElement) {
          noteElement.classList.add("animate-snap");

          const handleAnimationEnd = () => {
            setAnimatingNoteId(null);
            noteElement.classList.remove("animate-snap");
            noteElement.removeEventListener("animationend", handleAnimationEnd);
          };

          noteElement.addEventListener("animationend", handleAnimationEnd, {
            once: true,
          });

          setAnimatingNoteId(noteId);
        }
      }
    } catch (error) {
      console.error("Error deleting note", error);
      if (error.response && error.response.data) {
        showToastMessage("An error occurred while deleting the note", "error");
      }
    }
  };

  // Search for a Note
  const onSearchNote = async (query) => {
    setSearchQuery(query);
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
        setIsSearch(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;

    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        const updatedNote = response.data.note;
        if (updatedNote.isPinned) {
          showToastMessage("Note Pinned Successfully");
        } else {
          showToastMessage("Note Unpinned", "error");
        }
        getAllNotes();
      }
    } catch (error) {
      error.message = "An unexpected error occurred. Please try again.";
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setSearchQuery("");
    getAllNotes();
  };

  useEffect(() => {
    getUserInfo();
    getAllNotes();
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, []);

  if (loading) {
    return <div></div>;
  }

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
        onLogout={handleLogout}
      />

      <div className="mt-16">
        <div className="container mx-auto p-4">
          {allNotes.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 mt-8 auto-rows-auto">
              {allNotes.map((item) => {
                return (
                  <NoteCard
                    key={item._id}
                    title={item.title}
                    content={item.content}
                    date={item.createdOn}
                    tags={item.tags}
                    mood={item.mood}
                    isPinned={item.isPinned}
                    onEdit={() => {
                      handleEdit(item);
                    }}
                    onDelete={() => {
                      deleteNote(item);
                    }}
                    onPinNote={() => {
                      updateIsPinned(item);
                    }}
                    isAnimating={animatingNoteId === item._id}
                    searchQuery={searchQuery}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyCard
              imgSrc={isSearch ? NoDataImg : AddNotesImg}
              message={
                isSearch
                  ? `Oops! No notes found matching with your search.`
                  : `Start creating your first note! Click the 'Add' button to note down your
            thoughts, ideas, and reminders. Let's get started!`
              }
            />
          )}
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r
    from-blue-500 to-indigo-500 dark:from-yellow-500 dark:to-orange-500
    fixed right-4 transition-all duration-300 ease-in-out transform hover:scale-110 
    hover:rotate-12 shadow-lg hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        style={{
          bottom: scrollPos > 100 ? "4rem" : `${20 + scrollPos}px`,
          transition: "bottom 0.3s ease, transform 0.3s ease",
        }}
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white dark:text-gray-800" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-zinc-200 dark:bg-gray-600 rounded-md mx-auto mt-20 p-8 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({
              isShown: false,
              type: "add",
              data: null,
            });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
