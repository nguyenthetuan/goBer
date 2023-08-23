import { RouteProp, useRoute } from '@react-navigation/native';
import { IconName } from 'assets';
import {
  Buttons,
  IconCus,
  TextCus,
  TouchCus,
  ViewCus,
  LocationPermission,
} from 'components';
import { BottomSheetModalContainer } from 'components/BottomSheetModals';
import { useAuth, useCustomerSocket, useLocation, useOrders } from 'hooks';
import { NavigationService, RootStackParamList, Routes } from 'navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { Colors } from 'theme';
import { FindCarType, ILongLocation, IRefBottom } from 'types';
import {
  ChooseFromTo,
  ChooseWayToDelivery,
  DriverAreComing,
  FindDriver,
} from './Components';
import CannotFoundDriver from './Components/CannotFoundDriver';
import { FakeMapFind } from './Components/FakeMapFind';
import OrderIsCancel from './Components/OrderIsCancel';
import OrderIsSuccess from './Components/OrderIsSuccess';
import QuestionFromTo from './Components/QuestionFromTo';
import styles from './styles';
import { useIsFocused } from '@react-navigation/native';
import MoreOption from './Components/MoreOption';
import FullWayToDelivery from './Components/FullWayToDelivery';
import { height } from 'utils';
import { number } from 'yup';
import DriverArrived from './Components/DriverArrived';
import FindedDriver from './Components/FindedDriver';
import languageDetectorPlugin from '../../utils/languageDetectorPlugin';

export enum FindCarScreenStepView {
  QUESTION_CHOOSE_FROM_TO,
  CHOOSE_FROM_TO,
  COMFIRM_FROM_TO,
  CHOOSE_DELIVERY_OPTION,
  FIND_DRIVER,
  ON_PROCESS,
  DRIVER_ARE_COMING,
  CANNOT_FOUND_DRIVER,
  ORDER_IS_CANCEL,
  ORDER_IS_SUCCESS,
  MORE_OPTIONS,
  FULL_WAY_TO_DELIVERY,
  DRIVER_ARRIVED,
  FINDED_DRIVER,
}

