# Estrutura do MazeQuest Arcade

```
client/
  src/
    game/
      audio.ts          # Efeitos sonoros procedurais via Web Audio API
      generator.ts      # Geração de labirintos via Depth-First Search + nós extras
      pathfinder.ts     # Resolução de rota via algoritmo A* com cálculo de heurística
      storage.ts        # Gerenciamento de progresso, XP, rankings e cosméticos
      types.ts          # Definições de tipos (labirinto, jogador, estatísticas)
      engine.ts         # Loop principal, partículas, renderizador canvas e estado
    components/
      GameContainer.tsx # Container de montagem do Canvas com painéis e controles
    pages/
      Home.tsx          # Tela principal com HUD, abas de leaderboard, loja e conquistas
```
