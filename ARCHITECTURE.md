# Arquitetura de Integração e Portabilidade

O **MazeQuest Arcade** foi estruturado com desacoplamento rigoroso entre a camada de apresentação e a camada lógica/dados, permitindo que a mesma lógica alimente diferentes clientes ou se integre a backends distribuídos.

## 1. Contrato da API REST (Para consumo via Flutter ou Unreal Engine)

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/v1/mazes/generate` | `POST` | Gera as matrizes de células com sementes reproduzíveis |
| `/api/v1/leaderboard` | `GET` | Recupera as pontuações e tempos globais ordenados |
| `/api/v1/leaderboard` | `POST` | Envia score assinado com validação anti-cheat |
| `/api/v1/player/profile` | `GET` | Retorna nível, XP, créditos e inventário de skins |
| `/api/v1/player/achievements` | `POST` | Desbloqueia e persiste novas insígnias de conquista |

## 2. Esquema Relacional PostgreSQL

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    credits INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE leaderboard_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL,
    score INT NOT NULL,
    time_ms INT NOT NULL,
    moves_count INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_diff_score ON leaderboard_records(difficulty, score DESC);
```

## 3. Observabilidade e Datadog
Para monitorar a saúde da API sob carga de multiplayer ou de requisições de ranking:
- Métricas de latência em milissegundos para cálculo de rota do A*;
- Logs estruturados no padrão JSON via Winston;
- Rastreamento distribuído (APM) integrado com `dd-trace`.
