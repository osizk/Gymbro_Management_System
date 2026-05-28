import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getProductById, createProduct, updateProduct, getProductCategories } from '../../api/simpleFormsApi';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'];
const empty = { product_name: '', category_id: '', cost_price: '', selling_price: '', stock_quantity: '', status: 'ACTIVE' };

export default function ProductForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm]         = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    getProductCategories().then((r) => setCategories(r.data.data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getProductById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ product_name: d.product_name || '', category_id: String(d.category_id ?? ''), cost_price: String(d.cost_price ?? ''), selling_price: String(d.selling_price ?? ''), stock_quantity: String(d.stock_quantity ?? ''), status: d.status || 'ACTIVE' });
      })
      .catch(() => showToast('Failed to load product', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.category_id)         errs.category_id  = 'Category is required';
    const cost = parseFloat(form.cost_price);
    if (form.cost_price === '' || isNaN(cost) || cost < 0) errs.cost_price = 'Valid cost price is required';
    const sell = parseFloat(form.selling_price);
    if (form.selling_price === '' || isNaN(sell) || sell < 0) errs.selling_price = 'Valid selling price is required';
    const qty = parseInt(form.stock_quantity, 10);
    if (form.stock_quantity === '' || isNaN(qty) || qty < 0) errs.stock_quantity = 'Valid stock quantity is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { product_name: form.product_name, category_id: Number(form.category_id), cost_price: parseFloat(form.cost_price), selling_price: parseFloat(form.selling_price), stock_quantity: parseInt(form.stock_quantity, 10), status: form.status };
      if (isEdit) { 
        await updateProduct(id, payload);
        showToast('Product updated successfully', 'success');
        setTimeout(() => navigate(`/products/${id}`), 1500);
      } else { 
        const res = await createProduct(payload);
        showToast('Product created successfully', 'success');
        setTimeout(() => navigate(`/products/${res.data.data.id}`), 1500);
      }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save product', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="page-subtitle">Merchandise Product</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Product Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Product Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('product_name')}`} value={form.product_name} onChange={set('product_name')} placeholder="Product name" />
            {errors.product_name && <p className="form-error">{errors.product_name}</p>}
          </div>

          <div>
            <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('category_id')}`} value={form.category_id} onChange={set('category_id')}>
              <option value="">— Select Category —</option>
              {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.category_name}</option>)}
            </select>
            {errors.category_id && <p className="form-error">{errors.category_id}</p>}
          </div>

          <div>
            <label className="form-label">Cost Price (฿) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="0.01" className={`form-input${f('cost_price')}`} value={form.cost_price} onChange={set('cost_price')} placeholder="0.00" />
            {errors.cost_price && <p className="form-error">{errors.cost_price}</p>}
          </div>

          <div>
            <label className="form-label">Selling Price (฿) <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="0.01" className={`form-input${f('selling_price')}`} value={form.selling_price} onChange={set('selling_price')} placeholder="0.00" />
            {errors.selling_price && <p className="form-error">{errors.selling_price}</p>}
          </div>

          <div>
            <label className="form-label">Stock Quantity <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="number" min="0" step="1" className={`form-input${f('stock_quantity')}`} value={form.stock_quantity} onChange={set('stock_quantity')} placeholder="0" />
            {errors.stock_quantity && <p className="form-error">{errors.stock_quantity}</p>}
          </div>

          <div>
            <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className="form-input" value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
