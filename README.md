# MazeQuest Arcade

<p align="center">
  <strong>Jogo de labirinto procedural com estética cyberpunk, desenvolvido com TypeScript, HTML5 Canvas e React.</strong>
</p>

<p align="center">
  Geração procedural • A* Pathfinding • Gamificação • Web Audio • Progressão local
</p>

---

## Sobre o projeto

**MazeQuest Arcade** é um jogo de labirinto para navegador inspirado em estética retrô-futurista, arcade e synthwave.

O projeto foi estruturado separando a lógica do jogo da interface.

O gameplay, a geração procedural do labirinto, a movimentação, o pathfinding, os efeitos e o loop principal são executados com **TypeScript + HTML5 Canvas**.

O **React** é responsável pela interface externa do jogo, incluindo HUD, progressão, loja, leaderboard, conquistas e navegação.

O projeto também funciona como laboratório para estudar e aplicar conceitos de:

- arquitetura de software
- geração procedural
- algoritmos de busca
- gamificação
- game loops
- persistência local
- desenvolvimento de jogos para web

---

## Funcionalidades

### Geração procedural de labirintos

Cada labirinto é criado dinamicamente utilizando um algoritmo baseado em **Depth-First Search (DFS)**.

Além do caminho principal, conexões adicionais podem ser criadas entre células para gerar rotas alternativas e evitar labirintos excessivamente lineares.

---

### A* Pathfinding

O jogo possui uma implementação do algoritmo **A\*** para encontrar o melhor caminho entre o jogador e a saída.

O sistema utiliza distância de Manhattan como heurística.

O pathfinding é utilizado principalmente no sistema de dicas.

---

### Game Engine com Canvas

O núcleo do jogo roda independentemente do React utilizando:

- HTML5 Canvas
- TypeScript
- `requestAnimationFrame`
- movimentação baseada em grid
- colisões
- partículas
- gerenciamento de estado
- renderização do labirinto
- controle do jogador

O React não controla diretamente o loop principal do jogo.

---

### Progressão do jogador

O projeto possui um sistema de progressão persistente com:

- XP
- níveis
- créditos
- pontuação
- orbes coletáveis
- estatísticas
- skins
- temas
- itens cosméticos

Atualmente os dados são salvos localmente no navegador.

---

### Conquistas

O jogador pode desbloquear conquistas com base em diferentes condições e marcos de progressão.

---

### Loja

Os créditos obtidos durante as partidas podem ser utilizados para liberar personalizações visuais.

Entre elas:

- skins do jogador
- paletas neon
- temas do labirinto

---

### Leaderboard local

As partidas finalizadas são armazenadas em um ranking contendo informações como:

- jogador
- dificuldade
- tempo
- pontuação

Atualmente o leaderboard utiliza armazenamento local no navegador.

A arquitetura permite posteriormente migrar essa persistência para uma API e banco de dados.

---

### Áudio procedural

Os efeitos sonoros do jogo são gerados dinamicamente através da **Web Audio API**.

Isso permite criar feedback sonoro sem depender obrigatoriamente de arquivos externos de áudio.

---

### Controles

O jogo possui suporte para:

- setas do teclado
- WASD
- controles mobile
- D-Pad virtual

---

# Arquitetura

```text
┌───────────────────────────────────────────────┐
│                  React UI                     │
│                                               │
│ HUD • Loja • Leaderboard • Conquistas        │
│ Progressão • Navegação • Controles           │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│              GameContainer                    │
│                                               │
│       Integração React ↔ Canvas Engine        │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                 Game Engine                   │
│                                               │
│        TypeScript + HTML5 Canvas              │
│                                               │
│ Game Loop • Movimento • Renderização • State │
│ Partículas • Score • Colisão • Controles     │
└─────────────┬───────────────────────┬─────────┘
              │                       │
              ▼                       ▼
┌───────────────────────┐   ┌───────────────────┐
│ Gerador Procedural    │   │   A* Pathfinder   │
│                       │   │                   │
│         DFS           │   │ Manhattan         │
│                       │   │ Heuristic         │
└───────────────────────┘   └───────────────────┘
              │
              ▼
┌───────────────────────────────────────────────┐
│                Local Storage                  │
│                                               │
│ Progressão • Ranking • Skins • Temas         │
└───────────────────────────────────────────────┘
