# Configuração do Bucket Supabase Storage

## Problema Atual
Erro "OpaqueResponseBlocking" ao tentar carregar imagens do bucket `posts_images`.

## Soluções Implementadas

### 1. **URLs Assinadas (Recomendado)**
- O código agora usa URLs assinadas do Supabase
- Mais seguro e confiável
- Funciona mesmo com buckets privados

### 2. **Configuração do Bucket como Público**

Se você quiser usar URLs públicas diretas, configure o bucket como público:

1. **Acesse o Supabase Dashboard**
2. **Vá para Storage**
3. **Clique no bucket `posts_images`**
4. **Nas configurações, marque como "Public"**

### 3. **Verificar Políticas RLS**

Execute este SQL no Supabase:

```sql
-- Verificar se o bucket existe e está público
SELECT * FROM storage.buckets WHERE name = 'posts_images';

-- Se não existir, criar o bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts_images', 'posts_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### 4. **Políticas RLS para Bucket Público**

Se o bucket for público, execute:

```sql
-- Políticas para bucket público
CREATE POLICY "Permitir leitura pública de imagens" 
ON storage.objects
AS PERMISSIVE FOR SELECT
TO public
USING (bucket_id = 'posts_images');

CREATE POLICY "Permitir upload para usuários autenticados" 
ON storage.objects
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts_images');
```

## Teste

1. Reinicie o servidor backend
2. Recarregue a página
3. Verifique o console do navegador para logs de debug
4. Teste o upload e exibição de imagens

## Logs de Debug

O código agora inclui logs detalhados no console:
- "Loading image URL for post: [ID] image: [filename]"
- "Signed URL created: [URL]" ou "Error creating signed URL: [error]"

Verifique esses logs para diagnosticar o problema.
