import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Signature from "react-native-signature-canvas";

import { orderService } from "../services/order.service";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";

export default function CompleteOrderScreen({ route }: any) {
  const { id } = route.params;
  const navigation = useNavigation();

  const [images, setImages] = useState<any[]>([]);
  const [signature, setSignature] = useState<any>(null);
  const [note, setNote] = useState("");

  const signRef = useRef<any>(null);

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!res.canceled) {
      setImages([...images, res.assets[0]]);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
    });

    if (!res.canceled) {
      setImages([...images, res.assets[0]]);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Không có quyền định vị");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({});

    return {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
    };
  };

  const completeOrder = () => {
    if (images.length === 0) {
      Alert.alert("Cần ít nhất 1 hình ảnh chứng từ");
      return;
    }

    signRef.current?.readSignature();
  };

  const TEST_LOCATION = {
    lat: 10.7769,
    lng: 106.7009,
  };

  const handleSignature = async (sig: string) => {
    const location = TEST_LOCATION;

    try {
      // bỏ prefix base64
      const base64 = sig.replace("data:image/png;base64,", "");

      // đường dẫn file tạm
      const fileUri = FileSystem.cacheDirectory + "signature.png";

      // ghi base64 thành file
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const res = await orderService.shipperComplete(
        id,
        images,
        location,
        {
          uri: fileUri,
          type: "image/png",
          fileName: "signature.png",
        },
        note,
      );

      console.log("SUCCESS:", res);

      Alert.alert("Hoàn tất đơn");

      navigation.navigate("OrderList" as never);
    } catch (err: any) {
      console.log("ERROR:", err?.response?.data || err);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hình ảnh chứng từ *</Text>

      <View style={styles.imageRow}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={styles.image} />
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={takePhoto}>
          <Text>Chụp ảnh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text>Chọn ảnh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Chữ ký khách hàng *</Text>

      <View style={styles.signatureBox}>
        <Signature
          ref={signRef}
          onOK={handleSignature}
          descriptionText="Khách ký vào đây"
          clearText="Xoá"
          confirmText="Lưu"
        />
      </View>

      <Text style={styles.title}>Ghi chú</Text>

      <TextInput
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Ghi chú nếu cần..."
        style={styles.note}
      />

      <TouchableOpacity style={styles.completeBtn} onPress={completeOrder}>
        <Text style={{ color: "white", fontWeight: "600" }}>
          Xác nhận hoàn tất
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  btn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },

  signatureBox: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },

  note: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
  },

  completeBtn: {
    marginTop: 30,
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
