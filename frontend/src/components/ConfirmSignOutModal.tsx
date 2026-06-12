import LogoutIcon from "@mui/icons-material/Logout";

type Props = { open: boolean; busy?: boolean; onCancel: () => void; onConfirm: () => void };

const ConfirmSignOutModal = ({ open, busy, onCancel, onConfirm }: Props) => {
  if (!open) return null;
  return <div className="confirm-modal-backdrop" role="presentation" onMouseDown={onCancel}>
    <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="signout-title" onMouseDown={(event) => event.stopPropagation()}>
      <span className="confirm-modal-icon"><LogoutIcon /></span>
      <h2 id="signout-title">Sign out?</h2>
      <p>Are you sure you want to logout?</p>
      <div className="confirm-modal-actions"><button type="button" className="modal-cancel-button" onClick={onCancel}>Cancel</button><button type="button" className="modal-signout-button" disabled={busy} onClick={onConfirm}>{busy ? "Logging out..." : "Logout"}</button></div>
    </section>
  </div>;
};

export default ConfirmSignOutModal;
