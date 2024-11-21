import styles from './DropDown.module.css';
import { IDropDownProps } from './definition.ts';

const Dropdown = ({
  handleClickDropDownList,
  dropDownList,
  setDropDownItemIndex,
  dropDownItemIndex,
}: IDropDownProps) => {
  return (
    <div className={styles.DropDownBox}>
      {dropDownList.length === 0 && (
        <div className={styles.DropDownItem}>해당하는 종목이 없습니다</div>
      )}
      {dropDownList.slice(0, 4).map((dropDownItem, dropDownIndex) => (
        <div
          key={`${dropDownItem}-${dropDownIndex}`}
          onClick={() => handleClickDropDownList(dropDownItem)} // 아이템 클릭 핸들러 실행
          onMouseOver={() => setDropDownItemIndex(dropDownIndex)}
          className={`${styles.DropDownItem} ${
            dropDownItemIndex === dropDownIndex ? styles.selected : ''
          }`}
        >
          <div>{dropDownItem}</div>
        </div>
      ))}
    </div>
  );
};

export default Dropdown;
