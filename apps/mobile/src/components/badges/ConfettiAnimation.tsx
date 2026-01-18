import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

interface ConfettiAnimationProps {
  isVisible: boolean;
  onAnimationFinish?: () => void;
  loop?: boolean;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ isVisible, onAnimationFinish, loop = false }) => {
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
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={require('../../../assets/lottie/confetti.json')} // Assuming Lottie files are in assets/lottie
        autoPlay={false}
        loop={loop}
        speed={1}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottieAnimation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  lottieAnimation: {
    flex: 1,
  },
});

export default ConfettiAnimation;
