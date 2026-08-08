import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './components/common/ToastProvider.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <ToastProvider />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
