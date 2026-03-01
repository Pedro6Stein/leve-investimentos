declare const UIkit: any;
import { loginByEmail } from '../../../features/auth/by-email/api/login.js';
import { HttpError } from '../../../shared/api/httpClient.js';

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('@Leve:token')) {
        window.location.href = '../../dashboard/ui/index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    loginForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<div uk-spinner="ratio: 0.6"></div> Autenticando...';
        loginBtn.disabled = true;

        try {
            const data = await loginByEmail(email, password);

            localStorage.setItem('@Leve:token', data.token);
            localStorage.setItem('@Leve:user', JSON.stringify(data.user));

            UIkit.notification({
                message: `<span uk-icon='icon: check'></span> Sucesso! Redirecionando...`,
                status: 'success',
                pos: 'top-right'
            });

            setTimeout(() => {
                window.location.href = '../../dashboard/ui/index.html';
            }, 800);

        } catch (error) {
            console.error("Falha no login:", error);
            let errorMessage = 'Ocorreu um erro ao conectar com o servidor.';
            if (error instanceof HttpError) {
                errorMessage = error.message;
            }

            UIkit.notification({
                message: `<span uk-icon='icon: warning'></span> ${errorMessage}`,
                status: 'danger',
                pos: 'top-right'
            });
        } finally {
            loginBtn.innerHTML = originalBtnText;
            loginBtn.disabled = false;
        }
    });
});