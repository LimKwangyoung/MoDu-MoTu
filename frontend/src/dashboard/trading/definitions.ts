export interface IPriceProps {
  initialMarketPrice: number;
}

export interface IOrderProps {
  initialMarketPrice: number;
  mode: string;
}

export interface IOrderTypeProps {
  initialMarketPrice: number;
  mode: string;
  trackedPrice: number; // type이 Standard이면 0, Scheduled이면 감시 가격
}

export interface IOrderButtonProps {
  mode: string;
  trackedPrice: number;
  price: number;
  quantity: number | string;
}

export interface IPlaceOrderProps {
  stockCode: string;
  mode: string;
  trackedPrice: number;
  price: number;
  finalQuantity: number;
}
