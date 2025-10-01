import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './telas/Home/home';
import CadastroTema from './telas/Tema/cadastroTema';
import CadastroPergunta from './telas/Pergunta/cadastroPergunta';
import ListaTema from './telas/Tema/listaTema';
import ListagemPerguntas from './telas/Pergunta/listaPergunta';
import Quiz from './telas/Quiz/quiz';
import ConfigurarQuiz from './telas/Quiz/configurarQuiz';


/* Help:
https://reactnavigation.org/docs/hello-react-navigation
https://reactnavigation.org/docs/native-stack-navigator/#headerbackvisible

// pacotes para instalar: 
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npm install react-native-keyboard-aware-scroll-view
npx expo install @react-navigation/native-stack
*/


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroTema" component={CadastroTema} options={{ headerShown: false }} />
        <Stack.Screen name="CadastroPergunta" component={CadastroPergunta} options={{ headerShown: false }} />
        <Stack.Screen name="ListaTema" component={ListaTema} options={{ headerShown: false }} />
        <Stack.Screen name="Quiz" component={Quiz} options={{ headerShown: false }} />
        <Stack.Screen name="ListagemPerguntas" component={ListagemPerguntas} options={{ headerShown: false }} />
        <Stack.Screen name="ConfigurarQuiz" component={ConfigurarQuiz} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


