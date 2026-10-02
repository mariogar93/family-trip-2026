import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Navigation from './components/Navigation';
import AuthGate from './components/AuthGate';
import PWAInstallBanner from './components/PWAInstallBanner';

import ItineraryView from './views/ItineraryView';
import HomeView from './views/HomeView';
import GamesView from './views/GamesView';
import ExpensesView from './views/ExpensesView';
import LeaderboardPetView from './views/LeaderboardPetView';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('family_theme') || 'dark');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('family_admin') === 'true');
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('family_auth') === 'true'
  );
  const [activeMemberId, setActiveMemberId] = useState(
    () => localStorage.getItem('active_member_id') || null
  );
  const [activeTab, setActiveTab] = useState('home');
  const [activeGameSubTab, setActiveGameSubTab] = useState('missions');
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Default to arrival Nov 22 (index 1)

  const handleNavigateTab = (tab, subTab = null) => {
    setActiveTab(tab);
    if (tab === 'games' && subTab) {
      setActiveGameSubTab(subTab);
    }
  };

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);

  // App data states
  const [settings, setSettings] = useState({});
  const [members, setMembers] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [places, setPlaces] = useState([]);
  const [transits, setTransits] = useState([]);
  const [lodgings, setLodgings] = useState([]);
  const [bingoData, setBingoData] = useState({ items: [], winners: [], linesClaimed: [], countries: ['España', 'Francia'] });
  const [colorChallenges, setColorChallenges] = useState([]);
  const [expenseData, setExpenseData] = useState({ expenses: [], balances: [], settlements: [] });
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [photoFeed, setPhotoFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Theme on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme;
    localStorage.setItem('family_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToggleAdmin = (adminStatus) => {
    setIsAdmin(adminStatus);
    localStorage.setItem('family_admin', adminStatus ? 'true' : 'false');
  };

  // Listen to PWA install event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      const [
        resSettings,
        resMembers,
        resItinerary,
        resPlaces,
        resTransits,
        resLodgings,
        resBingo,
        resColors,
        resExpenses,
        resMissions,
        resFeed,
      ] = await Promise.all([
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/members').then(r => r.json()),
        fetch('/api/itinerary').then(r => r.json()),
        fetch('/api/places').then(r => r.json()),
        fetch('/api/transits').then(r => r.json()).catch(() => []),
        fetch('/api/lodgings').then(r => r.json()).catch(() => []),
        fetch('/api/bingo').then(r => r.json()),
        fetch('/api/colors').then(r => r.json()),
        fetch('/api/expenses').then(r => r.json()),
        fetch('/api/missions').then(r => r.json()),
        fetch('/api/feed').then(r => r.json()),
      ]);

      setSettings(resSettings);
      setMembers(resMembers);
      setItinerary(resItinerary);
      setPlaces(resPlaces);
      setTransits(resTransits || []);
      setLodgings(resLodgings || []);
      setBingoData(resBingo);
      setColorChallenges(resColors.challenges || resColors || []);
      setExpenseData(resExpenses);
      setMissions(resMissions.missions || []);
      setCompletedMissions(resMissions.completed || []);
      setPhotoFeed(resFeed || []);

      // If active member was saved but not found in members, clear
      if (activeMemberId && !resMembers.some(m => String(m.id) === String(activeMemberId))) {
        if (resMembers.length > 0) {
          setActiveMemberId(String(resMembers[0].id));
          localStorage.setItem('active_member_id', String(resMembers[0].id));
        } else {
          setActiveMemberId(null);
          localStorage.removeItem('active_member_id');
        }
      } else if (!activeMemberId && resMembers.length === 1) {
        setActiveMemberId(String(resMembers[0].id));
        localStorage.setItem('active_member_id', String(resMembers[0].id));
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute active member object
  const activeMember = members.find(m => String(m.id) === String(activeMemberId)) || null;

  // Handlers
  const handleAuthenticate = () => {
    localStorage.setItem('family_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleSelectMember = (member) => {
    localStorage.setItem('active_member_id', String(member.id));
    setActiveMemberId(String(member.id));
  };

  const handleCreateMember = async (memberData) => {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    const newMember = await res.json();
    setMembers(prev => [...prev, newMember]);
    handleSelectMember(newMember);
    setShowCreateMemberModal(false);
  };

  const handleDeleteMember = async (memberId) => {
    await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
    const remaining = members.filter(m => m.id !== memberId);
    setMembers(remaining);
    if (String(activeMemberId) === String(memberId)) {
      if (remaining.length > 0) {
        handleSelectMember(remaining[0]);
      } else {
        setActiveMemberId(null);
        localStorage.removeItem('active_member_id');
      }
    }
    loadAllData();
  };

  const handleUpdatePet = async (memberId, petData) => {
    const res = await fetch(`/api/members/${memberId}/pet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData),
    });
    const updated = await res.json();
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  // Itinerary handlers
  const handleToggleActivity = async (actId, status, memberId) => {
    await fetch(`/api/itinerary/activity/${actId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, member_id: memberId }),
    });
    loadAllData();
  };

  const handleAddActivity = async (activityData) => {
    await fetch('/api/itinerary/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    loadAllData();
  };

  const handleDeleteActivity = async (actId) => {
    await fetch(`/api/itinerary/activity/${actId}`, { method: 'DELETE' });
    loadAllData();
  };

  const handleAddDay = async (dayData) => {
    await fetch('/api/itinerary/day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dayData),
    });
    loadAllData();
  };

  const handleAddDaysRange = async (rangeData) => {
    const res = await fetch('/api/itinerary/days-range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rangeData),
    });
    loadAllData();
    return res.json();
  };

  const handleDeleteDay = async (dayId) => {
    await fetch(`/api/itinerary/day/${dayId}`, { method: 'DELETE' });
    loadAllData();
  };

  // Places handlers
  const handleToggleVisited = async (placeId, memberId) => {
    await fetch(`/api/places/${placeId}/toggle-visited`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId }),
    });
    loadAllData();
  };

  const handleAddPlace = async (placeData) => {
    await fetch('/api/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(placeData),
    });
    loadAllData();
  };

  const handleUpdatePlace = async (placeId, updateData) => {
    await fetch(`/api/places/${placeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    loadAllData();
  };

  const handleDeletePlace = async (placeId) => {
    await fetch(`/api/places/${placeId}`, { method: 'DELETE' });
    loadAllData();
  };

  // Transit handlers
  const handleAddTransit = async (transitData) => {
    await fetch('/api/transits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transitData)
    });
    loadAllData();
  };

  const handleUpdateTransit = async (transitId, transitData) => {
    await fetch(`/api/transits/${transitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transitData)
    });
    loadAllData();
  };

  const handleDeleteTransit = async (transitId) => {
    await fetch(`/api/transits/${transitId}`, { method: 'DELETE' });
    loadAllData();
  };

  // Lodgings handlers
  const handleAddLodging = async (lodgingData) => {
    await fetch('/api/lodgings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lodgingData)
    });
    loadAllData();
  };

  const handleUpdateLodging = async (lodgingId, lodgingData) => {
    await fetch(`/api/lodgings/${lodgingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lodgingData)
    });
    loadAllData();
  };

  const handleDeleteLodging = async (lodgingId) => {
    await fetch(`/api/lodgings/${lodgingId}`, { method: 'DELETE' });
    loadAllData();
  };

  // Bingo handlers
  const handleCompleteBingoItem = async (itemId, memberId, photoFile) => {
    const formData = new FormData();
    formData.append('item_id', itemId);
    formData.append('member_id', memberId);
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    const res = await fetch('/api/bingo/complete', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    await loadAllData();
    return result;
  };

  const handleUnmarkBingoItem = async (itemId, memberId) => {
    const res = await fetch('/api/bingo/unmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, member_id: memberId })
    });
    const result = await res.json();
    await loadAllData();
    return result;
  };

  const handleToggleBingoItem = async (itemId, memberId, photoFile) => {
    const formData = new FormData();
    formData.append('item_id', itemId);
    formData.append('member_id', memberId);
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    await fetch('/api/bingo/toggle', {
      method: 'POST',
      body: formData,
    });
    await loadAllData();
  };

  const handleAddBingoItem = async (itemData) => {
    await fetch('/api/bingo/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    loadAllData();
  };

  const handleClaimLine = async (claimData) => {
    const res = await fetch('/api/bingo/claim-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });
    const result = await res.json();
    loadAllData();
    return result;
  };

  // Color hunt handler
  const handleSubmitColorPhoto = async (challengeId, memberId, photoFile, caption) => {
    const formData = new FormData();
    formData.append('challenge_id', challengeId);
    formData.append('member_id', memberId);
    formData.append('photo', photoFile);
    if (caption) formData.append('caption', caption);

    await fetch('/api/colors/submit', {
      method: 'POST',
      body: formData,
    });
    loadAllData();
  };

  // Expenses handlers
  const handleAddExpense = async (expenseObj) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseObj),
    });
    loadAllData();
  };

  const handleUpdateExpense = async (id, expenseObj) => {
    await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseObj),
    });
    loadAllData();
  };

  const handleDeleteExpense = async (id) => {
    await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
    loadAllData();
  };

  // Missions handler
  const handleToggleMission = async (missionId, memberId) => {
    await fetch(`/api/missions/${missionId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId }),
    });
    loadAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-emerald-400 gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <span className="text-xs font-bold text-zinc-400">Preparando el equipaje...</span>
      </div>
    );
  }

  return (
    <AuthGate
      isAuthenticated={isAuthenticated}
      onAuthenticate={handleAuthenticate}
      members={members}
      activeMember={activeMember}
      onSelectMember={handleSelectMember}
      onCreateMember={handleCreateMember}
      onDeleteMember={handleDeleteMember}
      showCreateModalExplicit={showCreateMemberModal}
      onCloseCreateModal={() => setShowCreateMemberModal(false)}
    >
      <div className="min-h-screen flex flex-col selection:bg-[#ff3b68] selection:text-white transition-colors">
        {/* Top App Bar */}
        <TopBar
          settings={settings}
          activeMember={activeMember}
          members={members}
          onSwitchMember={handleSelectMember}
          onUpdatePet={handleUpdatePet}
          onOpenCreateMember={() => setShowCreateMemberModal(true)}
          onDeleteMember={handleDeleteMember}
          installPrompt={installPrompt}
          onInstallPWA={handleInstallPWA}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isAdmin={isAdmin}
          onToggleAdmin={handleToggleAdmin}
          selectedDayIndex={selectedDayIndex}
          onSelectDay={(dayIdx) => {
            setSelectedDayIndex(dayIdx);
            setActiveTab('itinerary');
          }}
        />

        {/* PWA Install helper for iOS Safari and Android Chrome */}
        <PWAInstallBanner
          installPrompt={installPrompt}
          onInstall={handleInstallPWA}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-2">
          {activeTab === 'home' && (
            <HomeView
              settings={settings}
              activeMember={activeMember}
              itinerary={itinerary}
              places={places}
              transits={transits}
              lodgings={lodgings}
              bingoData={bingoData}
              expenseData={expenseData}
              onNavigateTab={handleNavigateTab}
              onSelectItineraryDay={(dayIdx) => {
                setSelectedDayIndex(dayIdx);
                setActiveTab('itinerary');
              }}
            />
          )}

          {activeTab === 'itinerary' && (
            <ItineraryView
              itinerary={itinerary}
              activeMember={activeMember}
              isAdmin={isAdmin}
              selectedDayIndex={selectedDayIndex}
              onSelectDayIndex={setSelectedDayIndex}
              onToggleActivity={handleToggleActivity}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
              onAddDay={handleAddDay}
              onAddDaysRange={handleAddDaysRange}
              onDeleteDay={handleDeleteDay}
              onToggleVisitedPlace={handleToggleVisited}
              onAddPlace={handleAddPlace}
              onUpdatePlace={handleUpdatePlace}
              onDeletePlace={handleDeletePlace}
              places={places}
              transits={transits}
              onAddTransit={handleAddTransit}
              onUpdateTransit={handleUpdateTransit}
              onDeleteTransit={handleDeleteTransit}
              lodgings={lodgings}
              onAddLodging={handleAddLodging}
              onUpdateLodging={handleUpdateLodging}
              onDeleteLodging={handleDeleteLodging}
            />
          )}

          {activeTab === 'games' && (
            <GamesView
              bingoData={bingoData}
              activeMember={activeMember}
              members={members}
              isAdmin={isAdmin}
              activeSubTab={activeGameSubTab}
              onSelectSubTab={setActiveGameSubTab}
              onToggleBingoItem={handleToggleBingoItem}
              onCompleteBingoItem={handleCompleteBingoItem}
              onUnmarkBingoItem={handleUnmarkBingoItem}
              onAddBingoItem={handleAddBingoItem}
              onClaimLine={handleClaimLine}
              colorChallenges={colorChallenges}
              onSubmitColorPhoto={handleSubmitColorPhoto}
              selectedDayIndex={selectedDayIndex}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenseData={expenseData}
              members={members}
              activeMember={activeMember}
              currencySymbol="€"
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'trophy' && (
            <LeaderboardPetView
              members={members}
              activeMember={activeMember}
              missions={missions}
              completedMissions={completedMissions}
              photoFeed={photoFeed}
              onToggleMission={handleToggleMission}
            />
          )}
        </main>

        {/* Modern Floating Bottom Navigation Dock */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </AuthGate>
  );
}
