// DeleteModal.js
import Swal from 'sweetalert2';

export async function showDeleteModal({ t, titleKey, textKey, onConfirm }) {
  return Swal.fire({
    title: t(titleKey),
    text: t(textKey),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: t('BUTTON.Delete'),
    cancelButtonText: t('BUTTON.Cancel'),
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: t('ModalPopup.DeletingLoadingModal.title'),
          text: t('ModalPopup.DeletingLoadingModal.text'),
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        await onConfirm();
        Swal.close();
      } catch {
        Swal.close();
      }
    }
  });
}
