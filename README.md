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
| `ADMIN_EMAILS`   | opcional          | E-mails com acesso ao painel `/admin` (separados por vírgula). |
| `RESEND_API_KEY` | opcional          | Chave do Resend para enviar e-mails (verificação, redefinição etc.). |
| `EMAIL_FROM`     | opcional          | Remetente dos e-mails (ex.: `ALENTO <contato@seudominio>`).  |
| `GOOGLE_CLIENT_ID` | opcional        | Client ID do OAuth do Google Calendar (por psicólogo).       |
| `GOOGLE_CLIENT_SECRET` | opcional    | Client Secret do OAuth do Google Calendar.                   |
| `GOOGLE_REDIRECT_URI` | opcional      | Redirecionamento OAuth (padrão: `SITE_URL/api/integrations/google/callback`). |

> Sem `RESEND_API_KEY`, o cadastro funciona normalmente (a conta é verificada automaticamente) e
> o envio de e-mail é apenas ignorado (registrado em log) — nada quebra. As telas de confirmação
> de e-mail e de recuperação de senha ficam inertes até a chave ser configurada.

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
| POST   | `/api/auth/register`        | Cria conta de cliente                        |
| POST   | `/api/auth/login`           | Autentica por e-mail e senha               |
| POST   | `/api/auth/logout`          | Encerra a sessão                           |
| POST   | `/api/auth/verify/resend`   | Reenvia o e-mail de confirmação            |
| POST   | `/api/auth/forgot-password` | Envia link de redefinição de senha         |
| POST   | `/api/auth/reset-password`  | Redefine a senha usando o token do link    |
| GET    | `/api/integrations/google/connect`    | Inicia o OAuth do Google (psicólogo)  |
| GET    | `/api/integrations/google/callback`   | Recebe o retorno do OAuth e guarda tokens |
| GET    | `/api/integrations/google/status`     | Estado da conexão Google (auth)       |
| POST   | `/api/integrations/google/disconnect` | Remove a conexão com o Google (auth)  |
| GET    | `/api/appointments`         | Lista as consultas do cliente (auth)       |
| POST   | `/api/appointments`         | Cria um agendamento (auth)                 |
| DELETE | `/api/appointments/:id`     | Cancela um agendamento (auth)              |
| POST   | `/api/applications`         | Registra currículo de psicólogo            |

Todas as rotas de escrita têm limitação de taxa e honeypot (`website`).

## Integração com o Google Agenda

Cada psicólogo pode conectar a própria conta Google em **Minha agenda → Google Agenda**.

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a
   **Google Calendar API**.
2. Em *Credenciais*, crie um **ID do cliente OAuth** do tipo *Aplicativo da Web* e cadastre a
   URI de redirecionamento autorizada:
   `https://SEU-DOMINIO/api/integrations/google/callback`
3. Defina `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (e, se quiser, `GOOGLE_REDIRECT_URI`).
4. Na tela OAuth consent, adicione os escopos `calendar.events` e `calendar.readonly`.

Escopos usados: `calendar.events` (ler/criar/remover eventos) e `calendar.readonly` (free/busy),
com `access_type=offline` para receber o *refresh token*. Os tokens ficam na tabela
`al_google_accounts`, uma linha por psicólogo, e o `access_token` é renovado automaticamente.

> Sem `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, o cartão aparece como "integração indisponível" e
> nada quebra. As funções `fetchGoogleBusy` (ler ocupados) e `createGoogleEvent`/`deleteGoogleEvent`
> (criar/remover sessões) estão prontas em `lib/google.ts`.

## Provedores de agenda

Toda integração de agenda implementa a mesma interface `CalendarProvider`
(`lib/calendar/types.ts`): `listBusy`, `createEvent` e `deleteEvent`. O resto do sistema fala só
com essa interface, então trocar ou adicionar um provedor não exige retrabalho.

| Provedor | Arquivo                 | Quando usar                                            |
| -------- | ----------------------- | ------------------------------------------------------ |
| `google` | `lib/calendar/google.ts` | Google Agenda via OAuth (padrão)                       |
| `api`    | `lib/calendar/api.ts`    | API HTTP externa (ex.: agenda de um parceiro)          |
| `mock`   | `lib/calendar/mock.ts`   | Desenvolvimento/teste, sem depender de API externa     |

O provedor ativo vem de `AGENDA_PROVIDER` (`google`, `api` ou `mock`). Se não definido: usa `api`
quando `AGENDA_API_URL` existir, senão `google`. O contrato esperado para a API externa está
documentado em `.env.example` (`/busy`, `/events`).

A leitura de ocupados já está ligada ao cálculo de vagas (`lib/availability.ts`): os horários
ocupados na agenda externa são removidos da disponibilidade. Para testar sem nenhuma API real:

```
AGENDA_PROVIDER=mock
AGENDA_MOCK_BUSY=[{"start":"2026-11-18T09:00:00-03:00","end":"2026-11-18T10:00:00-03:00"}]
```

## Segurança

- Senhas com `scrypt` (salt por usuário) e comparação em tempo constante.
- Sessão em cookie `httpOnly`, `sameSite=lax` e `secure` em produção.
- Consultas sempre parametrizadas.
- Sigilo e avisos de crise (CVV 188 / SAMU 192) no rodapé.
