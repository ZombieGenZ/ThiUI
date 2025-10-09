interface PayOSConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

interface PaymentData {
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export class PayOSClient {
  private config: PayOSConfig;
  private baseURL = 'https://api-merchant.payos.vn/v2';

  constructor(config: PayOSConfig) {
    this.config = config;
  }

  async createPaymentLink(data: PaymentData): Promise<{ checkoutUrl: string; orderCode: string }> {
    try {
      const response = await fetch(`${this.baseURL}/payment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.config.clientId,
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          orderCode: data.orderCode,
          amount: Math.round(data.amount),
          description: data.description,
          returnUrl: data.returnUrl,
          cancelUrl: data.cancelUrl,
          signature: this.generateSignature(data),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const result = await response.json();
      return {
        checkoutUrl: result.data.checkoutUrl,
        orderCode: data.orderCode,
      };
    } catch (error) {
      console.error('PayOS Error:', error);
      throw error;
    }
  }

  private generateSignature(data: PaymentData): string {
    const dataStr = `amount=${Math.round(data.amount)}&cancelUrl=${data.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${data.returnUrl}`;
    return this.hmacSHA256(dataStr, this.config.checksumKey);
  }

  private hmacSHA256(data: string, key: string): string {
    const crypto = window.crypto || (window as any).msCrypto;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataBuffer = encoder.encode(data);

    return crypto.subtle
      .importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      .then((cryptoKey: CryptoKey) => crypto.subtle.sign('HMAC', cryptoKey, dataBuffer))
      .then((signature: ArrayBuffer) => {
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      })
      .catch(() => {
        return '';
      });
  }

  async verifyPaymentWebhook(webhookData: any): Promise<boolean> {
    try {
      const receivedSignature = webhookData.signature;
      const expectedSignature = this.generateSignature({
        orderCode: webhookData.orderCode,
        amount: webhookData.amount,
        description: webhookData.description,
        returnUrl: webhookData.returnUrl || '',
        cancelUrl: webhookData.cancelUrl || '',
      });

      return receivedSignature === expectedSignature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

const payosConfig: PayOSConfig = {
  clientId: import.meta.env.VITE_PAYOS_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_PAYOS_API_KEY || '',
  checksumKey: import.meta.env.VITE_PAYOS_CHECKSUM_KEY || '',
};

export const payosClient = new PayOSClient(payosConfig);
