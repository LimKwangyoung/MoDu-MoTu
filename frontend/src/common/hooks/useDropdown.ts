import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import codeToName from '../../assets/codeToName.json';
import nameToCode from '../../assets/nameToCode.json';

const kospi200Companies = Object.values(codeToName);

const useDropdown = (
  inputValue: string,
  setInputValue: (value: string) => void // 검색창 초기화를 위한 setter 전달
) => {
  const navigate = useNavigate();
  const [dropDownList, setDropDownList] = useState(kospi200Companies);
  const [dropDownItemIndex, setDropDownItemIndex] = useState(-1);
  const [isFocus, setIsFocus] = useState(false);

  const updatedDropDownList = () => {
    if (inputValue === '') {
      setDropDownList([]);
      return;
    }

    const getRelatedKeywordArr = kospi200Companies.filter(
      (textItem) =>
        textItem.includes(inputValue.toLocaleLowerCase()) ||
        textItem.includes(inputValue.toUpperCase())
    );

    setDropDownList(getRelatedKeywordArr);
    setDropDownItemIndex(-1);
  };

  const handleDropDownKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputValue.trim() === '' || event.nativeEvent.isComposing) return;

    if (event.code === 'ArrowDown') {
      if (dropDownItemIndex === dropDownList.length - 1) {
        setDropDownItemIndex(-1);
      } else {
        setDropDownItemIndex(dropDownItemIndex + 1);
      }
    }

    if (event.code === 'ArrowUp') {
      if (dropDownItemIndex === -1) {
        setDropDownItemIndex(dropDownList.length - 1);
      } else {
        setDropDownItemIndex(dropDownItemIndex - 1);
      }
    }

    if (event.code === 'Enter') {
      const keyword = dropDownList[dropDownItemIndex]
        ? dropDownList[dropDownItemIndex]
        : inputValue;

      navigate(`/dashboard/${nameToCode[keyword as keyof typeof nameToCode]}`);
      setInputValue(''); // 검색창 초기화
      setIsFocus(false); // 드롭다운 닫기
    }
  };

  const handleClickSearchBox = (e: MouseEvent) => {
    const isFocus = (e.target as HTMLElement).closest('form')?.dataset.id;
    if (isFocus) {
      setIsFocus(true);
    } else {
      setIsFocus(false);
    }
  };

  const handleClickDropDownList = (dropDownItem: string) => {
    navigate(`/dashboard/${nameToCode[dropDownItem as keyof typeof nameToCode]}`);
    setInputValue(''); // 검색창 초기화
    setIsFocus(false); // 드롭다운 닫기
  };

  useEffect(() => {
    updatedDropDownList();
  }, [inputValue]);

  useEffect(() => {
    document.addEventListener('click', handleClickSearchBox);
    return () => {
      document.removeEventListener('click', handleClickSearchBox);
    };
  }, []);

  return {
    handleClickDropDownList,
    handleDropDownKeyDown,
    isFocus,
    dropDownList,
    setDropDownItemIndex,
    dropDownItemIndex,
  };
};

export default useDropdown;
