import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Balance.module.css";
import { useBalanceStore } from "../../../store/useBalanceStore";
import { COLORS } from '../../../common/utils';
import { IHolding } from "../../../store/definitions";

const Balance = () => {
  const { balanceData, fetchBalanceData } = useBalanceStore();
  const [averageTotalPrice, setAverageTotalPrice] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBalanceData();
  }, [])

  useEffect(() => {
    if (!balanceData) return;

    setAverageTotalPrice(balanceData.holdings.reduce((total: number, item: IHolding) => {
      return total + item.average_price * item.total_amount;
    }, 0))
  }, [balanceData])

  const [filter, setFilter] = useState("가나다순"); // 필터링 기준 상태
  const [activeSort, setActiveSort] = useState("현재가"); // 현재가/평가금 활성화 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleFilterChange = (newFilter: "가나다순" | "구매순") => {
    setFilter(newFilter);
    setIsDropdownOpen(false);
  };

  // const calculatePercentage = (prev: number, current: number) => {
  //   return ((Math.abs(current - prev) / prev) * 100).toFixed(1)
  // };

  if (!balanceData || !averageTotalPrice) return <div />;

  return (
    <div className={styles.container}>
      <div className={styles.totalValue}>{Number(averageTotalPrice.toFixed(0)).toLocaleString()}원</div>
      {/* <p className={styles.totalChange} style={{ color: balanceData.balance > 0 ? COLORS.positive : balanceData.balance < 0 ? COLORS.negative : COLORS.neutral }}>
      {balanceData.balance >= 0 ? '+' : ''}{(balanceData.balance).toLocaleString()}원
        ({calculatePercentage(5000000, balanceData.balance)}%)
      </p> */}
      <p className={styles.balance}>보유 잔고 {balanceData.balance.toLocaleString()}원</p>

      <div className={styles.sorting}>
        <div className={styles.dropdown}>
          <button className={styles.filterButton} onClick={toggleDropdown}>
            {filter}{" "}
            <span className={styles.arrow}>{isDropdownOpen ? "▲" : "▼"}</span>
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownContent}>
              <div onClick={() => handleFilterChange("가나다순")}>가나다순</div>
              <div onClick={() => handleFilterChange("구매순")}>구매순</div>
            </div>
          )}
        </div>

        <div className={styles.sortOptions}>
          <button
            className={`${styles.sortButtonOne} ${activeSort === "현재가" ? styles.activeSortButton : ""}`}
            onClick={() => setActiveSort("현재가")}
          >
            현재가
          </button>
          <button
            className={`${styles.sortButtonTwo} ${activeSort === "평가금" ? styles.activeSortButton : ""}`}
            onClick={() => setActiveSort("평가금")}
          >
            평가금
          </button>
        </div>
      </div>

      <div className={styles.holding}>
        {balanceData.holdings.map((item) => (
          <div key={item.stock_name} className={styles.item} onClick={() => navigate(`dashboard/${item.stock_code}`)}>
            <div className={styles.itemLeft}>
              <span className={styles.itemName}>{item.stock_name}</span>
              <span className={styles.itemShares}>{item.total_amount}주</span>
            </div>
            <div className={styles.itemRight}>
              <span className={styles.itemValue}>
                {activeSort === "현재가"
                  ? Number(item.current_price).toLocaleString()
                  : Number(item.average_price.toFixed(0)).toLocaleString()}원
              </span>
              <span
                style={{
                  color:
                    activeSort === "현재가"
                      ? Number(item.difference) > 0
                        ? COLORS.positive
                        : Number(item.difference) < 0
                          ? COLORS.negative
                          : COLORS.neutral
                      : item.average_price > 0
                        ? COLORS.positive
                        : item.average_price < 0
                          ? COLORS.negative
                          : COLORS.neutral
                }}
              >
                {activeSort === "현재가"
                  ? `${Number(item.current_price) > 0 ? '+' : ''}${(Number(item.difference)).toLocaleString()} (${Number(item.percentage).toLocaleString()}%)`
                  : ""
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Balance;
