import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface DonutChartProps {
  data: {
    name: string;
    count: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[];
  title: string;
}

const screenWidth = Dimensions.get('window').width;

const DonutChart: React.FC<DonutChartProps> = ({ data, title }) => {
  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noDataText}>No data available to display.</Text>
      </View>
    );
  }
  
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const percentage = total > 0 ? (data[0].count / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          hasLegend={true}
        />
        <View style={styles.centerTextContainer}>
          <Text style={styles.centerPercentage}>{`${percentage.toFixed(0)}%`}</Text>
          <Text style={styles.centerLabel}>Completed</Text>
        </View>
      </View>
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
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  centerLabel: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 50,
  },
});

export default DonutChart;
