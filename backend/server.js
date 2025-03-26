const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro no servidor' });
});

// Rotas para Comissões
app.get('/comissoes', async (req, res) => {
    try {
        // Consulta corrigida com o nome exato da tabela
        const { data, error } = await supabase
            .from('tbcomissao')  // Nome correto da tabela
            .select('*')
            .order('data_pagamento', { ascending: false });

        if (error) throw error;
        
        // Formatação básica da resposta
        const comissoesFormatadas = data.map(item => ({
            id: item.comissao_id,
            valor: item.valor,
            status_id: item.status_id,
            data_pagamento: item.data_pagamento,
            vendedor_id: item.vendedor_id,
            meta_vendas: item.meta_vendas || null,
            criado_em: item.criado_em
        }));

        res.json(comissoesFormatadas);
    } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar comissões',
            details: err.message,
            hint: 'Verifique a conexão com o banco de dados'
        });
    }
});

app.post('/comissoes', async (req, res) => {
    try {
        const { valor, vendedor_id, data_pagamento, meta_vendas } = req.body;
        
        // Validação básica
        if (!valor || !vendedor_id || !data_pagamento) {
            return res.status(400).json({ 
                error: 'Dados incompletos',
                required_fields: ['valor', 'vendedor_id', 'data_pagamento']
            });
        }

        // Inserção na tabela com nome correto
        const { data, error } = await supabase
            .from('tbcomissao')
            .insert([{
                valor,
                vendedor_id,
                data_pagamento,
                meta_vendas: meta_vendas || null,
                status_id: 1, // Status padrão (1 = pendente)
                criado_em: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Erro ao criar comissão:', err);
        res.status(500).json({ 
            error: 'Falha ao registrar comissão',
            details: err.message
        });
    }
});

// Rota de status do servidor
app.get('/status', async (req, res) => {
    try {
        // Verificação simples da conexão com o banco
        const { data, error } = await supabase
            .from('tbcomissao')
            .select('*')
            .limit(1);

        res.json({
            status: 'online',
            database: error ? 'disconnected' : 'connected',
            tables: {
                comissoes: 'tbcomissao'
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'online',
            database: 'connection error'
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Tabela de comissões: tbcomissao`);
});