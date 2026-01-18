import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

interface StreakFireAnimationProps {
  size?: number;
}

const StreakFireAnimation: React.FC<StreakFireAnimationProps> = ({ size = 30 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={require('../../../assets/lottie/fire.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default StreakFireAnimation;
