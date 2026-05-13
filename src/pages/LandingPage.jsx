import { useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { ArrowRight, Shield, Zap, Users, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LandingPage({ onDemoLogin }) {
  const [showAuth, setShowAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (isDemoMode || !supabase) {
      setError('Connect Supabase to enable authentication. Use Demo mode instead.')
      setLoading(false)
      return
    }
    try {
      const { error: authError } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })
      if (authError) setError(authError.message)
    } catch (err) {
      setError('Authentication failed. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    if (isDemoMode || !supabase) return
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen bg-[#fafbfa]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">Wolff</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDemoLogin}
            className="px-4 py-2 text-sm text-sage-700 hover:text-sage-900 font-medium transition-colors"
          >
            Demo
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="px-5 py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Tax preparation,<br />
            <span className="text-sage-600">simplified.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 leading-relaxed max-w-xl">
            Manage clients, track documents, and automate communications.
            Everything your firm needs in one clean platform.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={() => { setShowAuth(true); setIsSignUp(true) }}
              className="px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors shadow-sm flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              onClick={onDemoLogin}
              className="px-6 py-3 text-sage-700 border border-sage-200 rounded-lg font-medium hover:bg-sage-50 transition-colors"
            >
              Try Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-100 bg-white">
            <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
              <Users size={20} className="text-sage-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Client Management</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Track personal, estate, and corporate returns. See document status at a glance. Import existing clients in bulk.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-100 bg-white">
            <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
              <Zap size={20} className="text-sage-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Operations</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered communication. Auto-request missing documents. Email integration routes docs to the right client automatically.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-100 bg-white">
            <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center mb-4">
              <Shield size={20} className="text-sage-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Status Tracking</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bird's eye pipeline view. Automated status updates to clients. Client-facing portal for self-service document upload.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 relative">
            <button
              onClick={() => { setShowAuth(false); setError('') }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10.34 10.34 0 0 0-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.462.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or</span></div>
            </div>

            {/* Email/Password */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400"
                    placeholder="you@email.com" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400"
                    placeholder="••••••••" required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 bg-sage-500 text-white rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} className="text-sage-600 font-medium hover:text-sage-700">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
