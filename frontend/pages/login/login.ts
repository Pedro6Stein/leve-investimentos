declare const UIkit: any;
import { loginByEmail } from '../../services/authService.js';
import { HttpError } from '../../services/httpClient.js';

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('@Leve:token')) {
        window.location.href = '../dashboard/index.html';
        return;
    }

    const loginForm     = document.getElementById('loginForm')  as HTMLFormElement;
    const loginBtn      = document.getElementById('loginBtn')   as HTMLButtonElement;
    const emailInput    = document.getElementById('email')      as HTMLInputElement;
    const passwordInput = document.getElementById('password')   as HTMLInputElement;

    loginForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML    = '<div uk-spinner="ratio: 0.6"></div> Autenticando...';
        loginBtn.disabled     = true;

        try {
            const data = await loginByEmail(emailInput.value, passwordInput.value);

            localStorage.setItem('@Leve:token', data.token);
            localStorage.setItem('@Leve:user',  JSON.stringify(data.user));

            UIkit.notification({
                message: `<span uk-icon='icon: check'></span> Bem-vindo(a), ${data.user.fullName}!`,
                status: 'success',
                pos: 'top-right'
            });

            setTimeout(() => {
                window.location.href = '../dashboard/index.html';
            }, 800);

        } catch (error) {
            const msg = error instanceof HttpError
                ? error.message
                : 'Ocorreu um erro ao conectar com o servidor.';

            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> ${msg}`,
                status: 'danger',
                pos: 'top-right'
            });
        } finally {
            loginBtn.innerHTML = originalBtnText;
            loginBtn.disabled  = false;
        }
    });
});
