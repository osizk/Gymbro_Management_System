import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getBookingById, createBooking, updateBooking,
  getAllTrainers, getAllTrainingTypes, getAllMembers,
} from '../../api/trainingBookingApi';
import MemberSearchModal  from '../../components/MemberSearchModal';
import TrainerSearchModal from '../../components/TrainerSearchModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyLine = () => ({
  _key:             crypto.randomUUID(),
  type_id:          '',
  type_name:        '',
  session_date:     new Date().toISOString().split('T')[0],
  start_time:       '09:00',
  end_time:         '10:00',
  duration_minutes: 60,
  hourly_rate:      '',
  session_cost:     0,
  notes:            '',
});

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

function calcDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TrainingBookingForm() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  // ── Form state ──
  const [bookingNo, setBookingNo]     = useState('Auto-generated');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId]       = useState('');
  const [memberName, setMemberName]   = useState('');
  const [trainerId, setTrainerId]     = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [lineItems, setLineItems]     = useState([emptyLine()]);

  // ── Supporting data ──
  const [trainers, setTrainers]       = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState({});

  // ── Modal state ──
  const [showMemberModal, setShowMemberModal]   = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);

  const totalCost = lineItems.reduce((sum, l) => sum + (l.session_cost || 0), 0);

  // ── Load lookup data ──
  useEffect(() => {
    Promise.all([getAllTrainers(), getAllTrainingTypes()])
      .then(([tRes, ttRes]) => {
        setTrainers(tRes.data.data || []);
        setTrainingTypes(ttRes.data.data || []);
      })
      .catch(() => {});
  }, []);

  // ── Load booking (edit mode) ──
  useEffect(() => {
    if (!isEdit) return;
    setLoadingPage(true);
    getBookingById(id)
      .then((res) => {
        const b = res.data.data;
        setBookingNo(b.id);
        setBookingDate(b.booking_date.split('T')[0]);
        setMemberId(String(b.member_id));
        setMemberName(b.member_name);
        setTrainerId(b.trainer_id);
        setTrainerName(b.trainer_name);
        setLineItems(b.line_items.map((l) => ({
          _key:             crypto.randomUUID(),
          type_id:          l.type_id,
          type_name:        l.type_name,
          session_date:     l.session_date.split('T')[0],
          start_time:       String(l.start_time).slice(0, 5),
          end_time:         String(l.end_time).slice(0, 5),
          duration_minutes: l.duration_minutes,
          hourly_rate:      String(l.hourly_rate),
          session_cost:     parseFloat(l.session_cost),
          notes:            l.notes || '',
        })));
      })
      .catch(() => alert('Failed to load booking'))
      .finally(() => setLoadingPage(false));
  }, [id, isEdit]);

  // ── Recompute session_cost whenever time or rate changes ──
  const recompute = (line) => {
    const duration_minutes = calcDuration(line.start_time, line.end_time);
    const session_cost = (duration_minutes / 60) * (parseFloat(line.hourly_rate) || 0);
    return { ...line, duration_minutes, session_cost };
  };

  // ── Staff modal callbacks ──
  const handleMemberSelect = (m) => {
    setMemberId(String(m.id));
    setMemberName(m.member_name);
    setErrors((prev) => ({ ...prev, memberId: null }));
    setShowMemberModal(false);
  };

  const handleTrainerSelect = (t) => {
    setTrainerId(t.id);
    setTrainerName(t.trainer_name);
    setErrors((prev) => ({ ...prev, trainerId: null }));
    setShowTrainerModal(false);
  };

  // ── Handle type selection (auto-fill hourly_rate) ──
  const handleTypeChange = (index, typeId) => {
    const tt = trainingTypes.find((t) => t.id === typeId);
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = {
        ...line,
        type_id:    typeId,
        type_name:  tt ? tt.type_name : '',
        hourly_rate: tt ? String(tt.default_hourly_rate) : line.hourly_rate,
      };
      return recompute(updated);
    }));
  };

  const handleLineChange = (index, field, value) => {
    setLineItems((prev) => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      if (['start_time', 'end_time', 'hourly_rate'].includes(field)) return recompute(updated);
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
    if (!bookingDate)   errs.bookingDate = 'Booking date is required';
    if (!memberId)      errs.memberId    = 'Member is required';
    if (!trainerId)     errs.trainerId   = 'Trainer is required';

    lineItems.forEach((line, i) => {
      if (!line.type_id)              errs[`line_${i}_type`]  = 'Select a training type';
      if (!line.session_date)         errs[`line_${i}_date`]  = 'Session date is required';
      if (!line.start_time)           errs[`line_${i}_start`] = 'Start time is required';
      if (!line.end_time)             errs[`line_${i}_end`]   = 'End time is required';
      if (line.duration_minutes <= 0) errs[`line_${i}_dur`]   = 'End time must be after start time';
      if (!(parseFloat(line.hourly_rate) > 0)) errs[`line_${i}_rate`] = 'Hourly rate must be > 0';
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
        booking_date: bookingDate,
        member_id:    Number(memberId),
        trainer_id:   trainerId,
        line_items: lineItems.map((l) => ({
          type_id:      l.type_id,
          session_date: l.session_date,
          start_time:   l.start_time,
          end_time:     l.end_time,
          hourly_rate:  parseFloat(l.hourly_rate),
          notes:        l.notes.trim() || null,
        })),
      };
      if (isEdit) {
        await updateBooking(id, payload);
        navigate(`/training-bookings/${id}`);
      } else {
        const res = await createBooking(payload);
        navigate(`/training-bookings/${res.data.data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) return <div className="state-box">Loading booking...</div>;

  return (
    <>
      {showMemberModal  && <MemberSearchModal  onSelect={handleMemberSelect}  onClose={() => setShowMemberModal(false)} />}
      {showTrainerModal && <TrainerSearchModal trainers={trainers} onSelect={handleTrainerSelect} onClose={() => setShowTrainerModal(false)} />}

      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Booking' : 'New Booking'}</h1>
            <p className="page-subtitle">Training Booking</p>
          </div>
        </div>

        <div className="card card-body">

          {/* ── Booking Details ── */}
          <p className="form-section-title">Booking Details</p>
          <div className="form-grid-2">

            {/* Booking No */}
            <div>
              <label className="form-label">Booking No</label>
              <input className="form-input readonly" readOnly value={bookingNo} />
            </div>

            {/* Booking Date */}
            <div>
              <label className="form-label">
                Booking Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input${errors.bookingDate ? ' error' : ''}`}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
              {errors.bookingDate && <p className="form-error">{errors.bookingDate}</p>}
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

            {/* Trainer */}
            <div>
              <label className="form-label">
                Trainer <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className={`form-input ${trainerName ? 'autofill' : ''}${errors.trainerId ? ' error' : ''}`}
                  readOnly
                  placeholder="— click 🔍 to select trainer —"
                  value={trainerName}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowTrainerModal(true)}
                />
                <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }}
                  onClick={() => setShowTrainerModal(true)} title="Search trainer">🔍</button>
              </div>
              {errors.trainerId && <p className="form-error">{errors.trainerId}</p>}
            </div>

            {/* Total Cost (computed) */}
            <div>
              <label className="form-label">Total Session Cost (฿)</label>
              <input className="form-input computed" readOnly value={fmt(totalCost)} />
            </div>
          </div>

          <hr className="divider" />

          {/* ── Sessions ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p className="form-section-title" style={{ margin: 0 }}>Line Items – Training Sessions</p>
            <button type="button" className="btn btn-primary" onClick={addLine}>+ Add Session</button>
          </div>

          <div className="table-wrapper">
            <table className="line-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 180 }}>Training Type</th>
                  <th style={{ width: 130 }}>Session Date</th>
                  <th style={{ width: 100 }}>Start</th>
                  <th style={{ width: 100 }}>End</th>
                  <th style={{ width: 80 }}>Mins</th>
                  <th style={{ width: 120 }}>Rate/hr (฿)</th>
                  <th style={{ width: 120 }}>Cost (฿)</th>
                  <th>Notes</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((line, i) => (
                  <tr key={line._key}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{i + 1}</td>

                    {/* Training Type */}
                    <td>
                      <select
                        className={`form-input${errors[`line_${i}_type`] ? ' error' : ''}`}
                        value={line.type_id}
                        onChange={(e) => handleTypeChange(i, e.target.value)}
                      >
                        <option value="">— select —</option>
                        {trainingTypes.map((t) => (
                          <option key={t.id} value={t.id}>{t.type_name}</option>
                        ))}
                      </select>
                      {errors[`line_${i}_type`] && <p className="form-error">{errors[`line_${i}_type`]}</p>}
                    </td>

                    {/* Session Date */}
                    <td>
                      <input
                        type="date"
                        className={`form-input${errors[`line_${i}_date`] ? ' error' : ''}`}
                        value={line.session_date}
                        onChange={(e) => handleLineChange(i, 'session_date', e.target.value)}
                      />
                      {errors[`line_${i}_date`] && <p className="form-error">{errors[`line_${i}_date`]}</p>}
                    </td>

                    {/* Start Time */}
                    <td>
                      <input
                        type="time"
                        className={`form-input${errors[`line_${i}_start`] ? ' error' : ''}`}
                        value={line.start_time}
                        onChange={(e) => handleLineChange(i, 'start_time', e.target.value)}
                      />
                    </td>

                    {/* End Time */}
                    <td>
                      <input
                        type="time"
                        className={`form-input${errors[`line_${i}_end`] || errors[`line_${i}_dur`] ? ' error' : ''}`}
                        value={line.end_time}
                        onChange={(e) => handleLineChange(i, 'end_time', e.target.value)}
                      />
                      {errors[`line_${i}_dur`] && <p className="form-error">{errors[`line_${i}_dur`]}</p>}
                    </td>

                    {/* Duration (computed) */}
                    <td>
                      <input className="form-input computed" readOnly value={line.duration_minutes} />
                    </td>

                    {/* Hourly Rate */}
                    <td>
                      <input
                        type="number" min="0.01" step="0.01"
                        className={`form-input${errors[`line_${i}_rate`] ? ' error' : ''}`}
                        value={line.hourly_rate}
                        onChange={(e) => handleLineChange(i, 'hourly_rate', e.target.value)}
                      />
                      {errors[`line_${i}_rate`] && <p className="form-error">{errors[`line_${i}_rate`]}</p>}
                    </td>

                    {/* Session Cost (computed) */}
                    <td>
                      <input className="form-input computed" readOnly value={fmt(line.session_cost)} />
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
              <span className="total-label">Total Session Cost</span>
              <span className="total-value">฿ {fmt(totalCost)}</span>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/training-bookings')}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Booking'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
