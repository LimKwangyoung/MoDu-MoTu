import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import fetchTraderTrend from "./hooks/fetchTraderTrend";
import { IInvestor } from "./definitions";

import styles from "./TradingTrend.module.css";

const Investor = () => {
  const { stockCode } = useParams();
  const [renderedInvestorData, setRenderedInvestorData] = useState<IInvestor[] | null>(null);

  useEffect(() => {
    if (!stockCode) return;

    const fetchData = async () => {
      try {
        const data = await fetchTraderTrend("investor", stockCode);
        setRenderedInvestorData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData()
  }, [stockCode])

  useEffect(() => {
    console.log(renderedInvestorData);
  }, [renderedInvestorData])

  if (!renderedInvestorData) return <div />;

  return (
    <div className={styles.subContent}>
      <table className={styles.investorTable}>
        <thead>
          <tr>
            <th className={styles.thDate}>일자</th>
            <th className={styles.thInvest}>외국인</th>
            <th className={styles.thInvest}>기관계</th>
            <th className={styles.thInvest}>개인</th>
          </tr>
        </thead>
        <tbody>
          {renderedInvestorData.slice(1, renderedInvestorData.length - 1).map((item, index) => (
              <tr key={index}>
                <td>{item.stck_bsop_date.slice(0, 4)}-{item.stck_bsop_date.slice(4, 6)}-{item.stck_bsop_date.slice(6, 8)}</td>
                <td className={Number(item.frgn_ntby_qty) >= 0 ? styles.positive : styles.negative}>
                  {Number(item.frgn_ntby_qty).toLocaleString()}
                </td>
                <td className={Number(item.orgn_ntby_qty) >= 0 ? styles.positive : styles.negative}>
                  {Number(item.orgn_ntby_qty).toLocaleString()}
                </td>
                <td className={Number(item.prsn_ntby_qty) >= 0 ? styles.positive : styles.negative}>
                  {Number(item.prsn_ntby_qty).toLocaleString()}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Investor;
