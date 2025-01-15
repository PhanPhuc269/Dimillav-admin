document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.querySelector('#account-change-password form');

    const currentPasswordInput = passwordForm.querySelector('input[name="currentPassword"]');
    const newPasswordInput = passwordForm.querySelector('input[name="newPassword"]');
    const repeatNewPasswordInput = passwordForm.querySelector('input[name="repeatNewPassword"]');

    passwordForm.addEventListener('submit', (event) => {
        const newPassword = newPasswordInput.value;
        const repeatNewPassword = repeatNewPasswordInput.value;

        // Check if passwords match
        if (newPassword !== repeatNewPassword) {
            alert('Mật khẩu nhập lại không khớp. Vui lòng thử lại.');
            event.preventDefault();
            return;
        }
        // Check password complexity
        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!complexityRegex.test(newPassword)) {
            alert('Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.');
            event.preventDefault();
            return;
        }


        // Additional checks if needed
        if (!currentPasswordInput.value) {
            alert('Vui lòng nhập mật khẩu hiện tại.');
            event.preventDefault();
            return;
        }

        // If all checks pass, form will be submitted
    });
  });