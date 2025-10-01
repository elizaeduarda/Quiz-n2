import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDbConnection, deleteQuestion } from '../../services/dbServices';

export default function ListagemPerguntas({ navigation }) {
  const [perguntas, setPerguntas] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const db = await getDbConnection();
      const registros = await db.getAllAsync(`
        SELECT q.id, q.question, q.correct_answer, q.theme_id, t.name AS theme_name
        FROM questions q
        LEFT JOIN themes t ON q.theme_id = t.id
        ORDER BY q.id DESC
      `);
      setPerguntas(registros);
      await db.closeAsync();
    };

    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    Alert.alert(
      'Excluir Pergunta',
      'Tem certeza que deseja excluir esta pergunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteQuestion(id);
              if (success) {
                setPerguntas(prev => prev.filter(p => p.id !== id));
                Alert.alert('Sucesso', 'Pergunta excluída.');
              } else {
                Alert.alert('Erro', 'Não foi possível excluir a pergunta.');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Erro', 'Não foi possível excluir a pergunta.');
            }
          }
        }
      ]
    );
  };
  const handleEdit = (pergunta) => {
    navigation.navigate('CadastroPergunta', { 
      pergunta: {
        id: pergunta.id,
        question: pergunta.question,
        theme_id: pergunta.theme_id,
        correct_answer: pergunta.correct_answer
      } 
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perguntas Cadastradas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CadastroPergunta')}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {perguntas.map((pergunta) => (
          <View key={pergunta.id} style={styles.card}>
            <Text style={styles.questionText}>{pergunta.question}</Text>
            <Text style={styles.themeText}>Tema: {pergunta.theme_name || 'Sem tema'}</Text>
            <Text style={styles.answerText}>
              Resposta correta: Alternativa {String.fromCharCode(64 + pergunta.correct_answer)}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleEdit(pergunta)}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(pergunta.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20,paddingVertical: 20, backgroundColor: '#4361EE',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '600', color: '#FFFFFF',
  },
  content: { padding: 15, padding: 20,},
  card: {
    backgroundColor: '#1E1E2E',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
  },
  questionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 5 },
  themeText: { color: '#94A3B8', fontSize: 14, marginBottom: 5 },
  answerText: { color: '#94A3B8', fontSize: 14, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F72585',
    padding: 10,
    borderRadius: 12,
  },
  actionText: { color: '#FFFFFF', fontWeight: '600' },
});