import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useStopwatch, useTimer } from "react-timer-hook";
import { useTimerNotification } from "./useTimerNotification";

const StopWatch = ({ shouldStart, onTimeUpdate }: any) => {
  const { seconds, minutes, start, pause, reset } = useStopwatch({
    autoStart: false,
  });

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(minutes * 60 + seconds);
    }
  }, [seconds]);

  useEffect(() => {
    if (shouldStart?._id) {
      pause();
      reset(undefined, false);
      setTimeout(() => start(), 50);
    } else {
      pause();
      reset(undefined, false);
    }
  }, [shouldStart]);

  return (
    <View className="items-center">
      <Text className="text-white text-xl font-bold text-left mb-1">
        Total workout time
      </Text>
      <Text className="text-[#00BFFF] text-lg font-bold">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
    </View>
  );
};

const Timer = ({ expirySeconds }: any) => {
  const {
    showCountdownNotification,
    scheduleCompletionAlert,
    cancelNotifications,
  } = useTimerNotification();

  const isRunning = useRef(false);

  const getExpiry = (secs: number) => {
    const t = new Date();
    t.setSeconds(t.getSeconds() + secs);
    return t;
  };

  const { seconds, minutes, start, pause, restart } = useTimer({
    expiryTimestamp: getExpiry(expirySeconds),
    autoStart: false,
    onExpire: async () => {
      // Timer hit zero — cancel the countdown notification
      // (the completion alert was already scheduled by the OS)
      await cancelNotifications();
      isRunning.current = false;
      // Restart timer visually but paused, ready for next set
      restart(getExpiry(expirySeconds), false);
    },
  });

  // When the rest time input changes, reset everything
  useEffect(() => {
    cancelNotifications();
    isRunning.current = false;
    restart(getExpiry(expirySeconds), false);
  }, [expirySeconds]);

  // Cleanup on unmount (leaving the workout screen)
  useEffect(() => {
    return () => {
      cancelNotifications();
    };
  }, []);

  const handleStart = async () => {
    const totalSeconds = minutes * 60 + seconds;
    const endsAt = Date.now() + totalSeconds * 1000;

    start(); // start the visual timer

    // Tell the OS to show the chronometer counting down
    await showCountdownNotification(endsAt);

    // Schedule the "done!" alert at the exact end time
    await scheduleCompletionAlert(totalSeconds);

    isRunning.current = true;
  };

  const handlePause = async () => {
    pause();
    await cancelNotifications();
    isRunning.current = false;
  };

  return (
    <View className="items-center">
      <Text className="text-white text-lg font-bold mb-2">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleStart}
          className="bg-[#1C2A4A] p-2 rounded-lg"
        >
          <Ionicons name="play" size={20} color="#00BFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePause}
          className="bg-[#1C2A4A] p-2 rounded-lg"
        >
          <Ionicons name="pause" size={20} color="#00BFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { StopWatch, Timer };

