# Contratos consumidos pelo frontend

Base: `{API_URL}/{API_PREFIX}`, por padrão `http://localhost:3001/api/v1`.

Swagger do backend: `http://localhost:3001/docs`.

A lista abaixo foi conferida no código do NestJS em `business-manager-v1`. O frontend não trata endpoint ausente como se existisse.

## Verificados e integrados

| Método | Caminho | Uso |
| --- | --- | --- |
| POST | `/auth/register` | Cria o negócio e a sessão |
| POST | `/auth/login` | Entra com e-mail e senha |
| POST | `/auth/forgot-password` | Pede o link de redefinição. A resposta é sempre genérica |
| POST | `/auth/reset-password` | Define a nova senha com o token do e-mail. Não cria sessão |
| PATCH | `/auth/change-password` | Troca a senha da sessão atual e revoga todas as sessões |
| POST | `/auth/refresh` | Renova os tokens no servidor |
| POST | `/auth/logout` | Encerra a sessão |
| GET | `/auth/me` | Usuário, papel, permissões e tipo de negócio |
| GET | `/tenants/current` | Negócio atual |
| PATCH | `/tenants/current` | Nome, documento, e-mail, telefone, fuso e moeda |
| GET | `/dashboard` | Indicadores do período |
| GET, POST, PATCH | `/customers` e `/customers/:id` | Clientes |
| GET | `/customers/:id/history` | Histórico do cliente |
| PATCH | `/customers/:id/activate` e `/deactivate` | Status |
| GET | `/users/roles` | Papéis e permissões |
| GET, POST, PATCH | `/users` e `/users/:id` | Usuários |
| PATCH | `/users/:id/activate` e `/deactivate` | Status |
| GET, POST, PATCH | `/services` e `/services/:id` | Serviços, inclusive ativação |
| GET, POST, PATCH | `/products` e `/products/:id` | Produtos, inclusive ativação |
| GET, POST | `/sales` | Vendas |
| PATCH | `/sales/:id/cancel` | Cancelamento |
| GET | `/payments/gateways` | Disponibilidade real dos gateways |
| GET, POST | `/payments` e `/payments/:id` | Pagamentos |
| PATCH | `/payments/:id/confirm` e `/cancel` | Pagamento manual |
| POST | `/payments/:id/sync` | Atualiza status no gateway |
| GET, POST, PATCH | `/subscription-plans` | Planos |
| GET, POST | `/subscriptions` | Contratos |
| GET | `/subscriptions/expiring` | Vencimentos |
| POST | `/subscriptions/lifecycle/run` | Expira e dispara lembretes já suportados pela API |
| PATCH | `/subscriptions/:id/renew` e `/cancel` | Renovação e cancelamento |
| GET | `/notifications/channels` | Canais e disponibilidade |
| GET, PUT | `/barbershop/settings` | Horário de funcionamento |
| GET, POST, PATCH | `/barbershop/barbers` | Profissionais |
| PATCH | `/barbershop/barbers/:id/activate` e `/deactivate` | Status |
| GET, POST | `/barbershop/appointments` | Agenda |
| PATCH | `/barbershop/appointments/:id/confirm`, `/complete`, `/no-show`, `/cancel`, `/reschedule` | Transições |
| GET, POST | `/barbershop/commission-rules` | Regras |
| GET | `/barbershop/commissions` | Lançamentos e totais |
| PATCH | `/barbershop/commissions/:id/pay` e `/cancel` | Registro de pagamento ou cancelamento |

Paginação: `{ data, meta: { page, limit, total, totalPages } }`. Valores monetários chegam como string decimal e saem como número nos formulários de escrita.

## Existentes no backend, sem tela

| Método | Caminho | Motivo |
| --- | --- | --- |
| GET | `/audit-logs` | Consulta ainda não exposta na interface |
| GET, PUT | `/barbershop/plans/:planId/benefits` | Benefícios do plano ainda sem tela |
| GET | `/barbershop/subscriptions/:subscriptionId/usage` | Uso do plano ainda sem tela |
| PATCH | `/tenants/current/settings` | Preferências genéricas ainda sem editor |
| GET | `/health` | Uso operacional, não de produto |

## Não existem na API

- Lista de tenants e troca de contexto
- Série temporal ou feed de atividade do painel
- Lista, leitura ou envio de notificações
- Exclusão física de clientes, usuários ou profissionais

## Integrações externas

`GET /payments/gateways` é a fonte da disponibilidade. Enquanto `available` for falso, Asaas, Mercado Pago e Stripe não podem ser selecionados. O gateway manual é o caminho real de registro.

`GET /notifications/channels` informa e-mail, WhatsApp e push. Canal indisponível não envia mensagem e a interface não simula entrega.
