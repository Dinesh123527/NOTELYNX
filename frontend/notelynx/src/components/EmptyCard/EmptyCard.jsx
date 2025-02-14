// eslint-disable-next-line no-unused-vars
import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src={imgSrc} alt="No notes" className="w-60" />

      <p className="w-1/2 text-large font-medium text-slate-800 dark:text-white text-center leading-7 mt-5">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;
