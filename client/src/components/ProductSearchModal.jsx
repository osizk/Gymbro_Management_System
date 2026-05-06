import { useState } from 'react';

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });

export default function ProductSearchModal({ products, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      String(p.id).includes(q) ||
      p.product_name.toLowerCase().includes(q)
    );
  });

  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">Select Product</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            className="form-input"
            placeholder="Search by ID or product name..."
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
              gridTemplateColumns: '48px 1fr 110px 80px',
              background: 'var(--gray-50)',
              cursor: 'default',
              borderBottom: '2px solid var(--gray-200)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="modal-row-id">ID</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Price (฿)</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Stock</span>
          </div>

          {filtered.length === 0 ? (
            <div className="modal-empty">No products found.</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="modal-row"
                style={{ gridTemplateColumns: '48px 1fr 110px 80px' }}
                onClick={() => onSelect(p)}
              >
                <span className="modal-row-id">#{p.id}</span>
                <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{p.product_name}</span>
                <span style={{ textAlign: 'right', color: 'var(--gray-700)' }}>{fmt(p.selling_price)}</span>
                <span style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: p.stock_quantity <= 5 ? 'var(--danger)' : 'var(--green-600)',
                }}>
                  {p.stock_quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}