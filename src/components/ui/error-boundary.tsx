'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center animate-[forge-scale-in_0.2s_ease-out_forwards]">
            <div className="w-16 h-16 bg-[rgba(239,68,68,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
            </div>
            
            <h2 className="text-xl font-bold text-[#F0F0F0] mb-2 tracking-tight">Something went wrong</h2>
            <p className="text-sm text-[#A0A0A0] mb-8 leading-relaxed">
              We encountered an unexpected error. Try refreshing the page. If the issue persists, contact support.
            </p>

            {this.state.error && (
               <div className="mb-6 p-3 bg-[#111111] border border-[#2A2A2A] rounded-lg text-left overflow-x-auto text-xs font-mono text-[#EF4444]">
                 {this.state.error.message}
               </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full h-11 bg-[#222222] border border-[#333333] hover:border-[#444444] text-[#F0F0F0] font-medium rounded-lg transition-all duration-150-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
