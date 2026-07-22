/**
 * @file BensPermanentesController.js
 * @description Controlador para o módulo de Bens Permanentes (Patrimônio da Prefeitura).
 * Gerencia o cadastro, listagem, atualização e controle de bens vinculados a setores.
 * @module Almoxarifado/BensPermanentesController
 */

const prisma = require('../../shared/database/prisma');

class BensPermanentesController {
    /**
     * Lista todos os bens permanentes cadastrados com setor e usuário responsável pelo registro.
     */
    static async listar(req, res) {
        try {
            const bens = await prisma.bemPermanente.findMany({
                include: {
                    setor: true,
                    usuarioRegistro: {
                        select: { id: true, nome: true }
                    }
                },
                orderBy: {
                    dataEntrada: 'desc'
                }
            });

            return res.status(200).json(bens);
        } catch (erro) {
            console.error("[BENS_PERMANENTES_LIST_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao buscar bens permanentes." });
        }
    }

    /**
     * Cadastra um novo bem permanente no sistema.
     */
    static async criar(req, res) {
        try {
            const { numeroPatrimonio, descricao, setorId, dataEntrada, status } = req.body;

            if (!numeroPatrimonio || !descricao || !setorId) {
                return res.status(400).json({ 
                    erro: "Número de patrimônio, descrição e setor são obrigatórios." 
                });
            }

            // Verifica se o número de patrimônio já foi cadastrado
            const existente = await prisma.bemPermanente.findUnique({
                where: { numeroPatrimonio: String(numeroPatrimonio).trim() }
            });

            if (existente) {
                return res.status(400).json({ 
                    erro: `Já existe um bem cadastrado com o patrimônio "${numeroPatrimonio}".` 
                });
            }

            // Garante que o setor informado existe
            const setorExiste = await prisma.setor.findUnique({
                where: { id: parseInt(setorId) }
            });

            if (!setorExiste) {
                return res.status(404).json({ erro: "Setor informado não foi encontrado." });
            }

            // Identifica quem está realizando o cadastro
            const usuarioRegistroId = req.usuario?.id || req.body.usuarioRegistroId;

            if (!usuarioRegistroId) {
                return res.status(400).json({ erro: "Usuário responsável pelo registro não identificado." });
            }

            const novoBem = await prisma.bemPermanente.create({
                data: {
                    numeroPatrimonio: String(numeroPatrimonio).trim(),
                    descricao,
                    setorId: parseInt(setorId),
                    usuarioRegistroId: parseInt(usuarioRegistroId),
                    status: status || "ATIVO",
                    dataEntrada: dataEntrada ? new Date(dataEntrada) : undefined
                },
                include: {
                    setor: true,
                    usuarioRegistro: {
                        select: { id: true, nome: true }
                    }
                }
            });

            return res.status(201).json(novoBem);
        } catch (erro) {
            console.error("[BENS_PERMANENTES_CREATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao cadastrar bem permanente." });
        }
    }

    /**
     * Atualiza dados de um bem permanente existente.
     */
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { numeroPatrimonio, descricao, setorId, status } = req.body;

            const bemAtual = await prisma.bemPermanente.findUnique({
                where: { id: parseInt(id) }
            });

            if (!bemAtual) {
                return res.status(404).json({ erro: "Bem permanente não encontrado." });
            }

            // Se o patrimônio for alterado, verifica se novo número já pertence a outro registro
            if (numeroPatrimonio && numeroPatrimonio !== bemAtual.numeroPatrimonio) {
                const outroExistente = await prisma.bemPermanente.findUnique({
                    where: { numeroPatrimonio: String(numeroPatrimonio).trim() }
                });

                if (outroExistente) {
                    return res.status(400).json({ 
                        erro: `O número de patrimônio "${numeroPatrimonio}" já está em uso por outro bem.` 
                    });
                }
            }

            const bemAtualizado = await prisma.bemPermanente.update({
                where: { id: parseInt(id) },
                data: {
                    numeroPatrimonio: numeroPatrimonio ? String(numeroPatrimonio).trim() : undefined,
                    descricao: descricao || undefined,
                    setorId: setorId ? parseInt(setorId) : undefined,
                    status: status || undefined
                },
                include: {
                    setor: true,
                    usuarioRegistro: {
                        select: { id: true, nome: true }
                    }
                }
            });

            return res.status(200).json(bemAtualizado);
        } catch (erro) {
            console.error("[BENS_PERMANENTES_UPDATE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao atualizar bem permanente." });
        }
    }

    /**
     * Remove um bem permanente do sistema.
     */
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            await prisma.bemPermanente.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({ mensagem: "Bem permanente removido com sucesso." });
        } catch (erro) {
            console.error("[BENS_PERMANENTES_DELETE_ERROR]", erro);
            return res.status(500).json({ erro: "Erro ao excluir bem permanente." });
        }
    }
}

module.exports = BensPermanentesController;
