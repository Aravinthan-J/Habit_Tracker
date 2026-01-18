import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

interface StepGoalSetterProps {
  initialGoal: number;
  onGoalChange: (goal: number) => void;
}

const StepGoalSetter: React.FC<StepGoalSetterProps> = ({ initialGoal, onGoalChange }) => {
  const [goal, setGoal] = useState(initialGoal);

  const handleSlidingComplete = (value: number) => {
    const newGoal = Math.round(value / 1000) * 1000;
    setGoal(newGoal);
    onGoalChange(newGoal);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleValueChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Your Daily Goal</Text>
      <Text style={styles.goalValue}>{goal.toLocaleString()} steps</Text>
      <Slider
        style={styles.slider}
        minimumValue={1000}
        maximumValue={50000}
        step={1000}
        value={goal}
        onSlidingComplete={handleSlidingComplete}
        onValueChange={handleValueChange}
        minimumTrackTintColor="#6C63FF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#6C63FF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default StepGoalSetter;
