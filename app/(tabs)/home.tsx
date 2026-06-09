import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BmiScale from "../../components/bmi";
import { API_URL } from "../../constants/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch(`${API_URL}/api/auth/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
      },
    ]);
  };
  const bmi =
    authUser?.weight && authUser?.height
      ? (authUser.weight / (authUser.height / 100) ** 2).toFixed(1)
      : null;

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return "#00BFFF"; // blue - underweight
    if (bmi < 25) return "#22c55e"; // green - normal
    if (bmi < 30) return "#f97316"; // orange - overweight
    return "#E63946"; // red - obese
  };

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

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E] p-6">
      <ScrollView contentContainerStyle={{ padding: 0, paddingBottom: 100 }}>
        <Text className="text-white text-2xl font-bold tracking-widest mb-8">
          PROFILE
        </Text>
        <View className="flex-row flex-wrap bg-[#1C2A4A] p-4 rounded-xl">
          <View className="bg-#00BFFF w-1/2 p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
                Username
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditField("username");
                  setEditValue(authUser?.username || "");
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#00BFFF" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-white text-2xl font-bold">
                {authUser?.username}
              </Text>
            </View>
          </View>
          <View className="bg-#00BFFF w-1/2 p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
                Email
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditField("email");
                  setEditValue(authUser?.email || "");
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#00BFFF" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-sm font-bold">
              {authUser?.email}
            </Text>
          </View>
          <View className="bg-#00BFFF w-1/2 p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
                Age
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditField("age");
                  setEditValue(authUser?.age || "");
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#00BFFF" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-2xl font-bold">
              {authUser?.age}
            </Text>
          </View>
          <View className="bg-#00BFFF w-1/2 p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
                Height
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditField("height");
                  setEditValue(authUser?.height || "");
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#00BFFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-white text-2xl font-bold">
              {authUser?.height}cm
            </Text>
          </View>
          <View className="bg-#00BFFF w-1/2 p-3">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
                Weight
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditField("weight");
                  setEditValue(authUser?.weight || "");
                }}
              >
                <Ionicons name="pencil-outline" size={20} color="#00BFFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-white text-2xl font-bold">
              {authUser?.weight}kg
            </Text>
          </View>
          <View className="bg-#00BFFF w-1/2 p-3">
            <Text className="text-[#00BFFF] text-lg uppercase tracking-widest mb-1 font-semibold">
              Gender
            </Text>
            <Text className="text-white text-2xl font-bold">
              {authUser?.gender}
            </Text>
          </View>
        </View>

        <View className="bg-[#1C2A4A] p-4 rounded-xl mt-6">
          <Text className="text-[#8E8E93] text-sm uppercase tracking-widest mb-1">
            BMI
          </Text>
          {bmi ? (
            <>
              <Text
                style={{ color: getBmiColor(Number(bmi)) }}
                className="text-3xl font-bold"
              >
                {bmi}
              </Text>
              <Text
                style={{ color: getBmiColor(Number(bmi)) }}
                className="text-sm font-bold mt-1"
              >
                {Number(bmi) < 18.5
                  ? "Underweight"
                  : Number(bmi) < 25
                    ? "Normal"
                    : Number(bmi) < 30
                      ? "Overweight"
                      : "Obese"}
              </Text>
              <BmiScale bmi={Number(bmi)} />
            </>
          ) : (
            <Text className="text-white">
              Set height and weight to calculate BMI
            </Text>
          )}
        </View>

        <View className="bg-[#1C2A4A] p-4 rounded-xl mt-6">
          <Text className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
            Fitness Goal
          </Text>
          <View className="flex-col gap-2">
            {[
              {
                key: "lose weight",
                label: "Lose Weight",
                desc: "Calorie deficit to shed body fat",
                icon: "trending-down-outline",
              },
              {
                key: "build muscle",
                label: "Build Muscle",
                desc: "Calorie surplus to gain mass",
                icon: "barbell-outline",
              },
              {
                key: "both",
                label: "Both",
                desc: "Maintain weight while recomping",
                icon: "sync-outline",
              },
            ].map((g) => (
              <TouchableOpacity
                key={g.key}
                onPress={() => {
                  updateProfile({
                    username: authUser?.username,
                    email: authUser?.email,
                    age: authUser?.age,
                    height: authUser?.height,
                    weight: authUser?.weight,
                    gender: authUser?.gender,
                    goal: g.key,
                    activityLevel: authUser?.activityLevel,
                  });
                }}
                className={`flex-row items-center gap-4 p-4 rounded-xl ${authUser?.goal === g.key ? "bg-[#00BFFF]" : "bg-[#0A0F1E]"}`}
              >
                <Ionicons name={g.icon as any} size={24} color="white" />
                <View>
                  <Text className="text-white font-bold">{g.label}</Text>
                  <Text className="text-[#8E8E93] text-sm">{g.desc}</Text>
                </View>
                {authUser?.goal === g.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="white"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-[#1C2A4A] p-4 rounded-xl mt-6">
          <Text className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
            Activity Level
          </Text>
          <View className="flex-col gap-2">
            {[
              {
                key: "sedentary",
                label: "Sedentary",
                desc: "Little or no exercise",
                icon: "bed-outline",
              },
              {
                key: "moderate",
                label: "Moderate",
                desc: "Exercise 3-5 days a week",
                icon: "walk-outline",
              },
              {
                key: "active",
                label: "Active",
                desc: "Exercise 6-7 days a week",
                icon: "barbell-outline",
              },
            ].map((a) => (
              <TouchableOpacity
                key={a.key}
                onPress={() => {
                  updateProfile({
                    username: authUser?.username,
                    email: authUser?.email,
                    age: authUser?.age,
                    height: authUser?.height,
                    weight: authUser?.weight,
                    gender: authUser?.gender,
                    goal: authUser?.goal,
                    activityLevel: a.key,
                  });
                }}
                className={`flex-row items-center gap-4 p-4 rounded-xl ${authUser?.activityLevel === a.key ? "bg-[#00BFFF]" : "bg-[#0A0F1E]"}`}
              >
                <Ionicons name={a.icon as any} size={24} color="white" />
                <View>
                  <Text className="text-white font-bold">{a.label}</Text>
                  <Text className="text-[#8E8E93] text-sm">{a.desc}</Text>
                </View>
                {authUser?.activityLevel === a.key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="white"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="bg-[#1C2A4A] p-4 rounded-xl mt-6">
          <Text className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
            Daily Calorie Target
          </Text>
          <Text className="text-white text-2xl font-bold">
            {dailyCalories
              ? `${dailyCalories} kcal`
              : "Enter your goal and activity level to calculate"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center gap-4 bg-[#1C2A4A] p-4 rounded-xl mt-10"
        >
          <Ionicons name="log-out-outline" size={24} color="#E63946" />
          <Text className="text-[#E63946] font-bold uppercase tracking-widest">
            Log Out
          </Text>
        </TouchableOpacity>
        <Modal
          visible={editField !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditField(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View className="bg-[#1C2A4A] p-6 rounded-xl">
              <Text className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
                Edit {editField}
              </Text>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholderTextColor="#8E8E93"
                placeholder={`Enter new ${editField}`}
                keyboardType={
                  ["age", "height", "weight"].includes(editField || "")
                    ? "numeric"
                    : "default"
                }
                className="bg-[#0A0F1E] text-white p-4 rounded-xl mb-4"
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditField(null)}
                  className="flex-1 bg-[#0A0F1E] p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const updated = {
                      username: authUser?.username,
                      email: authUser?.email,
                      age: authUser?.age,
                      height: authUser?.height,
                      weight: authUser?.weight,
                      gender: authUser?.gender,
                      goal: authUser?.goal, // ← add this
                      activityLevel: authUser?.activityLevel,
                      [editField!]: editValue,
                    };
                    updateProfile(updated);
                    setEditField(null);
                  }}
                  className="flex-1 bg-[#00BFFF] p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
