import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OrderListScreen from "../screens/OrderListScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";

const Stack = createNativeStackNavigator();

export default function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{ title: "Đơn giao nhận" }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Chi tiết đơn" }}
      />
    </Stack.Navigator>
  );
}