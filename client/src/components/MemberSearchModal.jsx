import { useEffect, useState } from 'react';
import apiClient from '../api/axiosInstance';

export default function MemberSearchModal({ onSelect, onClose }) {
  const [members, setMembers]   = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    apiClient.get('/merchandise/members/active')
      .then((res) => setMembers(res.data.data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      String(m.id).includes(q) ||
      m.member_name.toLowerCase().includes(q) ||
      (m.phone || '').includes(q)
    );
  });

  // close on overlay click
  const handleOverlay = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Select Member</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            className="form-input"
            placeholder="Search by ID, name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="modal-empty">No members found.</div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="modal-row"
                style={{ gridTemplateColumns: '48px 1fr 120px' }}
                onClick={() => onSelect(m)}
              >
                <span className="modal-row-id">#{m.id}</span>
                <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{m.member_name}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'right' }}>{m.phone}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}