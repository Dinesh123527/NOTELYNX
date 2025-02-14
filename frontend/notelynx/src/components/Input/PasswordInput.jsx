import { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ( { value, onChange, placeholder, onFocus} ) => {

  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };
    
  return (
    <div className="flex items-center bg-transparent border-[1.5px] border-black dark:border-white 
    px-5 rounded mb-3">
        <input 
          value={value}
          onChange={onChange}
          type={isShowPassword ? "text" : "password"}
          placeholder={placeholder || "Password"}
          className="w-full text-sm dark:text-white bg-transparent py-3 mr-3 rounded outline-none"
          onFocus={onFocus}
        />

        {isShowPassword ? (
            <FaEye
              size={22}
              className="text-primary cursor-pointer"
              onClick={() => toggleShowPassword()}
            />
        ) : (
            <FaEyeSlash
              size={22}
              className="text-primary cursor-pointer"
              onClick={() => toggleShowPassword()}
            />
        )}
    </div>
  )
}

export default PasswordInput
