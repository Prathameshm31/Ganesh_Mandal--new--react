import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteMember } from '../../services/memberService';

export default function DeleteDialog({ open, onClose, member, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success(`Member "${member.fullName}" deleted successfully`);
      onClose();
      if (onDeleted) onDeleted();
    } catch (err) {
      toast.error(err.message || 'Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Member</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{member?.fullName}</strong> ({member?.id})? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
