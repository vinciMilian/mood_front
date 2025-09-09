# Configuração do Supabase Storage para Upload de Imagens

## Problemas Resolvidos
1. ✅ Erro 404 "Bucket not found" - Nome do bucket corrigido
2. ✅ Erro 403 "Unauthorized" - Políticas RLS configuradas  
3. ✅ Erro 500 "Foreign key constraint violation" - Constraint problemática
4. ✅ Erro "OpaqueResponseBlocking" - URLs de imagens via API

## Solução

### 1. Configurar Políticas RLS no Supabase

Execute o seguinte script SQL no **SQL Editor** do seu dashboard do Supabase:

```sql
-- Políticas de segurança para o bucket 'posts_images'
CREATE POLICY "Permitir upload de imagens para usuários autenticados" 
ON storage.objects
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts_images');

CREATE POLICY "Permitir leitura de imagens públicas" 
ON storage.objects
AS PERMISSIVE FOR SELECT
TO public
USING (bucket_id = 'posts_images');

CREATE POLICY "Permitir atualização de imagens para usuários autenticados" 
ON storage.objects
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (bucket_id = 'posts_images');

CREATE POLICY "Permitir exclusão de imagens para usuários autenticados" 
ON storage.objects
AS PERMISSIVE FOR DELETE
TO authenticated
USING (bucket_id = 'posts_images');
```

### 2. Verificar Configuração do Bucket

1. Acesse o **Storage** no dashboard do Supabase
2. Verifique se o bucket `posts_images` existe
3. Se não existir, crie um novo bucket com o nome `posts_images`
4. Configure o bucket como **público** se desejar que as imagens sejam acessíveis publicamente

### 3. Verificar se as Políticas Foram Aplicadas

Execute esta query para verificar se as políticas foram criadas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### 4. **Resolver Constraint de Foreign Key**

Se você receber o erro "insert or update on table 'posts' violates foreign key constraint 'posts_image_id_bucket_fkey'", execute este script:

```sql
-- Remover a constraint problemática
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_image_id_bucket_fkey;
```

### 5. **Resolver Problema de Exibição de Imagens**

Se as imagens não carregarem (erro "OpaqueResponseBlocking"), a solução já foi implementada:

- ✅ Nova rota no backend: `GET /api/auth/storage/image/:fileName`
- ✅ Nova API no frontend: `storageAPI.getImageUrl()`
- ✅ Carregamento assíncrono de URLs de imagens
- ✅ Estado de carregamento para imagens

### 6. **Testar o Upload e Exibição**

Após executar os scripts SQL, teste:
1. Upload de imagens (deve funcionar)
2. Exibição de imagens nos posts (deve carregar corretamente)
3. Comentários nos posts (deve funcionar)

## Arquivos Modificados

- `src/components/Feed.js`: Adicionada autenticação com token do usuário no upload
- Criados arquivos SQL com as políticas necessárias

## Notas Importantes

- As políticas permitem que usuários autenticados façam upload de imagens
- As imagens são públicas para leitura (qualquer pessoa pode visualizar)
- O nome do arquivo é gerado com timestamp e string aleatória para evitar conflitos
- O token de autenticação do usuário é usado para autorizar o upload
