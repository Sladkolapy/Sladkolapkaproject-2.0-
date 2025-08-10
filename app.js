// Хранилище
const appStorage = {
    saveUser: (data) => {
        localStorage.setItem('nfcLockUser', JSON.stringify(data));
    },
    getUser: () => {
        const data = localStorage.getItem('nfcLockUser');
        return data ? JSON.parse(data) : null;
    },
    clearUser: () => {
        localStorage.removeItem('nfcLockUser');
    }
};

// Отправка данных на сервер (без try/catch)
async function sendToServer(userData) {
    const response = await fetch('http://192.168.1.128:5010/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: userData.name,
            hash: userData.hash
        })
    });
    return response.json();
}

// Инициализация страницы регистрации
export function initRegistrationPage() {
    const user = appStorage.getUser();
    if (user) {
        window.location.href = `control.html?name=${encodeURIComponent(user.name)}&hash=${user.hash}`;
        return;
    }

    document.getElementById('registration-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('first-name').value,
            hash: Math.random().toString(36).slice(2, 10)
        };

        await sendToServer(userData); // Отправка без обработки ошибок
        appStorage.saveUser(userData);
        window.location.href = `control.html?name=${encodeURIComponent(userData.name)}&hash=${userData.hash}`;
    });
}

// Инициализация страницы управления (без изменений)
export function initControlPage() {
    const params = new URLSearchParams(window.location.search);
    let userName = params.get('name');
    let userHash = params.get('hash');

    if (!userName || !userHash) {
        const user = appStorage.getUser();
        if (user) {
            userName = user.name;
            userHash = user.hash;
        } else {
            window.location.href = 'index.html';
            return;
        }
    }

    document.getElementById('user-name').textContent = `Привет, ${userName || 'Друг'}!`;
    document.getElementById('connection-hash').textContent = userHash || 'xxxxyyyy';

    let isLocked = true;
    document.getElementById('action-btn').addEventListener('click', () => {
        isLocked = !isLocked;
        const btn = document.getElementById('action-btn');
        const status = document.getElementById('lock-status');
        const hint = document.getElementById('nfc-hint');
        
        if (isLocked) {
            btn.textContent = 'Закрыть';
            btn.classList.remove('active');
            status.textContent = '🔒 Заблокирован';
            hint.textContent = 'Приложите телефон к замку';
        } else {
            btn.textContent = 'Открыть';
            btn.classList.add('active');
            status.textContent = '🔓 Разблокирован';
            hint.textContent = 'Готов к NFC';
            setTimeout(() => hint.textContent = 'Ключ сохранён!', 800);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        appStorage.clearUser();
        window.location.href = 'index.html';
    });
}