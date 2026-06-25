import AiNutritionSummary from "@/components/AiSummaryNutrition";
import FoodDetailModal from "@/components/FoodDetailModal";
import FoodResultCard from "@/components/foodResultCard";
import FoodResultCardSkeleton from "@/components/FoodResultCardSkeleton";
import MacroPieChart from "@/components/MacroPieChart";
import MealCard from "@/components/mealCard";
import MealCardSkeleton from "@/components/MealCardSkeleton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const Nutrition = () => {
  const queryClient = useQueryClient();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmedFoods, setConfirmedFoods] = useState<any[]>([]);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<any>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [grams, setGrams] = useState(100);

  const {
    data: meals,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["meals"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/nutrition/getLogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
  });

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
      setConfirmedFoods([]);
      setSearchQuery("");
      setSubmittedQuery("");
      setCreateModalVisible(false);
    },
  });
  const { mutate: deleteLog } = useMutation({
    mutationFn: async (mealId: string) => {
      const res = await fetch(`${API_URL}/api/nutrition/delete/${mealId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete meal");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });

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

  const totalCalories = confirmedFoods.reduce(
    (s, f) => s + (f.calories || 0),
    0,
  );
  const totalProtein = confirmedFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = confirmedFoods.reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = confirmedFoods.reduce((s, f) => s + (f.fat || 0), 0);

  const resetModal = () => {
    setConfirmedFoods([]);
    setSearchQuery("");
    setSubmittedQuery("");
    setCreateModalVisible(false);
  };
  const todaysMeals = meals?.filter((meal: any) => {
    const mealDate = new Date(meal.createdAt);
    const today = new Date();
    return (
      mealDate.getFullYear() === today.getFullYear() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getDate() === today.getDate()
    );
  });
  const todaysTotalProtein =
    todaysMeals?.reduce((s: number, m: any) => s + m.totalProteins, 0) ?? 0;
  const todaysTotalCarbs =
    todaysMeals?.reduce((s: number, m: any) => s + m.totalCarbohydrates, 0) ??
    0;
  const todaysTotalFat =
    todaysMeals?.reduce((s: number, m: any) => s + m.totalFats, 0) ?? 0;
  const todaysTotalCalories =
    todaysMeals?.reduce((s: number, m: any) => s + m.totalCalories, 0) ?? 0;

  return (
    <SafeAreaView className="bg-[#0A0F1E] h-full" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100,
        }}
      >
        <Text className="text-white text-2xl text-center font-bold tracking-widest mb-4">
          NUTRITION
        </Text>
        {todaysMeals && todaysMeals.length > 0 && (
          <MacroPieChart
            protein={todaysTotalProtein}
            carbs={todaysTotalCarbs}
            fat={todaysTotalFat}
            totalCalories={todaysTotalCalories}
          />
        )}
        {isLoading ? (
          <>
            <MealCardSkeleton />
            <MealCardSkeleton />
            <MealCardSkeleton />
          </>
        ) : isError ? (
          <Text className="text-red-500 text-center">Error loading meals</Text>
        ) : todaysMeals?.length === 0 ? (
          <Text className="text-white text-center">
            No meals logged yet today.
          </Text>
        ) : (
          todaysMeals?.map((meal: any) => (
            <MealCard
              key={meal._id}
              type={meal.type}
              calories={meal.totalCalories}
              protein={meal.totalProteins}
              carbs={meal.totalCarbohydrates}
              fat={meal.totalFats}
              foods={meal.foods}
              onDelete={() => deleteLog(meal._id)}
            />
          ))
        )}
        {todaysMeals && todaysMeals.length > 0 && (
          <AiNutritionSummary meals={todaysMeals} />
        )}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="flex-row justify-center items-center gap-2 bg-[#1C2A4A] p-4 rounded-xl mt-2 mx-4"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            ADD MEAL
          </Text>
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "flex-end",
          }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "flex-end",
            }}
          >
            <View
              className="bg-[#0A0F1E] rounded-t-3xl p-6"
              style={{ maxHeight: "90%" }}
            >
              <Text className="text-white text-xl font-bold mb-4">
                Add Meal
              </Text>

              {/* Meal type */}
              <Text className="text-[#8E8E93] text-sm mb-2 uppercase tracking-widest">
                Meal Type
              </Text>
              <View className="flex-row gap-2 mb-4">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                  (t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setMealType(t)}
                      className={`flex-1 p-3 rounded-xl items-center ${mealType === t ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"}`}
                    >
                      <Text className="text-white text-xs font-bold capitalize">
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Selected foods summary */}
              {confirmedFoods.length > 0 && (
                <View className="bg-[#1C2A4A] rounded-xl p-4 mb-4">
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
                        <Text className="text-[#8E8E93]">({f.grams}g)</Text>
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
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#E63946"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Combined totals */}
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
              <Text className="text-[#8E8E93] text-xs mb-3 uppercase tracking-widest">
                Values shown per serving size.
              </Text>

              <ScrollView style={{ maxHeight: 220 }}>
                {isSearching ? (
                  <Text className="text-[#8E8E93] text-center">
                    <FoodResultCardSkeleton />
                    <FoodResultCardSkeleton />
                    <FoodResultCardSkeleton />
                  </Text>
                ) : (
                  searchResults?.map((food: any) => (
                    <FoodResultCard
                      key={food.id}
                      food={food}
                      selected={confirmedFoods.some((f) => f.id === food.id)}
                      onPress={() => openFoodDetails(food)}
                    />
                  ))
                )}
              </ScrollView>

              {/* Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={resetModal}
                  className="flex-1 bg-[#1C2A4A] p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    createLog({ foods: confirmedFoods, type: mealType });

                    setCreateModalVisible(false);
                  }}
                  disabled={confirmedFoods.length === 0 || isCreating}
                  className={`flex-1 p-4 rounded-xl items-center ${confirmedFoods.length === 0 ? "bg-[#1C2A4A] opacity-40" : "bg-[#00BFFF]"}`}
                >
                  <Text className="text-white font-bold">
                    {isCreating
                      ? "Saving..."
                      : `Log Meal (${confirmedFoods.length})`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

export default Nutrition;
