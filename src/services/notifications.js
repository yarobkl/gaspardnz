import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

// À remplir après création du compte OneSignal (onesignal.com)
export const ONESIGNAL_APP_ID = "REMPLACER_PAR_VOTRE_APP_ID";

export async function registerPushToken() {
  if (!Capacitor.isNativePlatform()) return;

  await PushNotifications.register();

  PushNotifications.addListener("registration", async ({ value: token }) => {
    if (ONESIGNAL_APP_ID === "REMPLACER_PAR_VOTRE_APP_ID") return;
    try {
      await fetch("https://onesignal.com/api/v1/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          device_type: 0,
          identifier: token,
          language: "fr",
          timezone: 3600,
          tags: { source: "gaspardnz_app" },
        }),
      });
    } catch (_) {}
  });

  PushNotifications.addListener("pushNotificationReceived", () => {});
  PushNotifications.addListener("pushNotificationActionPerformed", () => {});
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;

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
}
