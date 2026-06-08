import {Toaster} from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import AppRouter from './routes/AppRouter.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <AuthProvider>
          <CurrencyProvider>
            <AppRouter />
          </CurrencyProvider>
        </AuthProvider>
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </>
  )
}
