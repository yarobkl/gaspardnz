import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

// ⚠️ OneSignal integration disabled - placeholder removed
// To enable:
// 1. Create account at onesignal.com
// 2. Get your APP_ID
// 3. Uncomment code below and add your APP_ID
// export const ONESIGNAL_APP_ID = "YOUR_APP_ID_HERE";

const ONESIGNAL_ENABLED = false;

export const isNotificationFeatureAvailable = () =>
  Capacitor.isNativePlatform() && ONESIGNAL_ENABLED;

export async function registerPushToken() {
  if (!isNotificationFeatureAvailable()) return;

  try {
    await PushNotifications.register();

    PushNotifications.addListener("registration", async ({ value: token }) => {
      // OneSignal registration would go here when enabled
      console.log("Push token registered:", token);
    });

    PushNotifications.addListener("pushNotificationReceived", () => {});
    PushNotifications.addListener("pushNotificationActionPerformed", () => {});
  } catch (error) {
    console.warn("Push notification setup skipped:", error.message);
  }
}

export async function requestNotificationPermission() {
  if (!isNotificationFeatureAvailable()) return false;

  try {
    const { receive } = await PushNotifications.checkPermissions();
    if (receive === "denied") return false;
    if (receive === "granted") {
      await registerPushToken();
      return true;
    }

    const result = await PushNotifications.requestPermissions();
    if (result.receive !== "granted") return false;

    await registerPushToken();
    return true;
  } catch (error) {
    console.warn("Notification permission request failed:", error.message);
    return false;
  }
}
