import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSubscriptionById, createSubscription, updateSubscription, getAllPackages,
} from '../../api/subscriptionApi';
import { getMemberById } from '../../api/merchandiseInvoiceApi';
import MemberSearchModal  from '../../components/MemberSearchModal';
import PackageSearchModal from '../../components/PackageSearchModal';
import { useToast } from '../../hooks/useToast';

const STATUS_OPTIONS = ['ACTIVE', 'EXPIRED', 'CANCELLED'];

const emptyLine = () => ({
  _key: crypto.randomUUID(),
  package_id: '', package_name: '', duration_months: '',
  start_date: '', end_date: '',
  base_price: '', discount_pct: 0, extended_price: 0,
});

const calcExtended = (base, disc) => {
  const b = parseFloat(base) || 0;
  const d = parseFloat(disc) || 0;
  return b * (1 - d / 100);
};

// Add months to a date string, return YYYY-MM-DD
const addMonths = (dateStr, months) => {
  if (!dateStr || !months) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + parseInt(months, 10));
  return d.toISOString().split('T')[0];
};

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function SubscriptionForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Header state
  const [subNo, setSubNo]               = useState('Auto-generated');
  const [subDate, setSubDate]           = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId]         = useState('');
  const [memberName, setMemberName]     = useState('');
  const [status, setStatus]             = useState('ACTIVE');
  const [lineItems, setLineItems]       = useState([emptyLine()]);

  // Supporting data
  const [packages, setPackages]         = useState([]);
  const [loadingPage, setLoadingPage]   = useState(isEdit);
  const [saving, setSaving]             = useState(false);
  const [errors, setErrors]             = useState({});

  // Modal state
  const [showMemberModal, setShowMemberModal]     = useState(false);
  const [pkgModalIndex, setPkgModalIndex]         = useState(null);

  const totalAmount = lineItems.reduce((sum, l) => sum + (parseFloat(l.extended_price) || 0), 0);

  // Load packages
  useEffect(() => {
    getAllPackages().then((res) => setPackages(res.data)).catch(() => setPackages([]));
  }, []);

  // Load existing subscription (edit mode)
  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getSubscriptionById(id)
      .then((res) => {
        const s = res.data;
        setSubNo(s.id);
        setSubDate(s.subscription_date.split('T')[0]);
        setMemberId(String(s.member_id));
        setMemberName(s.member_name || '');
        setStatus(s.status);
        setLineItems(s.line_items.map((l) => ({
          _key:           crypto.randomUUID(),
          package_id:     String(l.package_id),
          package_name:   l.package_name,
          duration_months: String(l.duration_months),
          start_date:     l.start_date?.split('T')[0] || '',
          end_date:       l.end_date?.split('T')[0] || '',
          base_price:     String(l.base_price),
          discount_pct:   String(l.discount_pct),
          extended_price: parseFloat(l.extended_price),
        })));
      })
      .catch(() => showToast('Failed to load subscription', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  // Member lookup on blur
  const handleMemberLookup = useCallback(async () => {
    if (!memberId.trim()) { setMemberName(''); return; }
    try {
      const res = await getMemberById(memberId.trim());
      setMemberName(res.data.member_name);
      setErrors((prev) => ({ ...prev, member_id: null }));
    } catch {
      setMemberName('');
      setErrors((prev) => ({ ...prev, member_id: 'Member not found' }));
    }
  }, [memberId]);

  // Member modal select
  const handleMemberSelect = (member) => {
    setMemberId(String(member.id));
    setMemberName(member.member_name);
    setErrors((prev) => ({ ...prev, member_id: null }));
    setShowMemberModal(false);
  };

  // Package modal select — autofill name, duration, base_price, recalc end_date
  const handlePackageSelect = (pkg) => {
    const i = pkgModalIndex;
    setLineItems((prev) => prev.map((line, idx) => {
      if (idx !== i) return line;
      const end = addMonths(line.start_date, pkg.duration_months);
      const ext = calcExtended(pkg.base_price, line.discount_pct);
      return {
        ...line,
        package_id:      String(pkg.id),
        package_name:    pkg.package_name,
        duration_months: String(pkg.duration_months),
        base_price:      String(pkg.base_price),
        end_date:        end,
        extended_price:  ext,
      };
    }));
    setPkgModalIndex(null);
  };

  // Start date change — recalc end_date automatically
  const handleStartDateChange = (index, value) => {
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const end = addMonths(value, line.duration_months);
      return { ...line, start_date: value, end_date: end };
    }));
  };

  // Discount change
  const handleDiscountChange = (index, value) => {
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const ext = calcExtended(line.base_price, value);
      return { ...line, discount_pct: value, extended_price: ext };
    }));
  };

  const addLine    = () => setLineItems((prev) => [...prev, emptyLine()]);
  const removeLine = (i) => { if (lineItems.length > 1) setLineItems((prev) => prev.filter((_, idx) => idx !== i)); };

  // Validation
  const validate = () => {
    const errs = {};
    if (!subDate)   errs.subDate   = 'Subscription date is required';
    if (!memberId)  errs.member_id = 'Member is required';
    if (!status)    errs.status    = 'Status is required';
    lineItems.forEach((line, i) => {
      if (!line.package_id)  errs[`line_${i}_pkg`]   = 'Select a package';
      if (!line.start_date)  errs[`line_${i}_start`] = 'Start date required';
      const disc = parseFloat(line.discount_pct);
      if (disc < 0 || disc > 100) errs[`line_${i}_disc`] = '0–100';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        subscription_date: subDate,
        member_id:         Number(memberId),
        status,
        line_items: lineItems.map((l) => ({
          package_id:   Number(l.package_id),
          start_date:   l.start_date,
          end_date:     l.end_date || null,
          base_price:   parseFloat(l.base_price),
          discount_pct: parseFloat(l.discount_pct) || 0,
        })),
      };
      if (isEdit) {
        await updateSubscription(id, payload);
        showToast('Subscription updated successfully', 'success');
        setTimeout(() => navigate(`/subscriptions/${id}`), 1500);
      } else {
        const res = await createSubscription(payload);
        showToast('Subscription created successfully', 'success');
        setTimeout(() => navigate(`/subscriptions/${res.data.id}`), 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save subscription', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading subscription...</div>;

  return (
    <>
      {showMemberModal && (
        <MemberSearchModal onSelect={handleMemberSelect} onClose={() => setShowMemberModal(false)} />
      )}
      {pkgModalIndex !== null && (
        <PackageSearchModal
          packages={packages}
          onSelect={handlePackageSelect}
          onClose={() => setPkgModalIndex(null)}
        />
      )}

      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Subscription' : 'New Subscription'}</h1>
            <p className="page-subtitle">Membership Subscription</p>
          </div>
        </div>

        <div className="card card-body">
          {/* ── Header Fields ── */}
          <p className="form-section-title">Subscription Details</p>
          <div className="form-grid-2">

            {/* Subscription No */}
            <div>
              <label className="form-label">Subscription No</label>
              <input className="form-input readonly" readOnly value={subNo} />
            </div>

            {/* Subscription Date */}
            <div>
              <label className="form-label">Subscription Date <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="date"
                className={`form-input${errors.subDate ? ' error' : ''}`}
                value={subDate}
                onChange={(e) => setSubDate(e.target.value)}
              />
              {errors.subDate && <p className="form-error">{errors.subDate}</p>}
            </div>

            {/* Member ID */}
            <div>
              <label className="form-label">Member ID <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className={`form-input${errors.member_id ? ' error' : ''}`}
                  placeholder="e.g. 1"
                  value={memberId}
                  onChange={(e) => { setMemberId(e.target.value); setMemberName(''); }}
                  onBlur={handleMemberLookup}
                />
                <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={() => setShowMemberModal(true)}>🔍</button>
              </div>
              {errors.member_id && <p className="form-error">{errors.member_id}</p>}
            </div>

            {/* Member Name */}
            <div>
              <label className="form-label">Member Name</label>
              <input
                className={`form-input ${memberName ? 'autofill' : 'readonly'}`}
                readOnly value={memberName}
                placeholder="Auto-filled when Member ID is entered"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="form-label">Total Amount (฿)</label>
              <input className="form-input computed" readOnly value={fmt(totalAmount)} />
            </div>

            {/* Status */}
            <div>
              <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className={`form-input${errors.status ? ' error' : ''}`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p className="form-error">{errors.status}</p>}
            </div>
          </div>

          <hr className="divider" />

          {/* ── Line Items ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="form-section-title" style={{ margin: 0 }}>Line Items — Packages</p>
            <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Package</button>
          </div>

          <div className="table-wrapper">
            <table className="line-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 180 }}>Package</th>
                  <th style={{ width: 160 }}>Package Name</th>
                  <th style={{ width: 80 }}>Duration</th>
                  <th style={{ width: 130 }}>Start Date</th>
                  <th style={{ width: 130 }}>End Date</th>
                  <th style={{ width: 120 }}>Base Price (฿)</th>
                  <th style={{ width: 110 }}>Discount (%)</th>
                  <th style={{ width: 130, textAlign: 'right' }}>Extended (฿)</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, i) => (
                  <tr key={line._key}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                    {/* Package search */}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className={`form-input${errors[`line_${i}_pkg`] ? ' error' : ''}`}
                          readOnly
                          placeholder="— select —"
                          value={line.package_id ? `#${line.package_id}` : ''}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setPkgModalIndex(i)}
                        />
                        <button
                          type="button" className="btn btn-secondary"
                          style={{ flexShrink: 0, padding: '6px 10px' }}
                          onClick={() => setPkgModalIndex(i)}
                        >🔍</button>
                      </div>
                      {errors[`line_${i}_pkg`] && <p className="form-error">{errors[`line_${i}_pkg`]}</p>}
                    </td>

                    {/* Package Name (autofill) */}
                    <td>
                      <input
                        className={`form-input ${line.package_name ? 'autofill' : 'readonly'}`}
                        readOnly value={line.package_name} placeholder="Auto-filled"
                      />
                    </td>

                    {/* Duration (autofill) */}
                    <td>
                      <input
                        className="form-input autofill"
                        readOnly
                        value={line.duration_months ? `${line.duration_months} mo.` : ''}
                        placeholder="—"
                      />
                    </td>

                    {/* Start Date */}
                    <td>
                      <input
                        type="date"
                        className={`form-input${errors[`line_${i}_start`] ? ' error' : ''}`}
                        value={line.start_date}
                        onChange={(e) => handleStartDateChange(i, e.target.value)}
                      />
                      {errors[`line_${i}_start`] && <p className="form-error">{errors[`line_${i}_start`]}</p>}
                    </td>

                    {/* End Date (computed, readonly) */}
                    <td>
                      <input
                        className="form-input computed"
                        readOnly
                        value={line.end_date || ''}
                        placeholder="Auto-calculated"
                      />
                    </td>

                    {/* Base Price (autofill) */}
                    <td>
                      <input
                        className="form-input autofill"
                        readOnly
                        value={line.base_price ? fmt(line.base_price) : ''}
                        placeholder="Auto-filled"
                      />
                    </td>

                    {/* Discount */}
                    <td>
                      <input
                        type="number" min="0" max="100" step="0.01"
                        className={`form-input${errors[`line_${i}_disc`] ? ' error' : ''}`}
                        value={line.discount_pct}
                        onChange={(e) => handleDiscountChange(i, e.target.value)}
                      />
                      {errors[`line_${i}_disc`] && <p className="form-error">{errors[`line_${i}_disc`]}</p>}
                    </td>

                    {/* Extended (computed) */}
                    <td>
                      <input className="form-input computed" readOnly value={fmt(line.extended_price)} />
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button" className="action-btn delete"
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
              <span className="total-label">Total Amount</span>
              <span className="total-value">฿ {fmt(totalAmount)}</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/subscriptions')}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Subscription'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}