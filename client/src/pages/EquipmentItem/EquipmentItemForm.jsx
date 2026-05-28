import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getEquipmentItemById, createEquipmentItem, updateEquipmentItem, getEquipmentCatsForItems } from '../../api/simpleFormsApi';

const STATUS_OPTIONS = ['ACTIVE', 'UNDER_MAINTENANCE', 'RETIRED'];
const empty = { equipment_name: '', category_id: '', purchase_date: '', status: 'ACTIVE' };

export default function EquipmentItemForm() {
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
    getEquipmentCatsForItems().then((r) => setCategories(r.data.data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getEquipmentItemById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ equipment_name: d.equipment_name || '', category_id: String(d.category_id ?? ''), purchase_date: d.purchase_date?.split('T')[0] || '', status: d.status || 'ACTIVE' });
      })
      .catch(() => showToast('Failed to load equipment', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.equipment_name.trim()) errs.equipment_name = 'Equipment name is required';
    if (!form.category_id)           errs.category_id   = 'Category is required';
    if (!form.status)                errs.status        = 'Status is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { equipment_name: form.equipment_name, category_id: form.category_id, purchase_date: form.purchase_date || null, status: form.status };
      if (isEdit) { await updateEquipmentItem(id, payload); showToast('Equipment updated successfully', 'success'); setTimeout(() => navigate(`/equipment-items/${id}`), 1500); }
      else { const res = await createEquipmentItem(payload); showToast('Equipment created successfully', 'success'); setTimeout(() => navigate(`/equipment-items/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save equipment', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Equipment' : 'New Equipment'}</h1>
          <p className="page-subtitle">Equipment Item</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Equipment Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Equipment Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${f('equipment_name')}`} value={form.equipment_name} onChange={set('equipment_name')} placeholder="Equipment name" />
            {errors.equipment_name && <p className="form-error">{errors.equipment_name}</p>}
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
            <label className="form-label">Purchase Date</label>
            <input type="date" className="form-input" value={form.purchase_date} onChange={set('purchase_date')} />
          </div>

          <div>
            <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('status')}`} value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.status && <p className="form-error">{errors.status}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipment-items')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
}
