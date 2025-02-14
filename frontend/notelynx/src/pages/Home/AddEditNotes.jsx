import { useContext, useState } from "react";
import { MdClose } from "react-icons/md";
import Sentiment from "sentiment";
import TagInput from "../../components/Input/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import { ThemeContext } from "../../context/ThemeProvider";

const AddEditNotes = ({
  noteData,
  type,
  getAllNotes,
  onClose,
  showToastMessage,
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const sentiment = new Sentiment();
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [selectedMood, setSelectedMood] = useState(noteData?.mood || "Neutral");
  const [error, setError] = useState(null);

  const moodEmojis = {
    Happy: "😊",
    Excited: "😄",
    Relaxed: "😌",
    Sad: "😢",
    Angry: "😡",
    Romantic: "💕",
    Neutral: "😐",
  };

  const moodKeywords = {
    romantic: [
      "love",
      "romantic",
      "affection",
      "sweetheart",
      "sweet",
      "lovely",
      "adore",
      "dear",
    ],
    happy: [
      "joy",
      "delighted",
      "blissful",
      "cheerful",
      "content",
      "grateful",
      "blessed",
      "smiling",
      "overjoyed",
      "positive",
      "promotion",
    ],
    excited: [
      "thrilled",
      "pumped",
      "hyped",
      "eager",
      "exciting",
      "adventure",
      "energetic",
      "can't wait",
      "excited",
    ],
    sad: [
      "upset",
      "down",
      "heartbroken",
      "lonely",
      "depressed",
      "gloomy",
      "unhappy",
      "disappointed",
      "negative",
    ],
    angry: [
      "furious",
      "irritated",
      "annoyed",
      "outraged",
      "mad",
      "pissed",
      "infuriated",
    ],
    relaxed: [
      "calm",
      "peaceful",
      "serene",
      "chill",
      "unwinding",
      "carefree",
      "laid back",
      "tranquil",
    ],
  };

  const checkMoodByKeywords = (content, keywords) => {
    return keywords.some((keyword) => content.includes(keyword));
  };

  const analyzeSentimentAndSetMood = (contentText) => {
    const sentimentResult = sentiment.analyze(contentText);
    const score = sentimentResult.score;
    const lowerContent = contentText?.toLowerCase();

    if (checkMoodByKeywords(lowerContent, moodKeywords.romantic)) {
      setSelectedMood("Romantic");
      return;
    }

    if (checkMoodByKeywords(lowerContent, moodKeywords.happy)) {
      setSelectedMood("Happy");
      return;
    }

    if (checkMoodByKeywords(lowerContent, moodKeywords.excited)) {
      setSelectedMood("Excited");
      return;
    }

    if (checkMoodByKeywords(lowerContent, moodKeywords.relaxed)) {
      setSelectedMood("Relaxed");
      return;
    }

    if (checkMoodByKeywords(lowerContent, moodKeywords.sad)) {
      setSelectedMood("Sad");
      return;
    }

    if (checkMoodByKeywords(lowerContent, moodKeywords.angry)) {
      setSelectedMood("Angry");
      return;
    }

    if (score >= 3) {
      setSelectedMood("Happy");
    } else if (score >= 2) {
      setSelectedMood("Excited");
    } else if (score === 0) {
      setSelectedMood("Relaxed");
    } else if (score < 0 && score >= -2) {
      setSelectedMood("Sad");
    } else if (score < -2) {
      setSelectedMood("Angry");
    } else {
      setSelectedMood("Neutral");
    }
  };

  const evaluateExpressions = (content) => {
    const regex = /([0-9+\-*/^%() x]+)\s*=/g;

    return content.replace(regex, (match, expression) => {
      const cleanedMatch = match.replace(/=\s*[-+]?\d*\.?\d+/, "").trim();

      try {
        const sanitizedExpression = cleanedMatch
          .replace(/\s+/g, "")
          .replace(/x/g, "*")
          .replace(/\^/g, "**");

        if (!/[+\-*\/%]/.test(sanitizedExpression)) {
          return match;
        }

        const result = eval(sanitizedExpression);
        return `${cleanedMatch} = ${result}`;
      } catch (error) {
        return match;
      }
    });
  };

  //Add Note
  const addNewNote = async () => {
    try {
      const evaluatedContent = evaluateExpressions(content);
      const response = await axiosInstance.post("/add-note", {
        title,
        content: evaluatedContent,
        tags,
        mood: selectedMood,
      });

      if (response.data && response.data.note) {
        showToastMessage("Notes added successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  //Edit Note
  const editNote = async () => {
    const noteId = noteData?._id;

    try {
      const evaluatedContent = evaluateExpressions(content);
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        title,
        content: evaluatedContent,
        tags,
        mood: selectedMood,
      });

      if (response.data && response.data.note) {
        showToastMessage("Notes updated successfully", "success");
        getAllNotes();
        onClose();
      } else {
        showToastMessage("No significant changes made.", "error");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const filterValidTags = (tagsArray) => {
    return tagsArray.filter((tag) => /^[a-zA-Z0-9]+$/.test(tag));
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter a title.");
      return;
    }

    if (title.length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    if (!content) {
      setError("Please enter a content");
      return;
    }

    const normalizeString = (str) => str.trim().replace(/\.*$/, "");

    const normalizedOriginalContent = normalizeString(noteData?.content || "");
    const normalizedNewContent = normalizeString(content);

    const validTags = filterValidTags(tags);
    const originalValidTags = filterValidTags(noteData?.tags || []);

    const originalMood = noteData?.mood || "Neutral";
    const newMood = selectedMood || "Neutral";

    setError("");

    const hasSignificantChange =
      title !== noteData?.title ||
      normalizedOriginalContent !== normalizedNewContent ||
      JSON.stringify(validTags) !== JSON.stringify(originalValidTags) ||
      newMood !== originalMood;

    if (type === "edit") {
      if (!hasSignificantChange) {
        showToastMessage("No significant changes detected.", "error");
        return;
      }
      editNote();
    } else {
      addNewNote();
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (error) setError(null);
  };

  const handleContentChange = (e) => {
    const inputContent = e.target.value;
    setContent(inputContent);
    const expressionRegex = /([0-9+\-*/^%() x]+)\s*=/;
    if (expressionRegex.test(inputContent) || inputContent.trim() === "") {
      setSelectedMood("Neutral");
    } else {
      analyzeSentimentAndSetMood(inputContent);
    }
    if (error) setError(null);
  };

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="relative">
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 
        hover:bg-slate-400 dark:hover:bg-red-400"
        onClick={onClose}
      >
        <MdClose className="text-2xl text-slate-800 dark:text-slate-300" />
      </button>

      <div className="flex flex-col gap-2">
        <label
          className="input-label text-slate-800 dark:text-white 
        text-lg font-bold"
        >
          TITLE
        </label>
        <input
          type="text"
          className="text-2xl text-slate-800 dark:text-white bg-zinc-200 
          dark:bg-gray-600 outline-none"
          placeholder="Enter the note title"
          value={title}
          onChange={handleTitleChange}
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label
          className="input-label text-slate-800 dark:text-white 
        text-lg font-bold"
        >
          CONTENT
        </label>
        <textarea
          type="text"
          className="text-sm text-slate-800 dark:text-white bg-slate-100 
          dark:bg-gray-500 outline-none p-2 rounded"
          placeholder="Content"
          rows={10}
          value={content}
          onChange={handleContentChange}
        />
      </div>

      <div className="mt-4">
        <label
          className="input-label text-slate-800 dark:text-white 
        text-lg font-bold"
        >
          TAGS
        </label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      <div className="mt-4">
        <label
          className="input-label text-slate-800 dark:text-white 
        text-lg font-bold"
        >
          MOOD
        </label>
        <div className="flex gap-2">
          {Object.keys(moodEmojis).map((mood) => (
            <button
              key={mood}
              onClick={() => handleMoodSelection(mood)}
              className={`text-2xl rounded-lg p-2 border transition ease-in-out duration-200 ${
                selectedMood === mood
                  ? isDarkMode
                    ? "border-4 animate-pulseDark"
                    : "border-4 animate-pulseLight"
                  : "border-2 border-gray-200 dark:border-gray-600"
              } hover:bg-blue-700 dark:hover:bg-green-400`}
            >
              {moodEmojis[mood]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs pt-4">{error}</p>}

      <button
        className="w-full py-3 rounded-full font-semibold text-lg mt-4 shadow-md
        bg-gradient-to-r from-green-500 to-teal-500 text-white dark:from-yellow-400 dark:to-yellow-600
        hover:shadow-[0_0_15px_rgba(72,187,120,0.5)] dark:hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
        dark:text-gray-900 transition-transform transform hover:scale-105 duration-300 ease-in-out"
        onClick={handleAddNote}
      >
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
