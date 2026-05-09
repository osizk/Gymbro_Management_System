import { useState } from 'react';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function PackageSearchModal({ packages, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = packages.filter((p) => {
    const q = search.toLowerCase();
    return (
      String(p.id).includes(q) ||
      p.package_name.toLowerCase().includes(q)
    );
  });

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">Select Package</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            className="form-input"
            placeholder="Search by ID or package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {/* Header row */}
          <div
            className="modal-row"
            style={{
              gridTemplateColumns: '48px 1fr 90px 110px',
              background: 'var(--gray-50)',
              cursor: 'default',
              borderBottom: '2px solid var(--gray-200)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="modal-row-id">ID</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Duration</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Base Price (฿)</span>
          </div>

          {filtered.length === 0 ? (
            <div className="modal-empty">No packages found.</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="modal-row"
                style={{ gridTemplateColumns: '48px 1fr 90px 110px' }}
                onClick={() => onSelect(p)}
              >
                <span className="modal-row-id">#{p.id}</span>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{p.package_name}</div>
                  {p.description && (
                    <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 1 }}>{p.description}</div>
                  )}
                </div>
                <span style={{ textAlign: 'center', color: 'var(--gray-600)' }}>
                  {p.duration_months} mo.
                </span>
                <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--green-600)' }}>
                  {fmt(p.base_price)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}