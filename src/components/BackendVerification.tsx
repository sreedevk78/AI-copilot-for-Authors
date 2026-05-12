'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Zap,
  Shield,
  Activity
} from 'lucide-react'
import { backendVerification } from '@/lib/backendVerification'

interface VerificationResult {
  feature: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export function BackendVerification() {
  const [results, setResults] = useState<VerificationResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const runVerification = async () => {
    setIsRunning(true)
    try {
      const verificationResults = await backendVerification.verifyAllBackendSaves()
      const persistenceResults = await backendVerification.testDataPersistence()
      
      setResults([...verificationResults, ...persistenceResults])
      setLastRun(new Date())
    } catch (error) {
      console.error('Verification error:', error)
      setResults([{
        feature: 'Verification System',
        status: 'error',
        message: 'Failed to run verification',
        details: error
      }])
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Activity className="w-5 h-5 text-[#8D6B4A]" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-[#D8C2A4] text-yellow-800'
      default:
        return 'bg-[var(--cx-bg-wash)] border-[var(--cx-border)] text-gray-800'
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length

  return (
    <div className="glassmorphism-card p-6 max-w-4xl mx-auto my-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#8D6B4A] to-[#563024] p-3 rounded-lg shadow-lg">
          <Database className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#2A1711]">Backend Verification</h1>
          <p className="text-[var(--cx-ink-secondary)]">Verify that all features save properly to the backend</p>
        </div>
      </div>

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FDFBF7] rounded-lg p-4 border border-[var(--cx-border)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-800">Success</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{successCount}</p>
          </div>
          <div className="bg-[#FDFBF7] rounded-lg p-4 border border-[var(--cx-border)]">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-800">Errors</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{errorCount}</p>
          </div>
          <div className="bg-[#FDFBF7] rounded-lg p-4 border border-[var(--cx-border)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-800">Warnings</span>
            </div>
            <p className="text-2xl font-bold text-[#BF8C3D] mt-1">{warningCount}</p>
          </div>
          <div className="bg-[#FDFBF7] rounded-lg p-4 border border-[var(--cx-border)]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#8D6B4A] mt-1">{results.length}</p>
          </div>
        </div>
      )}

      {/* Run Button */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runVerification}
          disabled={isRunning}
          className="bg-gradient-to-r from-[#8D6B4A] to-[#563024] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Running Verification...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run Backend Verification
            </>
          )}
        </motion.button>

        {lastRun && (
          <div className="text-sm text-[var(--cx-ink-secondary)]">
            Last run: {lastRun.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Verification Results</h2>
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{result.feature}</h3>
                  <p className="text-sm mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline">
                        View Details
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-black/10 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {results.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-[var(--cx-ink-faint)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Verify Backend</h3>
          <p className="text-[var(--cx-ink-secondary)] mb-6">
            Click the button above to verify that all features are saving properly to the backend.
            This will test all API endpoints and data persistence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              User Onboarding Data
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Story Creation & Management
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              AI-Generated Content
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              World Building Data
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Character & Plot Data
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--cx-ink-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              AI Suggestions
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
