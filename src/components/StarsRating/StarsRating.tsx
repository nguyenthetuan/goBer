import React from 'react';
import { IconApp } from '../IconApp';
import { IconName } from 'assets';
import { ViewCus } from '../ViewCus';
import { Colors } from 'theme';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { TouchCus } from 'components/TouchCus';

interface IProps {
  point: number;
  count?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
  onChangePoint: () => void;
}

const StarsRating: React.FC<IProps> = ({
  point,
  count = 5,
  size = 18,
  style,
  onChangePoint,
}) => {
  return (
    <ViewCus flex-row>
      {Array(point)
        .fill(0)
        .map((_, i) => (
          <TouchCus
            onPress={() => {
              onChangePoint(i);
            }}>
            <IconApp
              key={i}
              name={IconName.Start}
              size={size}
              color={Colors.yellowF9}
              style={[styles.mr, style]}
            />
          </TouchCus>
        ))}
      {/* {Array(count - Number(point))
        .fill(0)
        .map((_, i) => (
          <TouchCus
            onPress={() => {
              onChangePoint(i + point);
            }}>
            <IconApp
              key={i}
              name={IconName.Start}
              size={size}
              color={Colors.disable}
              style={[styles.mr, style]}
            />
          </TouchCus>
        ))} */}
    </ViewCus>
  );
};
const styles = StyleSheet.create({
  mr: {
    marginRight: 5,
  },
});
export default StarsRating;
