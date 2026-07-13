import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { PlayerProvider } from './store/playerStore';
import { MatchProvider } from './store/matchStore';
import { ToastProvider } from './components/ui/Toast';
import './styles/globals.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MatchProvider>
        <PlayerProvider>
          <ToastProvider>
            <Router />
          </ToastProvider>
        </PlayerProvider>
      </MatchProvider>
    </BrowserRouter>
  );
};

export default App;
