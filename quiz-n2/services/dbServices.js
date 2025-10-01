import * as SQLite from 'expo-sqlite';

// Conexão
export async function getDbConnection() {
    const db = await SQLite.openDatabaseAsync('quizApp.db');
    return db;
}

// Criação de tabelas
export async function createTables() {
    const queryThemes = `CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    difficulty TEXT,
    time_per_question INTEGER
  )`;

    const queryQuestions = `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    theme_id INTEGER,
    correct_answer INTEGER,
    FOREIGN KEY(theme_id) REFERENCES themes(id)
  )`;

    const queryAlternatives = `CREATE TABLE IF NOT EXISTS alternatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alternative TEXT NOT NULL,
    question_id INTEGER,
    FOREIGN KEY(question_id) REFERENCES questions(id)
  )`;

    const queryUserAnswers = `CREATE TABLE IF NOT EXISTS user_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    is_correct INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(question_id) REFERENCES questions(id)
  )`;

    const db = await getDbConnection();
    await db.execAsync(queryThemes);
    await db.execAsync(queryQuestions);
    await db.execAsync(queryAlternatives);
    await db.execAsync(queryUserAnswers);
    await db.closeAsync();
}

// Drop de tabela (dev only)
export async function dropTable() {
    const query = 'DROP TABLE IF EXISTS themes';
    const dbCx = await getDbConnection();
    await dbCx.execAsync(query);
    await dbCx.closeAsync();
}

// Buscar todos os temas
export async function getAllThemes() {
    const themes = [];
    const dbCx = await getDbConnection();

    const registros = await dbCx.getAllAsync(`
    SELECT 
      t.*,
      (SELECT COUNT(*) FROM questions q WHERE q.theme_id = t.id) AS questions,
      (SELECT COUNT(DISTINCT ua.question_id)
         FROM user_answers ua
         JOIN questions q ON q.id = ua.question_id
        WHERE q.theme_id = t.id) AS answered
    FROM themes t
  `);

    await dbCx.closeAsync();

    for (const registro of registros) {
        const progress =
            registro.questions > 0
                ? Math.round((registro.answered / registro.questions) * 100)
                : 0;

        themes.push({
            id: registro.id,
            name: registro.name,
            description: registro.description,
            color: registro.color,
            difficulty: registro.difficulty,
            time_per_question: registro.time_per_question,
            questions: registro.questions,
            answered: registro.answered,
            progress,
        });
    }

    return themes;
}

// Estatísticas
export async function getStatsFromDB() {
    const dbCx = await getDbConnection();

    const themesCountResult = await dbCx.getFirstAsync('SELECT COUNT(*) AS total FROM themes');
    const questionsCountResult = await dbCx.getFirstAsync('SELECT COUNT(*) AS total FROM questions');

    await dbCx.closeAsync();
    return {
        themes: themesCountResult?.total || 0,
        questions: questionsCountResult?.total || 0,
        completeness: 75 // placeholder
    };
}

// Adicionar tema
export async function addTheme(theme) {
    const dbCx = await getDbConnection();
    const query = `
    INSERT INTO themes (name, description, color, difficulty, time_per_question)
    VALUES (?, ?, ?, ?, ?)
  `;

    try {
        const result = await dbCx.runAsync(query, [
            theme.nome,
            theme.descricao,
            theme.cor,
            theme.dificuldade,
            theme.tempoPorPergunta,
        ]);
        await dbCx.closeAsync();
        return result.lastInsertRowId;
    } catch (error) {
        console.error("Erro ao salvar tema:", error);
        return null;
    }
}

// Atualizar tema
export async function updateTheme(id, theme) {
    const dbCx = await getDbConnection();
    const query = `
    UPDATE themes
    SET name = ?, description = ?, color = ?, difficulty = ?, time_per_question = ?
    WHERE id = ?
  `;

    try {
        await dbCx.runAsync(query, [
            theme.nome,
            theme.descricao,
            theme.cor,
            theme.dificuldade,
            theme.tempoPorPergunta,
            id,
        ]);
        await dbCx.closeAsync();
        return true;
    } catch (error) {
        console.error("Erro ao atualizar tema:", error);
        return false;
    }
}

// Excluir tema + perguntas + alternativas + respostas
export async function deleteTheme(themeId) {
    const db = await getDbConnection();
    try {
        // Apagar respostas de perguntas do tema
        await db.runAsync(
            `DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE theme_id = ?)`,
            [themeId]
        );
        // Apagar alternativas
        await db.runAsync(
            `DELETE FROM alternatives WHERE question_id IN (SELECT id FROM questions WHERE theme_id = ?)`,
            [themeId]
        );
        // Apagar perguntas
        await db.runAsync(`DELETE FROM questions WHERE theme_id = ?`, [themeId]);
        // Apagar tema
        await db.runAsync(`DELETE FROM themes WHERE id = ?`, [themeId]);

        await db.closeAsync();
        return true;
    } catch (error) {
        console.error("Erro ao excluir tema:", error);
        return false;
    }
}

