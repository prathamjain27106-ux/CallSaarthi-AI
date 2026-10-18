import React from 'react';
import { AlertTriangle, X, Check, Trash2 } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog confirmation-dialog" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon-badge ${isDestructive ? 'destructive' : 'warning'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={isDestructive ? 'btn-danger-confirm' : 'btn-primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {isDestructive ? <Trash2 size={16} /> : <Check size={16} />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
