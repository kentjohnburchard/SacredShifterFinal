import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the return path from location state, if available
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      // Redirect to the page they tried to visit or dashboard
      navigate(from, { replace: true });
      
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <motion.div 
          className="bg-dark-200 shadow-lg rounded-2xl px-8 pt-6 pb-8 mb-4 border border-dark-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div className="text-3xl font-heading font-bold text-white">
                Sacred <span className="opacity-70">Shifter</span>
              </div>
            </Link>
            <h2 className="text-2xl font-bold mb-2 text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue your spiritual journey</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-900 text-red-100 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-dark-300 border-dark-400 text-white leading-tight focus:outline-none focus:ring-2 focus:border-transparent"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ focusRingColor: chakraState.color }}
                required
              />
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-300 text-sm font-bold" htmlFor="password">
                  Password
                </label>
                <a className="inline-block align-baseline font-bold text-sm" href="#" style={{ color: chakraState.color }}>
                  Forgot Password?
                </a>
              </div>
              <input
                className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-dark-300 border-dark-400 text-white leading-tight focus:outline-none focus:ring-2 focus:border-transparent"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ focusRingColor: chakraState.color }}
                required
              />
            </div>
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{ 
                  backgroundColor: chakraState.color,
                  boxShadow: `0 0 15px ${chakraState.color}40`,
                  focusRingColor: chakraState.color
                }}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium transition-colors"
                  style={{ color: chakraState.color }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
        
        <div className="text-center">
          <Link to="/" className="text-gray-400 text-sm hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;