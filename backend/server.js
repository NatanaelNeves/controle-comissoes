const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware de Autenticação JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Rotas Públicas
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const { data: usuario, error } = await supabase
            .from('tbusuario')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario) throw new Error('Credenciais inválidas');

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) throw new Error('Credenciais inválidas');

        const token = jwt.sign(
            { id: usuario.id, permissao: usuario.permissao },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, usuario });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// Rotas Protegidas (CRUD de Usuários)
app.get('/usuarios', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase.from('tbusuario').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/usuarios', authenticate, async (req, res) => {
    const { nome, email, senha, permissao } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const { data, error } = await supabase
            .from('tbusuario')
            .insert([{ nome, email, senha: senhaHash, permissao }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/usuarios/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { nome, email, permissao } = req.body;
    try {
        const { data, error } = await supabase
            .from('tbusuario')
            .update({ nome, email, permissao })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/usuarios/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('tbusuario').delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rotas de Comissões (Protegidas)
app.get('/comissoes', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tbcomissao')
            .select('*')
            .order('data_pagamento', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/comissoes', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tbcomissao')
            .insert([req.body])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar Servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));