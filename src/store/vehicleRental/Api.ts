import { createApi } from '@reduxjs/toolkit/query/react';

import { API_HOST } from '@env';
import axiosClient from 'utils/axios';
import { API_ENDPOINT } from 'utils';
import { Data, IMetaDataResponse, IOrderRequest } from 'types';

const baseQuery = async <T = any>(requestOptions) => {
  const rs = await axiosClient.request<Data<T>>({
    baseURL: API_HOST,
    ...requestOptions,
  });

  return {
    data: rs,
    meta: requestOptions.meta,
  };
};

const orderVehicleApi = createApi({
  reducerPath: 'orderVehicleApi',
  baseQuery: baseQuery,

  endpoints: builder => {
    return {
      createOrder: builder.mutation<IMetaDataResponse<any>, IOrderRequest>({
        query: data => {
          return {
            url: `${API_ENDPOINT.RENTAL_VEHICLE.ODER_VEHICLE}?`,
            method: 'POST',
            data,
          };
        },
        transformResponse: res => {
          if (res.status === 201 && res.data?.result) {
            return res.data?.result[0];
          }
          return null as any;
        },
      }),
    };
  },
});

export const { useCreateOrderMutation } = orderVehicleApi;

export default orderVehicleApi;
