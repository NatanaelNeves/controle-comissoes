// Verifica se o usuário está logado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    // Verifica permissão de admin
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken.permissao === 'admin') {
        document.getElementById('menu-usuarios').style.display = 'block';
    }

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});