import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { createTables, getAllThemes, deleteTheme } from '../../services/dbServices';

export default function ListaTema({ navigation }) {
  const [temas, setTemas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarTemas = async () => {
    setRefreshing(true);
    await createTables();
    const themes = await getAllThemes();
    setTemas([...themes].reverse());
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      carregarTemas();
    }, [])
  );

  const abrirEditar = (tema) => {
    navigation.navigate('CadastroTema', { tema }); 
  };

  const abrirExcluir = (tema) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir o tema "${tema.name}"? Todas as perguntas relacionadas também serão apagadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTheme(tema.id);
              Alert.alert('Sucesso', 'Tema e perguntas excluídos com sucesso!');
              carregarTemas();
            } catch (error) {
              console.error(error);
              Alert.alert('Erro', 'Não foi possível excluir o tema.');
            }
          },
        },
      ]
    );
  };

  const getDificuldadeInfo = (dificuldade) => {
    const config = {
      easy: { label: 'Fácil', icon: 'smile', color: '#10B981' },
      medium: { label: 'Médio', icon: 'meh', color: '#F59E0B' },
      hard: { label: 'Difícil', icon: 'frown', color: '#F72585' },
    };
    return config[dificuldade] || config.medium;
  };

  const TemaCard = ({ tema }) => {
    const dificuldade = getDificuldadeInfo(tema.difficulty);

    return (
      <View style={[styles.temaCard, { borderLeftColor: tema.color }]}>
        <View style={styles.temaHeader}>
          <View style={styles.temaInfo}>
            <View style={[styles.corTema, { backgroundColor: tema.color }]} />
            <Text style={styles.temaNome}>{tema.name}</Text>
          </View>
          <View style={styles.temaAcoes}>
            <TouchableOpacity style={styles.acaoButton} onPress={() => abrirEditar(tema)}>
              <Ionicons name="pencil" size={18} color="#4361EE" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.acaoButton} onPress={() => abrirExcluir(tema)}>
              <Ionicons name="trash" size={18} color="#F72585" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.temaDescricao}>{tema.description}</Text>

        <View style={styles.temaStats}>
          <View style={styles.statItem}>
            <FontAwesome5 name="question-circle" size={12} color="#94A3B8" />
            <Text style={styles.statText}>{tema.questions ?? 0} perguntas</Text>
          </View>

          <View style={styles.statItem}>
            <FontAwesome5 name={dificuldade.icon} size={12} color={dificuldade.color} />
            <Text style={[styles.statText, { color: dificuldade.color }]}>{dificuldade.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Temas</Text>
        <TouchableOpacity style={styles.novoButton} onPress={() => navigation.navigate('CadastroTema')}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={carregarTemas}
            colors={['#4361EE']}
            tintColor="#4361EE"
          />
        }
      >
        {/* Estatísticas */}
        <View style={styles.estatisticasCard}>
          <Text style={styles.estatisticasTitle}>Resumo</Text>
          <View style={styles.estatisticasGrid}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{temas.length}</Text>
              <Text style={styles.estatisticaLabel}>Total de Temas</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>
                {temas.reduce((total, tema) => total + (tema.questions ?? 0), 0)}
              </Text>
              <Text style={styles.estatisticaLabel}>Perguntas</Text>
            </View>
          </View>
        </View>

        {/* Lista */}
        <View style={styles.listaSection}>
          <Text style={styles.listaTitle}>Temas Cadastrados</Text>
          {temas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open" size={64} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>Nenhum tema cadastrado</Text>
              <Text style={styles.emptyStateText}>
                Comece criando seu primeiro tema para organizar suas perguntas
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CadastroTema')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Criar Primeiro Tema</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.temasList}>
              {temas.map((tema) => (
                <TemaCard key={tema.id} tema={tema} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#4361EE',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  novoButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  estatisticasCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  estatisticasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CC9F0',
    marginBottom: 15,
  },
  estatisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaValor: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4361EE',
    marginBottom: 5,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  listaSection: {
    marginBottom: 20,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CC9F0',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4361EE',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  temasList: {
    gap: 12,
  },
  temaCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  temaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  temaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  corTema: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  temaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  temaAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  acaoButton: {
    padding: 6,
  },
  temaDescricao: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  temaStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  temaData: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 25,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CC9F0',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CC9F0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  excluirText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  excluirAviso: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  btnCancelar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnCancelarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnSalvar: {
    backgroundColor: '#4361EE',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnSalvarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnExcluir: {
    backgroundColor: '#F72585',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btnExcluirText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});