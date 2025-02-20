import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import InvoiceGenerator from './components/InvoiceGenerator';
import styles from './App.module.css';
import { useEffect } from 'react';
import { ClientsApi } from './middleware/api/ClientApi';

function App() {
  useEffect(() => {
    const getAllClients = async () => {
      ClientsApi.getAllClients()
    }
    getAllClients()
  }, [])
  return (
    <Router>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link className={styles.link} to="/">Home</Link>
          <Link className={styles.link} to="/invoices">Invoices</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<h1>Welcome</h1>} />
          <Route path="/invoices" element={<InvoiceGenerator />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
