import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Invoices from './modules/Invoices/Invoices';
import Navigator from './components/ui/navigator/Navigator';
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <Navigator />
      <main className={styles.main}>
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<h1>Welcome to Calido Viaje</h1>} />
            <Route path="/invoices" element={<Invoices />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;