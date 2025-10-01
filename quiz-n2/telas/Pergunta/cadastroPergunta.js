import React, { useState, useEffect, useCallback, memo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  getAllThemes,
  addQuestion,
  addAlternative,
  updateQuestion,
  getQuestionWithAlternatives,
} from '../../services/dbServices';

const AlternativaItem = memo(({ alternativa, index, onChange, onToggleCorrect }) => {
  return (
    <View style={styles.alternativaContainer}>
      <View style={styles.alternativaHeader}>
        <Text style={styles.alternativaLabel}>
          Alternativa {String.fromCharCode(65 + index)}
        </Text>

        <TouchableOpacity
          style={[
            styles.corretaButton,
            alternativa.correta && styles.corretaButtonSelecionada,
          ]}
          onPress={() => onToggleCorrect(alternativa.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark"
            size={16}
            color={alternativa.correta ? '#FFFFFF' : '#4361EE'}
          />
          <Text
            style={[
              styles.corretaButtonText,
              alternativa.correta && styles.corretaButtonTextSelecionada,
            ]}
          >
            Correta
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.alternativaInput}
        placeholder={`Digite a alternativa ${String.fromCharCode(65 + index)}...`}
        placeholderTextColor="#94A3B8"
        value={alternativa.texto}
        onChangeText={(text) => onChange(alternativa.id, 'texto', text)}
        multiline
        returnKeyType="done"
      />
    </View>
  );
});

const TemaOption = ({ tema, onSelect }) => (
  <TouchableOpacity
    style={[styles.temaOption, { borderLeftColor: tema.color || '#4361EE' }]}
    onPress={() => onSelect(tema)}
    activeOpacity={0.8}
  >
    <View style={[styles.temaCor, { backgroundColor: tema.color || '#4361EE' }]} />
    <Text style={styles.temaNome}>{tema.name}</Text>
  </TouchableOpacity>
);

export default function CadastroPergunta({ navigation, route }) {
  const perguntaEdit = route?.params?.pergunta || null;

  const [formData, setFormData] = useState({
    pergunta: '',
    tema: null,
    alternativas: [
      { id: 1, texto: '', correta: false },
      { id: 2, texto: '', correta: false },
      { id: 3, texto: '', correta: false },
      { id: 4, texto: '', correta: false },
    ],
  });

  const [temasDisponiveis, setTemasDisponiveis] = useState([]);
  const [modalTemaVisible, setModalTemaVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const temas = await getAllThemes();
      setTemasDisponiveis(temas);
    })();
  }, []);

  useEffect(() => {
    if (perguntaEdit) {
      (async () => {
        const data = await getQuestionWithAlternatives(perguntaEdit.id);
        if (data) {
          setFormData({
            id: data.id,
            pergunta: data.question,
            tema: { id: data.theme_id },
            alternativas: data.alternatives.map((alt, idx) => ({
              id: idx + 1,
              texto: alt.alternative,
              correta: idx + 1 === data.correct_answer,
            })),
          });
        }
      })();
    }
  }, [perguntaEdit]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAlternativaChange = useCallback((id, field, value) => {
    setFormData((prev) => {
      const novas = prev.alternativas.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      );
      return { ...prev, alternativas: novas };
    });
  }, []);

  const handleAlternativaCorreta = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      alternativas: prev.alternativas.map((a) => ({
        ...a,
        correta: a.id === id,
      })),
    }));
  }, []);

  const validarFormulario = () => {
    if (!formData.pergunta.trim()) {
      Alert.alert('Erro', 'Digite a pergunta');
      return false;
    }
    if (!formData.tema) {
      Alert.alert('Erro', 'Selecione um tema');
      return false;
    }
    for (let i = 0; i < 4; i++) {
      if (!formData.alternativas[i].texto.trim()) {
        Alert.alert('Erro', `Preencha a alternativa ${String.fromCharCode(65 + i)}`);
        return false;
      }
    }
    if (!formData.alternativas.find((a) => a.correta)) {
      Alert.alert('Erro', 'Selecione a alternativa correta');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;
    try {
      if (formData.id) {
        await updateQuestion(formData.id, {
          pergunta: formData.pergunta,
          tema_id: formData.tema.id,
          correct_answer: formData.alternativas.findIndex((a) => a.correta) + 1,
        });
        Alert.alert('Sucesso!', 'Pergunta atualizada', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const pergunta = {
          question: formData.pergunta,
          theme_id: formData.tema.id,
          correct_answer: formData.alternativas.findIndex((a) => a.correta) + 1,
        };
        const insertedId = await addQuestion(pergunta);
        for (let alt of formData.alternativas) {
          await addAlternative({
            alternative: alt.texto,
            question_id: insertedId,
          });
        }
        Alert.alert('Sucesso!', 'Pergunta cadastrada', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar a pergunta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {formData.id ? 'Editar Pergunta' : 'Nova Pergunta'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        enableAutomaticScroll={Platform.OS === 'ios'}
      >
        {/* Tema */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Tema *</Text>
          <TouchableOpacity
            style={styles.temaSelector}
            onPress={() => setModalTemaVisible(true)}
          >
            <Text
              style={[
                styles.temaSelectorText,
                !formData.tema && styles.temaSelectorPlaceholder,
              ]}
            >
              {formData.tema?.name || 'Selecione um tema'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
          </TouchableOpacity>
          {/* Pergunta */}
          <Text style={styles.label}>Pergunta *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Digite a pergunta..."
            placeholderTextColor="#94A3B8"
            value={formData.pergunta}
            onChangeText={(text) => handleInputChange('pergunta', text)}
            multiline
          />
        </View>
        {/* Alternativas */}
        <Text style={[styles.label, { marginLeft: 8 }]}>Alternativas *</Text>
        {formData.alternativas.map((alt, i) => (
          <AlternativaItem
            key={alt.id}
            alternativa={alt}
            index={i}
            onChange={handleAlternativaChange}
            onToggleCorrect={handleAlternativaCorreta}
          />
        ))}
        {/* Botões */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
            <Ionicons name="save" size={20} color="#FFF" />
            <Text style={styles.btnSalvarText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={20} color="#4361EE" />
            <Text style={styles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {/* Modal Temas */}
      <Modal
        transparent
        visible={modalTemaVisible}
        animationType="slide"
        onRequestClose={() => setModalTemaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Tema</Text>
              <TouchableOpacity onPress={() => setModalTemaVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
              {temasDisponiveis.map((t) => (
                <TemaOption
                  key={t.id}
                  tema={t}
                  onSelect={(tema) => {
                    setFormData((prev) => ({ ...prev, tema }));
                    setModalTemaVisible(false);
                  }}
                />
              ))}
            </KeyboardAwareScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4361EE',
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerRight: { width: 34 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#1E1E2E',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  label: { color: '#4CC9F0', fontWeight: '600', fontSize: 16, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  temaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  temaSelectorText: { flex: 1, color: '#FFF', fontSize: 16 },
  temaSelectorPlaceholder: { color: '#94A3B8' },
  alternativaContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alternativaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alternativaLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  corretaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4361EE',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  corretaButtonSelecionada: { backgroundColor: '#4361EE' },
  corretaButtonText: { color: '#4361EE', fontSize: 12, fontWeight: '600' },
  corretaButtonTextSelecionada: { color: '#FFF' },
  alternativaInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actions: { marginTop: 20, gap: 12 },
  btnSalvar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4361EE',
    padding: 14,
    borderRadius: 12,
  },
  btnSalvarText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  btnCancelar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4361EE',
    borderRadius: 12,
  },
  btnCancelarText: { color: '#4361EE', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { color: '#4CC9F0', fontSize: 18, fontWeight: '600' },
  temaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  temaCor: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  temaNome: { color: '#FFF', fontSize: 16 },
});
