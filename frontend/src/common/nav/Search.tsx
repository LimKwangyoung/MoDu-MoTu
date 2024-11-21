import { FormEvent } from 'react';
import useInput from '../hooks/useInput';
import styles from './Search.module.css';
import { fetchSearch } from './actions';
import Dropdown from '../components/DropDown/DropDown';
import { FaSearch } from 'react-icons/fa';
import useDropdown from '../hooks/useDropdown';

const Search = () => {
  const { inputValue, setInputValue, handleChange } = useInput(''); // setInputValue 추가
  const {
    handleDropDownKeyDown,
    isFocus,
    handleClickDropDownList,
    dropDownList,
    setDropDownItemIndex,
    dropDownItemIndex,
  } = useDropdown(inputValue, setInputValue); // setInputValue 전달

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetchSearch(inputValue);
    console.log('Fetch Search Result:', res);
    if (res) {
      console.log(res);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} data-id="searchForm">
        <FaSearch className={styles.searchIcon} />
        <input
          className={styles.search}
          placeholder="주식, 메뉴, 종목코드를 검색하세요"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleDropDownKeyDown}
        />
        {isFocus && (
          <Dropdown
            handleClickDropDownList={handleClickDropDownList}
            dropDownList={dropDownList}
            setDropDownItemIndex={setDropDownItemIndex}
            dropDownItemIndex={dropDownItemIndex}
          />
        )}
      </form>
    </div>
  );
};

export default Search;
