import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getVoucherById, createVoucher, updateVoucher,
  getAllExpenseCategories, getAllStaff, getAllPaymentMethods,
} from '../../api/expenseVoucherApi';
import StaffSearchModal from '../../components/StaffSearchModal';
import { useToast } from '../../hooks/useToast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyLine = () => ({
  _key: crypto.randomUUID(),
  category_id: '',
  category_name: '',
  amount: '',
  description: '',
});

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExpenseVoucherForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ── Form state ──
  const [voucherNo, setVoucherNo]     = useState('Auto-generated');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorName, setVendorName]   = useState('');
  const [staffId, setStaffId]         = useState('');
  const [staffName, setStaffName]     = useState('');
  const [methodId, setMethodId]       = useState('');
  const [lineItems, setLineItems]     = useState([emptyLine()]);

  // ── Supporting data ──
  const [categories, setCategories]   = useState([]);
  const [staffList, setStaffList]     = useState([]);
  const [methods, setMethods]         = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState({});

  // ── Modal state ──
  const [showStaffModal, setShowStaffModal] = useState(false);

  const totalExpense = lineItems.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  // ── Load lookup data ──
  useEffect(() => {
    Promise.all([
      getAllExpenseCategories(),
      getAllStaff(),
      getAllPaymentMethods(),
    ]).then(([cats, staff, pmethods]) => {
      setCategories(cats.data || []);
      setStaffList(staff.data || []);
      setMethods(pmethods.data || []);
    }).catch(() => {});
  }, []);

  // ── Load voucher (edit mode) ──
  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getVoucherById(id)
      .then((res) => {
        const v = res.data;
        setVoucherNo(v.id);
        setVoucherDate(v.voucher_date.split('T')[0]);
        setVendorName(v.vendor_name);
        setStaffId(String(v.paid_by_staff_id));
        setStaffName(v.staff_name);
        setMethodId(String(v.method_id));
        setLineItems(v.line_items.map((l) => ({
          _key:          crypto.randomUUID(),
          category_id:   String(l.category_id),
          category_name: l.category_name,
          amount:        String(l.amount),
          description:   l.description,
        })));
      })
      .catch(() => showToast('Failed to load voucher', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  // ── Staff modal select ──
  const handleStaffSelect = (s) => {
    setStaffId(String(s.id));
    setStaffName(s.staff_name);
    setErrors((prev) => ({ ...prev, staffId: null }));
    setShowStaffModal(false);
  };

  // ── Handle category selection in a line ──
  const handleCategoryChange = (index, catId) => {
    const cat = categories.find((c) => String(c.id) === catId);
    setLineItems((prev) => prev.map((line, i) =>
      i !== index ? line : {
        ...line,
        category_id:   catId,
        category_name: cat ? cat.category_name : '',
      }
    ));
  };

  // ── Handle other line field changes ──
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
    if (!voucherDate)       errs.voucherDate = 'Voucher date is required';
    if (!vendorName.trim()) errs.vendorName  = 'Vendor name is required';
    if (!staffId)           errs.staffId     = 'Paid by (staff) is required';
    if (!methodId)          errs.methodId    = 'Payment method is required';

    lineItems.forEach((line, i) => {
      if (!line.category_id)        errs[`line_${i}_cat`]  = 'Select a category';
      const amt = parseFloat(line.amount);
      if (!amt || amt <= 0)         errs[`line_${i}_amt`]  = 'Amount must be > 0';
      if (!line.description.trim()) errs[`line_${i}_desc`] = 'Description is required';
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
        voucher_date:     voucherDate,
        vendor_name:      vendorName.trim(),
        paid_by_staff_id: Number(staffId),
        method_id:        Number(methodId),
        line_items: lineItems.map((l) => ({
          category_id: Number(l.category_id),
          amount:      parseFloat(l.amount),
          description: l.description.trim(),
        })),
      };
      if (isEdit) {
        await updateVoucher(id, payload);
        showToast('Expense voucher updated successfully', 'success');
        setTimeout(() => navigate(`/expenses/${id}`), 1500);
      } else {
        const res = await createVoucher(payload);
        showToast('Expense voucher created successfully', 'success');
        setTimeout(() => navigate(`/expenses/${res.data.id}`), 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save voucher', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading voucher...</div>;

  return (
    <>
      {/* ── Staff modal ── */}
      {showStaffModal && (
        <StaffSearchModal
          staff={staffList}
          onSelect={handleStaffSelect}
          onClose={() => setShowStaffModal(false)}
        />
      )}

      <div>
        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Voucher' : 'New Voucher'}</h1>
            <p className="page-subtitle">Operational Expense Voucher</p>
          </div>
        </div>

        <div className="card card-body">

          {/* ── Voucher Details ── */}
          <p className="form-section-title">Voucher Details</p>
          <div className="form-grid-2">

            {/* Voucher No */}
            <div>
              <label className="form-label">Voucher No</label>
              <input className="form-input readonly" readOnly value={voucherNo} />
            </div>

            {/* Voucher Date */}
            <div>
              <label className="form-label">
                Voucher Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input${errors.voucherDate ? ' error' : ''}`}
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
              />
              {errors.voucherDate && <p className="form-error">{errors.voucherDate}</p>}
            </div>

            {/* Vendor Name */}
            <div>
              <label className="form-label">
                Vendor Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className={`form-input${errors.vendorName ? ' error' : ''}`}
                placeholder="e.g. PEA Electric Co."
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
              {errors.vendorName && <p className="form-error">{errors.vendorName}</p>}
            </div>

            {/* Paid By (Staff) — modal search */}
            <div>
              <label className="form-label">
                Paid By (Staff) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className={`form-input ${staffName ? 'autofill' : ''}${errors.staffId ? ' error' : ''}`}
                  readOnly
                  placeholder="— click 🔍 to select staff —"
                  value={staffName}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowStaffModal(true)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flexShrink: 0 }}
                  onClick={() => setShowStaffModal(true)}
                  title="Search staff"
                >
                  🔍
                </button>
              </div>
              {errors.staffId && <p className="form-error">{errors.staffId}</p>}
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

            {/* Total Expense (computed) */}
            <div>
              <label className="form-label">Total Expense (฿)</label>
              <input className="form-input computed" readOnly value={fmt(totalExpense)} />
            </div>
          </div>

          <hr className="divider" />

          {/* ── Line Items ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="form-section-title" style={{ margin: 0 }}>Line Items – Expense Items</p>
            <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Item</button>
          </div>

          <div className="table-wrapper">
            <table className="line-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 220 }}>Expense Category</th>
                  <th style={{ width: 140 }}>Amount (฿)</th>
                  <th>Description</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, i) => (
                  <tr key={line._key}>
                    {/* # */}
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                    {/* Category dropdown */}
                    <td>
                      <select
                        className={`form-input${errors[`line_${i}_cat`] ? ' error' : ''}`}
                        value={line.category_id}
                        onChange={(e) => handleCategoryChange(i, e.target.value)}
                      >
                        <option value="">— select —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={String(c.id)}>{c.category_name}</option>
                        ))}
                      </select>
                      {errors[`line_${i}_cat`] && (
                        <p className="form-error">{errors[`line_${i}_cat`]}</p>
                      )}
                    </td>

                    {/* Amount */}
                    <td>
                      <input
                        type="number" min="0.01" step="0.01"
                        className={`form-input${errors[`line_${i}_amt`] ? ' error' : ''}`}
                        value={line.amount}
                        onChange={(e) => handleLineChange(i, 'amount', e.target.value)}
                      />
                      {errors[`line_${i}_amt`] && (
                        <p className="form-error">{errors[`line_${i}_amt`]}</p>
                      )}
                    </td>

                    {/* Description */}
                    <td>
                      <input
                        type="text"
                        className={`form-input${errors[`line_${i}_desc`] ? ' error' : ''}`}
                        placeholder="e.g. Monthly electricity bill – March 2026"
                        value={line.description}
                        onChange={(e) => handleLineChange(i, 'description', e.target.value)}
                      />
                      {errors[`line_${i}_desc`] && (
                        <p className="form-error">{errors[`line_${i}_desc`]}</p>
                      )}
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="action-btn delete"
                        disabled={lineItems.length === 1}
                        onClick={() => removeLine(i)}
                        style={{ opacity: lineItems.length === 1 ? 0.3 : 1 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="total-block">
            <div className="total-inner">
              <span className="total-label">Total Expense</span>
              <span className="total-value">฿ {fmt(totalExpense)}</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Voucher'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
