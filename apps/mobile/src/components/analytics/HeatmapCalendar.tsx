import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ContributionGraph } from 'react-native-chart-kit';

interface HeatmapCalendarProps {
  data: { date: string; count: number }[];
  title: string;
}

const screenWidth = Dimensions.get('window').width;

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noDataText}>No data available to display.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ContributionGraph
        values={data}
        endDate={new Date()}
        numDays={105} // roughly 15 weeks
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        tooltipDataAttrs={(value) => ({
          'data-tip': value.date ? `${value.date}: ${value.count} completions` : '',
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 50,
  },
});

export default HeatmapCalendar;
