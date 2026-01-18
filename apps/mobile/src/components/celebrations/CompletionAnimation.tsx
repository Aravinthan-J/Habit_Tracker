import React, { useRef, useEffect } from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

interface CompletionAnimationProps {
  isVisible: boolean;
  onAnimationFinish?: () => void;
  size?: number;
}

const CompletionAnimation: React.FC<CompletionAnimationProps> = ({ isVisible, onAnimationFinish, size = 150 }) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isVisible) {
      animationRef.current?.play();
    } else {
      animationRef.current?.reset();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={require('../../../assets/lottie/checkmark.json')}
        autoPlay={false}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }], // Adjust for half of default size
    zIndex: 1000,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default CompletionAnimation;
