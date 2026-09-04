import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants';

export default function Divider({ style, vertical = false }) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  vertical: {
    width: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.sm,
    alignSelf: 'stretch',
  },
});
