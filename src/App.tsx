import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceGenerator from './components/InvoiceGenerator';
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
            <Route path="/invoices" element={<InvoiceGenerator />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;