import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getReceiptById, createReceipt, updateReceipt,
  getAllPaymentMethods,
} from '../../api/paymentReceiptApi';
import MemberSearchModal from '../../components/MemberSearchModal';

const REFERENCE_TYPES = ['SUBSCRIPTION', 'TRAINING', 'CLASS', 'MERCHANDISE'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyLine = () => ({
  _key:              crypto.randomUUID(),
  reference_type:    '',
  reference_no:      '',
  amount_paid:       '',
  remaining_balance: '',
  notes:             '',
});

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaymentReceiptForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  // ── Form state ──
  const [receiptNo, setReceiptNo]           = useState('Auto-generated');
  const [receiptDate, setReceiptDate]       = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId]             = useState('');
  const [memberName, setMemberName]         = useState('');
  const [methodId, setMethodId]             = useState('');
  const [paymentRefNo, setPaymentRefNo]     = useState('');
  const [lineItems, setLineItems]           = useState([emptyLine()]);

  // ── Supporting data ──
  const [methods, setMethods]               = useState([]);
  const [loadingPage, setLoadingPage]       = useState(isEdit);
  const [saving, setSaving]                 = useState(false);
  const [errors, setErrors]                 = useState({});

  // ── Modal state ──
  const [showMemberModal, setShowMemberModal] = useState(false);

  const totalPaid = lineItems.reduce((sum, l) => sum + (parseFloat(l.amount_paid) || 0), 0);

  // ── Load lookup data ──
  useEffect(() => {
    getAllPaymentMethods()
      .then((res) => setMethods(res.data.data || []))
      .catch(() => {});
  }, []);

  // ── Load receipt (edit mode) ──
  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getReceiptById(id)
      .then((res) => {
        const r = res.data.data;
        setReceiptNo(r.id);
        setReceiptDate(r.receipt_date.split('T')[0]);
        setMemberId(String(r.member_id));
        setMemberName(r.member_name);
        setMethodId(String(r.method_id));
        setPaymentRefNo(r.payment_reference_no || '');
        setLineItems(r.line_items.map((l) => ({
          _key:              crypto.randomUUID(),
          reference_type:    l.reference_type,
          reference_no:      l.reference_no,
          amount_paid:       String(l.amount_paid),
          remaining_balance: l.remaining_balance != null ? String(l.remaining_balance) : '',
          notes:             l.notes || '',
        })));
      })
      .catch(() => alert('Failed to load receipt'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  // ── Member modal ──
  const handleMemberSelect = (m) => {
    setMemberId(String(m.id));
    setMemberName(m.member_name);
    setErrors((prev) => ({ ...prev, memberId: null }));
    setShowMemberModal(false);
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) => prev.map((line, i) =>
      i !== index ? line : { ...line, [field]: value }
    ));
  };

  const addLine    = () => setLineItems((prev) => [...prev, emptyLine()]);
  const removeLine = (i) => {
    if (lineItems.length > 1) setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!receiptDate) errs.receiptDate = 'Receipt date is required';
    if (!memberId)    errs.memberId    = 'Member is required';
    if (!methodId)    errs.methodId    = 'Payment method is required';

    lineItems.forEach((line, i) => {
      if (!line.reference_type)     errs[`line_${i}_type`]   = 'Select a reference type';
      if (!line.reference_no.trim()) errs[`line_${i}_ref`]   = 'Reference No is required';
      const amt = parseFloat(line.amount_paid);
      if (!amt || amt <= 0)          errs[`line_${i}_amt`]   = 'Amount must be > 0';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        receipt_date:        receiptDate,
        member_id:           Number(memberId),
        method_id:           Number(methodId),
        payment_reference_no: paymentRefNo.trim() || null,
        line_items: lineItems.map((l) => ({
          reference_type:    l.reference_type,
          reference_no:      l.reference_no.trim(),
          amount_paid:       parseFloat(l.amount_paid),
          remaining_balance: l.remaining_balance !== '' ? parseFloat(l.remaining_balance) : null,
          notes:             l.notes.trim() || null,
        })),
      };
      if (isEdit) {
        await updateReceipt(id, payload);
        navigate(`/payment-receipts/${id}`);
      } else {
        const res = await createReceipt(payload);
        navigate(`/payment-receipts/${res.data.data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save receipt');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading receipt...</div>;

  return (
    <>
      {showMemberModal && (
        <MemberSearchModal onSelect={handleMemberSelect} onClose={() => setShowMemberModal(false)} />
      )}

      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Receipt' : 'New Receipt'}</h1>
            <p className="page-subtitle">Payment Receipt</p>
          </div>
        </div>

        <div className="card card-body">

          {/* ── Receipt Details ── */}
          <p className="form-section-title">Receipt Details</p>
          <div className="form-grid-2">

            {/* Receipt No */}
            <div>
              <label className="form-label">Receipt No</label>
              <input className="form-input readonly" readOnly value={receiptNo} />
            </div>

            {/* Receipt Date */}
            <div>
              <label className="form-label">
                Receipt Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input${errors.receiptDate ? ' error' : ''}`}
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
              {errors.receiptDate && <p className="form-error">{errors.receiptDate}</p>}
            </div>

            {/* Member */}
            <div>
              <label className="form-label">
                Member <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className={`form-input ${memberName ? 'autofill' : ''}${errors.memberId ? ' error' : ''}`}
                  readOnly
                  placeholder="— click 🔍 to select member —"
                  value={memberName}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowMemberModal(true)}
                />
                <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }}
                  onClick={() => setShowMemberModal(true)} title="Search member">🔍</button>
              </div>
              {errors.memberId && <p className="form-error">{errors.memberId}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="form-label">
                Payment Method <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                className={`form-input${errors.methodId ? ' error' : ''}`}
                value={methodId}
                onChange={(e) => { setMethodId(e.target.value); setErrors((p) => ({ ...p, methodId: null })); }}
              >
                <option value="">— Select method —</option>
                {methods.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.method_name}</option>
                ))}
              </select>
              {errors.methodId && <p className="form-error">{errors.methodId}</p>}
            </div>

            {/* Payment Reference No (optional) */}
            <div>
              <label className="form-label">Payment Reference No</label>
              <input
                className="form-input"
                placeholder="e.g. TXN-20260101-001 (optional)"
                value={paymentRefNo}
                onChange={(e) => setPaymentRefNo(e.target.value)}
              />
            </div>

            {/* Total Paid (computed) */}
            <div>
              <label className="form-label">Total Paid (฿)</label>
              <input className="form-input computed" readOnly value={fmt(totalPaid)} />
            </div>
          </div>

          <hr className="divider" />

          {/* ── Line Items ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="form-section-title" style={{ margin: 0 }}>Line Items – Payment Details</p>
            <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Item</button>
          </div>

          <div className="table-wrapper">
            <table className="line-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 160 }}>Reference Type</th>
                  <th style={{ width: 180 }}>Reference No</th>
                  <th style={{ width: 140 }}>Amount Paid (฿)</th>
                  <th style={{ width: 160 }}>Remaining Balance (฿)</th>
                  <th>Notes</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, i) => (
                  <tr key={line._key}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                    {/* Reference Type */}
                    <td>
                      <select
                        className={`form-input${errors[`line_${i}_type`] ? ' error' : ''}`}
                        value={line.reference_type}
                        onChange={(e) => handleLineChange(i, 'reference_type', e.target.value)}
                      >
                        <option value="">— select —</option>
                        {REFERENCE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors[`line_${i}_type`] && <p className="form-error">{errors[`line_${i}_type`]}</p>}
                    </td>

                    {/* Reference No */}
                    <td>
                      <input
                        type="text"
                        className={`form-input${errors[`line_${i}_ref`] ? ' error' : ''}`}
                        placeholder="e.g. SUB-2026-000001"
                        value={line.reference_no}
                        onChange={(e) => handleLineChange(i, 'reference_no', e.target.value)}
                      />
                      {errors[`line_${i}_ref`] && <p className="form-error">{errors[`line_${i}_ref`]}</p>}
                    </td>

                    {/* Amount Paid */}
                    <td>
                      <input
                        type="number" min="0.01" step="0.01"
                        className={`form-input${errors[`line_${i}_amt`] ? ' error' : ''}`}
                        value={line.amount_paid}
                        onChange={(e) => handleLineChange(i, 'amount_paid', e.target.value)}
                      />
                      {errors[`line_${i}_amt`] && <p className="form-error">{errors[`line_${i}_amt`]}</p>}
                    </td>

                    {/* Remaining Balance (optional) */}
                    <td>
                      <input
                        type="number" min="0" step="0.01"
                        className="form-input"
                        placeholder="Optional"
                        value={line.remaining_balance}
                        onChange={(e) => handleLineChange(i, 'remaining_balance', e.target.value)}
                      />
                    </td>

                    {/* Notes */}
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional notes..."
                        value={line.notes}
                        onChange={(e) => handleLineChange(i, 'notes', e.target.value)}
                      />
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="action-btn delete"
                        disabled={lineItems.length === 1}
                        onClick={() => removeLine(i)}
                        style={{ opacity: lineItems.length === 1 ? 0.3 : 1 }}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="total-block">
            <div className="total-inner">
              <span className="total-label">Total Paid</span>
              <span className="total-value">฿ {fmt(totalPaid)}</span>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/payment-receipts')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Receipt'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
