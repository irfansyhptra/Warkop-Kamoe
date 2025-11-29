declare module "midtrans-client" {
  interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
    billing_address?: Address;
    shipping_address?: Address;
  }

  interface Address {
    first_name: string;
    last_name?: string;
    phone: string;
    address: string;
    city: string;
    postal_code?: string;
    country_code?: string;
  }

  interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
  }

  interface TransactionParams {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetail[];
    enabled_payments?: string[];
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
    expiry?: {
      start_time?: string;
      unit: string;
      duration: number;
    };
    custom_field1?: string;
    custom_field2?: string;
    custom_field3?: string;
  }

  interface SnapTransaction {
    token: string;
    redirect_url: string;
  }

  interface TransactionStatus {
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
    status_code: string;
    status_message: string;
    signature_key: string;
    bank?: string;
    va_numbers?: Array<{
      bank: string;
      va_number: string;
    }>;
    payment_amounts?: Array<{
      amount: string;
      paid_at: string;
    }>;
    settlement_time?: string;
    currency?: string;
    merchant_id?: string;
    acquirer?: string;
    channel_response_code?: string;
    channel_response_message?: string;
  }

  interface RefundParams {
    amount?: number;
    reason?: string;
  }

  class Snap {
    constructor(config: MidtransConfig);
    createTransaction(params: TransactionParams): Promise<SnapTransaction>;
    createTransactionToken(params: TransactionParams): Promise<string>;
    createTransactionRedirectUrl(params: TransactionParams): Promise<string>;
  }

  class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      status(orderId: string): Promise<TransactionStatus>;
      cancel(orderId: string): Promise<TransactionStatus>;
      expire(orderId: string): Promise<TransactionStatus>;
      refund(orderId: string, params?: RefundParams): Promise<TransactionStatus>;
      notification(notificationJson: object): Promise<TransactionStatus>;
    };
    charge(params: object): Promise<object>;
  }

  export { Snap, CoreApi, MidtransConfig, TransactionParams, TransactionStatus };

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
