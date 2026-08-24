import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../Api/apiClient";
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayBill() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handlePay = async () => {
    setStatus('loading');
    setMessage('');

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setStatus('error');
      setMessage('Could not load the payment gateway. Check your connection and try again.');
      return;
    }

    try {
      const orderRes = await createPaymentOrder(billId);
      const { orderId, amount, currency, keyId, billNumber } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'AquaLedger',
        description: `Payment for bill #${billId}`,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus('success');
            setMessage('Payment successful — your bill is now marked as paid.');
            setTimeout(() => navigate('/resident/dashboard'), 1800);
          } catch (err) {
            setStatus('error');
            setMessage('Payment went through, but verification failed. Contact support with your payment ID.');
          }
        },
        modal: {
          ondismiss: () => setStatus('idle'),
        },
        theme: { color: '#1f6f78' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Could not start payment. Please try again.');
    }
  };

  return (
    <div className="auth-panel" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <h1>Pay your bill</h1>
        <p className="sub">You'll be redirected to a secure Razorpay checkout.</p>

        {message && (
          <div className={`banner ${status === 'success' ? 'banner-success' : 'banner-error'}`}>
            {message}
          </div>
        )}

        <button className="btn btn-fill btn-block" onClick={handlePay} disabled={status === 'loading'}>
          {status === 'loading' ? 'Opening secure checkout…' : 'Pay now'}
        </button>
      </div>
    </div>
  );
}