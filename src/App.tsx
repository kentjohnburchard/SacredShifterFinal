import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChakraProvider } from './context/ChakraContext';
import { XPProvider } from './context/XPProvider';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BlueprintPage from './pages/BlueprintPage';
import SigilGeneratorPage from './pages/SigilGeneratorPage';
import TasksPage from './pages/TasksPage';
import FractalMirrorPage from './pages/FractalMirrorPage';
import DigitalBaptismPage from './pages/DigitalBaptismPage';
import TheFoolPage from './pages/TheFoolPage';
import MagicianPage from './pages/MagicianPage';
import EmpressPage from './pages/EmpressPage';
import HighPriestessPage from './pages/HighPriestessPage';
import HierophantPage from './pages/HierophantPage';
import SigilGallery from './pages/SigilGallery';
import SigilEvolutionMap from './pages/SigilEvolutionMap';
import SigilBoardPage from './pages/SigilBoardPage';
import ProfilePage from './pages/ProfilePage';
import SacredCirclePage from './pages/SacredCirclePage';
import CircleDetailPage from './pages/CircleDetailPage';
import ResonanceSessionPage from './pages/ResonanceSessionPage';
import GridEchoMap from './pages/GridEchoMap';
import TimelineSelectorPage from './pages/TimelineSelectorPage';
import EchoCompassPage from './pages/EchoCompassPage';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ChakraProvider>
            <XPProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                  <Route path="/blueprint" element={<RequireAuth><BlueprintPage /></RequireAuth>} />
                  <Route path="/sigils" element={<RequireAuth><SigilGeneratorPage /></RequireAuth>} />
                  <Route path="/tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
                  <Route path="/fractal-mirror" element={<RequireAuth><FractalMirrorPage /></RequireAuth>} />
                  <Route path="/digital-baptism" element={<RequireAuth><DigitalBaptismPage /></RequireAuth>} />
                  <Route path="/the-fool" element={<RequireAuth><TheFoolPage /></RequireAuth>} />
                  <Route path="/the-high-priestess" element={<RequireAuth><HighPriestessPage /></RequireAuth>} />
                  <Route path="/journeys/hierophant" element={<RequireAuth><HierophantPage /></RequireAuth>} />
                  <Route path="/the-magician" element={<RequireAuth><MagicianPage /></RequireAuth>} />
                  <Route path="/the-empress" element={<RequireAuth><EmpressPage /></RequireAuth>} />
                  <Route path="/sigil-gallery" element={<RequireAuth><SigilGallery /></RequireAuth>} />
                  <Route path="/sigil-evolution" element={<RequireAuth><SigilEvolutionMap /></RequireAuth>} />
                  <Route path="/sigil-board" element={<RequireAuth><SigilBoardPage /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="/sacred-circle" element={<RequireAuth><SacredCirclePage /></RequireAuth>} />
                  <Route path="/sacred-circle/:id" element={<RequireAuth><CircleDetailPage /></RequireAuth>} />
                  <Route path="/sacred-circle/:circleId/session/:sessionId" element={<RequireAuth><ResonanceSessionPage /></RequireAuth>} />
                  <Route path="/grid-map" element={<RequireAuth><GridEchoMap /></RequireAuth>} />
                  <Route path="/timeline-selector" element={<RequireAuth><TimelineSelectorPage /></RequireAuth>} />
                  <Route path="/echo-compass" element={<RequireAuth><EchoCompassPage /></RequireAuth>} />
                </Route>
              </Routes>
            </XPProvider>
          </ChakraProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;