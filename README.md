# Controle de Pagamentos de Comissões

Este projeto é um sistema de controle de pagamentos de comissões para vendedores ou representantes, registrando valores, datas e metas de vendas atingidas.

## 🔗 Tecnologias Utilizadas
- **Frontend:** HTML, JavaScript, Bootstrap
- **Backend:** Node.js (Hospedado no Render)
- **Banco de Dados:** Supabase (PostgreSQL)

## 📂 Estrutura do Projeto
```
controle-comissoes/
├── backend/  → Código do servidor Node.js
│   ├── server.js  → Configuração do servidor Express e conexão com Supabase
│   ├── .env  → Variáveis de ambiente (não compartilhado no repositório)
│   ├── package.json  → Dependências do backend
│   └── ...
│
├── frontend/  → Código do React.js
│   ├── src/
│   │   ├── components/  → Componentes reutilizáveis
│   │   ├── pages/  → Páginas principais da aplicação
│   │   ├── api.js  → Comunicação com o backend
│   │   ├── App.js  → Configuração principal do React
│   │   └── ...
│   ├── .env  → Variáveis de ambiente do frontend
│   ├── package.json  → Dependências do frontend
│   └── ...
```

## 🚀 Como Rodar o Projeto Localmente

### 1️⃣ Clonar o Repositório
```sh
git clone https://github.com/seu-usuario/controle-comissoes.git
cd controle-comissoes
```

### 2️⃣ Configurar e Rodar o Backend
```sh
cd backend
npm install
cp .env.example .env  # Crie o arquivo .env com as credenciais do Supabase
npm start  # Inicia o servidor na porta 3002
```

### 3️⃣ Configurar e Rodar o Frontend
```sh
cd ../frontend
npm install
cp .env.example .env  # Adicione a URL do backend hospedado
npm start  # Inicia o frontend na porta 3000
```

## 🌍 Hospedagem
- **Frontend:** [Vercel](https://controle-comissoes.vercel.app)
- **Backend:** [Render](https://controle-comissoes.onrender.com)
- **Banco de Dados:** [Supabase](https://supabase.com)

## 📌 Endpoints da API
| Método | Rota        | Descrição |
|--------|------------|------------|
| GET    | /comissoes | Lista todas as comissões |

## 🛠️ Melhorias Futuras
- Adicionar autenticação de usuários e adicionar comissao
- Implementar filtros avançados para comissões
- Criar dashboard interativo para análise de vendas

---
🚀 **Desenvolvido por [Natanael Neves]**

