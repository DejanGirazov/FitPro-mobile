import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../../constants/api";

const calculateStreak = (logs: any[], dateField = "createdAt") => {
  if (!logs || logs.length === 0) return 0;

  // Get unique days (YYYY-MM-DD strings), sorted descending
  const days = [
    ...new Set(
      logs.map((log) => new Date(log[dateField]).toISOString().split("T")[0]),
    ),
  ].sort((a, b) => (a > b ? -1 : 1));

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must start from today or yesterday
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const Details = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.error) return null;
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });
  const { data: meals } = useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/nutrition/getLogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
  });

  const { data: workoutLogs } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/workout/getLogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
  });

  const { data: cardioLogs } = useQuery({
    queryKey: ["cardioLogs"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/cardio/getLogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
  });
  const calculateCalories = () => {
    if (
      !authUser?.weight ||
      !authUser?.height ||
      !authUser?.age ||
      !authUser?.gender
    )
      return null;

    // Step 1 - BMR
    let bmr;
    if (authUser.gender === "male") {
      bmr =
        88.36 +
        13.4 * authUser.weight +
        4.8 * authUser.height -
        5.7 * authUser.age;
    } else {
      bmr =
        447.6 +
        9.2 * authUser.weight +
        3.1 * authUser.height -
        4.3 * authUser.age;
    }

    // Step 2 - TDEE
    const multipliers: any = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.9,
    };
    const tdee = bmr * (multipliers[authUser.activityLevel] || 1.2);

    // Step 3 - Goal adjustment
    if (authUser.goal === "lose weight") return Math.round(tdee - 500);
    if (authUser.goal === "build muscle") return Math.round(tdee + 300);
    return Math.round(tdee);
  };
  const dailyCalories = calculateCalories();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const todaysMeals = meals?.filter((m: any) => isToday(m.createdAt)) ?? [];
  const todaysTotalCalories = todaysMeals.reduce(
    (s: number, m: any) => s + m.totalCalories,
    0,
  );
  const todaysTotalProtein = todaysMeals.reduce(
    (s: number, m: any) => s + m.totalProteins,
    0,
  );

  const todaysWorkout = workoutLogs?.find((l: any) => isToday(l.createdAt));

  const todaysCardio = cardioLogs?.find((l: any) => isToday(l.createdAt));
  const router = useRouter();
  const cardioStreak = calculateStreak(cardioLogs);
  const trainingStreak = calculateStreak(workoutLogs);
  const combinedStreak = Math.min(cardioStreak, trainingStreak);
  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E] p-6">
      <ScrollView contentContainerStyle={{ padding: 0, paddingBottom: 100 }}>
        <Text className="text-white text-2xl font-bold tracking-widest mb-8">
          DETAILS
        </Text>
        <View className="mb-6">
          <Text className="text-white text-3xl font-bold mt-1">
            Hello, {authUser?.username ?? "there"}
          </Text>

          <Text className="text-white text-md tracking-widest">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Streak Cards */}
        <View className="flex-row gap-3 mb-4">
          <View
            className="flex-1 bg-[#1C2A4A] rounded-xl p-4 items-center"
            style={{
              borderWidth: 3,
              borderLeftWidth: 3,
              borderBottomWidth: 3,
              borderColor: "#00BFFF",
            }}
          >
            <Ionicons name="barbell-outline" size={28} color="#00BFFF" />
            <Text className="text-white text-4xl font-bold mt-2">
              {trainingStreak}
            </Text>
            <Text className="text-[#8E8E93] text-xs text-center mt-1 uppercase tracking-widest">
              Training Streak
            </Text>
          </View>
          <View
            className="flex-1 bg-[#1C2A4A] rounded-xl p-4 items-center"
            style={{ borderWidth: 3, borderColor: "#00BFFF" }}
          >
            <Ionicons name="bicycle-outline" size={28} color="#00BFFF" />
            <Text className="text-white text-4xl font-bold mt-2">
              {cardioStreak}
            </Text>
            <Text className="text-[#8E8E93] text-xs text-center mt-1 uppercase tracking-widest">
              Cardio Streak
            </Text>
            <Text className="text-[#8E8E93] text-xs"></Text>
          </View>
        </View>

        {dailyCalories && (
          <View className="bg-[#1C2A4A] rounded-2xl p-5 mt-4">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-[#8E8E93] text-xs uppercase tracking-widest font-bold mb-1">
                  Daily Calorie Target
                </Text>
                <Text className="text-white text-4xl font-bold">
                  {Math.round(todaysTotalCalories)}
                  <Text className="text-[#8E8E93] text-lg font-normal">
                    {" "}
                    / {dailyCalories}
                  </Text>
                </Text>
                <Text className="text-[#8E8E93] text-xs mt-1">
                  kcal consumed today
                </Text>
              </View>
              <View
                className="rounded-2xl px-3 py-1"
                style={{
                  backgroundColor:
                    todaysTotalCalories >= dailyCalories
                      ? "#E6394620"
                      : todaysTotalCalories / dailyCalories > 0.85
                        ? "#f9731620"
                        : "#00BFFF20",
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color:
                      todaysTotalCalories >= dailyCalories
                        ? "#E63946"
                        : todaysTotalCalories / dailyCalories > 0.85
                          ? "#f97316"
                          : "#00BFFF",
                  }}
                >
                  {todaysTotalCalories >= dailyCalories
                    ? "Exceeded"
                    : `${Math.round((todaysTotalCalories / dailyCalories) * 100)}%`}
                </Text>
              </View>
            </View>

            {/* Bar */}
            <View
              className="bg-[#0A0F1E] rounded-full overflow-hidden mb-3"
              style={{ height: 8 }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((todaysTotalCalories / dailyCalories) * 100, 100)}%`,
                  backgroundColor:
                    todaysTotalCalories >= dailyCalories
                      ? "#E63946"
                      : todaysTotalCalories / dailyCalories > 0.85
                        ? "#f97316"
                        : "#00BFFF",
                }}
              />
            </View>

            {/* Macro row */}
            <View
              className="flex-row justify-between pt-3"
              style={{ borderTopWidth: 1, borderTopColor: "#0A0F1E" }}
            >
              {[
                {
                  label: "Protein",
                  value: `${Math.round(todaysTotalProtein)}g`,
                  color: "#00BFFF",
                },
                {
                  label: "Carbs",
                  value:
                    todaysMeals.length > 0
                      ? `${Math.round(todaysMeals.reduce((s: number, m: any) => s + m.totalCarbohydrates, 0))}g`
                      : "0g",
                  color: "#f97316",
                },
                {
                  label: "Fat",
                  value:
                    todaysMeals.length > 0
                      ? `${Math.round(todaysMeals.reduce((s: number, m: any) => s + m.totalFats, 0))}g`
                      : "0g",
                  color: "#a78bfa",
                },
                {
                  label: "Remaining",
                  value: `${Math.max(dailyCalories - Math.round(todaysTotalCalories), 0)} kcal`,
                  color: "#8E8E93",
                },
              ].map((item) => (
                <View key={item.label} className="items-center">
                  <Text
                    className="text-white text-sm font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs mt-1">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Today's Summary Grid */}
        <View className="mt-6">
          <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-3 font-bold">
            {"Today's Activity"}
          </Text>
          <View className="flex-row gap-3 mb-3">
            {/* Nutrition Card */}
            <View
              className="flex-1 bg-[#1C2A4A] rounded-2xl p-4"
              style={{ aspectRatio: 1 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/nutrition")}
                className="flex-row items-center justify-between mb-3"
              >
                <View className="flex-row items-center gap-2">
                  <View className="bg-[#0A0F1E] rounded-xl p-1.5">
                    <Ionicons
                      name="nutrition-outline"
                      size={14}
                      color="#00BFFF"
                    />
                  </View>
                  <Text className="text-white text-xs font-bold uppercase tracking-widest">
                    Nutrition
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#8E8E93" />
              </TouchableOpacity>

              {todaysMeals.length === 0 ? (
                <View className="flex-1 justify-center items-center gap-2">
                  <Ionicons
                    name="restaurant-outline"
                    size={28}
                    color="#1C2A4A"
                    style={{
                      backgroundColor: "#0A0F1E",
                      borderRadius: 50,
                      padding: 10,
                    }}
                  />
                  <Text className="text-[#8E8E93] text-xs text-center">
                    No meals{"\n"}logged yet
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-between">
                  <View>
                    <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                      Last meal
                    </Text>
                    <Text className="text-white text-xs font-bold mb-2 capitalize">
                      {todaysMeals[todaysMeals.length - 1].type}
                    </Text>
                    <View className="gap-1">
                      {todaysMeals[todaysMeals.length - 1].foods
                        .slice(0, 3)
                        .map((food: any, i: number) => (
                          <View key={i} className="flex-row items-center gap-2">
                            <View
                              className="rounded-full bg-[#00BFFF]"
                              style={{ width: 4, height: 4 }}
                            />
                            <Text
                              className="text-[#8E8E93] text-xs flex-1"
                              numberOfLines={1}
                            >
                              {food.name}
                            </Text>
                          </View>
                        ))}
                      {todaysMeals[todaysMeals.length - 1].foods.length > 3 && (
                        <Text className="text-[#8E8E93] text-xs ml-3">
                          +
                          {todaysMeals[todaysMeals.length - 1].foods.length - 3}{" "}
                          more
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Training Card */}
            <View
              className="flex-1 bg-[#1C2A4A] rounded-2xl p-4"
              style={{ aspectRatio: 1 }}
            >
              <TouchableOpacity
                onPress={() => router.push("/training")}
                className="flex-row items-center gap-1 mb-3"
              >
                <View className="bg-[#0A0F1E] rounded-xl p-1.5">
                  <Ionicons name="barbell-outline" size={14} color="#00BFFF" />
                </View>
                <Text className="text-[#00BFFF] text-xs font-bold uppercase tracking-widest">
                  Training
                </Text>
                <Ionicons name="chevron-forward" size={12} color="#00BFFF" />
              </TouchableOpacity>
              {!todaysWorkout ? (
                <View className="flex-1 justify-center">
                  <Text className="text-[#8E8E93] text-xs">
                    No session{"\n"}today.
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-between">
                  <View>
                    <Text className="text-white text-2xl font-bold">
                      {todaysWorkout.totalWeight}kg
                    </Text>
                    <Text className="text-[#8E8E93] text-xs">total volume</Text>
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    <View className="bg-[#0A0F1E] rounded-lg px-2 py-1 flex-1 items-center">
                      <Text className="text-white text-xs font-bold">
                        {todaysWorkout.totalReps}
                      </Text>
                      <Text className="text-[#8E8E93]" style={{ fontSize: 9 }}>
                        reps
                      </Text>
                    </View>
                    <View className="bg-[#0A0F1E] rounded-lg px-2 py-1 flex-1 items-center">
                      <Text className="text-white text-xs font-bold">
                        {Math.floor(todaysWorkout.totalTime / 60)}m
                      </Text>
                      <Text className="text-[#8E8E93]" style={{ fontSize: 9 }}>
                        duration
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Cardio Card — full width */}
          <View className="bg-[#1C2A4A] rounded-2xl p-4">
            <TouchableOpacity
              onPress={() => router.push("/cardio")}
              className="flex-row items-center gap-1 mb-3"
            >
              <View className="bg-[#0A0F1E] rounded-xl p-1.5">
                <Ionicons name="bicycle-outline" size={14} color="#00BFFF" />
              </View>
              <Text className="text-[#00BFFF] text-xs font-bold uppercase tracking-widest">
                Cardio
              </Text>
              <Ionicons name="chevron-forward" size={12} color="#00BFFF" />
            </TouchableOpacity>
            {!todaysCardio ? (
              <Text className="text-[#8E8E93] text-xs">
                No cardio session today.
              </Text>
            ) : (
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white text-2xl font-bold capitalize">
                    {todaysCardio.type}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">activity</Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="bg-[#0A0F1E] rounded-xl px-4 py-3 items-center">
                    <Text className="text-white font-bold">
                      {todaysCardio.distance
                        ? `${todaysCardio.distance}km`
                        : "—"}
                    </Text>
                    <Text className="text-[#8E8E93]" style={{ fontSize: 10 }}>
                      distance
                    </Text>
                  </View>
                  <View className="bg-[#0A0F1E] rounded-xl px-4 py-3 items-center">
                    <Text className="text-white font-bold">
                      {Math.floor(todaysCardio.duration / 60)}m
                    </Text>
                    <Text className="text-[#8E8E93]" style={{ fontSize: 10 }}>
                      duration
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Details;
