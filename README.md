# KODA Business Manager

Frontend da plataforma KODA: gestão empresarial com um núcleo compartilhado e módulos por segmento. A primeira configuração de negócio é a barbearia. A identidade visual já existente permanece em `/marca`.

## Tecnologias

- Next.js 16, React 19 e TypeScript
- Tailwind CSS 4, com os tokens da KODA
- React Hook Form e Zod
- TanStack Query
- Lucide

## Requisitos

- Node.js 22 ou superior
- API NestJS da KODA em execução

## Instalação

```bash
npm install
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Ambiente

| Variável | Uso |
| --- | --- |
| `API_URL` | Origem do backend, lida apenas no servidor. Padrão `http://localhost:3001`. |
| `API_PREFIX` | Prefixo global. Padrão `api/v1`. |

O frontend sobe em `http://localhost:3000`. A API precisa usar outra porta, normalmente `3001`, para não colidir.

Swagger, quando habilitado no backend: `http://localhost:3001/docs`.

## Executar

```bash
npm run dev
```

- `/` entra no produto: painel se houver sessão, senão login.
- `/marca` mantém a apresentação da identidade visual.
- `/login` e `/register` autenticam na API.

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run generate:logos` recria os SVG da marca. As fontes ficam em `scripts/.cache`, fora do Git.

## Autenticação

A API devolve access token e refresh token no corpo da resposta. O navegador não os armazena. As rotas `/api/auth/*` gravam os tokens em cookies `HttpOnly` (`koda_access` e `koda_refresh`, `SameSite=Lax`, `Secure` em produção). As telas chamam `/api/backend/...`, que anexa o Bearer e renova a sessão uma vez quando o access token expira.

Não há recuperação de senha: a API não oferece esse endpoint.

## Multi-tenancy

O tenant vem do usuário autenticado (`GET /auth/me` e `GET /tenants/current`). Não existe endpoint para listar ou trocar de negócio, então a interface mostra o negócio atual e não envia um `tenantId` escolhido pelo cliente. Sair encerra a sessão no backend e apaga os cookies.

## Organização

- `src/app/(app)` — área autenticada
- `src/modules` — telas por domínio
- `src/config/navigation.ts` — rotas do core e dos módulos, com permissão e segmento
- `src/lib/api` — comunicação com o backend
- `src/components/ui` e `src/components/brand` — identidade visual preservada

O core cobre painel, clientes, serviços, produtos, vendas, pagamentos, assinaturas, usuários, notificações e configurações. Barbearia acrescenta profissionais, agenda, horários e comissões. Um segmento futuro entra na navegação por módulo, sem espalhar o tipo de negócio pelos componentes.

## Funcionalidades

Implementadas sobre os contratos existentes:

- Login, cadastro de negócio, logout, renovação de sessão e rotas privadas
- Painel com os indicadores agregados da API
- Clientes, usuários, serviços, produtos e vendas
- Pagamentos, com gateways indisponíveis bloqueados
- Planos e assinaturas, incluindo renovação e cancelamento reais
- Profissionais, agenda, horários da barbearia e comissões
- Consulta de disponibilidade dos canais de notificação

## Pendências

- Recuperação de senha e troca de senha de usuário existente
- Lista de negócios e troca de tenant
- Série histórica e atividade recente no painel
- Histórico e envio de notificações
- Cobrança Asaas, Mercado Pago e Stripe
- Entrega por e-mail, WhatsApp e push
- Tela de auditoria e benefícios de plano da barbearia
- Módulos de salão, varejo e serviços

Os contratos estão em `docs/api-contracts.md`. A marca está em `docs/brand-guidelines.md`.
