import { BrowserRouter as Router} from 'react-router-dom';
import Navigator from './components/navigator/Navigator';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './components/appRouter/AppRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigator />
        <AppRouter />
      </AuthProvider>
    </Router>
  );
}

export default App;