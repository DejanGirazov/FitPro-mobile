import notifee, {
  AndroidCategory,
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";

const CHANNEL_ID = "rest-timer";
const COUNTDOWN_NOTIFICATION_ID = "rest-timer-countdown";

export function useTimerNotification() {
  // Call once to set up the Android notification channel
  const setupChannel = async () => {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Rest Timer",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });
  };

  // Shows the live countdown notification with the native chronometer
  // This is what ticks automatically — the OS handles the counting, not JS
  const showCountdownNotification = async (endsAtTimestamp: number) => {
    await setupChannel();

    await notifee.displayNotification({
      id: COUNTDOWN_NOTIFICATION_ID,
      title: "🏋️ FitPro — Rest Timer",
      body: "Rest timer running...",
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.LOW,
        ongoing: true, // stays in notification bar, user can't swipe away
        onlyAlertOnce: true, // doesn't make sound every update
        showTimestamp: false,
        // This is the key part — native OS countdown, no setInterval needed
        timestamp: endsAtTimestamp,
        showChronometer: true,
        chronometerDirection: "down", // counts DOWN to zero
        category: AndroidCategory.ALARM,
        pressAction: {
          id: "default",
          launchActivity: "default", // tapping opens your app
        },
      },
    });
  };

  // Schedules the "done!" alert that fires when timer hits zero
  const scheduleCompletionAlert = async (seconds: number) => {
    await setupChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + seconds * 1000,
    };

    await notifee.createTriggerNotification(
      {
        id: "rest-timer-done",
        title: "✅ Rest Complete!",
        body: "Time to get back to it.",
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          sound: "default",
          pressAction: {
            id: "default",
            launchActivity: "default",
          },
        },
      },
      trigger,
    );
  };

  // Cancels everything — called on pause or when timer resets
  const cancelNotifications = async () => {
    await notifee.cancelNotification(COUNTDOWN_NOTIFICATION_ID);
    await notifee.cancelNotification("rest-timer-done");
  };

  return {
    showCountdownNotification,
    scheduleCompletionAlert,
    cancelNotifications,
  };
}
