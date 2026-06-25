import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { API_URL } from "../constants/api";

const AiNutritionSummary = ({ meals }: { meals: any[] }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    mutate: fetchSummary,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/ai/nutritionSummary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals }),
      });
      const text = await res.text();
      console.log(text); // ← read as text first
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || "Failed to get summary");
      return data.summary;
    },
    onSuccess: (data) => {
      setSummary(data);
      setIsExpanded(true);
    },
    onError: (err: any) => {
      alert("ai is busy right now try again later");
    },
  });

  const handlePress = () => {
    if (summary) {
      setIsExpanded((prev) => !prev);
      return;
    }
    fetchSummary();
  };

  const handleRefresh = () => {
    setSummary(null);
    setIsExpanded(false);
    fetchSummary();
  };

  return (
    <View className="bg-[#1C2A4A] rounded-xl mx-4 mb-4 overflow-hidden">
      <TouchableOpacity
        onPress={handlePress}
        disabled={isPending}
        className="flex-row items-center justify-between p-4"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles" size={18} color="#00BFFF" />
          <Text className="text-white font-bold tracking-widest uppercase text-sm">
            AI Summary
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {isPending && <ActivityIndicator size="small" color="#00BFFF" />}
          {summary && !isPending && (
            <TouchableOpacity onPress={handleRefresh} hitSlop={8}>
              <Ionicons name="refresh-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
          {!isPending && (
            <Ionicons
              name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
              size={18}
              color="#8E8E93"
            />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && summary && meals && (
        <View
          className="px-4 pb-4"
          style={{ borderTopWidth: 1, borderTopColor: "#0A0F1E" }}
        >
          <Text className="text-white text-sm leading-6 mt-3">{summary}</Text>
        </View>
      )}

      {isError && (
        <View
          className="px-4 pb-4"
          style={{ borderTopWidth: 1, borderTopColor: "#0A0F1E" }}
        >
          <Text className="text-red-400 text-sm mt-3">
            AI is busy right now, tap refresh to try again.
          </Text>
        </View>
      )}
    </View>
  );
};

export default AiNutritionSummary;
