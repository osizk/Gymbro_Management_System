import { useState } from 'react';

export default function StaffSearchModal({ staff, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      String(s.id).includes(q) ||
      s.staff_name.toLowerCase().includes(q) ||
      (s.position || '').toLowerCase().includes(q)
    );
  });

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Select Staff</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            className="form-input"
            placeholder="Search by ID, name or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {filtered.length === 0 ? (
            <div className="modal-empty">No staff found.</div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="modal-row"
                style={{ gridTemplateColumns: '48px 1fr 140px' }}
                onClick={() => onSelect(s)}
              >
                <span className="modal-row-id">#{s.id}</span>
                <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{s.staff_name}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'right' }}>{s.position}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
