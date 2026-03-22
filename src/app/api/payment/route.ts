import { NextRequest, NextResponse } from 'next/server';
import { PACKAGES, PackageType, PackageLimits } from '@/lib/packages';

// Mercado Pago SDK would be used here
// For now, we'll create a mock payment flow

interface CreatePaymentRequest {
  packageType: PackageType;
  payerEmail: string;
  payerName?: string;
}

interface PaymentResponse {
  paymentId: string;
  initPoint: string; // Mercado Pago checkout URL
  packageType: PackageType;
  limits: PackageLimits;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json();
    const { packageType, payerEmail, payerName } = body;

    // Validate package type
    if (!packageType || !PACKAGES[packageType]) {
      return NextResponse.json(
        { error: 'Invalid package type' },
        { status: 400 }
      );
    }

    const pkg = PACKAGES[packageType];

    // In production, you would use Mercado Pago SDK here:
    // const mercadopago = require('mercadopago');
    // mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    // 
    // const preference = {
    //   items: [{
    //     title: pkg.name,
    //     description: pkg.description,
    //     unit_price: pkg.price,
    //     quantity: 1,
    //     currency_id: 'BRL',
    //   }],
    //   payer: {
    //     email: payerEmail,
    //     name: payerName,
    //   },
    //   back_urls: {
    //     success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    //     failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
    //     pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
    //   },
    //   auto_return: 'approved',
    //   notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`,
    // };
    // 
    // const response = await mercadopago.preferences.create(preference);

    // For demo purposes, create a mock payment
    const mockPaymentId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Store payment in database (in production)
    // await db.payment.create({
    //   data: {
    //     id: mockPaymentId,
    //     packageType,
    //     payerEmail,
    //     amount: pkg.price,
    //     currency: pkg.currency,
    //     status: 'pending',
    //   },
    // });

    // In production, return the Mercado Pago checkout URL
    // For demo, we'll return a success URL directly
    const response: PaymentResponse = {
      paymentId: mockPaymentId,
      initPoint: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?payment_id=${mockPaymentId}&package=${packageType}`,
      packageType,
      limits: pkg.limits,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// Webhook for Mercado Pago notifications
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, verify the webhook signature and update payment status
    // const { type, data } = body;
    // if (type === 'payment') {
    //   const paymentId = data.id;
    //   // Fetch payment details from Mercado Pago
    //   // Update database with payment status
    //   // If approved, create the tribute with the package limits
    // }

    console.log('Webhook received:', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
