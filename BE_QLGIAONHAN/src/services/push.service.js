const { Expo } = require("expo-server-sdk");

const expo = new Expo();

async function sendPushNotification(tokens, message, orderId) {
  const messages = [];

  for (let token of tokens) {
    if (!Expo.isExpoPushToken(token)) continue;

    messages.push({
      to: token,
      sound: "default",
      title: "Nhị Gia Logistics",
      body: message,
      data: { orderId },
    });
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = { sendPushNotification };