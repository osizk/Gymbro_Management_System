import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          style={{
            animation: 'slideIn 0.3s ease-out',
            animationFillMode: 'both',
          }}
        >
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast {
          pointer-events: auto;
          padding: 12px 16px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-size: 14px;
          font-weight: 500;
          max-width: 400px;
          word-wrap: break-word;
        }

        .toast-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .toast-message {
          flex: 1;
        }

        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 0;
          color: inherit;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .toast-close:hover {
          opacity: 1;
        }

        .toast-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .toast-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .toast-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .toast-container {
            bottom: 10px;
            right: 10px;
            left: 10px;
          }

          .toast {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
