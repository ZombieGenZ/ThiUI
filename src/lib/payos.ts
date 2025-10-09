interface PayOSConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

interface PaymentData {
  orderCode: number;
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

  async createPaymentLink(data: PaymentData): Promise<{ checkoutUrl: string; orderCode: number } | null> {
    try {
      // Validate config
      if (!this.config.clientId || !this.config.apiKey || !this.config.checksumKey) {
        console.error('PayOS config is missing:', {
          hasClientId: !!this.config.clientId,
          hasApiKey: !!this.config.apiKey,
          hasChecksumKey: !!this.config.checksumKey
        });
        throw new Error('PayOS configuration is incomplete');
      }

      // Validate orderCode is a number
      if (typeof data.orderCode !== 'number' || data.orderCode <= 0) {
        throw new Error('orderCode must be a positive number');
      }

      // Truncate description to 25 characters max
      const description = data.description.substring(0, 25);

      const paymentData = {
        ...data,
        description,
        amount: Math.round(data.amount)
      };

      // Generate signature (await because it's async)
      const signature = await this.generateSignature(paymentData);
      
      if (!signature) {
        throw new Error('Failed to generate payment signature');
      }

      const payload = {
        orderCode: paymentData.orderCode,
        amount: paymentData.amount,
        description: paymentData.description,
        returnUrl: paymentData.returnUrl,
        cancelUrl: paymentData.cancelUrl,
        signature: signature,
      };

      console.log('PayOS request payload:', {
        ...payload,
        signature: signature.substring(0, 10) + '...' // Log only first 10 chars
      });

      const response = await fetch(`${this.baseURL}/payment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.config.clientId,
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('PayOS raw response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create payment link';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.desc || errorData.message || errorData.error || errorMessage;
          console.error('PayOS API error:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', responseText);
        }
        throw new Error(errorMessage);
      }

      const result = JSON.parse(responseText);
      
      // Check for error response with code
      if (result.code && result.code !== '00') {
        console.error('PayOS returned error code:', result);
        throw new Error(result.desc || 'Payment gateway returned an error');
      }

      // Validate response structure
      if (!result.data || !result.data.checkoutUrl) {
        console.error('Invalid PayOS response structure:', result);
        throw new Error('Invalid response from payment gateway');
      }

      return {
        checkoutUrl: result.data.checkoutUrl,
        orderCode: data.orderCode,
      };
    } catch (error: any) {
      console.error('PayOS Error:', {
        message: error.message,
        stack: error.stack,
        error
      });
      return null;
    }
  }

  private async generateSignature(data: PaymentData): Promise<string> {
    try {
      const dataStr = `amount=${Math.round(data.amount)}&cancelUrl=${data.cancelUrl}&description=${data.description}&orderCode=${data.orderCode}&returnUrl=${data.returnUrl}`;
      
      console.log('Generating signature for:', dataStr);
      
      const signature = await this.hmacSHA256(dataStr, this.config.checksumKey);
      
      if (!signature) {
        throw new Error('HMAC signature generation returned empty string');
      }
      
      return signature;
    } catch (error) {
      console.error('Signature generation error:', error);
      return '';
    }
  }

  private async hmacSHA256(data: string, key: string): Promise<string> {
    try {
      const crypto = window.crypto || (window as any).msCrypto;
      
      if (!crypto || !crypto.subtle) {
        throw new Error('Web Crypto API is not available');
      }

      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const dataBuffer = encoder.encode(data);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
      
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('HMAC SHA256 error:', error);
      return '';
    }
  }

  async verifyPaymentWebhook(webhookData: any): Promise<boolean> {
    try {
      const receivedSignature = webhookData.signature;
      const expectedSignature = await this.generateSignature({
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