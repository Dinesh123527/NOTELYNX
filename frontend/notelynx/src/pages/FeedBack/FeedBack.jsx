import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const FeedBack = () => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const navigateTo = useNavigate();

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
  };

  const handleCancel = () => {
    navigateTo("/logout");
  }

  const handleSubmit = () => {
    if (selectedRating >= 3) {
      setFeedbackMessage(
        "We appreciate you taking the time to share your thoughts with us!"
      );
    } else {
      setFeedbackMessage("We will work on your feedback. What went wrong?");
    }

    setTimeout(() => {
      navigateTo("/logout");
    }, 20000);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-zinc-200 dark:bg-gray-600 w-full max-w-5xl bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-teal-400 mb-4">
            Feedback
          </h1>
          <p className="text-lg text-neutral-800 dark:text-stone-200 mb-6">
            How was your overall experience with Notelyx?
          </p>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => handleRatingSelect(1)}
              className={`py-2 px-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                selectedRating === 1
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-red-300 text-black dark:bg-red-500 dark:text-white"
              } hover:bg-red-500 active:scale-95`}
            >
              Poor
            </button>
            <button
              onClick={() => handleRatingSelect(2)}
              className={`py-4 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                selectedRating === 2
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "bg-yellow-300 text-black dark:bg-yellow-500 dark:text-white"
              } hover:bg-yellow-400 active:scale-95`}
            >
              Average
            </button>
            <button
              onClick={() => handleRatingSelect(3)}
              className={`py-4 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                selectedRating === 3
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-green-300 text-black dark:bg-green-500 dark:text-white"
              } hover:bg-green-400 active:scale-95`}
            >
              Good
            </button>
            <button
              onClick={() => handleRatingSelect(4)}
              className={`py-4 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                selectedRating === 4
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-green-400 text-black dark:bg-green-600 dark:text-white"
              } hover:bg-green-500 active:scale-95`}
            >
              Outstanding
            </button>
          </div>

          {selectedRating && (
            <p className="text-xl mb-6 text-black dark:text-white">
              Selected Rating: {selectedRating}
            </p>
          )}

          <div className="space-x-4">
            <button
              onClick={handleSubmit}
              className={`py-2 px-10 rounded-full transition-all ${
                selectedRating
                  ? "inline-block font-semibold rounded-full px-10 py-4 text-center shadow-lg bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-400 dark:to-teal-500 text-white dark:text-gray-900 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#3b82f6] dark:hover:shadow-[0_0_20px_#facc15]"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-300 dark:text-gray-600"
              }`}
              disabled={!selectedRating}
            >
              Submit
            </button>

            <button
              onClick={handleCancel}
              className="inline-block font-semibold rounded-full px-10 py-4 text-center shadow-lg bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white dark:text-gray-900 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_#f87171] dark:hover:shadow-[0_0_20px_#facc15]"
            >
              Cancel
            </button>
          </div>

          {feedbackMessage && (
            <div
              className={`mt-6 p-4 rounded-md ${
                selectedRating >= 3
                  ? "bg-green-600 text-zinc-200 dark:bg-green-400 dark:text-zinc-600"
                  : selectedRating === 2
                  ? "bg-orange-600 text-zinc-200 dark:bg-orange-400 dark:text-zinc-600"
                  : selectedRating === 1
                  ? "bg-red-600 text-zinc-200 dark:bg-red-400 dark:text-zinc-600"
                  : "bg-gray-100 text-zinc-600 dark:bg-gray-600 dark:text-zinc-200"
              }`}
            >
              <p>{feedbackMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedBack;
