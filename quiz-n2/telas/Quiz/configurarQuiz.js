// screens/ConfigurarQuiz.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllThemes } from '../../services/dbServices';

export default function ConfigurarQuiz({ navigation }) {
  const [selectedTema, setSelectedTema] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(5);
  const [temasDisponiveis, setTemasDisponiveis] = useState([]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const themes = await getAllThemes();
        setTemasDisponiveis(themes);
      } catch (error) {
        console.error('Erro ao carregar temas:', error);
      }
    };
    loadThemes();
  }, []);
  const iniciarQuiz = () => {
    if (!selectedTema || !selectedQuantity) return;
    
    if (selectedTema.questions < selectedQuantity) {
      alert(`Este tema possui apenas ${selectedTema.questions} perguntas.`);
      return;
    }   
    navigation.navigate('Quiz', { 
      tema: selectedTema,
      quantidade: selectedQuantity
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurar Quiz</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção de Quantidade */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Quantidade de Perguntas</Text>
          <Text style={styles.sectionDescription}>
            Escolha quantas perguntas deseja responder
          </Text>
          
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
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20,paddingVertical: 20, backgroundColor: '#4361EE',
  },
  backButton: { 
    padding: 5 
  },
 headerTitle: {
    fontSize: 18, fontWeight: '600', color: '#FFFFFF',
  },
  headerPlaceholder: { 
    width: 24 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  sectionContainer: { 
    marginBottom: 25 
  },
  sectionLabel: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginBottom: 5 
  },
  sectionDescription: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.7)', 
    marginBottom: 15 
  },
  quantityGrid: { 
    flexDirection: 'row', 
    gap: 10 
  },
  quantityCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quantityCardSelected: {
    backgroundColor: 'rgba(76, 201, 240, 0.2)',
    borderColor: '#4CC9F0',
  },
  quantityNumber: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  quantityNumberSelected: { 
    color: '#4CC9F0' 
  },
  quantityLabel: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: 2 
  },
  quantityLabelSelected: { 
    color: '#4CC9F0' 
  },
  themesList: { 
    maxHeight: 300 
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeItemSelected: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    borderColor: '#4CC9F0',
  },
  themeColorContainer: { 
    marginRight: 12 
  },
  themeColor: { 
    width: 24, 
    height: 24, 
    borderRadius: 12 
  },
  themeInfo: { 
    flex: 1 
  },
  themeName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginBottom: 2 
  },
  themeDescription: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.7)', 
    marginBottom: 4 
  },
  themeStats: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  themeStatText: { 
    fontSize: 11, 
    color: '#94A3B8' 
  },
  selectionIndicator: { 
    marginLeft: 10 
  },
  unselectedCircle: {
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionContainer: { 
    paddingTop: 15 
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361EE',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  startButtonDisabled: { 
    backgroundColor: 'rgba(67, 97, 238, 0.5)' 
  },
  startButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  warningText: { 
    fontSize: 12, 
    color: '#F56565', 
    textAlign: 'center', 
    marginTop: 8 
  },
});