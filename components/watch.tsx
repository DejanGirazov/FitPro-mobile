import { useWorkoutStore } from "@/app/store/workoutStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTimer } from "react-timer-hook";
import { useTimerNotification } from "./useTimerNotification";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const StopWatch = ({ shouldStart }: any) => {
  const { startTimestamp } = useWorkoutStore();

  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = () => {
    if (!startTimestamp) return;

    // prevent multiple intervals
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const diff = Date.now() - startTimestamp;
      setElapsed(Math.floor(diff / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (shouldStart?._id && startTimestamp) {
      startTimer();
    } else {
      stopTimer();
      setElapsed(0);
    }

    return () => stopTimer();
  }, [shouldStart, startTimestamp]);

  // OPTIONAL: handle app background/resume
  useEffect(() => {
    const subscription = require("react-native").AppState.addEventListener(
      "change",
      (state: string) => {
        if (state === "active" && shouldStart?._id && startTimestamp) {
          startTimer();
        }
      },
    );

    return () => subscription.remove();
  }, [shouldStart, startTimestamp]);

  return (
    <View className="items-center">
      <Text
        className="text-[#00BFFF] font-bold"
        style={{
          fontSize: 37,
          letterSpacing: 2,
          fontVariant: ["tabular-nums"],
        }}
      >
        {formatTime(elapsed)}
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
      <Text
        style={{
          fontSize: 37,
          fontWeight: "bold",
          letterSpacing: 2,
          color: minutes === 0 && seconds <= 10 ? "#ef4444" : "#00BFFF",
          fontVariant: ["tabular-nums"],
        }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
      <View className="flex-row gap-3 mt-3">
        <TouchableOpacity
          onPress={handleStart}
          className="bg-[#00BFFF] px-6 py-3 rounded-xl flex-row items-center gap-2"
        >
          <Ionicons name="play" size={18} color="white" />
          <Text className="text-white font-bold">Start</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePause}
          className="bg-[#0A0F1E] px-6 py-3 rounded-xl flex-row items-center gap-2"
        >
          <Ionicons name="pause" size={18} color="#00BFFF" />
          <Text className="text-[#00BFFF] font-bold">Pause</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { StopWatch, Timer };

