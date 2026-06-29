import AiNutritionSummary from "@/components/AiSummaryNutrition";
import FoodDetailModal from "@/components/FoodDetailModal";
import MacroPieChart from "@/components/MacroPieChart";
import MealCard from "@/components/mealCard";
import MealCardSkeleton from "@/components/MealCardSkeleton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const Nutrition = () => {
  const queryClient = useQueryClient();
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [confirmedFoods, setConfirmedFoods] = useState<any[]>([]);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<any>(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [grams, setGrams] = useState(100);

  const router = useRouter();

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
          onPress={() => router.push("/addMeal")}
          className="flex-row justify-center items-center gap-2 bg-[#1C2A4A] p-4 rounded-xl mt-2 mx-4"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            ADD MEAL
          </Text>
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

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
