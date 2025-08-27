# Scripts de Administração

Este diretório contém scripts úteis para administrar o sistema BAR DO CARNEIRO.

## 📁 Arquivos Disponíveis

### 1. `limpar-funcionarios.js`
- **Função**: Remove todos os funcionários existentes do banco de dados
- **Uso**: Útil para limpar dados de teste ou resetar o sistema

### 2. `configurar-admin.js`
- **Função**: Configura o perfil do usuário administrador
- **Uso**: Define nome e email padrão para o usuário com cargo "dono"

### 3. `limpar-e-configurar.js`
- **Função**: Script principal que executa ambos os scripts acima
- **Uso**: Recomendado para uso geral

## 🚀 Como Executar

### Opção 1: Executar script principal (Recomendado)
```bash
cd server/scripts
node limpar-e-configurar.js
```

### Opção 2: Executar scripts individualmente
```bash
cd server/scripts

# Limpar funcionários
node limpar-funcionarios.js

# Configurar administrador
node configurar-admin.js
```

## 📋 O que os Scripts Fazem

### 🧹 Limpeza dos Funcionários
1. Lista todos os funcionários existentes
2. Remove todos os funcionários do banco
3. Exibe relatório da operação

### 👑 Configuração do Administrador
1. Busca o usuário com cargo "dono"
2. Atualiza nome para "Administrador BAR DO CARNEIRO" (se vazio)
3. Atualiza email para "admin@bardocarneiro.com" (se vazio)
4. Exibe perfil configurado

## ⚠️ Importante

- **Backup**: Sempre faça backup do banco antes de executar scripts de limpeza
- **Permissões**: Apenas usuários com cargo "dono" podem executar estes scripts
- **Dados**: Os dados removidos não podem ser recuperados

## 🔧 Personalização

Para personalizar os valores padrão, edite os arquivos:
- `configurar-admin.js`: Altere o nome e email padrão
- `limpar-funcionarios.js`: Modifique a lógica de limpeza se necessário

## 📞 Suporte

Em caso de problemas, verifique:
1. Se o banco de dados está acessível
2. Se as tabelas existem e estão corretas
3. Se há usuário com cargo "dono" no sistema
