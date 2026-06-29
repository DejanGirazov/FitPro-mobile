import FoodDetailModal from "@/components/FoodDetailModal";
import FoodResultCard from "@/components/foodResultCard";
import FoodResultCardSkeleton from "@/components/FoodResultCardSkeleton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const AddMealPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [confirmedFoods, setConfirmedFoods] = useState<any[]>([]);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<any>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [grams, setGrams] = useState(100);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["foodSearch", submittedQuery],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/nutrition/search?food=${submittedQuery}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    enabled: submittedQuery.length > 0,
  });

  const { mutate: createLog, isPending: isCreating } = useMutation({
    mutationFn: async ({ foods, type }: { foods: any[]; type: string }) => {
      const res = await fetch(`${API_URL}/api/nutrition/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create log");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      router.back();
    },
  });

  const totalCalories = confirmedFoods.reduce(
    (s, f) => s + (f.calories || 0),
    0,
  );
  const totalProtein = confirmedFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = confirmedFoods.reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = confirmedFoods.reduce((s, f) => s + (f.fat || 0), 0);

  const openFoodDetails = async (food: any) => {
    const isConfirmed = confirmedFoods.some((f) => f.id === food.id);
    if (isConfirmed) {
      setConfirmedFoods(confirmedFoods.filter((f) => f.id !== food.id));
      return;
    }
    const res = await fetch(`${API_URL}/api/nutrition/search/${food.id}`);
    const data = await res.json();
    setSelectedFoodDetails(data);
    setGrams(data.BaseWeight || 100);
    setFoodModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-4 border-b border-[#1C2A4A]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-[#1C2A4A] p-2 rounded-xl"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold tracking-widest">
            ADD MEAL
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* Meal Type */}
          <Text className="text-[#8E8E93] text-sm mb-2 uppercase tracking-widest">
            Meal Type
          </Text>
          <View className="flex-row gap-2 mb-6">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setMealType(t)}
                className={`flex-1 p-3 rounded-xl items-center ${
                  mealType === t ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"
                }`}
              >
                <Text className="text-white text-xs font-bold capitalize">
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Foods Summary */}
          {confirmedFoods.length > 0 && (
            <View className="bg-[#1C2A4A] rounded-xl p-4 mb-6">
              <Text className="text-[#00BFFF] font-bold uppercase tracking-widest text-sm mb-3">
                Selected Foods
              </Text>
              {confirmedFoods.map((f) => (
                <View
                  key={f.id}
                  className="flex-row justify-between items-center mb-2"
                >
                  <Text
                    className="text-white text-sm flex-1 mr-2"
                    numberOfLines={1}
                  >
                    {f.name}{" "}
                    <Text className="text-[#8E8E93]">({f.quantity}g)</Text>
                  </Text>
                  <View className="flex-row gap-2 items-center">
                    <Text className="text-[#00BFFF] text-xs font-bold">
                      {Math.round(f.calories)} kcal
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setConfirmedFoods(
                          confirmedFoods.filter((x) => x.id !== f.id),
                        )
                      }
                    >
                      <Ionicons name="close-circle" size={18} color="#E63946" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Totals */}
              <View
                className="mt-3 pt-3 flex-row justify-between"
                style={{ borderTopWidth: 1, borderTopColor: "#0A0F1E" }}
              >
                <View className="items-center">
                  <Text className="text-[#00BFFF] text-lg font-bold">
                    {Math.round(totalCalories)}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">kcal</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {Math.round(totalProtein)}g
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Protein</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {Math.round(totalCarbs)}g
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Carbs</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {Math.round(totalFat)}g
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Fat</Text>
                </View>
              </View>
            </View>
          )}

          {/* Search */}
          <Text className="text-[#8E8E93] text-sm mb-2 uppercase tracking-widest">
            Search Food
          </Text>
          <TextInput
            placeholder="e.g. chicken breast..."
            placeholderTextColor="#8E8E93"
            className="bg-[#1C2A4A] text-white p-4 rounded-xl mb-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => setSubmittedQuery(searchQuery)}
            returnKeyType="search"
          />
          <Text className="text-[#8E8E93] text-xs mb-4 uppercase tracking-widest">
            Values shown per serving size.
          </Text>

          {/* Search Results */}
          {isSearching ? (
            <>
              <FoodResultCardSkeleton />
              <FoodResultCardSkeleton />
              <FoodResultCardSkeleton />
            </>
          ) : (
            <>
              {searchResults?.filter((f: any) => f.isLocal).length > 0 && (
                <>
                  <Text className="text-[#00BFFF] text-xs font-bold uppercase tracking-widest mb-2">
                    Common Foods
                  </Text>
                  {searchResults
                    .filter((f: any) => f.isLocal)
                    .map((food: any) => (
                      <FoodResultCard
                        key={food.id}
                        food={food}
                        selected={confirmedFoods.some((f) => f.id === food.id)}
                        onPress={() => openFoodDetails(food)}
                      />
                    ))}
                </>
              )}
              {searchResults?.filter((f: any) => !f.isLocal).length > 0 && (
                <>
                  <Text className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest mb-2 mt-3">
                    USDA Database
                  </Text>
                  {searchResults
                    .filter((f: any) => !f.isLocal)
                    .map((food: any) => (
                      <FoodResultCard
                        key={food.id}
                        food={food}
                        selected={confirmedFoods.some((f) => f.id === food.id)}
                        onPress={() => openFoodDetails(food)}
                      />
                    ))}
                </>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          className="flex-row gap-3 px-4 pb-6 pt-3 bg-[#0A0F1E]"
          style={{ borderTopWidth: 1, borderTopColor: "#1C2A4A" }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-[#1C2A4A] p-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => createLog({ foods: confirmedFoods, type: mealType })}
            disabled={confirmedFoods.length === 0 || isCreating}
            className={`flex-1 p-4 rounded-xl items-center ${
              confirmedFoods.length === 0
                ? "bg-[#1C2A4A] opacity-40"
                : "bg-[#00BFFF]"
            }`}
          >
            <Text className="text-white font-bold">
              {isCreating ? "Saving..." : `Log Meal (${confirmedFoods.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <FoodDetailModal
        visible={foodModalVisible}
        food={selectedFoodDetails}
        grams={grams}
        setGrams={setGrams}
        onClose={() => setFoodModalVisible(false)}
        onAdd={(food, gramsAmount) => {
          const scale = (v: number) =>
            parseFloat(((gramsAmount / food.BaseWeight) * v).toFixed(1));
          setConfirmedFoods((prev) => [
            ...prev,
            {
              id: food.id,
              externalFoodId: food.id,
              name: food.name,
              quantity: gramsAmount,
              unit: "g",
              calories: scale(food.calories),
              protein: scale(food.protein),
              carbs: scale(food.carbs),
              fat: scale(food.fat),
            },
          ]);
          setFoodModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default AddMealPage;
