# UserContext - Exibição de Dados do Usuário

O `UserContext` é um contexto React criado para buscar e exibir os dados do usuário da tabela `usersData` do banco de dados. Ele complementa o `AuthContext` fornecendo funcionalidades específicas para acessar e formatar dados do perfil do usuário.

## Características

- **Foco específico**: Busca e exibe dados da tabela `usersData`
- **Sincronização automática**: Mantém dados sincronizados com localStorage
- **Apenas leitura**: Focado na exibição de dados (sem edição)
- **Estados de loading**: Gerencia estados de carregamento e erro
- **Funções utilitárias**: Fornece funções para formatação de dados

## Como Usar

### 1. Importar o Hook

```javascript
import { useUser } from '../contexts/UserContext';
```

### 2. Usar em Componentes

```javascript
function MeuComponente() {
    const { 
        userData, 
        loading, 
        error, 
        getUserDisplayName, 
        getUserInitial, 
        getUserCreatedAt,
        updateDisplayName,
        refreshUserData 
    } = useUser();

    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div>
            <h1>{getUserDisplayName()}</h1>
            <p>Inicial: {getUserInitial()}</p>
            <p>Membro desde: {getUserCreatedAt()}</p>
        </div>
    );
}
```

## API do UserContext

### Estados

- **`userData`**: Objeto com dados do usuário da tabela `usersData`
- **`loading`**: Boolean indicando se está carregando
- **`error`**: String com mensagem de erro (se houver)

### Funções de Dados

- **`getUserDisplayName()`**: Retorna o nome de exibição do usuário
- **`getUserInitial()`**: Retorna a primeira letra do nome (para avatar)
- **`getUserCreatedAt()`**: Retorna data de criação formatada em português

### Funções de Operação

- **`fetchUserData(token)`**: Busca dados do usuário do servidor
- **`refreshUserData()`**: Recarrega dados do servidor
- **`setError(error)`**: Define mensagem de erro

## Exemplo de Uso Completo

```javascript
import React from 'react';
import { useUser } from '../contexts/UserContext';

function UserProfile() {
    const { 
        userData, 
        loading, 
        error, 
        getUserDisplayName,
        getUserCreatedAt,
        getUserInitial
    } = useUser();

    if (loading) return <div>Carregando perfil...</div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div>
            <h2>Perfil do Usuário</h2>
            <div className="user-avatar">
                {getUserInitial()}
            </div>
            <p><strong>Nome:</strong> {getUserDisplayName()}</p>
            <p><strong>Membro desde:</strong> {getUserCreatedAt()}</p>
            <p><strong>ID:</strong> {userData?.user_id_reg}</p>
        </div>
    );
}
```

## Integração com AuthContext

O `UserContext` trabalha em conjunto com o `AuthContext`:

- **AuthContext**: Gerencia autenticação e dados básicos do Supabase Auth
- **UserContext**: Gerencia dados específicos da tabela `usersData`

### Estrutura de Dados

```javascript
// AuthContext fornece:
{
    id: "user-id",
    email: "user@email.com",
    user_metadata: {...}
}

// UserContext fornece:
{
    user_id_reg: "user-id",
    displayName: "Nome do Usuário",
    created_at: "2025-09-06T18:33:30.392399+00:00"
}
```

## Configuração

O `UserContext` é automaticamente configurado no `App.js`:

```javascript
function App() {
    return (
        <AuthProvider>
            <UserProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </UserProvider>
        </AuthProvider>
    );
}
```

## Vantagens

1. **Separação de responsabilidades**: Auth vs User data
2. **Reutilização**: Funções utilitárias disponíveis em qualquer componente
3. **Sincronização**: Dados sempre atualizados entre componentes
4. **Performance**: Carregamento otimizado e cache local
5. **Simplicidade**: Focado apenas na exibição de dados
6. **Manutenibilidade**: Código organizado e fácil de manter
