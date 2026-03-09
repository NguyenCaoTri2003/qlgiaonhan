import AsyncStorage from "@react-native-async-storage/async-storage";

export const setUser = async (user: any, token: string) => {
  await AsyncStorage.setItem("nhigia_user", JSON.stringify(user));
  await AsyncStorage.setItem("nhigia_token", token);
};

export const logout = async () => {
  await AsyncStorage.removeItem("nhigia_user");
  await AsyncStorage.removeItem("nhigia_token");
};