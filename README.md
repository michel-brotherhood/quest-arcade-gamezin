# MazeQuest Arcade 🕹️⚡

Plataforma de jogo retro-futurista e arcade de labirintos procedurais, construída com foco em alto desempenho, modularidade e desacoplamento de framework na lógica central.

## 🚀 Destaques da Arquitetura
- **Engine Core:** Vanilla Canvas 2D + TypeScript puro para o ciclo de renderização e física de partículas, sem React na lógica do jogo.
- **Geração Procedural:** Algoritmo Depth-First Search (DFS) com remoção controlada de paredes para criar caminhos secundários e múltiplos percursos.
- **Pathfinding Inteligente:** Resolução em tempo real via algoritmo A* com cálculo de heurística de Manhattan para suporte ao jogador.
- **Gamificação Completa:**
  - Níveis de jogador e acúmulo de XP;
  - Moedas e créditos obtidos na conclusão de fases e orbes coletadas;
  - Loja de personalização com paletas neon e temas de labirinto;
  - Sistema de insígnias e conquistas;
  - Leaderboard com ordenação por pontuação e tempo.
- **Áudio Sintetizado:** Efeitos sonoros gerados dinamicamente via Web Audio API.
- **Pronto para Docker e Cloud:** Dockerfile otimizado multi-stage e `docker-compose.yml` prontos para deploy.

## 🛠️ Tecnologias Utilizadas
- **Linguagens:** TypeScript, JavaScript, HTML5 Canvas
- **Runtime:** Node.js 22
- **Estilização:** Tailwind CSS & Lucide Icons
- **Conteinerização:** Docker & Docker Compose
- **Design de Dados:** Estrutura pronta para PostgreSQL e integração com clientes externos (Flutter, Unreal Engine).

## 💻 Como Rodar Localmente

```bash
# Instalar dependências
pnpm install

# Iniciar o servidor de desenvolvimento
pnpm dev
```

Abra `http://localhost:3000` no seu navegador para jogar.

## 🐳 Executando com Docker

```bash
docker-compose up --build
```

A aplicação estará acessível em `http://localhost:3000`.

## 📄 Licença
Distribuído sob licença MIT. Livre para modificação e uso pessoal ou comercial.
