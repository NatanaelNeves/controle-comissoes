const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();  // Carregar as variáveis de ambiente do arquivo .env
console.log("Arquivo carregado corretamente!");

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Listar todas as comissões
app.get('/comissoes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tbComissao')  // Apenas o nome da tabela sem o 'public.'
            .select('*');

        if (error) {
            console.error('Erro ao buscar comissões:', error);
            return res.status(500).json(error);
        }

        res.json(data);
    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Criar uma nova comissão
app.post('/comissoes', async (req, res) => {
    const { valor, status_id, data_pagamento, vendedor_id, meta_vendas } = req.body;

    try {
        const { data, error } = await supabase
            .from('tbComissao')  // Apenas o nome da tabela sem o 'public.'
            .insert([
                { valor, status_id, data_pagamento, vendedor_id, meta_vendas }
            ]);

        if (error) {
            console.error('Erro ao criar comissão:', error);
            return res.status(500).json(error);
        }

        res.json({ id: data[0].comissao_id, ...req.body });
    } catch (err) {
        console.error('Erro no servidor:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Iniciar servidor
app.listen(3002, () => {
    console.log('Servidor rodando na porta 3002');
});
