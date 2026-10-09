# ALENTO — clínica de psicologia

Site e plataforma de uma clínica de psicologia fictícia: landing minimalista, diretório de
psicólogos, área do cliente com login (agendamento e gestão de consultas) e página de
candidatura para psicólogos enviarem o currículo.

> Projeto demonstrativo. Nomes, CRP, endereço, telefone e CNPJ são fictícios.

## Funcionalidades

- **Landing** clara e minimalista (tema branco, acento verde-sálvia), com abordagens,
  passo a passo, time e FAQ.
- **Diretório de psicólogos** com filtro por abordagem e por modalidade (online/presencial).
- **Conta do cliente**: cadastro e login com sessão em cookie `httpOnly`.
- **Agendamento**: escolha do psicólogo, data, horário e modalidade, com bloqueio de
  horários já ocupados (índice único no banco).
- **Minha conta**: lista das sessões, próxima consulta e cancelamento.
- **Quero atender**: formulário de envio de currículo para psicólogos.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- Tailwind CSS 4 (tokens via `@theme`)
- PostgreSQL (`pg`) com fallback automático
- TypeScript, ESLint

## Banco de dados e armazenamento

A camada em `lib/db.ts` escolhe o backend sozinha:

1. **Postgres** — quando `POSTGRES_URL` (ou `DATABASE_URL`) está definida. O schema é criado
   na primeira consulta (`CREATE TABLE IF NOT EXISTS`).
2. **Arquivo local** — no dev sem Postgres, grava em `.alento-data.json`.
3. **Memória** — na Vercel sem Postgres (dados não persistem entre instâncias).

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

| Variável         | Obrigatória       | Descrição                                                    |
| ---------------- | ----------------- | ------------------------------------------------------------ |
| `POSTGRES_URL`   | produção          | String de conexão do Postgres. Sem ela, usa arquivo/memória. |
| `SESSION_SECRET` | produção          | Reservado para assinar sessões em múltiplas instâncias.      |
| `SITE_URL`       | recomendada       | URL pública do site (metadata, sitemap, robots).             |

> No dev, sem `POSTGRES_URL`, tudo funciona com o arquivo local — inclusive o login, pois a
> sessão fica na tabela/arquivo `sessions`.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint     # ESLint
```

## Rotas de API

| Método | Rota                        | Descrição                                  |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/api/health`               | Status e backend de armazenamento          |
| POST   | `/api/auth/register`        | Cria conta de cliente e inicia sessão      |
| POST   | `/api/auth/login`           | Autentica por e-mail e senha               |
| POST   | `/api/auth/logout`          | Encerra a sessão                           |
| GET    | `/api/appointments`         | Lista as consultas do cliente (auth)       |
| POST   | `/api/appointments`         | Cria um agendamento (auth)                 |
| DELETE | `/api/appointments/:id`     | Cancela um agendamento (auth)              |
| POST   | `/api/applications`         | Registra currículo de psicólogo            |

Todas as rotas de escrita têm limitação de taxa e honeypot (`website`).

## Segurança

- Senhas com `scrypt` (salt por usuário) e comparação em tempo constante.
- Sessão em cookie `httpOnly`, `sameSite=lax` e `secure` em produção.
- Consultas sempre parametrizadas.
- Sigilo e avisos de crise (CVV 188 / SAMU 192) no rodapé.
