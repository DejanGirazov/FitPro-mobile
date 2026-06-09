import { Dimensions, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";

const WorkoutChart = ({ logs, selectedWorkout, tab }: any) => {
  const chartData = logs
    ?.filter((log: any) => log.workout === selectedWorkout?._id)
    .map((log: any) => ({
      date: new Date(log.createdAt).toLocaleDateString(),
      weight: log.totalWeight,
      reps: log.totalReps,
    }));

  if (!chartData || chartData.length === 0) {
    return <Text className="text-white text-center">No data available</Text>;
  }

  if (chartData.length < 3) {
    return (
      <Text className="text-white text-center">
        Complete at least 3 workouts to view chart
      </Text>
    );
  }

  return (
    <LineChart
      data={{
        labels: chartData.map((d: any) => {
          const parts = d.date.split("/");
          return `${parts[0]}/${parts[1]}`;
        }),
        datasets: [{ data: chartData.map((d: any) => d[tab]) }],
      }}
      width={Dimensions.get("window").width - 64}
      height={200}
      chartConfig={{
        backgroundColor: "#0A0F1E",
        backgroundGradientFrom: "#0A0F1E",
        backgroundGradientTo: "#1C2A4A",
        decimalPlaces: 0,
        color: () => "#00BFFF",
        labelColor: () => "#8E8E93",
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#00BFFF" },
      }}
      bezier
      style={{ borderRadius: 12 }}
    />
  );
};

export default WorkoutChart;
