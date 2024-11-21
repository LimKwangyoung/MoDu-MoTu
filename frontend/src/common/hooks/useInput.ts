import { ChangeEvent, useState } from "react";

const useInput = (initialValue: string) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  return { inputValue, setInputValue, handleChange };
};

export default useInput;
