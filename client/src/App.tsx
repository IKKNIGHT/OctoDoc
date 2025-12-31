import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CreatePaste from './components/CreatePaste';
import ViewPaste from './components/ViewPaste';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CreatePaste />} />
          <Route path="/paste/:id" element={<ViewPaste />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
