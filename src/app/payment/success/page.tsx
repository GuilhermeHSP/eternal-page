import { redirect } from 'next/navigation';

// Retired page from the old "pay first, create later" flow. After paying, buyers now land on
// /finalize. This file can be deleted.
export default function PaymentSuccessPage() {
  redirect('/');
}
