import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Articles from './pages/Articles';
import Publisher from './pages/Publisher';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="publisher" element={<Publisher />} />
          <Route path="sites" element={<Sites />} />
          <Route path="articles" element={<Articles />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
