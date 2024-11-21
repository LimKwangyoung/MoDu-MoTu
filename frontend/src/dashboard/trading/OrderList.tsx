// 주문내역
import { useParams } from 'react-router-dom';
import History from '../../common/components/account/History';

const OrderList = () => {
  const { stockCode } = useParams<{ stockCode: string }>();

  return(
    <div>
      {stockCode && <History filter={stockCode} />}
    </div>
  );
};

export default OrderList
