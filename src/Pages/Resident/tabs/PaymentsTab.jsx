import { useState } from 'react';
import { createPaymentOrder, verifyPayment } from '../../../Api/residentApi';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAGE_SIZE = 5;

export default function PaymentsTab({ bills = [], payments = [], onPaymentSuccess }) {
  const pending = bills.filter(b => b.status !== 'PAID');
  const [payingId, setPayingId] = useState(null);
  const [payError, setPayError] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const pendingPages = Math.max(1, Math.ceil(pending.length / PAGE_SIZE));
  const historyPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));

  const pendingData = pending.slice(
    (pendingPage - 1) * PAGE_SIZE,
    pendingPage * PAGE_SIZE
  );

  const historyData = payments.slice(
    (historyPage - 1) * PAGE_SIZE,
    historyPage * PAGE_SIZE
  );

  const handlePay = async bill => {
    setPayError('');
    setPayingId(bill.id);

    try {
      if (!(await loadRazorpayScript())) throw new Error('gateway');

      const { data } = await createPaymentOrder(bill.id);
      const { orderId, amount, currency, keyId } = data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'AquaLedger',
        description: `Payment for ${bill.billingMonth} bill`,
        method: { upi: true, card: true, netbanking: true },

        handler: async response => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            onPaymentSuccess();
          } catch {
            setPayError('Payment completed but verification failed.');
          } finally {
            setPayingId(null);
          }
        },

        modal: { ondismiss: () => setPayingId(null) },
        theme: { color: '#0f766e' }
      });

      rzp.open();
    } catch (err) {
      setPayError(
        err.response?.data?.message ||
        'Could not start payment. Please try again.'
      );
      setPayingId(null);
    }
  };

  const Pager = ({ page, pages, setPage }) => (
    pages > 1 && (
      <div style={styles.pager}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ‹ Previous
        </button>
        <span>Page {page} of {pages}</span>
        <button disabled={page === pages} onClick={() => setPage(page + 1)}>
          Next ›
        </button>
      </div>
    )
  );

  return (
    <>
      {payError && <div style={styles.error}>{payError}</div>}

      {/* PENDING PAYMENTS */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2>💳 Pending Payments</h2>
            <p>Pay your outstanding water bills securely.</p>
          </div>
          <span style={styles.count}>{pending.length} Pending</span>
        </div>

        {pending.length === 0 ? (
          <p className="empty-state">🎉 No pending payments.</p>
        ) : (
          <>
            <div style={styles.paymentGrid}>
              {pendingData.map(b => (
                <div key={b.id} style={styles.paymentCard}>
                  <div style={styles.cardTop}>
                    <div>
                      <small>Billing Period</small>
                      <h3>{b.billingMonth || 'Current Bill'}</h3>
                    </div>
                    <span style={styles.pendingBadge}>
                      {b.status || 'PENDING'}
                    </span>
                  </div>

                  <div style={styles.amount}>
                    ₹{Number(b.amount || 0).toFixed(2)}
                  </div>

                  <div style={styles.details}>
                    <span>💧 Consumption</span>
                    <strong>{b.consumption || 0} units</strong>
                  </div>

                  <button
                    style={styles.payButton}
                    disabled={payingId === b.id}
                    onClick={() => handlePay(b)}
                  >
                    {payingId === b.id
                      ? 'Opening secure checkout…'
                      : '🔒 Pay Now'}
                  </button>
                </div>
              ))}
            </div>

            <Pager
              page={pendingPage}
              pages={pendingPages}
              setPage={setPendingPage}
            />
          </>
        )}
      </div>

      {/* PAYMENT HISTORY */}
      <div className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2>📋 Payment History</h2>
            <p>Your completed water bill transactions.</p>
          </div>
          <span style={styles.successCount}>
            {payments.length} Transactions
          </span>
        </div>

        <div className="app-table-wrap">
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
              {!historyData.length ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No completed payments yet.
                  </td>
                </tr>
              ) : (
                historyData.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.transactionId || '—'}</strong></td>
                    <td style={{ color: '#0f766e', fontWeight: 700 }}>
                      ₹{Number(p.amount || 0).toFixed(2)}
                    </td>
                    <td>{p.paymentMethod || '—'}</td>
                    <td>{p.paymentDate || '—'}</td>
                    <td>
                      <span style={styles.paidBadge}>
                        ✓ {p.status || 'PAID'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={historyPage}
          pages={historyPages}
          setPage={setHistoryPage}
        />
      </div>
    </>
  );
}

const styles = {
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
    gap: 18
  },

  paymentCard: {
    padding: 20,
    borderRadius: 16,
    background: 'linear-gradient(135deg,#ecfeff,#f0fdfa)',
    border: '1px solid #99f6e4',
    boxShadow: '0 6px 18px rgba(15,118,110,.10)'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  amount: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f766e',
    margin: '18px 0'
  },

  details: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderTop: '1px solid #ccfbf1',
    borderBottom: '1px solid #ccfbf1',
    color: '#475569'
  },

  payButton: {
    width: '100%',
    marginTop: 16,
    padding: '12px 18px',
    border: 0,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#0f766e,#0891b2)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer'
  },

  pendingBadge: {
    background: '#fef3c7',
    color: '#b45309',
    padding: '6px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700
  },

  paidBadge: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '6px 10px',
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 12
  },

  count: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '8px 13px',
    borderRadius: 20,
    fontWeight: 700
  },

  successCount: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '8px 13px',
    borderRadius: 20,
    fontWeight: 700
  },

  error: {
    padding: 14,
    marginBottom: 15,
    borderRadius: 10,
    background: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 600
  },

  pager: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginTop: 20
  }
};