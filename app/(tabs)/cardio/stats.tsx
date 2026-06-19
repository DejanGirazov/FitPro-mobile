import CardioLogCard from "@/components/CardioLogCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { API_URL } from "../../../constants/api";

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

const Stats = () => {
  const queryClient = useQueryClient();

  const { data: cardioLogs, isLoading: isLoadingCardioLogs } = useQuery({
    queryKey: ["cardioLogs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cardio/getLogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch logs");
      return data;
    },
  });

  const { mutate: deleteLog } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/cardio/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete log");
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cardioLogs"] }),
    onError: (err: any) => alert(err.message),
  });

  const totalDistance =
    cardioLogs?.reduce(
      (sum: number, log: any) => sum + (log.distance || 0),
      0,
    ) || 0;
  const totalCalories =
    cardioLogs?.reduce(
      (sum: number, log: any) => sum + (log.totalCalories || 0),
      0,
    ) || 0;
  const totalDuration =
    cardioLogs?.reduce(
      (sum: number, log: any) => sum + (log.duration || 0),
      0,
    ) || 0;
  const totalSessions = cardioLogs?.length || 0;

  const statCards = [
    { label: "Total Distance", value: `${totalDistance.toFixed(1)} km` },
    { label: "Total Calories", value: `${Math.round(totalCalories)} kcal` },
    { label: "Time Spent", value: formatTime(totalDuration) },
    { label: "Total Sessions", value: `${totalSessions}` },
  ];

  if (isLoadingCardioLogs) {
    return (
      <View className="flex-1 bg-[#0A0F1E] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1E]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Stat Cards */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {statCards.map((card, i) => (
            <View
              key={i}
              className="bg-[#1C2A4A] rounded-xl p-4 items-center justify-center"
              style={{
                width: "47%",
              }}
            >
              <Text className="text-[#8E8E93] text-xs text-center mb-1">
                {card.label}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        {cardioLogs?.length > 0 && (
          <Text className="text-white text-lg font-bold mb-3">
            Recent Sessions
          </Text>
        )}

        {cardioLogs?.slice(0, 5).map((log: any) => (
          <CardioLogCard key={log._id} log={log} onDelete={deleteLog} />
        ))}

        {!cardioLogs?.length && (
          <View className="items-center mt-16 gap-4">
            <Ionicons name="bicycle-outline" size={64} color="#1C2A4A" />
            <Text className="text-[#8E8E93] text-center">
              No cardio sessions yet.{"\n"}Complete a session to see your stats!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Stats;
