import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { EDITIONS } from './data/editions';
import { RefractionCanvas } from './components/RefractionCanvas';
import { Navigation } from './components/Navigation';
import { HeroShowcase } from './components/HeroShowcase';
import { MarketDashboard } from './components/MarketDashboard';
import { ConfiguratorModal } from './components/ConfiguratorModal';
import { SearchModal } from './components/SearchModal';
import { EngineTachModal } from './components/EngineTachModal';
import { HeritageModal } from './components/HeritageModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { initAuth } from './services/googleAuth';
import { engineAudio } from './utils/audio';

export default function App() {
  const [activeEditionIndex, setActiveEditionIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('models');
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isTachModalOpen, setIsTachModalOpen] = useState<boolean>(false);
  const [isHeritageOpen, setIsHeritageOpen] = useState<boolean>(false);
  const [isDriveOpen, setIsDriveOpen] = useState<boolean>(false);
  const [showAerodynamics, setShowAerodynamics] = useState<boolean>(false);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Live fluctuating car price for real-time market dynamics
  const [livePrice, setLivePrice] = useState<number>(EDITIONS[0].marketPrice);

  const currentEdition = EDITIONS[activeEditionIndex] || EDITIONS[0];

  // Initialize auth state listener on app load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    setLivePrice(currentEdition.marketPrice);
  }, [currentEdition]);

  // Subtle real-time price fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.floor(Math.random() * 5) - 2) * 250;
        return Math.max(350000, prev + delta);
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleNextEdition = () => {
    setActiveEditionIndex((prev) => (prev + 1) % EDITIONS.length);
  };

  const handlePrevEdition = () => {
    setActiveEditionIndex((prev) => (prev - 1 + EDITIONS.length) % EDITIONS.length);
  };

  const handleSelectEdition = (editionId: string) => {
    const idx = EDITIONS.findIndex((e) => e.id === editionId);
    if (idx !== -1) {
      setActiveEditionIndex(idx);
    }
  };

  const handleToggleAudio = () => {
    if (isAudioActive) {
      engineAudio.stop();
      setIsAudioActive(false);
    } else {
      engineAudio.triggerRevBurst();
      setIsAudioActive(true);
      setIsTachModalOpen(true);
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'models') {
      setIsMarketOpen(false);
    } else if (tab === 'heritage') {
      setIsHeritageOpen(true);
    } else if (tab === 'configurator') {
      setIsConfiguratorOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F3F2EE] text-neutral-900 select-none overflow-x-hidden font-sans">
      {/* Interactive Refraction Glass Particles & Shards */}
      <RefractionCanvas
        accentColor={currentEdition.accentColor}
        intensity={1}
        showAerodynamics={showAerodynamics}
      />

      {/* Top Header Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenConfigurator={() => setIsConfiguratorOpen(true)}
        onToggleMarket={() => setIsMarketOpen((prev) => !prev)}
        isMarketOpen={isMarketOpen}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        currentPrice={livePrice}
        currentUser={currentUser}
        onOpenDrive={() => setIsDriveOpen(true)}
      />

      {/* Hero Showcase (The exact visual composition from the user screenshot) */}
      <HeroShowcase
        edition={currentEdition}
        onNextEdition={handleNextEdition}
        onPrevEdition={handlePrevEdition}
        currentIndex={activeEditionIndex}
        totalEditions={EDITIONS.length}
        onSelectIndex={(idx) => setActiveEditionIndex(idx)}
        showAerodynamics={showAerodynamics}
        onToggleAerodynamics={() => setShowAerodynamics((prev) => !prev)}
        onOpenMarket={() => setIsMarketOpen(true)}
        onOpenConfigurator={() => setIsConfiguratorOpen(true)}
      />

      {/* Live Market Trends & Telemetry Dashboard Modal */}
      <MarketDashboard
        isOpen={isMarketOpen}
        onClose={() => setIsMarketOpen(false)}
        currentCarPrice={livePrice}
        carName={currentEdition.title}
        onOpenDrive={() => {
          setIsMarketOpen(false);
          setIsDriveOpen(true);
        }}
      />

      {/* Interactive Configurator Studio */}
      <ConfiguratorModal
        isOpen={isConfiguratorOpen}
        onClose={() => setIsConfiguratorOpen(false)}
        edition={currentEdition}
        onSelectEdition={handleSelectEdition}
        onOpenMarket={() => {
          setIsConfiguratorOpen(false);
          setIsMarketOpen(true);
        }}
        onOpenDrive={() => {
          setIsConfiguratorOpen(false);
          setIsDriveOpen(true);
        }}
      />

      {/* Google Drive Vault & Document Management Modal */}
      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        currentEdition={currentEdition}
        currentPrice={livePrice}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEdition={handleSelectEdition}
        onOpenMarket={() => {
          setIsSearchOpen(false);
          setIsMarketOpen(true);
        }}
      />

      {/* 9,000 RPM Flat-Six Engine Audio & Tachometer Simulator */}
      <EngineTachModal
        isOpen={isTachModalOpen}
        onClose={() => {
          setIsTachModalOpen(false);
          setIsAudioActive(false);
        }}
      />

      {/* Heritage History Modal */}
      <HeritageModal
        isOpen={isHeritageOpen}
        onClose={() => setIsHeritageOpen(false)}
        onOpenMarket={() => {
          setIsHeritageOpen(false);
          setIsMarketOpen(true);
        }}
      />
    </div>
  );
}
