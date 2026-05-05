import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getInvoiceById, createInvoice, updateInvoice,
  getActiveProducts, getMemberById,
} from '../../api/merchandiseInvoiceApi';

const emptyLine = () => ({
  _key: crypto.randomUUID(),
  product_id: '', product_name: '',
  quantity: '', unit_price: '', discount_pct: 0,
  extended_price: 0, stock_quantity: null,
});

const calcExtended = (qty, price, disc) => {
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  const d = parseFloat(disc) || 0;
  return q * p * (1 - d / 100);
};

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function MerchandiseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [invoiceNo, setInvoiceNo]   = useState('Auto-generated');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId]     = useState('');
  const [memberName, setMemberName] = useState('');
  const [lineItems, setLineItems]   = useState([emptyLine()]);
  const [products, setProducts]     = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]         = useState(false);
  const [errors, setErrors]         = useState({});

  const totalAmount = lineItems.reduce((sum, l) => sum + (parseFloat(l.extended_price) || 0), 0);

  useEffect(() => {
    getActiveProducts().then((res) => setProducts(res.data)).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getInvoiceById(id)
      .then((res) => {
        const inv = res.data;
        setInvoiceNo(inv.id);
        setInvoiceDate(inv.invoice_date.split('T')[0]);
        setMemberId(inv.member_id ? String(inv.member_id) : '');
        setMemberName(inv.member_name || '');
        setLineItems(inv.line_items.map((l) => ({
          _key: crypto.randomUUID(),
          product_id: String(l.product_id), product_name: l.product_name,
          quantity: String(l.quantity), unit_price: String(l.unit_price),
          discount_pct: String(l.discount_pct),
          extended_price: parseFloat(l.extended_price), stock_quantity: null,
        })));
      })
      .catch(() => alert('Failed to load invoice'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

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

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    setLineItems((prev) => prev.map((line, i) =>
      i !== index ? line : {
        ...line,
        product_id: productId,
        product_name: product ? product.product_name : '',
        unit_price: product ? String(product.selling_price) : '',
        stock_quantity: product ? product.stock_quantity : null,
        extended_price: calcExtended(line.quantity, product ? product.selling_price : 0, line.discount_pct),
      }
    ));
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      updated.extended_price = calcExtended(updated.quantity, updated.unit_price, updated.discount_pct);
      return updated;
    }));
  };

  const addLine = () => setLineItems((prev) => [...prev, emptyLine()]);
  const removeLine = (index) => { if (lineItems.length > 1) setLineItems((prev) => prev.filter((_, i) => i !== index)); };

  const validate = () => {
    const errs = {};
    if (!invoiceDate) errs.invoiceDate = 'Invoice date is required';
    lineItems.forEach((line, i) => {
      if (!line.product_id) errs[`line_${i}_product`] = 'Select a product';
      const qty = parseFloat(line.quantity);
      if (!qty || qty <= 0) errs[`line_${i}_qty`] = 'Must be > 0';
      else if (line.stock_quantity !== null && qty > line.stock_quantity) errs[`line_${i}_qty`] = `Max: ${line.stock_quantity}`;
      const price = parseFloat(line.unit_price);
      if (isNaN(price) || price < 0) errs[`line_${i}_price`] = 'Must be ≥ 0';
      const disc = parseFloat(line.discount_pct);
      if (disc < 0 || disc > 100) errs[`line_${i}_disc`] = '0–100';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        invoice_date: invoiceDate,
        member_id: memberId ? Number(memberId) : null,
        line_items: lineItems.map((l) => ({
          product_id: Number(l.product_id),
          quantity: parseFloat(l.quantity),
          unit_price: parseFloat(l.unit_price),
          discount_pct: parseFloat(l.discount_pct) || 0,
        })),
      };
      if (isEdit) await updateInvoice(id, payload);
      else await createInvoice(payload);
      navigate('/merchandise');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading invoice...</div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="page-subtitle">Merchandise Sales</p>
        </div>
      </div>

      <div className="card card-body">

        {/* ── Invoice Header Fields ── */}
        <p className="form-section-title">Invoice Details</p>
        <div className="form-grid-2">

          {/* Invoice No */}
          <div>
            <label className="form-label">Invoice No</label>
            <input className="form-input readonly" readOnly value={invoiceNo} />
          </div>

          {/* Invoice Date */}
          <div>
            <label className="form-label">Invoice Date <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="date"
              className={`form-input${errors.invoiceDate ? ' error' : ''}`}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            {errors.invoiceDate && <p className="form-error">{errors.invoiceDate}</p>}
          </div>

          {/* Member ID */}
          <div>
            <label className="form-label">Member ID <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional — leave blank for walk-in)</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={`form-input${errors.member_id ? ' error' : ''}`}
                placeholder="e.g. 1"
                value={memberId}
                onChange={(e) => { setMemberId(e.target.value); setMemberName(''); }}
                onBlur={handleMemberLookup}
              />
              <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={handleMemberLookup}>
                🔍
              </button>
            </div>
            {errors.member_id && <p className="form-error">{errors.member_id}</p>}
          </div>

          {/* Member Name */}
          <div>
            <label className="form-label">Member Name</label>
            <input
              className={`form-input ${memberName ? 'autofill' : 'readonly'}`}
              readOnly
              value={memberName}
              placeholder="Auto-filled when Member ID is entered"
            />
          </div>
        </div>

        <hr className="divider" />

        {/* ── Line Items ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="form-section-title" style={{ margin: 0 }}>Line Items</p>
          <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Product</button>
        </div>

        <div className="table-wrapper">
          <table className="line-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th style={{ width: 180 }}>Product</th>
                <th style={{ width: 180 }}>Product Name</th>
                <th style={{ width: 100 }}>Quantity</th>
                <th style={{ width: 130 }}>Unit Price (฿)</th>
                <th style={{ width: 110 }}>Discount (%)</th>
                <th style={{ width: 140, textAlign: 'right' }}>Extended (฿)</th>
                <th style={{ width: 70, textAlign: 'center' }}>Del</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line, i) => (
                <tr key={line._key}>
                  <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                  {/* Product dropdown */}
                  <td>
                    <select
                      className={`form-input${errors[`line_${i}_product`] ? ' error' : ''}`}
                      value={line.product_id}
                      onChange={(e) => handleProductChange(i, e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.id} · {p.product_name}</option>
                      ))}
                    </select>
                    {errors[`line_${i}_product`] && <p className="form-error">{errors[`line_${i}_product`]}</p>}
                  </td>

                  {/* Product name autofill */}
                  <td>
                    <input
                      className={`form-input ${line.product_name ? 'autofill' : 'readonly'}`}
                      readOnly value={line.product_name} placeholder="Auto-filled"
                    />
                  </td>

                  {/* Quantity */}
                  <td>
                    <input
                      type="number" min="0.01" step="0.01"
                      className={`form-input${errors[`line_${i}_qty`] ? ' error' : ''}`}
                      value={line.quantity}
                      onChange={(e) => handleLineChange(i, 'quantity', e.target.value)}
                    />
                    {errors[`line_${i}_qty`] && <p className="form-error">{errors[`line_${i}_qty`]}</p>}
                    {line.stock_quantity !== null && (
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Stock: {line.stock_quantity}</p>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td>
                    <input
                      type="number" min="0" step="0.01"
                      className={`form-input${errors[`line_${i}_price`] ? ' error' : ''}`}
                      value={line.unit_price}
                      onChange={(e) => handleLineChange(i, 'unit_price', e.target.value)}
                    />
                    {errors[`line_${i}_price`] && <p className="form-error">{errors[`line_${i}_price`]}</p>}
                  </td>

                  {/* Discount */}
                  <td>
                    <input
                      type="number" min="0" max="100" step="0.01"
                      className={`form-input${errors[`line_${i}_disc`] ? ' error' : ''}`}
                      value={line.discount_pct}
                      onChange={(e) => handleLineChange(i, 'discount_pct', e.target.value)}
                    />
                    {errors[`line_${i}_disc`] && <p className="form-error">{errors[`line_${i}_disc`]}</p>}
                  </td>

                  {/* Extended price */}
                  <td>
                    <input className="form-input computed" readOnly value={fmt(line.extended_price)} />
                  </td>

                  {/* Delete row */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button" className="action-btn delete"
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
            <span className="total-label">Total Amount</span>
            <span className="total-value">฿ {fmt(totalAmount)}</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/merchandise')}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}