import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn("Could not set notification handler", e);
}

export async function registerForPushNotificationsAsync() {
  let token;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
    }
  } catch (e) {
    console.warn("Notifications disabled in testing environment:", e);
    // Suppress crash by swallowing the error so UI doesn't become inactive
  }

  return token;
}

export async function scheduleSchemeReminder(schemeName: string, deadline: string) {
  // We'll just schedule a local notification a short time from now for demonstration purposes,
  // or 24 hours from now realistically.
  const triggerSeconds = 5; // 5 seconds later for immediate testing demo

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scheme Reminder \uD83D\uDCDD",
        body: `Don't forget to apply for ${schemeName}. Deadline: ${deadline}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
      },
    });
    return id;
  } catch (error) {
    console.error("Error scheduling notification", error);
    return null;
  }
}
