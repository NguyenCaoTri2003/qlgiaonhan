import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { loginApi } from "../api/auth.api";
import { setUser } from "../store/auth.store";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await loginApi(email, password);

      await setUser(res.data.user, res.data.token);

      navigation.replace("Main");
    } catch (err) {
      setErrorMsg("Sai thông tin đăng nhập");
    }
  };

  const fillDemo = () => {
    setEmail("giaonhan1@abc.com");
    setPassword("123456789");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>NHỊ GIA</Text>
        <Text style={styles.subtitle}>Hệ thống quản lý giao nhận</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* EMAIL */}
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="email@nhigia.vn"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>

        {/* DEMO ACCOUNT */}
        <TouchableOpacity style={styles.demoBtn} onPress={fillDemo}>
          <Text style={styles.demoText}>Dùng tài khoản demo</Text>
        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "white",
    padding: 26,
    borderRadius: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  logo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 22,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
    backgroundColor: "#fafafa",
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  demoBtn: {
    alignSelf: "flex-end",
    marginBottom: 14,
  },

  demoText: {
    color: "#2563eb",
    fontWeight: "500",
    fontSize: 13,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  error: {
    color: "#ef4444",
    marginBottom: 10,
    textAlign: "center",
  },
});