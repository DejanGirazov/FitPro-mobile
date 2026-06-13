import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";

type Food = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealCardProps = {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: { name: string; calories: number }[];
  onAdd?: () => void;
  onDelete?: () => void;
};

const MEAL_ICONS: Record<string, any> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "nutrition-outline",
};

const MealCard = ({
  type,
  calories,
  protein,
  carbs,
  fat,
  foods,
  onAdd,
  onDelete,
}: MealCardProps) => {
  return (
    <View className="bg-[#1C2A4A] rounded-xl p-4 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name={MEAL_ICONS[type]} size={20} color="#00BFFF" />
          <Text className="text-white font-bold text-lg capitalize">
            {type}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="text-[#00BFFF] font-bold">
            {Math.round(calories)} kcal
          </Text>
          <TouchableOpacity
            onPress={onDelete}
            className="bg-[#0A0F1E] p-1 rounded-lg"
          >
            <Ionicons name="trash-outline" size={20} color="#E63946" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Macro summary */}
      <View className="flex-row gap-3 mb-3">
        {[
          { label: "Protein", value: protein },
          { label: "Carbs", value: carbs },
          { label: "Fat", value: fat },
        ].map((macro) => (
          <View
            key={macro.label}
            className="flex-1 bg-[#0A0F1E] rounded-lg p-2 items-center"
          >
            <Text className="text-[#8E8E93] text-xs">{macro.label}</Text>
            <Text className="text-white font-bold">
              {Math.round(macro.value)}g
            </Text>
          </View>
        ))}
      </View>

      {/* Food list */}
      {foods.map((food, i) => (
        <View
          key={i}
          className="flex-row justify-between items-center py-2"
          style={
            i !== 0 ? { borderTopWidth: 0.5, borderColor: "#ffffff20" } : {}
          }
        >
          <Text className="text-white text-sm flex-1">{food.name}</Text>
          <Text className="text-[#8E8E93] text-sm">
            {Math.round(food.calories)} kcal
          </Text>
        </View>
      ))}

      {foods.length === 0 && (
        <Text className="text-[#8E8E93] text-sm text-center py-2">
          No foods logged yet
        </Text>
      )}
    </View>
  );
};

export default MealCard;
