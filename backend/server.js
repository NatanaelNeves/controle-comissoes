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
        const { data, error } = await supabase
            .from('tbcomissao')
            .select(`
                *,
                vendedores:tbvendedores (
                    *,
                    pessoa:cadastro.tbPessoas (*)
                )
            `);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        res.status(500).json({ message: err.message });
    }
});

app.post('/comissoes', async (req, res) => {
    try {
        const { valor, status_id, data_pagamento, vendedor_id, meta_vendas } = req.body;
        
        const { data, error } = await supabase
            .from('tbcomissao')
            .insert([{ valor, status_id, data_pagamento, vendedor_id, meta_vendas }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Erro ao criar comissão:', err);
        res.status(500).json({ message: err.message });
    }
});

// Rotas para Vendedores
app.get('/vendedores', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tbvendedores')
            .select(`
                *,
                pessoa:cadastro.tbPessoas (*)
            `);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
        res.status(500).json({ message: err.message });
    }
});

app.get('/vendedores/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tbvendedores')
            .select(`
                *,
                pessoa:cadastro.tbPessoas (*)
            `)
            .eq('vendedor_id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar vendedor:', err);
        res.status(500).json({ message: err.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});