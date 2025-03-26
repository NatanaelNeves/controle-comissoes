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

// Função auxiliar para buscar pessoas
async function getPessoas(pessoaIds) {
    // Verifica se há IDs para buscar
    if (!pessoaIds || pessoaIds.length === 0) return [];
    
    // Consulta usando o esquema correto (sem 'cadastro.')
    const { data, error } = await supabase
        .from('tbPessoas')
        .select('*')
        .in('pessoa_id', pessoaIds);

    if (error) throw error;
    return data;
}

// Função auxiliar para buscar vendedores com pessoas relacionadas
async function getVendedoresComPessoas() {
    // Consulta 1: Busca todos os vendedores
    const { data: vendedores, error: vendedoresError } = await supabase
        .from('tbvendedores')
        .select('*');

    if (vendedoresError) throw vendedoresError;

    // Extrai os IDs das pessoas
    const pessoaIds = vendedores.map(v => v.pessoa_id).filter(id => id);

    // Consulta 2: Busca todas as pessoas relacionadas
    const pessoas = await getPessoas(pessoaIds);

    // Combina os dados
    return vendedores.map(vendedor => {
        const pessoa = pessoas.find(p => p.pessoa_id === vendedor.pessoa_id);
        return {
            ...vendedor,
            pessoa: pessoa || null
        };
    });
}

// Rotas para Comissões
app.get('/comissoes', async (req, res) => {
    try {
        // 1. Busca todas as comissões
        const { data: comissoes, error: comissoesError } = await supabase
            .from('tbcomissao')
            .select('*');

        if (comissoesError) throw comissoesError;

        // 2. Busca todos os vendedores com pessoas relacionadas
        const vendedores = await getVendedoresComPessoas();

        // 3. Combina os dados
        const comissoesCompletas = comissoes.map(comissao => {
            const vendedor = vendedores.find(v => v.vendedor_id === comissao.vendedor_id);
            return {
                ...comissao,
                vendedor: vendedor || null
            };
        });

        res.json(comissoesCompletas);
    } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        res.status(500).json({ 
            message: err.message,
            details: err.details || null
        });
    }
});

app.post('/comissoes', async (req, res) => {
    try {
        const { valor, status_id, data_pagamento, vendedor_id, meta_vendas, valor_venda, percentual } = req.body;
        
        // Validação dos campos obrigatórios
        if (!valor || !status_id || !data_pagamento || !vendedor_id) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando' });
        }

        const { data, error } = await supabase
            .from('tbcomissao')
            .insert([{ 
                valor, 
                status_id, 
                data_pagamento, 
                vendedor_id, 
                meta_vendas,
                valor_venda,
                percentual
            }])
            .select();

        if (error) throw error;
        
        // Busca os dados completos da comissão recém-criada
        const comissaoCriada = data[0];
        const vendedores = await getVendedoresComPessoas();
        const vendedor = vendedores.find(v => v.vendedor_id === comissaoCriada.vendedor_id);

        const resposta = {
            ...comissaoCriada,
            vendedor: vendedor || null
        };

        res.status(201).json(resposta);
    } catch (err) {
        console.error('Erro ao criar comissão:', err);
        res.status(500).json({ 
            message: err.message,
            details: err.details || null
        });
    }
});

// Rotas para Vendedores
app.get('/vendedores', async (req, res) => {
    try {
        const vendedores = await getVendedoresComPessoas();
        res.json(vendedores);
    } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
        res.status(500).json({ 
            message: err.message,
            details: err.details || null
        });
    }
});

app.get('/vendedores/:id', async (req, res) => {
    try {
        // Busca o vendedor específico
        const { data: vendedor, error: vendedorError } = await supabase
            .from('tbvendedores')
            .select('*')
            .eq('vendedor_id', req.params.id)
            .single();

        if (vendedorError) throw vendedorError;

        // Busca a pessoa relacionada se existir
        let pessoa = null;
        if (vendedor.pessoa_id) {
            const { data: pessoaData, error: pessoaError } = await supabase
                .from('tbPessoas')
                .select('*')
                .eq('pessoa_id', vendedor.pessoa_id)
                .single();

            if (!pessoaError) pessoa = pessoaData;
        }

        res.json({
            ...vendedor,
            pessoa: pessoa
        });
    } catch (err) {
        console.error('Erro ao buscar vendedor:', err);
        res.status(500).json({ 
            message: err.message,
            details: err.details || null
        });
    }
});

app.post('/vendedores', async (req, res) => {
    try {
        const { pessoa_id, meta_mensal, data_admissao } = req.body;
        
        // Validação dos campos obrigatórios
        if (!pessoa_id) {
            return res.status(400).json({ message: 'ID da pessoa é obrigatório' });
        }

        const { data, error } = await supabase
            .from('tbvendedores')
            .insert([{ 
                pessoa_id,
                meta_mensal: meta_mensal || null,
                data_admissao: data_admissao || null
            }])
            .select();

        if (error) throw error;
        
        // Busca os dados completos do vendedor recém-criado
        const novoVendedor = data[0];
        const { data: pessoa, error: pessoaError } = await supabase
            .from('tbPessoas')
            .select('*')
            .eq('pessoa_id', novoVendedor.pessoa_id)
            .single();

        if (pessoaError) throw pessoaError;

        const resposta = {
            ...novoVendedor,
            pessoa: pessoa || null
        };

        res.status(201).json(resposta);
    } catch (err) {
        console.error('Erro ao criar vendedor:', err);
        res.status(500).json({ 
            message: err.message,
            details: err.details || null
        });
    }
});

// Rota de saúde do servidor
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});