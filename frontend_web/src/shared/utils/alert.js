import Swal from 'sweetalert2';

const COLOR_PRINCIPAL = '#B90F0F';
const COLOR_PRINCIPAL_HOVER = '#9f0d0d';

const baseConfig = {
    confirmButtonColor: COLOR_PRINCIPAL,
    cancelButtonColor: '#6B7280',
    buttonsStyling: true,
};

export const alertSuccess = (title, text = '') =>
    Swal.fire({
        ...baseConfig,
        icon: 'success',
        title,
        text,
        confirmButtonText: 'Aceptar',
    });

export const alertError = (title, text = '') =>
    Swal.fire({
        ...baseConfig,
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Entendido',
    });

export const alertWarning = (title, text = '') =>
    Swal.fire({
        ...baseConfig,
        icon: 'warning',
        title,
        text,
        confirmButtonText: 'Aceptar',
    });

export const alertInfo = (title, text = '') =>
    Swal.fire({
        ...baseConfig,
        icon: 'info',
        title,
        text,
        confirmButtonText: 'Aceptar',
    });

export const alertMessage = (title, icon = 'info') =>
    Swal.fire({
        ...baseConfig,
        icon,
        title,
        confirmButtonText: 'Aceptar',
    });

export const alertConfirm = async ({
    title,
    text = '',
    icon = 'warning',
    confirmButtonText = 'Sí, continuar',
    cancelButtonText = 'Cancelar',
}) => {
    const result = await Swal.fire({
        ...baseConfig,
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
    });
    return result.isConfirmed;
};

export const toastSuccess = (title) =>
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });

export const toastError = (title) =>
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
