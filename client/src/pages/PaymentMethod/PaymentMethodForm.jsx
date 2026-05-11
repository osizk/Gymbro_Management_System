import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentMethodById, createPaymentMethod, updatePaymentMethod } from '../../api/simpleFormsApi';

export default function PaymentMethodForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [methodName, setMethodName]   = useState('');
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getPaymentMethodById(id)
      .then((res) => setMethodName(res.data.data.method_name || ''))
      .catch(() => alert('Failed to load payment method'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!methodName.trim()) { setError('Method name is required'); return; }
    setError('');
    setSaving(true);
    try {
      if (isEdit) { await updatePaymentMethod(id, { method_name: methodName }); navigate(`/payment-methods/${id}`); }
      else { const res = await createPaymentMethod({ method_name: methodName }); navigate(`/payment-methods/${res.data.data.id}`); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loadingPage) return <div className="state-box">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Payment Method' : 'New Payment Method'}</h1>
          <p className="page-subtitle">Payment Method</p>
        </div>
      </div>

      <div className="card card-body">
        <p className="form-section-title">Method Details</p>
        <div className="form-grid-2">

          <div>
            <label className="form-label">ID</label>
            <input className="form-input readonly" readOnly value={isEdit ? id : 'Auto-generated'} />
          </div>

          <div>
            <label className="form-label">Method Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className={`form-input${error ? ' error' : ''}`} value={methodName} onChange={(e) => setMethodName(e.target.value)} placeholder="e.g. Cash, Credit Card, PromptPay" />
            {error && <p className="form-error">{error}</p>}
          </div>

        </div>

        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/payment-methods')}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Method'}
          </button>
        </div>
      </div>
    </div>
  );
}
