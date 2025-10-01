import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQuestionsWithAlternatives, addUserAnswer } from '../../services/dbServices';

export default function Quiz({ route, navigation }) {
    const { tema, quantidade } = route.params;
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [timer, setTimer] = useState(null);
    const [showNextButton, setShowNextButton] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]); // Novo estado para armazenar todas as respostas

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const qs = await getQuestionsWithAlternatives(tema.id, quantidade);
                if (qs.length === 0) {
                    Alert.alert(
                        'Nenhuma pergunta',
                        'Este tema não possui perguntas cadastradas.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                    return;
                }
                const shuffled = [...qs].sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
                if (tema.time_per_question) {
                    setTimeLeft(tema.time_per_question);
                }
            } catch (error) {
                console.error('Erro ao carregar perguntas:', error);
                Alert.alert('Erro', 'Não foi possível carregar as perguntas.');
            }
        };
        loadQuestions();
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [tema, quantidade]);
    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !quizCompleted && selectedAnswer === null) {
            const newTimer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(newTimer);
                        handleTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            setTimer(newTimer);

            return () => clearInterval(newTimer);
        }
    }, [timeLeft, quizCompleted, selectedAnswer]);

    const handleTimeUp = async () => {
        setSelectedAnswer(-1); 
        await addUserAnswer(questions[current].id, false);
        setUserAnswers(prev => [...prev, {
            question: questions[current],
            userAnswer: -1,
            isCorrect: false,
            correctAnswer: questions[current].correct_answer
        }]);
        setShowNextButton(true);
    };

    const handleAnswer = async (alternativeIndex) => {
        if (selectedAnswer !== null) return;
        if (timer) clearInterval(timer);
        setSelectedAnswer(alternativeIndex);

        const selectedAlt = questions[current].alternatives[alternativeIndex];
        const isCorrect = alternativeIndex === (questions[current].correct_answer - 1);

        if (isCorrect) {
            setScore(score + 1);
        }
        await addUserAnswer(questions[current].id, isCorrect);
        setUserAnswers(prev => [...prev, {
            question: questions[current],
            userAnswer: alternativeIndex,
            isCorrect,
            correctAnswer: questions[current].correct_answer
        }]);
        setShowNextButton(true);
    };

    const goToNextQuestion = () => {
        if (current + 1 < questions.length) {
            setCurrent(current + 1);
            setSelectedAnswer(null);
            setShowNextButton(false); 
            if (tema.time_per_question) {
                setTimeLeft(tema.time_per_question);
            }
        } else {
            setQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrent(0);
        setScore(0);
        setSelectedAnswer(null);
        setQuizCompleted(false);
        setUserAnswers([]); 
        if (tema.time_per_question) {
            setTimeLeft(tema.time_per_question);
        }
    };

    const exitQuiz = () => {
        if (timer) clearInterval(timer);
        navigation.goBack();
    };

    const getAnswerColor = (alternativeIndex) => {
        if (selectedAnswer === null) return '#2D3748';

        const currentQuestion = questions[current]; 

        console.log('Alternative Index:', alternativeIndex);
        console.log('Correct Answer:', currentQuestion.correct_answer); 
        console.log('Selected Answer:', selectedAnswer);
        console.log('Alternatives:', currentQuestion.alternatives); 

        if (alternativeIndex === (currentQuestion.correct_answer - 1)) {
            return '#48BB78';
        }    
        if (alternativeIndex === selectedAnswer && alternativeIndex !== (currentQuestion.correct_answer - 1)) {
            return '#F56565'; 
        }
        return '#2D3748'; 
    };
    const getAnswerTextColor = (alternativeIndex) => {
        if (selectedAnswer === null) return '#FFFFFF';

        const currentQuestion = questions[current]; 

        if (alternativeIndex === (currentQuestion.correct_answer - 1) ||
            alternativeIndex === selectedAnswer) {
            return '#FFFFFF';
        }
        return 'rgba(255,255,255,0.7)';
    };

    const renderQuestionResult = (answerData, index) => {
        const { question, userAnswer, isCorrect, correctAnswer } = answerData;
        const userAnswerText = userAnswer === -1 ? 'Tempo esgotado' : question.alternatives[userAnswer]?.alternative;
        const correctAnswerText = question.alternatives[correctAnswer - 1]?.alternative;

        return (
            <View key={index} style={styles.questionResultItem}>
                <View style={styles.questionResultHeader}>
                    <Text style={styles.questionResultNumber}>Pergunta {index + 1}</Text>
                    <View style={[
                        styles.resultBadge,
                        isCorrect ? styles.correctBadge : styles.incorrectBadge
                    ]}>
                        <Ionicons
                            name={isCorrect ? "checkmark" : "close"}
                            size={16}
                            color="#FFFFFF"
                        />
                        <Text style={styles.resultBadgeText}>
                            {isCorrect ? 'Acertou' : 'Errou'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.questionResultText}>{question.question}</Text>

                <View style={styles.answerInfo}>
                    <View style={styles.answerItem}>
                        <Text style={styles.answerLabel}>Sua resposta:</Text>
                        <Text style={[
                            styles.answerText,
                            isCorrect ? styles.correctText : styles.incorrectText
                        ]}>
                            {userAnswerText}
                        </Text>
                    </View>

                    {!isCorrect && (
                        <View style={styles.answerItem}>
                            <Text style={styles.answerLabel}>Resposta correta:</Text>
                            <Text style={[styles.answerText, styles.correctText]}>
                                {correctAnswerText}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.separator} />
            </View>
        );
    };
    if (questions.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass-outline" size={64} color="#4CC9F0" />
                    <Text style={styles.loadingText}>Carregando perguntas...</Text>
                </View>
            </SafeAreaView>
        );
    }
    if (quizCompleted) {
        const percentage = ((score / questions.length) * 100);
        let message = '';
        let icon = '';

        if (percentage >= 80) {
            message = 'Excelente! Você dominou este tema!';
            icon = 'trophy';
        } else if (percentage >= 60) {
            message = 'Muito bom! Continue praticando!';
            icon = 'star';
        } else if (percentage >= 40) {
            message = 'Bom trabalho! Você está evoluindo!';
            icon = 'thumbs-up';
        } else {
            message = 'Continue estudando! Você vai melhorar!';
            icon = 'school';
        }
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.completedContainer}>
                    <Ionicons name={icon} size={80} color="#4CC9F0" />
                    <Text style={styles.completedTitle}>Quiz Concluído!</Text>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>{score}/{questions.length}</Text>
                        <Text style={styles.percentageText}>{percentage.toFixed(1)}% de acerto</Text>
                    </View>

                    <Text style={styles.messageText}>{message}</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={24} color="#4CC9F0" />
                            <Text style={styles.statText}>{questions.length} perguntas</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#48BB78" />
                            <Text style={styles.statText}>{score} corretas</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="close-circle-outline" size={24} color="#F56565" />
                            <Text style={styles.statText}>{questions.length - score} erradas</Text>
                        </View>
                    </View>

                    {/* Seção de resultados detalhados */}
                    <View style={styles.detailedResults}>
                        <Text style={styles.detailedResultsTitle}>Detalhes das Respostas</Text>
                        {userAnswers.map((answerData, index) => renderQuestionResult(answerData, index))}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={restartQuiz}
                            style={[styles.button, styles.primaryButton]}
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Jogar Novamente</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={exitQuiz}
                            style={[styles.button, styles.secondaryButton]}
                        >
                            <Ionicons name="home" size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Voltar ao Início</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    const question = questions[current];
    const progressPercentage = ((current + 1) / questions.length) * 100;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={exitQuiz} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.themeName} numberOfLines={1}>{tema.name}</Text>
                    <Text style={styles.progressText}>
                        {current + 1}/{questions.length}
                    </Text>
                </View>

                <View style={styles.scoreBadge}>
                    <Ionicons name="star" size={16} color="#FBBF24" />
                    <Text style={styles.scoreText}>{score}</Text>
                </View>
            </View>

            {/* Barra de progresso */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progressPercentage}%` }
                        ]}
                    />
                </View>
            </View>

            {/*Timer*/}
            {timeLeft !== null && (
                <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={20} color="#F56565" />
                    <Text style={[
                        styles.timerText,
                        timeLeft <= 10 && styles.timerTextWarning
                    ]}>
                        {timeLeft}s
                    </Text>
                </View>
            )}
            {/* Área da pergunta */}
            <ScrollView contentContainerStyle={styles.questionContainer}>
                <Text style={styles.questionText}>{question.question}</Text>

                <View style={styles.alternativesContainer}>
                    {question.alternatives.map((alt, idx) => (
                        <TouchableOpacity
                            key={alt.id}
                            style={[
                                styles.alternativeButton,
                                {
                                    backgroundColor: getAnswerColor(idx),
                                    borderColor: selectedAnswer === idx
                                        ? (idx === (question.correct_answer - 1) ? '#48BB78' : '#F56565')
                                        : 'transparent',
                                    borderWidth: selectedAnswer === idx ? 2 : 0
                                }
                            ]}
                            onPress={() => handleAnswer(idx)}
                            disabled={selectedAnswer !== null}
                        >
                            <Text style={[
                                styles.alternativeText,
                                { color: getAnswerTextColor(idx) }
                            ]}>
                                {alt.alternative}
                            </Text>

                            {selectedAnswer !== null && idx === (question.correct_answer - 1) && (
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            )}

                            {selectedAnswer === idx && idx !== (question.correct_answer - 1) && (
                                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                            )}

                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Feedback*/}
            {selectedAnswer !== null && (
                <View style={styles.feedbackContainer}>
                    {selectedAnswer === (question.correct_answer - 1) ? (

                        <View style={styles.correctFeedback}>
                            <Ionicons name="checkmark-circle" size={24} color="#48BB78" />
                            <Text style={styles.feedbackText}>Resposta Correta!</Text>
                        </View>
                    ) : selectedAnswer === -1 ? (
                        <View style={styles.timeUpFeedback}>
                            <Ionicons name="time-outline" size={24} color="#F56565" />
                            <Text style={styles.feedbackText}>Tempo esgotado!</Text>
                        </View>
                    ) : (
                        <View style={styles.incorrectFeedback}>
                            <Ionicons name="close-circle" size={24} color="#F56565" />
                            <Text style={styles.feedbackText}>Resposta Incorreta</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={goToNextQuestion}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextButtonText}>
                            {current + 1 === questions.length ? 'Ver Resultado' : 'Próxima Pergunta'}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginTop: 16,
    },
    completedContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    completedTitle: {
        fontSize: 32,
        fontWeight: '600',
        color: '#4CC9F0',
        marginTop: 20,
        marginBottom: 10,
    },
    scoreContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    percentageText: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
    },
    messageText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    statsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    statText: {
        color: '#FFFFFF',
        marginLeft: 10,
        fontSize: 16,
    },
    detailedResults: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: '#1E1E2E',
        borderRadius: 12,
        padding: 15,
    },
    detailedResultsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4CC9F0',
        marginBottom: 15,
        textAlign: 'center',
    },
    questionResultItem: {
        marginBottom: 15,
    },
    questionResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    questionResultNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    resultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    correctBadge: {
        backgroundColor: '#48BB78',
    },
    incorrectBadge: {
        backgroundColor: '#F56565',
    },
    resultBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    questionResultText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 10,
        lineHeight: 20,
    },
    answerInfo: {
        gap: 8,
    },
    answerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    answerLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    answerText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 10,
    },
    correctText: {
        color: '#48BB78',
    },
    incorrectText: {
        color: '#F56565',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginTop: 10,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    primaryButton: {
        backgroundColor: '#4361EE',
    },
    secondaryButton: {
        backgroundColor: '#7209B7',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1E1E2E',
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        marginHorizontal: 15,
    },
    themeName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    progressText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    progressBarContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CC9F0',
        borderRadius: 3,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 8,
        gap: 8,
    },
    timerText: {
        color: '#F56565',
        fontSize: 16,
        fontWeight: '600',
    },
    timerTextWarning: {
        color: '#F56565',
        fontWeight: '700',
    },
    questionContainer: {
        flexGrow: 1,
        padding: 20,
    },
    questionText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 30,
        marginBottom: 30,
        textAlign: 'center',
    },
    alternativesContainer: {
        gap: 12,
    },
    alternativeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        minHeight: 60,
    },
    alternativeText: {
        fontSize: 16,
        flex: 1,
        fontWeight: '500',
    },
    feedbackContainer: {
        padding: 20,
        backgroundColor: '#1E1E2E',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    correctFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 10,
    },
    incorrectFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 10,
    },
    timeUpFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 10,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4361EE',
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});