import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useStopwatch, useTimer } from "react-timer-hook";

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
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + expirySeconds);

  const { seconds, minutes, start, pause, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => {
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + expirySeconds);
      restart(newExpiry, false);
    },
  });

  useEffect(() => {
    const newExpiry = new Date();
    newExpiry.setSeconds(newExpiry.getSeconds() + expirySeconds);
    restart(newExpiry, false);
  }, [expirySeconds]);

  return (
    <View className="items-center">
      <Text className="text-white text-lg font-bold mb-2">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={start}
          className="bg-[#1C2A4A] p-2 rounded-lg"
        >
          <Ionicons name="play" size={20} color="#00BFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pause}
          className="bg-[#1C2A4A] p-2 rounded-lg"
        >
          <Ionicons name="pause" size={20} color="#00BFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { StopWatch, Timer };

