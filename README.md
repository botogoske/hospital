# Hospital

Aplicação Next.js com Prisma e SQLite.

## Desenvolvimento

Instale as dependências e crie o banco SQLite:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

O banco padrão usa `DATABASE_URL=file:./dev.db` e fica na raiz do projeto.
Defina `DATABASE_URL` para usar outro caminho.

## Importação do PostgreSQL

Para preservar os dados existentes, pare as gravações no PostgreSQL e aplique
as migrações em um banco SQLite novo:

```bash
pnpm db:migrate
```

Depois execute o importador com as duas conexões configuradas:

```bash
DATABASE_URL=file:./dev.db \
SOURCE_DATABASE_URL=postgresql://usuario:senha@host:5432/banco \
pnpm db:import-postgres
```

O importador preserva IDs e falha se qualquer tabela do destino já tiver dados.
Faça backup do PostgreSQL antes do corte e mantenha as gravações pausadas até a
validação da importação.
