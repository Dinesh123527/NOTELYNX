import { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [lastAddedIndex, setLastAddedIndex] = useState(-1);


  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError("");
  };

  const isValidTag = (tag) => /^[a-zA-Z0-9]+$/.test(tag);

  const addNewTag = () => {
    const trimmedValue = inputValue.trim();

    if (trimmedValue === "") {
      setError("Tag cannot be empty.");
      return;
    }

    if (!isValidTag(trimmedValue)) {
      setError("Invalid tag");
      return;
    }

    setTags((prevTags) => [...prevTags, trimmedValue]);
    setNewTags((prevNewTags) => [...prevNewTags, trimmedValue]);
    setLastAddedIndex(newTags.length);
    setInputValue("");
  };

  const removeLastNewTag = () => {
    if (lastAddedIndex >= 0) {
      const updatedNewTags = [...newTags];
      const removedTag = updatedNewTags.pop();
      setNewTags(updatedNewTags);
      setTags(tags.filter((tag) => tag !== removedTag));
      setLastAddedIndex(lastAddedIndex - 1);
    }
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      addNewTag();
    }

    if ((e.key === "z" && (e.ctrlKey || e.metaKey))) {
      removeLastNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-2 text-sm text-slate-800 dark:text-white 
              bg-slate-100 dark:bg-gray-500 px-3 py-1 rounded"
            >
              # {tag}
              <button
                onClick={() => {
                  handleRemoveTag(tag);
                }}
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          value={inputValue}
          className="text-sm bg-transparent border-[1.5px] border-black 
           dark:border-white px-3 py-2 dark:text-white rounded outline-none"
          placeholder="Add tags"
          onChange={handleInputChange}
          onKeyDown={handleKeydown}
        />

        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 
          hover:bg-blue-700 hover:text-white"
          onClick={() => {
            addNewTag();
          }}
        >
          <MdAdd className="text-2xl text-slate hover:text-white" />
        </button>
      </div>

      {error && <p className="text-red-500 text-xs pt-2">{error}</p>}
    </div>
  );
};

export default TagInput;
