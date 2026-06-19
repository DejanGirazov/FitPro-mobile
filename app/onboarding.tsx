import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

const GOALS = [
  {
    key: "lose weight",
    label: "Lose Weight",
    desc: "Burn fat and slim down",
    icon: "📉",
  },
  {
    key: "build muscle",
    label: "Build Muscle",
    desc: "Gain mass and get stronger",
    icon: "💪",
  },
  { key: "both", label: "Both", desc: "Recomp and stay balanced", icon: "⚖️" },
];

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { key: "light exercise", label: "Light", desc: "1–2 days a week" },
  { key: "moderate exercise", label: "Moderate", desc: "3–5 days a week" },
  { key: "heavy exercise", label: "Heavy", desc: "6–7 days a week" },
  { key: "athlete", label: "Athlete", desc: "Training twice a day" },
];

const STEPS = ["stats", "goal", "activity"];

export default function Onboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
  });

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

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/auth/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      router.replace("/(tabs)/home" as any);
    },
  });

  const canProceed = () => {
    if (currentStep === 0) return form.age && form.height && form.weight;
    if (currentStep === 1) return form.goal;
    if (currentStep === 2) return form.activityLevel;
    return false;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      saveProfile({
        username: authUser?.username,
        email: authUser?.email,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        gender: authUser?.gender,
        goal: form.goal,
        activityLevel: form.activityLevel,
      });
    }
  };

  const progress = (currentStep + 1) / STEPS.length;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 pt-8 pb-6">
          {/* Progress */}
          <View className="mb-10">
            <View className="flex-row justify-between mb-2">
              <Text className="text-[#8E8E93] text-xs uppercase tracking-widest">
                Step {currentStep + 1} of {STEPS.length}
              </Text>
              <Text className="text-[#8E8E93] text-xs">
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View
              className="bg-[#1C2A4A] rounded-full overflow-hidden"
              style={{ height: 4 }}
            >
              <View
                className="h-full rounded-full bg-[#00BFFF]"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
          </View>

          {/* Step 0 — Stats */}
          {currentStep === 0 && (
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">
                Your body stats
              </Text>
              <Text className="text-[#8E8E93] mb-10">
                Used to calculate your personal calorie target.
              </Text>

              <View className="gap-5">
                <View>
                  <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                    Age
                  </Text>
                  <TextInput
                    value={form.age}
                    onChangeText={(v) => setForm({ ...form, age: v })}
                    placeholder="e.g. 25"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    className="bg-[#1C2A4A] text-white text-lg p-4 rounded-2xl"
                  />
                </View>
                <View>
                  <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                    Height (cm)
                  </Text>
                  <TextInput
                    value={form.height}
                    onChangeText={(v) => setForm({ ...form, height: v })}
                    placeholder="e.g. 178"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    className="bg-[#1C2A4A] text-white text-lg p-4 rounded-2xl"
                  />
                </View>
                <View>
                  <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                    Weight (kg)
                  </Text>
                  <TextInput
                    value={form.weight}
                    onChangeText={(v) => setForm({ ...form, weight: v })}
                    placeholder="e.g. 75"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    className="bg-[#1C2A4A] text-white text-lg p-4 rounded-2xl"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2 — Goal */}
          {currentStep === 1 && (
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">
                {" What's your goal?"}
              </Text>
              <Text className="text-[#8E8E93] mb-10">
                {"We'll adjust your calorie target based on this."}
              </Text>
              <View className="gap-4">
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.key}
                    onPress={() => setForm({ ...form, goal: g.key })}
                    className={`p-5 rounded-2xl flex-row items-center gap-4 ${
                      form.goal === g.key ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"
                    }`}
                  >
                    <Text style={{ fontSize: 28 }}>{g.icon}</Text>
                    <View>
                      <Text className="text-white font-bold text-base">
                        {g.label}
                      </Text>
                      <Text
                        className={`text-sm ${form.goal === g.key ? "text-white opacity-80" : "text-[#8E8E93]"}`}
                      >
                        {g.desc}
                      </Text>
                    </View>
                    {form.goal === g.key && (
                      <View className="ml-auto w-5 h-5 rounded-full bg-white items-center justify-center">
                        <View className="w-2.5 h-2.5 rounded-full bg-[#00BFFF]" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3 — Activity */}
          {currentStep === 2 && (
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">
                How active are you?
              </Text>
              <Text className="text-[#8E8E93] mb-10">
                Be honest — this directly affects your calorie target.
              </Text>
              <View className="gap-3">
                {ACTIVITY_LEVELS.map((a) => (
                  <TouchableOpacity
                    key={a.key}
                    onPress={() => setForm({ ...form, activityLevel: a.key })}
                    className={`p-4 rounded-2xl flex-row items-center justify-between ${
                      form.activityLevel === a.key
                        ? "bg-[#00BFFF]"
                        : "bg-[#1C2A4A]"
                    }`}
                  >
                    <View>
                      <Text className="text-white font-bold">{a.label}</Text>
                      <Text
                        className={`text-xs ${form.activityLevel === a.key ? "text-white opacity-80" : "text-[#8E8E93]"}`}
                      >
                        {a.desc}
                      </Text>
                    </View>
                    {form.activityLevel === a.key && (
                      <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                        <View className="w-2.5 h-2.5 rounded-full bg-[#00BFFF]" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bottom buttons */}
          <View className="flex-row gap-3 mt-auto pt-6">
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={() => setCurrentStep((s) => s - 1)}
                className="flex-1 bg-[#1C2A4A] p-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold">Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed() || isPending}
              className={`flex-1 p-4 rounded-2xl items-center ${
                canProceed() ? "bg-[#00BFFF]" : "bg-[#1C2A4A] opacity-40"
              }`}
            >
              <Text className="text-white font-bold">
                {isPending
                  ? "Saving..."
                  : currentStep === STEPS.length - 1
                    ? "Finish"
                    : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
