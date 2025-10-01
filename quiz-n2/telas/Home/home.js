import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { createTables, getAllThemes, getStatsFromDB } from '../../services/dbServices';

export default function Home({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    themes: 0,
    questions: 0,
    completeness: 0
  });

  const [recentThemes, setRecentThemes] = useState([]);
  const [temasDisponiveis, setTemasDisponiveis] = useState([]);
  const [activeTab, setActiveTab] = useState('Home');

  const [selectedTema, setSelectedTema] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(5);

  const iniciarQuiz = () => {
  if (!selectedTema || !selectedQuantity) return;
  
  if (selectedTema.questions < selectedQuantity) {
    alert(`Este tema possui apenas ${selectedTema.questions} perguntas.`);
    return;
  }
  
  setModalVisible(false);
  navigation.navigate('Quiz', { 
    tema: selectedTema,
    quantidade: selectedQuantity
  });
  
  setSelectedTema(null);
  setSelectedQuantity(5);
};

  const loadData = async () => {
    await createTables();

    const themes = await getAllThemes();
    setRecentThemes([...themes].reverse());
    setTemasDisponiveis(themes);

    const statsData = await getStatsFromDB();
    setStats(statsData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleActionPress = (action) => {
    switch (action) {
      case 'new-theme':
        navigation.navigate('ListaTema');
        break;
      case 'new-question':
        navigation.navigate('CadastroPergunta');
        break;
      case 'quick-quiz':
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  const selecionarTema = (tema) => {
    setModalVisible(false);
    navigation.navigate('Quiz', { tema });
  };

  const renderActionCard = (icon, title, subtitle, action, color) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: color }]}
      onPress={() => handleActionPress(action)}
      activeOpacity={0.7}
    >
      <FontAwesome5 name={icon} size={32} color="#FFFFFF" />
      <Text style={styles.actionCardTitle}>{title}</Text>
      <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const renderThemeCard = (theme, index) => (
    <View
      key={`theme-${theme.id ?? 'noid'}-${index}`}
      style={[styles.themeCard, { borderLeftColor: theme.color || '#4361EE' }]}
    >
      <Text style={styles.themeName}>{theme.name ?? 'Sem nome'}</Text>
      <Text style={styles.themeDescription}>{theme.description ?? 'Sem descrição'}</Text>
      <View style={styles.themeStats}>
        <Text style={styles.themeStatText}>
          {`${theme.answered ?? 0}/${theme.questions ?? 0} perguntas`}
        </Text>
        <Text style={styles.themeStatText}>
          {String(theme.progress ?? 0)}%
        </Text>
      </View>
    </View>
  );

  const renderProgressItem = (theme, index) => (
    <View key={`progress-${index}`} style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{theme.name ?? 'Sem nome'}</Text>
        <Text style={styles.progressPercentage}>
          {`${theme.answered ?? 0}/${theme.questions ?? 0}`} ({String(theme.progress ?? 0)}%)
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${theme.progress ?? 0}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.logo}>
          <FontAwesome5 name="brain" size={28} color="#FFFFFF" />
          <Text style={styles.logoText}>QuizFutur</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Olá!</Text>
          <Text style={styles.welcomeSubtitle}>Pronta(o) para criar quizzes incríveis?</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recentThemes.length}</Text>
              <Text style={styles.statLabel}>Temas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.questions}</Text>
              <Text style={styles.statLabel}>Perguntas</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionCards}>
          {/* BOTAO DE CADASTRAR TEMA */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#4361EE' }]}
            onPress={() => navigation.navigate('CadastroTema')}>
            <FontAwesome5 name="folder-plus" size={32} color="#FFFFFF" />
            <Text style={styles.actionCardTitle}>Novo Tema</Text>
            <Text style={styles.actionCardSubtitle}>Criar categoria</Text>
          </TouchableOpacity>

          {/* BOTAO DE CADASTRAR PERGUNTA */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#7209B7' }]}
            onPress={() => navigation.navigate('CadastroPergunta')}
            activeOpacity={0.7}>
            <FontAwesome5 name="question-circle" size={32} color="#FFFFFF" />
            <Text style={styles.actionCardTitle}>Nova Pergunta</Text>
            <Text style={styles.actionCardSubtitle}>Adicionar quiz</Text>
          </TouchableOpacity>

          {renderActionCard(
            'bolt',
            'Quiz Rápido',
            'Iniciar agora',
            'quick-quiz',
            '#4CC9F0'
          )}
        </View>
        {/* Seção de Temas Recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Temas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ListaTema')}>
              <Text style={styles.viewAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themesScroll}
          >
            {recentThemes.map((theme, index) => renderThemeCard(theme, index))}
          </ScrollView>
        </View>
        {/* Seção de Progresso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu Progresso</Text>
          <View style={styles.progressCard}>
            {recentThemes.map((theme, index) => renderProgressItem(theme, index))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? '#4361EE' : '#94A3B8'} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'home' && styles.navTextActive
          ]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'themes' && styles.navItemActive]}
          onPress={() => {
            setActiveTab('themes');
            navigation.navigate('ListaTema');
          }}
        >
          <Ionicons 
            name="folder" 
            size={24} 
            color={activeTab === 'themes' ? '#4361EE' : '#94A3B8'} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'themes' && styles.navTextActive
          ]}>Temas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'questions' && styles.navItemActive]}
          onPress={() => {
            setActiveTab('questions');
            navigation.navigate('ListagemPerguntas');
          }}
        >
          <Ionicons 
            name="help-circle" 
            size={24} 
            color={activeTab === 'questions' ? '#4361EE' : '#94A3B8'} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'questions' && styles.navTextActive
          ]}>Perguntas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'quiz' && styles.navItemActive]}
          onPress={() => {
            setActiveTab('quiz');
            navigation.navigate('ConfigurarQuiz');
          }}
        >
          <Ionicons 
            name="play-circle" 
            size={24} 
            color={activeTab === 'quiz' ? '#4361EE' : '#94A3B8'} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'quiz' && styles.navTextActive
          ]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Quiz Rápido */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="play-circle" size={28} color="#4CC9F0" />
                <Text style={styles.modalTitle}>Configurar Quiz</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Seção de Quantidade */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Quantidade de Perguntas</Text>
              <Text style={styles.sectionDescription}>Escolha quantas perguntas deseja responder</Text>
              
              <View style={styles.quantityGrid}>
                {[5, 10, 15, 20].map((quantity) => (
                  <TouchableOpacity
                    key={quantity}
                    style={[
                      styles.quantityCard,
                      selectedQuantity === quantity && styles.quantityCardSelected
                    ]}
                    onPress={() => setSelectedQuantity(quantity)}
                  >
                    <Text style={[
                      styles.quantityNumber,
                      selectedQuantity === quantity && styles.quantityNumberSelected
                    ]}>
                      {quantity}
                    </Text>
                    <Text style={[
                      styles.quantityLabel,
                      selectedQuantity === quantity && styles.quantityLabelSelected
                    ]}>
                      perguntas
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seção de Temas */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Selecionar Tema</Text>
              <Text style={styles.sectionDescription}>Escolha o tema do quiz</Text>
              
              <ScrollView 
                style={styles.themesList}
                showsVerticalScrollIndicator={false}
              >
                {temasDisponiveis.map((tema) => (
                  <TouchableOpacity
                    key={tema.id}
                    style={[
                      styles.themeItem,
                      selectedTema?.id === tema.id && styles.themeItemSelected
                    ]}
                    onPress={() => setSelectedTema(tema)}
                  >
                    <View style={styles.themeColorContainer}>
                      <View 
                        style={[
                          styles.themeColor,
                          { backgroundColor: tema.color || '#4361EE' }
                        ]} 
                      />
                    </View>
                    
                    <View style={styles.themeInfo}>
                      <Text style={styles.themeName}>{tema.name}</Text>
                      <Text style={styles.themeDescription} numberOfLines={1}>
                        {tema.description || 'Sem descrição'}
                      </Text>
                      <View style={styles.themeStats}>
                        <Ionicons name="document-text" size={12} color="#94A3B8" />
                        <Text style={styles.themeStatText}>
                          {tema.questions || 0} perguntas disponíveis
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.selectionIndicator}>
                      {selectedTema?.id === tema.id ? (
                        <Ionicons name="checkmark-circle" size={24} color="#4CC9F0" />
                      ) : (
                        <View style={styles.unselectedCircle} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Botão de Ação */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  (!selectedTema || !selectedQuantity) && styles.startButtonDisabled
                ]}
                onPress={iniciarQuiz}
                disabled={!selectedTema || !selectedQuantity}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>
                  {selectedTema && selectedQuantity 
                    ? `Iniciar Quiz - ${selectedQuantity} perguntas`
                    : 'Selecione um tema e quantidade'
                  }
                </Text>
              </TouchableOpacity>
              
              {selectedTema && selectedTema.questions < selectedQuantity && (
                <Text style={styles.warningText}>
                  ⚠️ Este tema possui apenas {selectedTema.questions} perguntas
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
 flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'linear-gradient(90deg, #4361EE 0%, #7209B7 100%)'
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 20, paddingBottom: 80 },
  welcomeCard: {
    backgroundColor: '#1E1E2E', borderRadius: 16, padding: 20, marginBottom: 25
  },
  welcomeTitle: { fontSize: 24, fontWeight: '600', color: '#4CC9F0' },
  welcomeSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#4361EE' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  actionCards: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  actionCard: {
    flex: 1, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, elevation: 5
  },
  actionCardTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginTop: 10 },
  actionCardSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  section: { marginBottom: 25 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#4CC9F0' },
  viewAllText: { fontSize: 14, color: '#4361EE' },
  themesScroll: { flexDirection: 'row' },
  themeCard: {
    width: 200,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    borderLeftWidth: 4
  },
  themeName: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  themeDescription: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  themeStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  themeStatText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  progressCard: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 20 },
  progressItem: { marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#FFF' },
  progressPercentage: { fontSize: 14, color: '#4361EE', fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#4CC9F0', borderRadius: 4 },
  bottomNav: {
    flexDirection: 'row', backgroundColor: '#1E1E2E', paddingVertical: 12, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
  },
  navItem: {
    flex: 1, alignItems: 'center', paddingVertical: 5,
  },
  navText: {
    fontSize: 10, color: '#94A3B8', marginTop: 4,
  },
  navTextActive: {
    color: '#4361EE', fontWeight: '600',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end',
  },
  modalContent: {
     backgroundColor: '#1E1E2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitleContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  modalTitle: {
    fontSize: 20, fontWeight: '700', color: '#4CC9F0',
  },
  closeButton: {
    padding: 5,
  },
  sectionContainer: {
    paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionLabel: {
    fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 15,
  },
  quantityGrid: {
    flexDirection: 'row', gap: 10,
  },
  quantityCard: {
    flex: 1, alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
  },
  quantityCardSelected: {
    backgroundColor: 'rgba(76, 201, 240, 0.2)', borderColor: '#4CC9F0',
  },
  quantityNumber: {
    fontSize: 24, fontWeight: '700', color: '#FFFFFF',
  },
  quantityNumberSelected: {
    color: '#4CC9F0',
  },
  quantityLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2,
  },
  quantityLabelSelected: {
    color: '#4CC9F0',
  },
  themesList: {
    maxHeight: 200,
  },
  themeItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent',
  },
  themeItemSelected: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)', borderColor: '#4CC9F0',
  },
  themeColorContainer: {
    marginRight: 12,
  },
  themeColor: {
    width: 24, height: 24, borderRadius: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2,
  },
  themeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  themeStats: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  themeStatText: {
    fontSize: 11, color: '#94A3B8',
  },
  selectionIndicator: {
    marginLeft: 10,
  },
  unselectedCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  actionContainer: {
    paddingHorizontal: 20, paddingTop: 15,
  },
  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4361EE', padding: 16, borderRadius: 12, gap: 10,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(67, 97, 238, 0.5)',
  },
  startButtonText: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '600',
  },
  warningText: {
    fontSize: 12, color: '#F56565', textAlign: 'center', marginTop: 8,
  },
});