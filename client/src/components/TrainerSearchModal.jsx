import { useState } from 'react';

export default function TrainerSearchModal({ trainers, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = trainers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.trainer_name.toLowerCase().includes(q) ||
      (t.specialization || '').toLowerCase().includes(q)
    );
  });

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Select Trainer</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            className="form-input"
            placeholder="Search by ID, name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {filtered.length === 0 ? (
            <div className="modal-empty">No trainers found.</div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="modal-row"
                style={{ gridTemplateColumns: '80px 1fr 160px' }}
                onClick={() => onSelect(t)}
              >
                <span className="modal-row-id">{t.id}</span>
                <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{t.trainer_name}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'right' }}>{t.specialization}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
