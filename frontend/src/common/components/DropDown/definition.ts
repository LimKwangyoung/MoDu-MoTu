export interface IDropDownProps {
  handleClickDropDownList: (dropDownItem: string) => void;
  dropDownList: string[];
  setDropDownItemIndex: React.Dispatch<React.SetStateAction<number>>;
  dropDownItemIndex: number;
}
