export default function ConfirmationModal({ action, onConfirm, onCancel }) {
  if (!action) return null;
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <h2>Confirm safe command</h2>
        <p>
          <strong>{action.name}</strong> bajarilsinmi?
        </p>
        <pre>{JSON.stringify(action.args, null, 2)}</pre>
        <button type="button" onClick={onConfirm}>
          Confirm
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </section>
    </div>
  );
}
