import { API_ROUTES } from '@/constants/api-routes';

import apiCaller from '@/lib/api-caller';

// Payment Method Interface
export interface PaymentMethod {
  id: number;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last_four: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  display_name: string;
  created_at: string;
}

// Payment Requests
export interface NewCardPaymentRequest {
  booking_id: number;
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  cardholder_name: string;
  save_payment_method: boolean;
}

export interface SavedCardPaymentRequest {
  booking_id: number;
  saved_payment_method_id: string; // This will be the stripe_payment_method_id
}

// Payment Response
export interface PaymentResponse {
  success: boolean;
  message: string;
  payment_intent_id: string;
  booking_id: number;
  payment_id: number;
  amount_paid: number;
  session_cost: number;
  platform_fee: number;
  total_amount: number;
  duration_hours: number;
  hourly_rate: number;
  status: string;
  card_last4: string;
  card_brand: string;
  zoom_join_url?: string;
  booking_details: {
    start_time: string;
    end_time: string;
    consultant_name: string;
    gig_title: string;
  };
}

export const paymentService = {
  // Get all saved payment methods for the user
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiCaller(
      API_ROUTES.PAYMENTS.GET_PAYMENT_METHODS,
      'GET',
      undefined,
      {},
      true
    );
    return response.data;
  },

  // Process payment with new card
  processPaymentWithNewCard: async (
    data: NewCardPaymentRequest
  ): Promise<PaymentResponse> => {
    const response = await apiCaller(
      API_ROUTES.PAYMENTS.PROCESS_BOOKING_PAYMENT,
      'POST',
      data as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },

  // Process payment with saved card
  processPaymentWithSavedCard: async (
    data: SavedCardPaymentRequest
  ): Promise<PaymentResponse> => {
    const response = await apiCaller(
      API_ROUTES.PAYMENTS.PROCESS_BOOKING_PAYMENT,
      'POST',
      data as unknown as Record<string, string>,
      {},
      true
    );
    return response.data;
  },
};
