import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const PARTICLE_COUNT = 16;
const DURATION = 700;

const CONFETTI_COLORS = [
  colors.brandOrange,
  colors.tertiaryBlue,
  colors.tertiaryGreen,
  colors.tertiaryPurple,
  colors.tertiaryPink,
];

type Particle = {
  tx: Animated.Value;
  ty: Animated.Value;
  op: Animated.Value;
  rot: Animated.Value;
  color: string;
  dx: number;
  dy: number;
  rotDir: number;
  w: number;
  h: number;
};

type Props = {
  visible: boolean;
  origin: { x: number; y: number };
  onDone: () => void;
};

export default function ConfettiOverlay({ visible, origin, onDone }: Props) {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      op: new Animated.Value(0),
      rot: new Animated.Value(0),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      dx: (Math.random() - 0.5) * 240,
      dy: Math.random() * -180 + 30,
      rotDir: Math.random() > 0.5 ? 360 : -360,
      w: 6 + Math.floor(Math.random() * 6),
      h: 4 + Math.floor(Math.random() * 6),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    particles.forEach((p) => {
      p.tx.setValue(0);
      p.ty.setValue(0);
      p.op.setValue(1);
      p.rot.setValue(0);
    });

    Animated.parallel(
      particles.map((p) =>
        Animated.parallel([
          Animated.timing(p.tx, { toValue: p.dx, duration: DURATION, useNativeDriver: true }),
          Animated.timing(p.ty, { toValue: p.dy, duration: DURATION, useNativeDriver: true }),
          Animated.timing(p.op, { toValue: 0, duration: DURATION, useNativeDriver: true }),
          Animated.timing(p.rot, { toValue: 1, duration: DURATION, useNativeDriver: true }),
        ])
      )
    ).start(() => onDone());
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rot.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotDir}deg`],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: origin.x - p.w / 2,
              top: origin.y - p.h / 2,
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              borderRadius: 2,
              opacity: p.op,
              transform: [
                { translateX: p.tx },
                { translateY: p.ty },
                { rotate },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
