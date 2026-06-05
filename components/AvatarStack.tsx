import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

type Avatar = { id: string; initials: string; color: string };

type Props = {
  avatars: Avatar[];
  size?: number;
  overlap?: number;
  showAdd?: boolean;
  onAdd?: () => void;
};

export default function AvatarStack({
  avatars,
  size = 32,
  overlap = 10,
  showAdd = false,
  onAdd,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', height: size }}>
        {avatars.map((avatar, i) => (
          <View
            key={avatar.id}
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: avatar.color,
                marginLeft: i === 0 ? 0 : -overlap,
                zIndex: avatars.length - i,
              },
            ]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
              {avatar.initials}
            </Text>
          </View>
        ))}
      </View>
      {showAdd && (
        <TouchableOpacity
          onPress={onAdd}
          style={[
            styles.addButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontFamily: 'OpenSauceOne-Bold',
  },
  addButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brandOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    ...typography.label,
    color: colors.brandOrange,
    fontFamily: 'OpenSauceOne-Bold',
    lineHeight: 16,
  },
});
