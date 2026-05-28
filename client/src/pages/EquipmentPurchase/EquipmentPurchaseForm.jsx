import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import {
  getPurchaseById, createPurchase, updatePurchase,
  getAllStaff, getAllPaymentMethods, getAllEquipmentCategories,
} from '../../api/equipmentPurchaseApi';
import StaffSearchModal from '../../components/StaffSearchModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyLine = () => ({
  _key:            crypto.randomUUID(),
  equipment_name:  '',
  category_id:     '',
  category_name:   '',
  quantity:        '',
  unit_cost:       '',
  warranty_months: '',
  extended_cost:   0,
});

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────
export default function EquipmentPurchaseForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ── Form state ──
  const [purchaseNo, setPurchaseNo]       = useState('Auto-generated');
  const [purchaseDate, setPurchaseDate]   = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName]   = useState('');
  const [staffId, setStaffId]             = useState('');
  const [staffName, setStaffName]         = useState('');
  const [methodId, setMethodId]           = useState('');
  const [lineItems, setLineItems]         = useState([emptyLine()]);

  // ── Supporting data ──
  const [staffList, setStaffList]         = useState([]);
  const [methods, setMethods]             = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loadingPage, setLoadingPage]     = useState(isEdit);
  const [saving, setSaving]               = useState(false);
  const [errors, setErrors]               = useState({});

  // ── Modal state ──
  const [showStaffModal, setShowStaffModal] = useState(false);

  const totalCost = lineItems.reduce((sum, l) => sum + (l.extended_cost || 0), 0);

  // ── Load lookup data ──
  useEffect(() => {
    Promise.all([getAllStaff(), getAllPaymentMethods(), getAllEquipmentCategories()])
      .then(([sRes, mRes, cRes]) => {
        setStaffList(sRes.data.data || []);
        setMethods(mRes.data.data || []);
        setCategories(cRes.data.data || []);
      })
      .catch(() => {});
  }, []);

  // ── Load purchase (edit mode) ──
  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getPurchaseById(id)
      .then((res) => {
        const p = res.data.data;
        setPurchaseNo(p.id);
        setPurchaseDate(p.purchase_date.split('T')[0]);
        setSupplierName(p.supplier_name);
        setStaffId(String(p.received_by_staff_id));
        setStaffName(p.staff_name);
        setMethodId(String(p.method_id));
        setLineItems(p.line_items.map((l) => ({
          _key:            crypto.randomUUID(),
          equipment_name:  l.equipment_name,
          category_id:     l.category_id,
          category_name:   l.category_name,
          quantity:        String(l.quantity),
          unit_cost:       String(l.unit_cost),
          warranty_months: l.warranty_months != null ? String(l.warranty_months) : '',
          extended_cost:   parseFloat(l.extended_cost),
        })));
      })
      .catch(() => showToast('Failed to load purchase', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  // ── Staff modal ──
  const handleStaffSelect = (s) => {
    setStaffId(String(s.id));
    setStaffName(s.staff_name);
    setErrors((prev) => ({ ...prev, staffId: null }));
    setShowStaffModal(false);
  };

  // ── Handle category selection ──
  const handleCategoryChange = (index, catId) => {
    const cat = categories.find((c) => c.id === catId);
    setLineItems((prev) => prev.map((line, i) =>
      i !== index ? line : {
        ...line,
        category_id:   catId,
        category_name: cat ? cat.category_name : '',
      }
    ));
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      if (field === 'quantity' || field === 'unit_cost') {
        updated.extended_cost = (parseInt(updated.quantity, 10) || 0) * (parseFloat(updated.unit_cost) || 0);
      }
      return updated;
    }));
  };

  const addLine    = () => setLineItems((prev) => [...prev, emptyLine()]);
  const removeLine = (i) => {
    if (lineItems.length > 1) setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Validation ──
  const validate = () => {
    const errs = {};
    if (!purchaseDate)         errs.purchaseDate  = 'Purchase date is required';
    if (!supplierName.trim())  errs.supplierName  = 'Supplier name is required';
    if (!staffId)              errs.staffId       = 'Received by (staff) is required';
    if (!methodId)             errs.methodId      = 'Payment method is required';

    lineItems.forEach((line, i) => {
      if (!line.equipment_name.trim()) errs[`line_${i}_name`]  = 'Equipment name is required';
      if (!line.category_id)           errs[`line_${i}_cat`]   = 'Select a category';
      const qty = parseInt(line.quantity, 10);
      if (!qty || qty <= 0)            errs[`line_${i}_qty`]   = 'Quantity must be ≥ 1';
      const uc = parseFloat(line.unit_cost);
      if (!uc || uc <= 0)              errs[`line_${i}_cost`]  = 'Unit cost must be > 0';
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
        purchase_date:        purchaseDate,
        supplier_name:        supplierName.trim(),
        received_by_staff_id: Number(staffId),
        method_id:            Number(methodId),
        line_items: lineItems.map((l) => ({
          equipment_name:  l.equipment_name.trim(),
          category_id:     l.category_id,
          quantity:        parseInt(l.quantity, 10),
          unit_cost:       parseFloat(l.unit_cost),
          warranty_months: l.warranty_months !== '' ? parseInt(l.warranty_months, 10) : 0,
        })),
      };
      if (isEdit) {
        await updatePurchase(id, payload);
        showToast('Equipment purchase updated successfully', 'success');
        setTimeout(() => navigate(`/equipment/${id}`), 1500);
      } else {
        const res = await createPurchase(payload);
        showToast('Equipment purchase created successfully', 'success');
        setTimeout(() => navigate(`/equipment/${res.data.data.id}`), 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save purchase', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading purchase...</div>;

  return (
    <>
      {showStaffModal && (
        <StaffSearchModal staff={staffList} onSelect={handleStaffSelect} onClose={() => setShowStaffModal(false)} />
      )}

      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Purchase' : 'New Purchase'}</h1>
            <p className="page-subtitle">Equipment Purchase Order</p>
          </div>
        </div>

        <div className="card card-body">

          {/* ── Purchase Details ── */}
          <p className="form-section-title">Purchase Details</p>
          <div className="form-grid-2">

            {/* Purchase No */}
            <div>
              <label className="form-label">Purchase No</label>
              <input className="form-input readonly" readOnly value={purchaseNo} />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="form-label">
                Purchase Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input${errors.purchaseDate ? ' error' : ''}`}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
              {errors.purchaseDate && <p className="form-error">{errors.purchaseDate}</p>}
            </div>

            {/* Supplier Name */}
            <div>
              <label className="form-label">
                Supplier Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className={`form-input${errors.supplierName ? ' error' : ''}`}
                placeholder="e.g. FitEquip Co., Ltd."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
              {errors.supplierName && <p className="form-error">{errors.supplierName}</p>}
            </div>

            {/* Received By (Staff) */}
            <div>
              <label className="form-label">
                Received By (Staff) <span style={{ color: 'var(--danger)' }}>*</span>
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
                <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }}
                  onClick={() => setShowStaffModal(true)} title="Search staff">🔍</button>
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

            {/* Total Cost (computed) */}
            <div>
              <label className="form-label">Total Purchase Cost (฿)</label>
              <input className="form-input computed" readOnly value={fmt(totalCost)} />
            </div>
          </div>

          <hr className="divider" />

          {/* ── Line Items ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="form-section-title" style={{ margin: 0 }}>Line Items – Equipment Items</p>
            <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Item</button>
          </div>

          <div className="table-wrapper">
            <table className="line-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Equipment Name</th>
                  <th style={{ width: 180 }}>Category</th>
                  <th style={{ width: 90 }}>Qty</th>
                  <th style={{ width: 130 }}>Unit Cost (฿)</th>
                  <th style={{ width: 110 }}>Warranty (mo.)</th>
                  <th style={{ width: 140 }}>Extended Cost (฿)</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, i) => (
                  <tr key={line._key}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                    {/* Equipment Name */}
                    <td>
                      <input
                        type="text"
                        className={`form-input${errors[`line_${i}_name`] ? ' error' : ''}`}
                        placeholder="e.g. Treadmill Model X"
                        value={line.equipment_name}
                        onChange={(e) => handleLineChange(i, 'equipment_name', e.target.value)}
                      />
                      {errors[`line_${i}_name`] && <p className="form-error">{errors[`line_${i}_name`]}</p>}
                    </td>

                    {/* Category */}
                    <td>
                      <select
                        className={`form-input${errors[`line_${i}_cat`] ? ' error' : ''}`}
                        value={line.category_id}
                        onChange={(e) => handleCategoryChange(i, e.target.value)}
                      >
                        <option value="">— select —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.category_name}</option>
                        ))}
                      </select>
                      {errors[`line_${i}_cat`] && <p className="form-error">{errors[`line_${i}_cat`]}</p>}
                    </td>

                    {/* Quantity */}
                    <td>
                      <input
                        type="number" min="1" step="1"
                        className={`form-input${errors[`line_${i}_qty`] ? ' error' : ''}`}
                        value={line.quantity}
                        onChange={(e) => handleLineChange(i, 'quantity', e.target.value)}
                      />
                      {errors[`line_${i}_qty`] && <p className="form-error">{errors[`line_${i}_qty`]}</p>}
                    </td>

                    {/* Unit Cost */}
                    <td>
                      <input
                        type="number" min="0.01" step="0.01"
                        className={`form-input${errors[`line_${i}_cost`] ? ' error' : ''}`}
                        value={line.unit_cost}
                        onChange={(e) => handleLineChange(i, 'unit_cost', e.target.value)}
                      />
                      {errors[`line_${i}_cost`] && <p className="form-error">{errors[`line_${i}_cost`]}</p>}
                    </td>

                    {/* Warranty Months (optional) */}
                    <td>
                      <input
                        type="number" min="0" step="1"
                        className="form-input"
                        placeholder="0"
                        value={line.warranty_months}
                        onChange={(e) => handleLineChange(i, 'warranty_months', e.target.value)}
                      />
                    </td>

                    {/* Extended Cost (computed) */}
                    <td>
                      <input className="form-input computed" readOnly value={fmt(line.extended_cost)} />
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
              <span className="total-label">Total Purchase Cost</span>
              <span className="total-value">฿ {fmt(totalCost)}</span>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipment')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Purchase'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
