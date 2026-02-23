# 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade
**Título do TCC:** Refatoração arquitetural da plataforma Micélio para ganhos de escalabilidade e manutenibilidade
**Alunos:** Emmanuel Dickson Teye
*Semestre de Defesa:** 2025-2 
[PDF do TCC](https://www.overleaf.com/read/xymvjhpykdmw#313594)

# TL;DR

Para executar rapidamente o sistema em sua máquina local:

### 1. Clonar o repositório
```bash
git clone https://github.com/EIC-BCC/25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade.git
cd 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade

### Backend
```bash
cd MicelioAPI
npm install
npm run dev
### Frontend
cd MicelioDashboardNext
npm run dev

# Descrição Geral

Este projeto consiste na refatoração arquitetural da plataforma Micélio utilizando o framework Next.js, com foco em aprimorar desempenho, escalabilidade, manutenção e organização estrutural. O trabalho envolveu a modernização de componentes, correção de funcionalidades existentes, adoção de Server-Side Rendering, reorganização de módulos e implementação de técnicas como Edge Functions e connection pooling para otimização de acesso ao banco de dados.

# Funcionalidades

* Migração completa para Next.js
   * Reestruturação de componentes
   * Uso de SSR 
   * Modularização
* Implementação de Edge Function
   * Dados em tempo real com baixa latência
   * Redução de carga no servidor principal
* Connection Pooling no banco de dados
   * Reutilização de conexões
   * Menor latência
   * Proteção contra excesso de conexões
* Novos cards informativos no painel
   * Métricas de sessões, jogos, grupos e usuários online
* Correção de problemas herdados
   * Carregamento de sessões
   * Configurações de visualizações
   * Renderização de componentes

# Arquitetura

A arquitetura refatorada da plataforma Micélio foi reorganizada para separar responsabilidades, otimizar fluxo de dados e melhorar manutenção. O sistema é composto por:

* Frontend em Next.js (SSR + SPA híbrido)
* Edge Function para processamento rápido
* API interna para consultas
* Banco de dados com connection pooling

```mermaid
graph TD;
    User-->NextJS;
    NextJS-->EdgeFunction;
    NextJS-->API;
    API-->Database;
    EdgeFunction-->Database;

# Dependências

* Node.js
* Next.js
* Edge Functions (Vercel)
* MySQL(Banco de dados relacional)
* Connection Pooling
* React

# Execução

### 1. Clonar o repositório
```bash
git clone https://github.com/EIC-BCC/25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade.git
cd 25_2-Refatoracao-arquitetural-da-plataforma-Micelio-para-ganhos-de-escalabilidade-e-manutenibilidade

 2. Backend
cd MicelioAPI
npm install
npm run dev

 3. Frontend
cd MicelioDashboardNext
npm install
npm run dev

