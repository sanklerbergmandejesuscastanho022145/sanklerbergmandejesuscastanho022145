# PET MAISPERTO MATO GROSSO
### 👤 Dados de Inscrição
Nome: Sankler Bergman de Jesus Castanho
Email: sanklerbergman@gmail.com
Vaga: Engenheiro da Computação - Sênior 
Inscrição: 16320
Repositório: [\[URL DO REPOSITÓRIO\]](https://github.com/sanklerbergmandejesuscastanho022145/sanklerbergmandejesuscastanho022145)

### FINALIZADOS(ORDEM DE PRIORIDADE)
- tela de login,auth guard, interceptors e modulos
- tela inicial de pets e services
- tela de cadastro do pet
- tela de detalhes do pet
- ainda priorizar a finalização de paginas com relação ao pet
- pagina de pets: Busca por nome para filtrar
- PAGINA DE TUTORES
- tshoot pagina de detalhes do tutor(foto sem loading completo)
- tshoot buscar dados de edição do tutor(dentro detalhes) ao clicar em editar
- tshoot buscar dados de edição do pet(dentro detalhes) ao clicar em editar
- VALIDAÇÃO DE RESPONSIVIDADE
- TESTES UNITARIOS
- ● Empacotar artefato em container com todas as dependências isoladas.
- ● README.md com documentação da arquitetura, dados de inscrição, vaga e como executar/testar.


# Sistema de Gerenciamento de Pets

Sistema web desenvolvido em Angular para gerenciamento de pets e seus tutores.

## 📋 Sobre o Projeto

Sistema que permite cadastrar, visualizar, editar e excluir pets, com suporte a múltiplos tutores por pet.

---

## 🏗️ Arquitetura
┌─────────────────────────────┐
│     Componentes Angular     │
│  (Lista / Detalhes / Form)  │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│           Services          │
│        (Pet / Image)        │
│     Comunicação HTTP        │
└───────────────┬─────────────┘
                │
┌───────────────▼─────────────┐
│          API REST           │
│     (Backend / Database)    │
└─────────────────────────────┘


### Tecnologias

- Angular 17+
- TypeScript
- RxJS
- Docker + Nginx

---

## 🚀 Como Executar

### Com Docker (Recomendado)

# Build e execução
```bash
- docker build -t pet-app .
- docker run -d -p 4200:80 pet-app
- docker ps (Valide que o container foi inciado com sucesso)
```

# Acesse: http://localhost:4200

# Credenciais de acesso ao sistema
Login: admin
Senha: admin

### Ambiente Local
# Instalar dependências
npm install

# Configurar URL da API em src/environments/environment.ts

# Executar
npm start

## Acesse: http://localhost:4200

# 🧪 Como Testar
### Testes unitários
npm test

### Testes com coverage
npm run test:coverage

## Scripts Disponíveis

### Desenvolvimento
npm start            

### Build produção
npm run build:prod    

### Testes
npm test          

### Build Docker
docker build -t pet-app .  

### Executar Docker
docker run -d -p 4200:80 pet-app  

