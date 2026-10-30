# Migração da aplicação para SQLite

## Intenção

Fazer a aplicação Hospital usar SQLite como banco principal, mantendo o modelo
Prisma e permitindo uma migração única dos dados atualmente armazenados em
PostgreSQL.

## Objetivos

- Usar o adaptador SQLite do Prisma no runtime da aplicação.
- Criar um banco SQLite inicializável por migrações Prisma.
- Preservar os dados e os IDs existentes durante a transferência PostgreSQL →
  SQLite.
- Manter seed, comandos Prisma, documentação e referências de arquitetura
  coerentes com SQLite.
- Validar geração do cliente, migração, seed e build da aplicação.

## Fora do escopo e antiobjetivos

- Não alterar o modelo funcional, nomes de campos ou regras da aplicação sem
  necessidade da compatibilidade SQLite.
- Não manter PostgreSQL como banco de runtime nem adicionar fallback silencioso.
- Não fazer sincronização contínua entre os bancos; a transferência será
  explicitamente única e executada pelo operador.
- Não apagar o banco PostgreSQL de origem nem sobrescrever um arquivo SQLite
  existente sem confirmação explícita.

## Restrições

- O projeto usa Prisma 7 com cliente gerado em `src/generated/prisma`.
- O schema atual contém enums, relações, UUIDs como texto, `DateTime`, campos
  opcionais e histórico de migrações PostgreSQL.
- Não há atualmente um arquivo de exemplo de variáveis de ambiente versionado.
- A conexão de origem e o caminho do SQLite devem ser configuráveis por
  variáveis de ambiente, sem credenciais no repositório.
- O ambiente alvo é local ou um servidor com disco persistente, com uma única
  instância da aplicação.
- O corte poderá pausar as gravações para obter uma cópia consistente.
- O volume esperado é pequeno, até aproximadamente 100 mil registros totais.

## Abordagens consideradas

1. **Migração limpa com adaptador SQLite e importador único (escolhida)**:
   trocar o provider e o adaptador, recriar o histórico de migrações como
   SQLite, e adicionar um comando de importação que lê o PostgreSQL de origem e
   grava no SQLite em ordem de dependências, preservando IDs e valores. É a
   opção mais segura para novos ambientes e atende à preservação de dados sem
   manter PostgreSQL no caminho normal da aplicação.
2. **Trocar somente provider/adaptador e manter as migrações existentes**:
   rejeitada porque as migrações atuais usam enums e tipos `TIMESTAMP` próprios
   do PostgreSQL e não formam um histórico aplicável ao SQLite.
3. **Manter Prisma PostgreSQL e colocar uma camada SQLite paralela**:
   rejeitada porque duplica persistência, mantém o PostgreSQL como dependência
   operacional e cria risco de divergência de dados.

## Decisões de implementação

- O runtime usará `@prisma/adapter-better-sqlite3` com
  `DATABASE_URL=file:./dev.db` por padrão documentado.
- O schema Prisma será convertido para `provider = "sqlite"`; enums serão
  representados pelo suporte compatível do Prisma/SQLite, preservando os
  valores usados pela aplicação.
- O histórico PostgreSQL será substituído por uma migração inicial SQLite
  derivada do schema atual, e o lock registrará SQLite.
- O importador será um comando separado, com conexão de origem configurada por
  `SOURCE_DATABASE_URL` e destino pelo `DATABASE_URL`; executará em transação,
  verificará o banco de origem e recusará qualquer destino não vazio.
- O importador assumirá uma janela de manutenção com gravações pausadas e
  documentará essa pré-condição; não tentará sincronização best-effort.
- O arquivo SQLite será persistido no disco local/volume configurado. A
  aplicação será documentada para uma única instância; múltiplas instâncias e
  armazenamento efêmero não serão suportados.
- A dependência PostgreSQL, se necessária exclusivamente pelo importador, ficará
  isolada do runtime e será removida quando o importador usar uma forma
  independente do driver; a implementação deve preferir não carregar `pg` no
  servidor Next.js.
- O seed continuará sendo idempotente apenas no sentido atual de limpar as
  tabelas antes de recriar os dados de demonstração; ele não será usado como
  mecanismo de migração de produção.

## O que falta ao construtor

- Implementar a troca de dependências e adaptadores.
- Gerar e validar a migração SQLite.
- Implementar e documentar o comando de transferência, incluindo ordem de
  tabelas, preservação de IDs e tratamento explícito de erro.
- Atualizar `.env`/README e os arquivos de arquitetura que mencionam
  PostgreSQL.
- Executar validações focadas e registrar limitações caso uma instância
  PostgreSQL real não esteja disponível no ambiente.
