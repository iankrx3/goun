import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { NavHeader } from './components/NavHeader';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { useAuth } from './hooks/useAuth';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import CommunityPage from './pages/CommunityPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import TreatmentDetailPage from './pages/TreatmentDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import type { AuthReturnTab } from './services/auth';

export default function App() {
  const { authReady, session, returnTab, signOut, signInAsDemo } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (returnTab) setIsAuthOpen(false);
  }, [returnTab]);

  const authReturnTab: AuthReturnTab = location.pathname.startsWith('/map')
    ? 'map'
    : location.pathname.startsWith('/community')
      ? 'community'
      : 'explore';

  if (!authReady) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-miyeon-main/60">
        Signing you in…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-miyeon-main">
      <NavHeader session={session} onSignIn={() => setIsAuthOpen(true)} onSignOut={signOut} />

      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/community"
          element={<CommunityPage session={session} onSignIn={() => setIsAuthOpen(true)} />}
        />
        <Route
          path="/community/:id"
          element={<PostDetailPage session={session} onSignIn={() => setIsAuthOpen(true)} />}
        />
        <Route path="/place/:id" element={<PlaceDetailPage />} />
        <Route path="/treatment/:id" element={<TreatmentDetailPage />} />
      </Routes>

      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        returnTab={authReturnTab}
        onDemoSignIn={signInAsDemo}
      />
    </div>
  );
}