let TimeOutCancel = null;
const FindCar = () => {
  //#region Static
  const route = useRoute<RouteProp<RootStackParamList, 'FindCar'>>();
  const { locationUser } = useLocation();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const {
    onConnect,
    connect,
    onConnectError,
    socket: customerSocket,
    onTaxiOrderDriverMoving,
    onNotFoundDriver,
    onCompleteMotoTaxi,
    onFoundMotobikeDriver,
    onDriverArrived,
  } = useCustomerSocket();

  const [fromToData, setFromToData] = useState({
    from: {
      address: '',
      lat: locationUser.lat,
      long: locationUser.long,
    },
    to: {
      address: '',
      lat: locationUser.lat,
      long: locationUser.long,
    },
  });
  const [tripInfo, setTripInfo] = useState({});
  const currentOrderCodeRef = useRef<string | null>(null);
  const [heightChooseWayDelivery, setheightChooseWayDelivery] = useState(0);
  const [heightOption, setHeightOption] = useState(0);
  const [heightSheet, setHeightSheet] = useState(0);
  const [DeliveryInfo, setDeliveryInfo] = useState({});
  const [driverLocation, setDriverLocation] = useState<ILongLocation | null>(
    null,
  );
  const { getInfoTaxiService, findCarAction, loading, cancleFindDriver } =
    useOrders();
  const deliveryDriverOptions = useMemo(() => {
    const { from, to } = fromToData;
    const rs = [
      {
        id: 1,
        title: 'Xe máy',
        subTitle: '',
        type: 'MOTORBIKE',
      },
      {
        id: 2,
        title: 'Ô tô 4 chỗ',
        subTitle: 'Thoải mái với 4 chỗ ngồi',
        type: 'CAR4SEATS',
      },
      {
        id: 3,
        title: 'Ô tô 7 chỗ',
        subTitle: 'Thoải mái với 7 chỗ ngồi',
        type: 'CAR7SEATS',
      },
    ];
    if (
      from.address &&
      to.address &&
      from.long &&
      from.lat &&
      to.long &&
      to.lat
    ) {
      try {
        for (let i = 0; i < rs.length; i++) {
          getInfoTaxiService(
            {
              pickupLocation: {
                address: from.address,
                long: from.long,
                lat: from.lat,
              },
              dropoffLocation: {
                address: to.address,
                long: to.long,
                lat: to.lat,
              },
              vehicle: rs[i]?.type?.toString(),
            },
            res => {
              if (res.data.result?.length > 0) {
                rs[i].price = res.data.result[0].price?.toFixed(0);
                rs[i].distance = res.data.result[0].distanceKm;
                rs[i].distanceText = res.data.result[0].distanceText;
              }
            },
          );
        }
      } catch (error) {
        console.log('error:', error);
      }
    }
    return rs;
  }, [route?.params?.type, fromToData]);

  useEffect(() => {
    if (isFocused) {
      refContentBottom.current?.show();
    } else {
      refContentBottom.current?.close();
    }
  }, [isFocused]);

  //#endregion

  //#region Ref control
  const refContentBottom = useRef<IRefBottom>(null);
  //#endregion

  //#region State screen
  const [stepView, setStepView] = useState(
    FindCarScreenStepView.QUESTION_CHOOSE_FROM_TO,
  );
  const [deliveryDriverSelected, setDeliveryDriverSelected] = useState(
    deliveryDriverOptions[0],
  );

  const snapPointModal = useMemo(() => {
    let rs: [any, any] | any[] = ['25%', '25%'];
    switch (stepView) {
      case FindCarScreenStepView.QUESTION_CHOOSE_FROM_TO:
        if (heightSheet) {
          rs = [heightSheet, heightSheet];
        }
        // rs = ['25%', '25%'];
        break;
      case FindCarScreenStepView.CHOOSE_FROM_TO:
        rs = ['100%', '100%'];
        break;
      case FindCarScreenStepView.CHOOSE_DELIVERY_OPTION:
        // rs = ['55%', '55%'];
        if (heightChooseWayDelivery) {
          rs = [heightChooseWayDelivery, heightChooseWayDelivery];
        }
        break;

      case FindCarScreenStepView.FIND_DRIVER:
        rs = ['32%', '32%'];
        break;
      case FindCarScreenStepView.FINDED_DRIVER:
        rs = ['25%', '25%'];
        break;

      case FindCarScreenStepView.ON_PROCESS:
        rs = ['100%'];
        break;

      case FindCarScreenStepView.DRIVER_ARE_COMING:
        if (heightSheet) {
          rs = [heightSheet, heightSheet];
        }
        // rs = ['92%', '92%'];
        break;
      case FindCarScreenStepView.DRIVER_ARRIVED:
        if (heightSheet) {
          rs = [heightSheet, heightSheet];
        }
        // rs = ['92%', '92%'];
        break;

      case FindCarScreenStepView.CANNOT_FOUND_DRIVER:
        rs = [310, '40%'];
        break;
      case FindCarScreenStepView.ORDER_IS_CANCEL:
        rs = [310, '40%'];
        break;

      case FindCarScreenStepView.ORDER_IS_SUCCESS:
        rs = [334, '35%'];
        break;
      case FindCarScreenStepView.MORE_OPTIONS:
        // rs = ['45%', '45%'];
        if (heightOption) {
          rs = [
            heightOption + (height * 100) / 812,
            heightOption + (height * 100) / 812,
          ];
        }
        break;
      case FindCarScreenStepView.FULL_WAY_TO_DELIVERY:
        // rs = ['90%', '90%'];
        if (heightSheet) {
          rs = [
            heightSheet + (height * 100) / 812,
            heightSheet + (height * 100) / 812,
          ];
        }
        break;
      default:
        break;
    }
    return rs;
  }, [stepView, heightChooseWayDelivery, heightSheet]);

  //#endregion

  //#region Ref value
  const refTimeOutCacheRunningFunction = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  //#endregion

  //#region Screen function
  const onChooseFromToChange = useCallback((fromData, toData) => {
    setFromToData({
      from: fromData,
      to: toData,
    });
  }, []);
  const getTypeFindDirection = useCallback((type: FindCarType) => {
    let rs = 'bike';
    if (route?.params?.type) {
      switch (type) {
        case FindCarType.MOTORBIKE:
          break;

        default:
          rs = 'car';
          break;
      }
    }
    return rs;
  }, []);
  //#endregion
  //#region Render function
  const renderFooterModal = useCallback(() => {
    switch (stepView) {
      case FindCarScreenStepView.CHOOSE_FROM_TO:
        return <></>;
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[styles.bo8]}
                onPress={() => {
                  const isValidFrom =
                    fromToData.from?.address &&
                    fromToData.from?.lat &&
                    fromToData.from?.long;
                  const isValidTo =
                    fromToData.to?.address &&
                    fromToData.to?.lat &&
                    fromToData.to?.long;
                  if (isValidFrom && isValidTo) {
                    setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
                  }
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  Xác nhận
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );
      case FindCarScreenStepView.CHOOSE_DELIVERY_OPTION:
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[styles.bo8]}
                onPress={() => {
                  onFindDriverClick();
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  Đặt TasCaree
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );
      case FindCarScreenStepView.MORE_OPTIONS:
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[styles.bo8]}
                onPress={() => {
                  setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  Áp dụng
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );

      case FindCarScreenStepView.CANNOT_FOUND_DRIVER:
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                mr-12
                round={false}
                style={[
                  {
                    backgroundColor: Colors.greyAD,
                  },
                  styles.bo8,
                ]}
                // onPress={() => {
                //   refContentBottom.current?.close();
                //   NavigationService.goBack();
                //   //huỷ
                // }}
                onPress={onCancelFindDriver}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  delivery.cancelFind
                </TextCus>
              </Buttons>
            </ViewCus>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[styles.bo8]}
                onPress={() => {
                  setStepView(FindCarScreenStepView.FIND_DRIVER);
                  TimeOutCancel = setTimeout(() => {
                    setStepView(FindCarScreenStepView.CANNOT_FOUND_DRIVER);
                  }, 60000);
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  delivery.continueFind
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );

      case FindCarScreenStepView.ORDER_IS_CANCEL:
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                mr-12
                round={false}
                style={[
                  {
                    backgroundColor: Colors.greyAD,
                  },
                  styles.bo8,
                ]}
                onPress={() => {
                  refContentBottom.current?.close();
                  NavigationService.replace(Routes.Categories);
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  cancel
                </TextCus>
              </Buttons>
            </ViewCus>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[styles.bo8]}
                onPress={() => {
                  refContentBottom.current?.close();
                  NavigationService.resetTo(
                    [
                      {
                        name: Routes.HomeTabs,
                      },
                      {
                        name: Routes.Categories,
                      },
                    ],
                    1,
                  );
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  delivery.createNewOrder
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );

      case FindCarScreenStepView.ORDER_IS_SUCCESS:
        return (
          <ViewCus flex-row p-16>
            <ViewCus f-1>
              <Buttons
                h-48
                mr-12
                round={false}
                style={[
                  {
                    backgroundColor: Colors.greyAD,
                  },
                  styles.bo8,
                ]}
                onPress={() => {
                  refContentBottom.current?.close();
                  NavigationService.reset(Routes.Home);
                  NavigationService.navigate(Routes.Home);
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  exit
                </TextCus>
              </Buttons>
            </ViewCus>
            <ViewCus f-1>
              <Buttons
                h-48
                round={false}
                style={[
                  styles.bo8,
                  {
                    backgroundColor: Colors.success,
                  },
                ]}
                onPress={() => {
                  refContentBottom.current?.close();
                  NavigationService.resetTo(
                    [
                      {
                        name: Routes.HomeTabs,
                      },
                      {
                        name: Routes.Rating,
                        params: {
                          type: 'car',
                          deliveryInfo: DeliveryInfo,
                        },
                      },
                    ],
                    1,
                  );
                }}>
                <TextCus useI18n bold semiBold color={Colors.white}>
                  activity.rating
                </TextCus>
              </Buttons>
            </ViewCus>
          </ViewCus>
        );

      default:
        return <></>;
    }
  }, [stepView, deliveryDriverSelected, fromToData]);

  const renderContentModal = (step: FindCarScreenStepView) => {
    switch (step) {
      case FindCarScreenStepView.QUESTION_CHOOSE_FROM_TO:
        return (
          <QuestionFromTo
            onLayout={(height: number) => setHeightSheet(height)}
            setStepView={setStepView}
          />
        );
      case FindCarScreenStepView.CHOOSE_FROM_TO:
        return (
          <>
            <ChooseFromTo
              fromToData={fromToData}
              onChooseFromToChange={onChooseFromToChange}
              setStepView={setStepView}
            />
          </>
        );
      case FindCarScreenStepView.CHOOSE_DELIVERY_OPTION:
        return (
          <View style={{ paddingBottom: 50 }}>
            <ChooseWayToDelivery
              initialValue={deliveryDriverSelected}
              options={deliveryDriverOptions}
              onOpenMore={() => {
                setStepView(FindCarScreenStepView.MORE_OPTIONS);
              }}
              onShowFullWayToDelivery={() => {
                setStepView(FindCarScreenStepView.FULL_WAY_TO_DELIVERY);
              }}
              onLayout={height => setheightChooseWayDelivery(height)}
              onCancel={() => {
                refContentBottom.current?.close();
                handleBackOrCancel();
              }}
              fromToData={fromToData}
              onSubmit={data => {
                setDeliveryDriverSelected(data);
              }}
            />
          </View>
        );

      case FindCarScreenStepView.FIND_DRIVER:
        return (
          <FindDriver
            onCancel={onCancelFindDriver}
            onSubmit={() => {
              setStepView(FindCarScreenStepView.DRIVER_ARE_COMING);
            }}
            type={deliveryDriverSelected.type}
            fromToData={fromToData}
          />
        );
      case FindCarScreenStepView.FINDED_DRIVER:
        return <FindedDriver type={deliveryDriverSelected.type} />;
      case FindCarScreenStepView.DRIVER_ARE_COMING:
        return (
          <DriverAreComing
            onCancel={() => {
              setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
            }}
            onLayout={(height: number) => setHeightSheet(height)}
            fromToData={fromToData}
            DeliveryInfo={DeliveryInfo}
            type={deliveryDriverSelected.type}
          />
        );

      case FindCarScreenStepView.DRIVER_ARRIVED:
        return (
          <DriverArrived
            onCancel={() => {
              setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
            }}
            onLayout={(height: number) => setHeightSheet(height)}
            fromToData={fromToData}
            DeliveryInfo={DeliveryInfo}
            type={deliveryDriverSelected.type}
          />
        );

      case FindCarScreenStepView.ORDER_IS_CANCEL:
        return <OrderIsCancel />;

      case FindCarScreenStepView.CANNOT_FOUND_DRIVER:
        return <CannotFoundDriver />;

      case FindCarScreenStepView.ORDER_IS_SUCCESS:
        return <OrderIsSuccess />;
      case FindCarScreenStepView.MORE_OPTIONS:
        return <MoreOption onLayout={height => setHeightOption(height)} />;
      case FindCarScreenStepView.FULL_WAY_TO_DELIVERY:
        return (
          <FullWayToDelivery
            option={deliveryDriverOptions}
            onLayout={height => setHeightSheet(height)}
            onSubmit={data => {
              setDeliveryDriverSelected(data);
              setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
            }}
          />
        );
      default:
        return <></>;
    }
  };

  //#endregion

  //#region Watch change
  useEffect(() => {
    refContentBottom.current?.show();
  }, [refContentBottom.current]);

  useEffect(() => {
    const handle = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackOrCancel();
      return true;
    });
    return () => {
      handle.remove();
    };
  }, [stepView]);

  useEffect(() => {
    return () => {
      if (refTimeOutCacheRunningFunction.current !== null) {
        clearTimeout(refTimeOutCacheRunningFunction.current);
      }
    };
  }, []);
  useEffect(() => {
    onFoundMotobikeDriver(handleCustomerSocketFoundDriver);
    onCompleteMotoTaxi(handelOnCompleteMotoTaxi);
    onDriverArrived(handleOnDriverArrived);
  }, []);

  useEffect(() => {
    onNotFoundDriver(handleCustomerSocketNotFoundDriver);
  }, []);

  useEffect(() => {
    onTaxiOrderDriverMoving(handleOnTaxiOrderDriverMoving);
  }, []);

  const handleOnTaxiOrderDriverMoving = (data?: {
    result: { lat: number; long: number; orderCode: string }[];
  }) => {
    if (data && Array.isArray(data?.result) && data?.result.length > 0) {
      const sockerData = data?.result[0];
      const { lat, long, motorcycleTaxiId } = sockerData;
      setDriverLocation({
        lat,
        long,
      });
    }
  };

  const handelOnCompleteMotoTaxi = data => {
    setStepView(FindCarScreenStepView.ORDER_IS_SUCCESS);
  };

  const handleCustomerSocketNotFoundDriver = data => {
    clearTimeout(TimeOutCancel);
  };

  const handleOnDriverArrived = data => {
    setStepView(FindCarScreenStepView.DRIVER_ARRIVED);
  };
  //#endregion

  const onCancelFindDriver = () => {
    clearTimeout(TimeOutCancel);
    cancleFindDriver({ id: tripInfo.id }, res => {
      if (res.status === 200) {
        setStepView(FindCarScreenStepView.CHOOSE_DELIVERY_OPTION);
      }
    });
  };

  const onListenSocket = () => {
    connect();
    onConnectError(onSocketCustomerConnectionError);
  };

  const onSocketCustomerConnectionError = useCallback(
    err => {
      console.log('onSocketCustomerConnectionError', err);
    },
    [customerSocket],
  );
  const handleCustomerSocketFoundDriver = args => {
    setDeliveryInfo(args?.result[0]);
    clearTimeout(TimeOutCancel);

    setStepView(FindCarScreenStepView.FINDED_DRIVER);
    setTimeout(() => {
      setStepView(FindCarScreenStepView.DRIVER_ARE_COMING);
    }, 5000);
  };

  const onFindDriverClick = () => {
    const { from, to } = fromToData;

    const data = {
      pickupLocation: {
        address: from.address,
        long: from.long,
        lat: from.lat,
      },
      dropoffLocation: {
        address: to.address,
        long: to.long,
        lat: to.lat,
      },
      vehicle: deliveryDriverSelected?.type,
    };
    findCarAction(data, response => {
      if (response.status === 200) {
        setStepView(FindCarScreenStepView.FIND_DRIVER);
        onListenSocket();
        setTripInfo(response.data?.result[0]);
        TimeOutCancel = setTimeout(() => {
          setStepView(FindCarScreenStepView.CANNOT_FOUND_DRIVER);
        }, 60000);
      }
    });
  };

  const handleBackOrCancel = useCallback(() => {
    switch (stepView) {
      case FindCarScreenStepView.CHOOSE_FROM_TO:
        setStepView(FindCarScreenStepView.QUESTION_CHOOSE_FROM_TO);
        break;

      case FindCarScreenStepView.CHOOSE_DELIVERY_OPTION:
        setStepView(FindCarScreenStepView.CHOOSE_FROM_TO);
        break;

      default:
        refContentBottom.current?.close();
        NavigationService.replace(Routes.HomeTabs);
        break;
    }
  }, [stepView]);
  //#endregion
  return (
    <>
      <ViewCus l-16 t-90 style={styles.posAbsolute}>
        <TouchCus
          onPress={() => {
            handleBackOrCancel();
          }}>
          <ViewCus bg-white br-12 w-32 h-32 items-center justify-center>
            <IconCus name={IconName.ChevronLeft} color={Colors.main} />
          </ViewCus>
        </TouchCus>
      </ViewCus>
      <ViewCus f-1>
        <FakeMapFind
          type={getTypeFindDirection(deliveryDriverSelected.type)}
          // type={'car'}
          startFind={
            ![
              FindCarScreenStepView.CHOOSE_DELIVERY_OPTION,
              FindCarScreenStepView.QUESTION_CHOOSE_FROM_TO,
              FindCarScreenStepView.CHOOSE_FROM_TO,
              FindCarScreenStepView.DRIVER_ARE_COMING,
              FindCarScreenStepView.ORDER_IS_SUCCESS,
            ].includes(stepView)
          }
          fromToData={fromToData}
          driverLocation={driverLocation}
          stepView={stepView}
        />
        <BottomSheetModalContainer
          footerComponent={renderFooterModal}
          hideBackdrop={true}
          ref={refContentBottom}
          index={1}
          keyboardBehavior="fullScreen"
          android_keyboardInputMode="adjustResize"
          showIndicator={true}
          snapPoints={snapPointModal}>
          {renderContentModal(stepView)}
        </BottomSheetModalContainer>

        {/* <BottomSheet
          index={1}
          android_keyboardInputMode="adjustResize"
          snapPoints={snapPointModal}>
          {renderContentModal(stepView)}
        </BottomSheet> */}
      </ViewCus>
    </>
  );
};

export default FindCar;