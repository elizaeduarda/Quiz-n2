# 🧠 QuizFutur

**QuizFutur** é um aplicativo mobile de quiz desenvolvido com **React Native**, **Expo** e **JavaScript**.  
O app permite cadastrar, editar e excluir temas e perguntas, visualizar todos os temas e perguntas cadastrados e jogar quizzes por tema.

[![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow)](https://github.com/elizaeduarda/QuizFutur)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

## 📌 Sumário

- [Sobre](#-sobre)  
- [Tecnologias](#-tecnologias)  
- [Funcionalidades](#-funcionalidades)  
- [Estrutura do Projeto](#-estrutura-do-projeto)  
- [Como Executar](#-como-executar)  
- [Banco de Dados](#-banco-de-dados)  
- [Melhorias Futuras](#-melhorias-futuras)  
- [Preview](#-preview)  
- [Desenvolvedora](#-desenvolvedora)  
- [Licença](#-licença)

---

## 🟦 Sobre

QuizFutur é um aplicativo de quiz local (offline) que oferece:
- Gestão de **temas** (criar, editar, excluir).  
- Gestão de **perguntas** (associadas a temas) com 4 alternativas e indicação da resposta correta.  
- Modo **jogo** por tema, com feedback de acerto/erro e contagem de pontos.

O objetivo é servir como projeto de portfólio e base para evoluções (sincronização em nuvem, multiplayer, estatísticas, etc).

---

## 🚀 Tecnologias

- **React Native**  
- **Expo**  
- **JavaScript (ES6+)**  
- **expo-sqlite** (SQLite local)  
- **React Navigation** (navegação entre telas)

---

## ✅ Funcionalidades

- Cadastro de temas (nome, cor e dificuldade)  
- Edição e exclusão de temas  
- Cadastro de perguntas com 4 alternativas 
- Edição e exclusão de perguntas  
- Tela de listagem de temas e perguntas  
- Modo de jogo: seleciona-se um tema e responde às perguntas, com contador de acertos

---

## 🏗️ Estrutura do Projeto 
quiz-n2/
├── assets/
├── services/
├── telas/
├── App.js
├── app.json
├── index.js
├── package-lock.json
└── package.json
