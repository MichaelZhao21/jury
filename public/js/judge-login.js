let loginLock = false;

window.onload = () => {
    document.getElementById('login-code-input').addEventListener('keydown', (key) => {
        if (key.key == 'Enter') {
            login();
        }
        hideError();
    });
    getCookies();
};

async function login() {
    // Prevent spamming of login while waiting for fetch
    if (loginLock) return;
    loginLock = true;

    // Get code from input
    const code = document.getElementById('login-code-input').value;

    // Check for length of code
    if (code.length < 6) {
        showError();
        loginLock = false;
        return;
    }

    // Make async call to check code
    const res = await fetch('/judge/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });

    // Invalid code
    if (res.status === 400) {
        showError();
        loginLock = false;
        return;
    }

    // Internal server error
    if (res.status !== 200) {
        console.error(await res.text());
        showError();
        loginLock = false;
        return;
    }

    // Correct code; save token as cookie
    const token = await res.text();
    setCookie('token', token, 60 * 60 * 24);

    // Redirect
    window.location.href = window.origin + '/judge';

    loginLock = false;
}

function showError() {
    document.getElementById('login-code-input').classList.add('error');
    document.getElementById('login-code-input-label').classList.add('error');
    document.getElementById('login-code-input-label').textContent = 'Invalid judging code';
}

function hideError() {
    document.getElementById('login-code-input').classList.remove('error');
    document.getElementById('login-code-input-label').classList.remove('error');
    document.getElementById('login-code-input-label').textContent = 'Enter your judging code';
}