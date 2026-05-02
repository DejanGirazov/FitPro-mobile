import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          height: 55,
          marginBottom: 30,
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="bar-chart" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="startWorkout"
        options={{
          title: "Start Workout",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="barbell-outline" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="createWorkout"
        options={{
          title: "Create Workout",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="create-outline" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
