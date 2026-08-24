import { useState } from 'react';
import {
  createPaymentOrder,
  verifyPayment
} from "../../../Api/residentApi";

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');

    script.id = 'razorpay-sdk';
    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function PaymentsTab({
  bills = [],
  payments = [],
  onPaymentSuccess
}) {
  const pending = bills.filter(
    b => b.status !== 'PAID'
  );

  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState('');

  const handlePay = async bill => {
    setPayError('');
    setPayingId(bill.id);

    const sdkLoaded =
      await loadRazorpayScript();

    if (!sdkLoaded) {
      setPayError(
        'Could not load the payment gateway. Check your connection and try again.'
      );
      setPayingId(null);
      return;
    }

    try {
      const { createPaymentOrder, verifyPayment } =
  await import("../../../Api/residentApi");

      const orderRes = await createPaymentOrder(bill.id);

      const {
        orderId,
        amount,
        currency,
        keyId
      } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'AquaLedger',
        description:
          `Payment for ${bill.billingMonth} bill`,

        method: {
          upi: true,
          card: true,
          netbanking: true
        },

        handler: async response => {
          try {
            await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature
            });

            onPaymentSuccess();
          } catch {
            setPayError(
              'Payment went through, but verification failed. Contact support with your payment ID.'
            );
          } finally {
            setPayingId(null);
          }
        },

        modal: {
          ondismiss: () =>
            setPayingId(null)
        },

        theme: {
          color: '#0f4c5c'
        }
      };

      const rzp =
        new window.Razorpay(options);

      rzp.open();

    } catch (err) {
      setPayError(
        err.response?.data?.message ||
        'Could not start payment. Please try again.'
      );

      setPayingId(null);
    }
  };

  return (
    <>
      {payError && (
        <div className="banner banner-error">
          {payError}
        </div>
      )}

      {pending.length > 0 && (
        <div className="dash-section">

          <div className="dash-section-head">
            <h2>Pending Payment</h2>
          </div>

          {pending.map(b => (
            <div
              key={b.id}
              className="expandable-card"
            >
              <div className="expandable-header">

                <div>
                  <strong>
                    {b.billingMonth}
                  </strong>
                  {' '}— ₹{b.amount}
                </div>

                <span className="badge badge-warning">
                  {b.status || 'PENDING'}
                </span>

              </div>

              <button
                className="btn btn-fill"
                style={{ marginTop: 10 }}
                disabled={
                  payingId === b.id
                }
                onClick={() =>
                  handlePay(b)
                }
              >
                {payingId === b.id
                  ? 'Opening secure checkout…'
                  : 'Pay Now (UPI / Card)'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="dash-section">

        <div className="dash-section-head">
          <h2>Payment History</h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="empty-state"
                >
                  No completed payments yet.
                </td>
              </tr>
            ) : (
              payments.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.transactionId}
                  </td>

                  <td>₹{p.amount}</td>

                  <td>
                    {p.paymentMethod}
                  </td>

                  <td>
                    {p.paymentDate}
                  </td>

                  <td>
                    <span className="badge badge-success">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}