import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getTicketById, createTicket, updateTicket, getEquipmentForTickets, getStaffForTickets } from '../../api/simpleFormsApi';

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'DONE'];
const empty = { equipment_id: '', report_date: new Date().toISOString().split('T')[0], issue_description: '', technician_id: '', status: 'PENDING', repair_cost: '' };

export default function MaintenanceTicketForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm]         = useState(empty);
  const [equipment, setEquipment] = useState([]);
  const [staff, setStaff]       = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    getEquipmentForTickets().then((r) => setEquipment(r.data.data || [])).catch(() => setEquipment([]));
    getStaffForTickets().then((r) => setStaff(r.data.data || [])).catch(() => setStaff([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getTicketById(id)
      .then((res) => {
        const d = res.data.data;
        setForm({ equipment_id: String(d.equipment_id), report_date: d.report_date?.split('T')[0] || '', issue_description: d.issue_description || '', technician_id: String(d.technician_id), status: d.status || 'OPEN', repair_cost: d.repair_cost != null ? String(d.repair_cost) : '' });
      })
      .catch(() => showToast('Failed to load ticket', 'error'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.equipment_id)              errs.equipment_id      = 'Equipment is required';
    if (!form.report_date)               errs.report_date       = 'Report date is required';
    if (!form.issue_description.trim())  errs.issue_description = 'Issue description is required';
    if (!form.technician_id)             errs.technician_id     = 'Technician is required';
    if (!form.status)                    errs.status            = 'Status is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { equipment_id: form.equipment_id, report_date: form.report_date, issue_description: form.issue_description, technician_id: Number(form.technician_id), status: form.status, repair_cost: form.repair_cost ? parseFloat(form.repair_cost) : null };
      if (isEdit) { await updateTicket(id, payload); showToast('Maintenance ticket updated successfully', 'success'); setTimeout(() => navigate(`/maintenance-tickets/${id}`), 1500); }
      else { const res = await createTicket(payload); showToast('Maintenance ticket created successfully', 'success'); setTimeout(() => navigate(`/maintenance-tickets/${res.data.data.id}`), 1500); }
    } catch (err) { showToast(err.response?.data?.message || 'Failed to save ticket', 'error'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;
  const f = (field) => errors[field] ? ' error' : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Ticket' : 'New Maintenance Ticket'}</h1>
          <p className="page-subtitle">Maintenance Ticket</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Ticket Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">Ticket ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Report Date <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="date" className={`form-input${f('report_date')}`} value={form.report_date} onChange={set('report_date')} />
            {errors.report_date && <p className="form-error">{errors.report_date}</p>}
          </div>

          <div>
            <label className="form-label">Equipment <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('equipment_id')}`} value={form.equipment_id} onChange={set('equipment_id')}>
              <option value="">— Select Equipment —</option>
              {equipment.map((e) => <option key={e.id} value={String(e.id)}>#{e.id} {e.equipment_name}</option>)}
            </select>
            {errors.equipment_id && <p className="form-error">{errors.equipment_id}</p>}
          </div>

          <div>
            <label className="form-label">Technician <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('technician_id')}`} value={form.technician_id} onChange={set('technician_id')}>
              <option value="">— Select Technician —</option>
              {staff.map((s) => <option key={s.id} value={String(s.id)}>#{s.id} {s.staff_name} {s.position ? `(${s.position})` : ''}</option>)}
            </select>
            {errors.technician_id && <p className="form-error">{errors.technician_id}</p>}
          </div>

          <div>
            <label className="form-label">Status <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select className={`form-input${f('status')}`} value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            {errors.status && <p className="form-error">{errors.status}</p>}
          </div>

          <div>
            <label className="form-label">Repair Cost (฿)</label>
            <input type="number" min="0" step="0.01" className="form-input" value={form.repair_cost} onChange={set('repair_cost')} placeholder="Optional" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Issue Description <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea className={`form-input${f('issue_description')}`} rows={3} value={form.issue_description} onChange={set('issue_description')} placeholder="Describe the issue..." style={{ resize: 'vertical' }} />
            {errors.issue_description && <p className="form-error">{errors.issue_description}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/maintenance-tickets')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
