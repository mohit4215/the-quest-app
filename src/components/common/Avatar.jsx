/**
 * Avatar — User profile picture with fallback initials
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants';

const SIZE_MAP = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 80,
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// Generate a consistent color from name string
function getAvatarColor(name = '') {
  const palette = [
    '#1565C0', '#283593', '#6A1B9A', '#00695C',
    '#2E7D32', '#E65100', '#AD1457', '#4527A0',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function Avatar({ name, uri, size = 'md', style }) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const fontSize = dimension * 0.36;

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[containerStyle, styles.image, style]}
        accessibilityLabel={`${name} avatar`}
      />
    );
  }

  return (
    <View style={[containerStyle, { backgroundColor: bgColor }, styles.fallback, style]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
