// CardioLogCard.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";

const CARDIO_TYPES = [
  { key: "running", label: "Running", icon: "walk-outline" },
  { key: "cycling", label: "Cycling", icon: "bicycle-outline" },
  { key: "swimming", label: "Swimming", icon: "water-outline" },
  { key: "hiit", label: "HIIT", icon: "flame-outline" },
  { key: "hiking", label: "Hiking", icon: "trail-sign-outline" },
  { key: "walking", label: "Walking", icon: "footsteps-outline" },
];

const formatDate = (date: string) => {
  const d = new Date(date);
  const dayMonth = d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })
    .replace(/\//g, "/");
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayMonth} ${time}`;
};

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

// Distance is stored in km, duration in seconds -> average speed in km/h
const calculateAvgSpeed = (distance: number, durationSeconds: number) => {
  if (!distance || distance <= 0 || !durationSeconds) return null;
  const hours = durationSeconds / 3600;
  return distance / hours;
};

type Props = {
  log: any;
  onDelete: (id: string) => void;
};

const CardioLogCard = ({ log, onDelete }: Props) => {
  const typeInfo = CARDIO_TYPES.find((t) => t.key === log.type);
  const avgSpeed = calculateAvgSpeed(log.distance, log.duration);

  return (
    <View className="bg-[#1C2A4A] rounded-xl p-4 mb-3">
      <View className="flex-row items-center gap-3 mb-2">
        <Ionicons
          name={(typeInfo?.icon as any) ?? "heart-outline"}
          size={22}
          color="#00BFFF"
        />
        <Text className="text-white font-bold text-lg capitalize">
          {log.type}
        </Text>
        <Text className="text-white text-sm ml-auto">
          {formatDate(log.createdAt)}
        </Text>

        <TouchableOpacity
          onPress={() => onDelete(log._id)}
          className="bg-red-600 p-2 rounded-lg"
        >
          <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-6">
        <View>
          <Text className="text-[#8E8E93] text-xs uppercase tracking-widest">
            Duration
          </Text>
          <Text className="text-white font-bold">
            {formatTime(log.duration)}
          </Text>
        </View>
        {log.distance > 0 && (
          <View>
            <Text className="text-[#8E8E93] text-xs uppercase tracking-widest">
              Distance
            </Text>
            <Text className="text-white font-bold">{log.distance} km</Text>
          </View>
        )}
        {avgSpeed !== null && (
          <View>
            <Text className="text-[#8E8E93] text-xs uppercase tracking-widest">
              Avg Speed
            </Text>
            <Text className="text-white font-bold">
              {avgSpeed.toFixed(1)} km/h
            </Text>
          </View>
        )}
        <View>
          <Text className="text-[#8E8E93] text-xs uppercase tracking-widest">
            Calories
          </Text>
          <Text className="text-white font-bold">{log.totalCalories} kcal</Text>
        </View>
      </View>
      {log.notes ? (
        <Text className="text-[#8E8E93] text-sm mt-3">{log.notes}</Text>
      ) : null}
    </View>
  );
};

export default CardioLogCard;
