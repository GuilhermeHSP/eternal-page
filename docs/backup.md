# Backup do banco de dados

Todas as homenagens, pedidos e pagamentos ficam num único arquivo SQLite no volume do Railway
(`DATABASE_URL`, hoje `/data/custom.db`). O site faz backup dele sozinho.

## Como funciona

- Uma vez por hora o servidor confere se o backup mais recente tem mais de 24 horas. Se tiver (ou
  se não houver nenhum), tira uma cópia consistente com `VACUUM INTO`, que é segura mesmo com o
  site gravando, compacta com gzip e envia para o R2 em `backups/`.
- Backups com mais de 30 dias são apagados, mas os 7 mais recentes nunca são.
- O primeiro teste acontece 2 minutos depois de cada deploy, então um backup novo aparece logo
  depois do primeiro deploy com este código.
- Vai para o bucket `R2_BACKUP_BUCKET` se essa variável existir; senão, para o mesmo `R2_BUCKET`
  das fotos. O nome de cada arquivo tem uma parte aleatória longa, para ninguém conseguir adivinhar
  o endereço pelo domínio público do bucket. Um bucket separado, sem acesso público, é ainda melhor.
- Código: `src/lib/backup.ts`. Nos logs do Railway aparece `Database backup saved: backups/...`
  ou `Database backup failed: ...`.

## Ver os backups ou fazer um agora

Com a senha de admin (`ADMIN_PASSWORD`):

```sh
# listar
curl -H "x-admin-key: $ADMIN_PASSWORD" https://eternalpage.com.br/api/admin/backup
# fazer um backup agora (por exemplo antes de uma mudança arriscada)
curl -X POST -H "x-admin-key: $ADMIN_PASSWORD" https://eternalpage.com.br/api/admin/backup
```

Também dá para ver e baixar os arquivos no painel da Cloudflare, em R2, pasta `backups/`.

## Restaurar

O script `scripts/restore-backup.ts` usa as mesmas variáveis `R2_*` do Railway.

### Conferir um backup no seu computador

Com as variáveis `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` e `R2_BUCKET` no
ambiente:

```sh
npx tsx scripts/restore-backup.ts list
npx tsx scripts/restore-backup.ts download latest ./backup.db
```

O `download` confere a integridade do arquivo e mostra quantas homenagens ele tem. Sem script,
também funciona baixar o `.db.gz` pelo painel da Cloudflare e rodar `gunzip`.

### Restaurar em produção

1. Escolha o backup: `npx tsx scripts/restore-backup.ts list` (ou `latest` para o mais recente).
2. Entre no serviço: `railway ssh` (CLI do Railway, projeto `skillful-vibrancy`, serviço
   `eternal-page`).
3. Lá dentro, rode `npx tsx scripts/restore-backup.ts restore <chave-ou-latest>`. O script baixa,
   confere a integridade e só então troca o arquivo. O banco atual fica guardado ao lado como
   `custom.db.before-restore-<data>`.
4. Reinicie o serviço no Railway logo em seguida. O que for gravado entre a troca e o reinício se
   perde, então faça isso num momento calmo.
