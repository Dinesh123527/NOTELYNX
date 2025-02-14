// eslint-disable-next-line no-unused-vars
import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  
  return (
    <div className="w-80 flex items-center px-4 bg-slate-200 dark:bg-slate-600 rounded-md">
      <input
        type="text"
        placeholder="Search Notes"
        className="w-full text-xs bg-transparent py-[11px] outline-none text-black dark:text-white"
        value={value}
        onChange={(e) => {
          onChange(e);
          if (e.target.value === "") {
            onClearSearch();
          }
        }}
        onKeyDown={handleKeyPress}
      />

      {value && (
        <IoMdClose
          className="text-xl text-slate-700 dark:text-slate-200 cursor-pointer hover:text-black
          dark:hover:text-white mr-3"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-slate-700 dark:text-slate-200 cursor-pointer hover:text-black 
        dark:hover:text-white"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
