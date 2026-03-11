export type RootTabParamList = {
  Dashboard: undefined;
  Orders: { screen?: string; params?: any };
  Notifications: undefined;
  Profile: undefined;
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { id: number };
  CompleteOrder: { id: number };
};