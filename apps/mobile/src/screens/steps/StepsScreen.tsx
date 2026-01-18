import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, Button, TextInput, Modal } from 'react-native';
import { useSteps } from '../../hooks/useSteps';
import StepProgressRing from '../../components/steps/StepProgressRing';
import StepStats from '../../components/steps/StepStats';
import StepGoalSetter from '../../components/steps/StepGoalSetter';
import StepChart from '../../components/steps/StepChart';
import { useQueryClient } from '@tanstack/react-query';

const StepsScreen = () => {
  const { 
    todaySteps, 
    dailyStepGoal, 
    setDailyStepGoal, 
    weeklySteps, 
    isLoading, 
    logManualSteps 
  } = useSteps();

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [manualSteps, setManualSteps] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['todaySteps'] });
    queryClient.invalidateQueries({ queryKey: ['weeklySteps'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleManualLog = () => {
    const steps = parseInt(manualSteps, 10);
    if (!isNaN(steps)) {
      logManualSteps(new Date(), steps);
      setModalVisible(false);
      setManualSteps('');
    }
  };

  // Dummy data for stats until the service provides it
  const distance = todaySteps * 0.76;
  const calories = todaySteps * 0.04;
  const activeMinutes = Math.round(todaySteps / 100);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Today's Steps</Text>
      
      <View style={styles.progressContainer}>
        <StepProgressRing currentSteps={todaySteps} goal={dailyStepGoal} />
      </View>
      
      <StepStats distance={distance} calories={calories} activeMinutes={activeMinutes} />
      
      <StepGoalSetter initialGoal={dailyStepGoal} onGoalChange={setDailyStepGoal} />
      
      <StepChart data={weeklySteps || []} title="Last 7 Days" />

      <View style={styles.manualLogContainer}>
        <Button title="Manually Log Steps" onPress={() => setModalVisible(true)} color="#6C63FF" />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Enter Steps</Text>
          <TextInput
            style={styles.input}
            onChangeText={setManualSteps}
            value={manualSteps}
            keyboardType="numeric"
            placeholder="e.g., 5000"
          />
          <Button title="Log Steps" onPress={handleManualLog} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  manualLogContainer: {
    marginVertical: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    textAlign: 'center',
    borderRadius: 10,
  }
});

export default StepsScreen;
