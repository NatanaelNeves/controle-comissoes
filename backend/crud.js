document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';

    // Carrega usuários
    const carregarUsuarios = async () => {
        try {
            const response = await fetch('http://localhost:3002/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usuarios = await response.json();
            renderizarUsuarios(usuarios);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        }
    };

    // Renderiza tabela
    const renderizarUsuarios = (usuarios) => {
        const tbody = document.getElementById('tabela-usuarios');
        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.permissao}</td>
                <td>
                    <button onclick="editarUsuario(${usuario.id})" class="btn btn-sm btn-warning">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="excluirUsuario(${usuario.id})" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    };

    // Formulário (Cadastro/Edição)
    document.getElementById('form-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('usuario-id').value;
        const usuario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            permissao: document.getElementById('permissao').value
        };

        try {
            const url = id ? `http://localhost:3002/usuarios/${id}` : 'http://localhost:3002/usuarios';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                carregarUsuarios();
                document.getElementById('form-usuario').reset();
            }
        } catch (err) {
            console.error('Erro ao salvar usuário:', err);
        }
    });

    // Funções globais
    window.editarUsuario = async (id) => {
        const response = await fetch(`http://localhost:3002/usuarios/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuario = await response.json();
        
        document.getElementById('usuario-id').value = usuario.id;
        document.getElementById('nome').value = usuario.nome;
        document.getElementById('email').value = usuario.email;
        document.getElementById('permissao').value = usuario.permissao;
        document.getElementById('senha').placeholder = 'Deixe em branco para manter a senha atual';
    };

    window.excluirUsuario = async (id) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            await fetch(`http://localhost:3002/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            carregarUsuarios();
        }
    };

    // Inicialização
    carregarUsuarios();
});