// Perguntas
export async function addQuestion(question) {
    const db = await getDbConnection();
    const query = 'INSERT INTO questions (question, theme_id, correct_answer) VALUES (?, ?, ?)';
    const result = await db.runAsync(query, [
        question.question,
        question.theme_id,
        question.correct_answer
    ]);
    const insertedId = result.lastInsertRowId;
    await db.closeAsync();
    return insertedId;
}

export async function deleteQuestion(questionId) {
  const db = await getDbConnection();
  try {
    await db.runAsync('DELETE FROM user_answers WHERE question_id = ?', [questionId]);
    await db.runAsync('DELETE FROM alternatives WHERE question_id = ?', [questionId]);
    await db.runAsync('DELETE FROM questions WHERE id = ?', [questionId]);
    await db.closeAsync();
    return true;
  } catch (error) {
    console.error('Erro ao excluir pergunta:', error);
    try { await db.closeAsync(); } catch(e) {}
    return false;
  }
}
export async function updateQuestion(id, question) {
    const db = await getDbConnection();
    const query = `
        UPDATE questions 
        SET question = ?, theme_id = ?, correct_answer = ?
        WHERE id = ?
    `;

    try {
        await db.runAsync(query, [
            question.pergunta,
            question.tema_id,
            question.correct_answer,
            id,
        ]);
        await db.closeAsync();
        return true;
    } catch (error) {
        console.error("Erro ao atualizar pergunta:", error);
        return false;
    }
}

// Função para buscar pergunta com alternativas (mais simples)
export async function getQuestionWithAlternatives(questionId) {
    const db = await getDbConnection();
    
    try {
        const question = await db.getFirstAsync(
            'SELECT * FROM questions WHERE id = ?',
            [questionId]
        );
        
        if (question) {
            const alternatives = await db.getAllAsync(
                'SELECT * FROM alternatives WHERE question_id = ? ORDER BY id',
                [questionId]
            );
            
            await db.closeAsync();
            return {
                id: question.id,
                question: question.question,
                theme_id: question.theme_id,
                correct_answer: question.correct_answer,
                alternatives: alternatives
            };
        }
        
        await db.closeAsync();
        return null;
    } catch (error) {
        console.error('Erro ao buscar pergunta:', error);
        try { await db.closeAsync(); } catch(e) {}
        return null;
    }
}

// Alternativas
export async function addAlternative(alternative) {
    const db = await getDbConnection();
    const query = 'INSERT INTO alternatives (alternative, question_id) VALUES (?, ?)';
    const result = await db.runAsync(query, [
        alternative.alternative,
        alternative.question_id
    ]);
    const insertedId = result.lastInsertRowId;
    await db.closeAsync();
    return insertedId;
}

// Perguntas por tema
export async function getQuestionsByTheme(themeId) {
    const questions = [];
    const db = await getDbConnection();

    const registros = await db.getAllAsync('SELECT * FROM questions WHERE theme_id = ?', [themeId]);

    for (const registro of registros) {
        questions.push({
            id: registro.id,
            question: registro.question,
            correct_answer: registro.correct_answer,
        });
    }

    await db.closeAsync();
    return questions;
}

// Alternativas por pergunta
export async function getAlternativesByQuestion(questionId) {
    const alternatives = [];
    const db = await getDbConnection();

    const registros = await db.getAllAsync('SELECT * FROM alternatives WHERE question_id = ?', [questionId]);

    for (const registro of registros) {
        alternatives.push({
            id: registro.id,
            alternative: registro.alternative,
        });
    }

    await db.closeAsync();
    return alternatives;
}

// Contagem mínima de perguntas em tema
export async function checkThemeQuestionsCount(themeId, count) {
    const db = await getDbConnection();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as questionCount FROM questions WHERE theme_id = ?',
        [themeId]
    );
    const questionCount = result?.questionCount || 0;
    await db.closeAsync();

    return questionCount >= count;
}

// Resposta do usuário
export async function addUserAnswer(questionId, isCorrect) {
    const db = await getDbConnection();
    const result = await db.runAsync(
        'INSERT INTO user_answers (question_id, is_correct) VALUES (?, ?)',
        [questionId, isCorrect ? 1 : 0]
    );
    await db.closeAsync();
    return result.lastInsertRowId;
}

// Buscar perguntas com alternativas
export async function getQuestionsWithAlternatives(themeId, limit = 10) {
    const db = await getDbConnection();

    const questions = await db.getAllAsync(
        'SELECT * FROM questions WHERE theme_id = ? ORDER BY RANDOM() LIMIT ?',
        [themeId, limit]
    );

    for (let q of questions) {
        q.alternatives = await db.getAllAsync(
            'SELECT * FROM alternatives WHERE question_id = ?',
            [q.id]
        );
    }

    await db.closeAsync();
    return questions;
}