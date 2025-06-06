import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChakra } from '../context/ChakraContext';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const { chakraState } = useChakra();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password || !fullName.trim()) {
      setError('All fields are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Redirect to dashboard after successful signup
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('Error signing up:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
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
            <h2 className="text-2xl font-bold mb-2 text-white">Create Your Account</h2>
            <p className="text-gray-400">Begin your journey of spiritual transformation</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-900 text-red-100 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                className="shadow appearance-none border rounded-md w-full py-3 px-4 bg-dark-300 border-dark-400 text-white leading-tight focus:outline-none focus:ring-2 focus:border-transparent"
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ focusRingColor: chakraState.color }}
                required
              />
            </div>
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
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
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
              <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters</p>
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
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </motion.button>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium transition-colors"
                  style={{ color: chakraState.color }}
                >
                  Sign in
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

export default SignupPage;