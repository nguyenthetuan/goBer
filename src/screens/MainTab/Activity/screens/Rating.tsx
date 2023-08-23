import {
  Divider,
  HomeLayout,
  IconApp,
  RNFlatList,
  ScrollViewCus,
  TextCus,
  TouchCus,
  ViewCus,
} from 'components';
import React, { useMemo, useState } from 'react';
import { BaseStyle, Colors } from 'theme';
import { ContentRating } from '../components';
import { NavigationService, RootStackParamList, Routes } from 'navigation';
import { StyleSheet } from 'react-native';
import { formatMoney } from 'utils';
import { IconName } from 'assets';
import { RouteProp, useRoute } from '@react-navigation/native';
const Rating: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Rating'>>();
  const [point, setpoint] = useState<Number>(5);
  const body = useMemo(() => {
    switch (route.params?.type) {
      case 'car':
        return (
          <>
            <ContentRating
              subtitle="Bạn đánh giá tài xế của bạn như thế nào?"
              title="Đánh giá tài xế"
              onPress={() =>
                NavigationService.navigate(Routes.RatingBiker, {
                  point: point,
                  deliveryInfo: route.params?.deliveryInfo,
                })
              }
              point={point}
              onChangePoint={(p: number) => {
                setpoint(p + 1);
              }}
            />
          </>
        );

      default:
        return (
          <>
            <ContentRating
              subtitle="Bạn đánh các món tại Cơm Gà Xối Mỡ 142 - Đinh Tiên Hoàng như thế nào"
              title="Đánh giá nhà hàng"
              onPress={() =>
                NavigationService.navigate(Routes.RatingRestaurant)
              }
            />
            <ContentRating
              subtitle="Bạn đánh giá tài xế của bạn như thế nào?"
              title="Đánh giá tài xế"
              onPress={() =>
                NavigationService.navigate(Routes.RatingBiker, {
                  point: point,
                  deliveryInfo: route.params?.deliveryInfo,
                })
              }
            />
          </>
        );
    }
  }, [route.params?.type, point]);
  return (
    <HomeLayout
      bgColor={Colors.main}
      header={{
        title: 'activity.rating',
        iconColor: Colors.white,
      }}>
      <ScrollViewCus>
        <ViewCus px-16 pb-16 f-1>
          {body}
          <ViewCus style={styles.contentBox}>
            <ViewCus>
              <Divider
                small
                color={Colors.greyEE}
                style={{ marginBottom: 12 }}
              />

              <TouchCus
                style={BaseStyle.flexRowSpaceBetwwen}
                onPress={() =>
                  NavigationService.navigate(Routes.RatingBiker, {
                    point: point,
                    deliveryInfo: route.params?.deliveryInfo,
                  })
                }>
                <ViewCus flex-row items-center>
                  <IconApp
                    name={IconName.Term}
                    color={Colors.grey85}
                    size={18}
                  />
                  <TextCus ml-8 useI18n>
                    activity.writeReview
                  </TextCus>
                </ViewCus>
                <IconApp
                  name={IconName.ChevronRight}
                  color={Colors.grey85}
                  size={16}
                />
              </TouchCus>
            </ViewCus>
          </ViewCus>
        </ViewCus>
      </ScrollViewCus>
    </HomeLayout>
  );
};
const styles = StyleSheet.create({
  contentBox: {
    ...BaseStyle.boxShadow,
    marginTop: 24,
    padding: 14,
  },
  clearPadding: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  ml16: {
    marginLeft: 16,
  },
  activeText: {
    color: Colors.main,
  },
  activeItem: {
    borderColor: Colors.main,
  },
  wrapperItem: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.greyE6,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginTop: 16,
    marginRight: 8,
  },
});
export default Rating;