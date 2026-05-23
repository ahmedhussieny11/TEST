import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import App from './App.tsx'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import { setPatientToken } from './api/client'
import { applyApiBaseUrl } from './api/setupApi'
import { loadRuntimeConfig } from './config/runtime'
import { usePatientAuthStore } from './patient/store/patientAuthStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

async function bootstrap() {
  await loadRuntimeConfig()
  applyApiBaseUrl()

  const savedPatientToken = usePatientAuthStore.getState().token
  if (savedPatientToken) {
    setPatientToken(savedPatientToken)
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <ToastContainer
            position="top-center"
            rtl={true}
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
          />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

bootstrap()

