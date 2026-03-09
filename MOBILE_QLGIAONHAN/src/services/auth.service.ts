import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {

  async getUser() {
    const user = await AsyncStorage.getItem("nhigia_user");
    return user ? JSON.parse(user) : null;
  }

};