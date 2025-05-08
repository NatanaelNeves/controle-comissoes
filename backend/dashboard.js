// Configuração
const API_URL = 'http://localhost:3002';
const token = localStorage.getItem('token');
let comissoesChart;
const toastEl = document.getElementById('live-toast');
const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (!token) window.location.href = 'index.html';

    document.getElementById('data-pagamento').valueAsDate = new Date();
    document.getElementById('valor-venda').addEventListener('input', calcularComissao);
    document.getElementById('percentual').addEventListener('input', calcularComissao);
    document.getElementById('form-comissao').addEventListener('submit', salvarComissao);
    document.getElementById('filtro-mes').addEventListener('change', filtrarComissoes);
    document.getElementById('filtro-vendedor').addEventListener('input', filtrarComissoes);

    carregarComissoes();
});

// Funções (mantenha as mesmas do seu código original, mas adicione o header de autenticação)
async function carregarComissoes() {
    try {
        const response = await fetch(`${API_URL}/comissoes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao carregar comissões');
        const comissoes = await response.json();
        atualizarDashboard(comissoes);
        atualizarTabela(comissoes);
        renderizarGrafico(comissoes);
    } catch (error) {
        mostrarToast('Erro', error.message, 'danger');
    }
}

async function salvarComissao(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const btnOriginal = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Salvando...';

        const comissaoData = {
            nome_vendedor: document.getElementById('nome-vendedor').value,
            valor: document.getElementById('valor-comissao').value,
            valor_venda: document.getElementById('valor-venda').value,
            percentual: document.getElementById('percentual').value,
            meta_vendas: document.getElementById('meta-vendas').value || null,
            data_pagamento: document.getElementById('data-pagamento').value
        };

        const response = await fetch(`${API_URL}/comissoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(comissaoData)
        });

        if (!response.ok) throw new Error(await response.text());
        
        mostrarToast('Sucesso', 'Comissão registrada!', 'success');
        e.target.reset();
        await carregarComissoes();
    } catch (error) {
        mostrarToast('Erro', error.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = btnOriginal;
    }
}

// Mantenha as demais funções (calcularComissao, filtrarComissoes, etc.) do seu código original