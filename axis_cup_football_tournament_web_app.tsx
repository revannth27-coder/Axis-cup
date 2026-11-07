import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

// ==========================================
// INLINE SVG ICONS (Fixes Lucide import errors)
// ==========================================
const Trophy = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4m-5-8h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2zM5 5h14v2H5V5z" />
  </svg>
);

const Shield = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Users = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Calendar = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Megaphone = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c.41 0 .789.208 1.018.556L12 9h4a2 2 0 012 2v1.5a2 2 0 01-2 2h-4l-2.15 2.444a1.205 1.205 0 01-1.018.556H7a4 4 0 01-1.564-.317z" />
  </svg>
);

const Lock = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Unlock = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const Trash2 = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckCircle = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusCircle = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogOut = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const AlertTriangle = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const Award = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Clock = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPin = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Sparkles = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// ==========================================
// 1. FIREBASE INITIALIZATION (Mandatory Rules)
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
      storageBucket: "demo-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'axis-cup-2026';

// Helper for Firestore public collections
const getPublicCol = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
const getPublicDoc = (colName, docId) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

// Preset Team Logos for fast selection
const PRESET_LOGOS = [
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop&q=80"
];

// Helper to calculate standings for a pool
const computeStandings = (poolName, teams, matches) => {
  const poolTeams = teams.filter(t => t.pool === poolName);
  const table = {};

  poolTeams.forEach(t => {
    table[t.id] = {
      id: t.id,
      name: t.name,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gs: 0,
      ga: 0,
      gd: 0,
      pts: 0,
      overridePts: t.manualPtsBonus || 0
    };
  });

  matches.filter(m => m.stage === poolName && m.status === 'Finished' && m.approved).forEach(m => {
    const home = table[m.homeTeamId];
    const away = table[m.awayTeamId];

    if (home && away) {
      home.played += 1;
      away.played += 1;
      home.gs += Number(m.homeScore || 0);
      home.ga += Number(m.awayScore || 0);
      away.gs += Number(m.awayScore || 0);
      away.ga += Number(m.homeScore || 0);

      if (m.homeScore > m.awayScore) {
        home.won += 1;
        home.pts += 3;
        away.lost += 1;
      } else if (m.homeScore < m.awayScore) {
        away.won += 1;
        away.pts += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.pts += 1;
        away.pts += 1;
      }
    }
  });

  return Object.values(table).map(t => ({
    ...t,
    gd: t.gs - t.ga,
    totalPts: t.pts + t.overridePts
  })).sort((a, b) => {
    if (b.totalPts !== a.totalPts) return b.totalPts - a.totalPts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gs - a.gs;
  });
};

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // App Navigation
  const [activeTab, setActiveTab] = useState('register'); // register, pools, schedule, bracket, announcements, admin

  // Real-time Firestore Collections state
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [settings, setSettings] = useState({ registrationOpen: true });
  const [bracket, setBracket] = useState({ quarterFinals: [], semiFinals: [], final: [] });

  // Registration Form State
  const [teamName, setTeamName] = useState('');
  const [captainContact, setCaptainContact] = useState('');
  const [teamLogo, setTeamLogo] = useState(PRESET_LOGOS[0]);
  const [players, setPlayers] = useState([
    { name: '', position: 'GK' },
    { name: '', position: 'DEF' },
    { name: '', position: 'DEF' },
    { name: '', position: 'MID' },
    { name: '', position: 'MID' },
    { name: '', position: 'FWD' },
    { name: '', position: 'FWD' }
  ]);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  // Admin Editors State
  const [editingTeam, setEditingTeam] = useState(null);
  const [newMatch, setNewMatch] = useState({
    homeTeamId: '',
    awayTeamId: '',
    stage: 'Pool A',
    time: '16:00',
    date: new Date().toISOString().split('T')[0],
    pitch: 'Pitch 1 (Axis Grounds)'
  });
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // 1. One-time Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Listeners (Guarded by user auth)
  useEffect(() => {
    if (!user) return;

    // Listen Teams
    const unsubTeams = onSnapshot(getPublicCol('teams'), 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTeams(docs);
      },
      (err) => console.error("Teams sync error:", err)
    );

    // Listen Matches
    const unsubMatches = onSnapshot(getPublicCol('matches'), 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setMatches(docs);
      },
      (err) => console.error("Matches sync error:", err)
    );

    // Listen Announcements
    const unsubAnnounce = onSnapshot(getPublicCol('announcements'), 
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => b.timestamp - a.timestamp);
        setAnnouncements(docs);
      },
      (err) => console.error("Announcements sync error:", err)
    );

    // Listen Tournament Settings
    const unsubSettings = onSnapshot(getPublicDoc('settings', 'config'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        } else {
          setDoc(getPublicDoc('settings', 'config'), { registrationOpen: true });
        }
      },
      (err) => console.error("Settings sync error:", err)
    );

    // Listen Bracket
    const unsubBracket = onSnapshot(getPublicDoc('brackets', 'knockout'),
      (docSnap) => {
        if (docSnap.exists()) {
          setBracket(docSnap.data());
        }
      },
      (err) => console.error("Bracket sync error:", err)
    );

    return () => {
      unsubTeams();
      unsubMatches();
      unsubAnnounce();
      unsubSettings();
      unsubBracket();
    };
  }, [user]);

  // Admin login check
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passcode === 'naqvi123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPasscode('');
      setLoginError('');
      setActiveTab('admin');
    } else {
      setLoginError('Invalid Passcode! Only authorized administrators are allowed.');
    }
  };

  // Handle Team Registration
  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    setRegSuccessMsg('');
    setRegErrorMsg('');

    if (!settings.registrationOpen) {
      setRegErrorMsg('Registration is currently closed by the tournament administrator.');
      return;
    }

    if (!teamName.trim() || !captainContact.trim()) {
      setRegErrorMsg('Please fill in team name and captain contact info.');
      return;
    }

    // Check players validation (exactly 7 max)
    const validPlayers = players.filter(p => p.name.trim() !== '');
    if (validPlayers.length !== 7) {
      setRegErrorMsg('Exactly 7 player names are required for squad registration.');
      return;
    }

    try {
      const teamId = 'team_' + Date.now();
      const newTeam = {
        name: teamName.trim(),
        captainContact: captainContact.trim(),
        logo: teamLogo,
        players: validPlayers,
        pool: 'Unassigned', // Unassigned until Admin seeds into Pool A, B, C, or D
        manualPtsBonus: 0,
        registeredAt: Date.now()
      };

      await setDoc(getPublicDoc('teams', teamId), newTeam);

      setRegSuccessMsg(`Success! "${teamName}" has been registered for Axis Cup 2026.`);
      setTeamName('');
      setCaptainContact('');
      setPlayers([
        { name: '', position: 'GK' },
        { name: '', position: 'DEF' },
        { name: '', position: 'DEF' },
        { name: '', position: 'MID' },
        { name: '', position: 'MID' },
        { name: '', position: 'FWD' },
        { name: '', position: 'FWD' }
      ]);
    } catch (err) {
      console.error(err);
      setRegErrorMsg('Failed to register team. Check internet connection.');
    }
  };

  // Player input field updater
  const updatePlayer = (index, field, value) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  // Admin Operations
  const toggleRegistration = async () => {
    try {
      await setDoc(getPublicDoc('settings', 'config'), {
        ...settings,
        registrationOpen: !settings.registrationOpen
      });
    } catch (err) {
      console.error(err);
    }
  };

  const setTeamPool = async (teamId, pool) => {
    try {
      const teamRef = getPublicDoc('teams', teamId);
      const targetTeam = teams.find(t => t.id === teamId);
      if (targetTeam) {
        await setDoc(teamRef, { ...targetTeam, pool });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team? All references will be removed.")) return;
    try {
      await deleteDoc(getPublicDoc('teams', teamId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.homeTeamId || !newMatch.awayTeamId) {
      alert("Please select both Home and Away teams.");
      return;
    }
    if (newMatch.homeTeamId === newMatch.awayTeamId) {
      alert("Home and Away teams cannot be the same.");
      return;
    }

    try {
      const matchId = 'match_' + Date.now();
      const matchData = {
        ...newMatch,
        homeScore: 0,
        awayScore: 0,
        status: 'Upcoming', // Upcoming, Live, Finished
        approved: false, // Must be approved by admin to reflect on rankings
        createdAt: Date.now()
      };
      await setDoc(getPublicDoc('matches', matchId), matchData);
      alert("Match scheduled successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const updateMatchScore = async (matchId, homeScore, awayScore, status, approved) => {
    try {
      const target = matches.find(m => m.id === matchId);
      if (target) {
        await setDoc(getPublicDoc('matches', matchId), {
          ...target,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          status,
          approved
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMatch = async (matchId) => {
    if (!window.confirm("Delete this match?")) return;
    try {
      await deleteDoc(getPublicDoc('matches', matchId));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    try {
      const annId = 'ann_' + Date.now();
      await setDoc(getPublicDoc('announcements', annId), {
        text: broadcastMsg.trim(),
        timestamp: Date.now()
      });
      setBroadcastMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await deleteDoc(getPublicDoc('announcements', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Automated Knockout Bracket Generator (Top 2 from Pools A, B, C, D)
  const generateKnockoutBrackets = async () => {
    if (!window.confirm("Generate Automated Knockout Bracket based on top teams in Pool A, B, C, D?")) return;

    const poolA = computeStandings('Pool A', teams, matches);
    const poolB = computeStandings('Pool B', teams, matches);
    const poolC = computeStandings('Pool C', teams, matches);
    const poolD = computeStandings('Pool D', teams, matches);

    const qf = [
      { id: 'qf1', title: 'QF 1', team1: poolA[0]?.name || '1st Pool A', team2: poolB[1]?.name || '2nd Pool B', score1: '-', score2: '-' },
      { id: 'qf2', title: 'QF 2', team1: poolB[0]?.name || '1st Pool B', team2: poolA[1]?.name || '2nd Pool A', score1: '-', score2: '-' },
      { id: 'qf3', title: 'QF 3', team1: poolC[0]?.name || '1st Pool C', team2: poolD[1]?.name || '2nd Pool D', score1: '-', score2: '-' },
      { id: 'qf4', title: 'QF 4', team1: poolD[0]?.name || '1st Pool D', team2: poolC[1]?.name || '2nd Pool C', score1: '-', score2: '-' }
    ];

    const sf = [
      { id: 'sf1', title: 'Semi-Final 1', team1: 'Winner QF 1', team2: 'Winner QF 3', score1: '-', score2: '-' },
      { id: 'sf2', title: 'Semi-Final 2', team1: 'Winner QF 2', team2: 'Winner QF 4', score1: '-', score2: '-' }
    ];

    const fn = [
      { id: 'fn1', title: 'GRAND FINAL', team1: 'Winner SF 1', team2: 'Winner SF 2', score1: '-', score2: '-' }
    ];

    const bracketData = { quarterFinals: qf, semiFinals: sf, final: fn };
    await setDoc(getPublicDoc('brackets', 'knockout'), bracketData);
    alert("Automated Knockout Bracket generated & published!");
  };

  // Pools Standings Computation
  const poolAStandings = useMemo(() => computeStandings('Pool A', teams, matches), [teams, matches]);
  const poolBStandings = useMemo(() => computeStandings('Pool B', teams, matches), [teams, matches]);
  const poolCStandings = useMemo(() => computeStandings('Pool C', teams, matches), [teams, matches]);
  const poolDStandings = useMemo(() => computeStandings('Pool D', teams, matches), [teams, matches]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12 selection:bg-emerald-500 selection:text-white">
      {/* Realtime Announcement Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-medium py-2.5 px-4 shadow-lg flex items-center justify-between text-sm overflow-hidden">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full animate-pulse">
            <Megaphone className="h-5 w-5 flex-shrink-0 text-slate-950" />
            <span className="font-bold uppercase text-xs tracking-wider bg-slate-950 text-yellow-400 px-2 py-0.5 rounded">Broadcast</span>
            <p className="truncate font-semibold">{announcements[0].text}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="border-b border-emerald-900/40 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-0.5 shadow-xl flex items-center justify-center">
                <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                    AXIS CUP 2026
                  </h1>
                  <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Official
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  Axis Hostel No. 2, Samarkand • SSMU International Faculty
                </p>
              </div>
            </div>

            {/* Action Header Items */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-400 block font-semibold">Organized by</span>
                <span className="text-xs text-amber-400 font-bold">Axis Institutes & Axis FC</span>
              </div>

              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Admin Access</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Admin Mode
                  </span>
                  <button
                    onClick={() => { setIsAdmin(false); setActiveTab('register'); }}
                    className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
                    title="Exit Admin Control"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto mt-5 pb-1 scrollbar-none border-t border-slate-800/80 pt-3">
            {[
              { id: 'register', label: 'Team Registration', icon: Users },
              { id: 'pools', label: 'Pool Standings', icon: Shield },
              { id: 'schedule', label: 'Matches & Live Scores', icon: Calendar },
              { id: 'bracket', label: 'Knockout Stage', icon: Trophy },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              ...(isAdmin ? [{ id: 'admin', label: '⚡ Admin Control Panel', icon: Sparkles }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ============================================================ */}
        {/* TAB 1: TEAM REGISTRATION FORM */}
        {/* ============================================================ */}
        {activeTab === 'register' && (
          <div className="space-y-6">
            {/* Tournament Info Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Trophy className="h-64 w-64 text-emerald-400" />
              </div>
              <div className="relative z-10 max-w-3xl">
                <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                  Samarkand State Medical University
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  Axis Cup Football Tournament Registration
                </h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  Held at <span className="text-emerald-400 font-semibold">Axis Hostel No. 2, Samarkand</span>. Reserved exclusively for students of the International Faculty of SSMU. Organized by Axis Institutes and managed by Axis FC.
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>Max 7 Players Per Team</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Shield className="h-4 w-4 text-amber-400" />
                    <span>4 Robin Pools System</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="h-4 w-4 text-teal-400" />
                    <span>Status: {settings.registrationOpen ? <span className="text-emerald-400 font-bold">Registration OPEN</span> : <span className="text-red-400 font-bold">Registration CLOSED</span>}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Status Indicator */}
            {!settings.registrationOpen ? (
              <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-2xl">
                <XCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Registration Closed</h3>
                <p className="text-slate-400 text-sm mt-1">
                  The tournament administrator has locked team registration. Please check match schedules and group standings.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-emerald-400" />
                      Register Your Team
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Fill out team credentials & register exactly 7 players.</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-3 py-1 rounded-full">
                    {teams.length} Teams Registered
                  </span>
                </div>

                {regSuccessMsg && (
                  <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span>{regSuccessMsg}</span>
                  </div>
                )}

                {regErrorMsg && (
                  <div className="mb-6 p-4 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <span>{regErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterTeam} className="space-y-6">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Samarkand Strikers FC"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Captain Contact (WhatsApp / Phone) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +998 90 123 45 67"
                        value={captainContact}
                        onChange={(e) => setCaptainContact(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Team Logo Picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Choose Team Logo / Insignia
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      {PRESET_LOGOS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTeamLogo(url)}
                          className={`relative rounded-xl overflow-hidden p-1 border-2 transition ${
                            teamLogo === url ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="preset" className="h-12 w-12 object-cover rounded-lg" />
                        </button>
                      ))}
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={teamLogo}
                        onChange={(e) => setTeamLogo(e.target.value)}
                        className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Squad Registration - Exactly 7 Players */}
                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="h-4 w-4" /> Team Roster (Exactly 7 Players Maximum)
                      </h4>
                      <span className="text-xs text-slate-400">7 Required</span>
                    </div>

                    <div className="space-y-3">
                      {players.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <span className="text-xs font-bold text-emerald-400 w-6 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            placeholder={`Player ${idx + 1} Full Name`}
                            value={p.name}
                            onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                            required
                          />
                          <select
                            value={p.position}
                            onChange={(e) => updatePlayer(idx, 'position', e.target.value)}
                            className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-semibold"
                          >
                            <option value="GK">GK (Goalkeeper)</option>
                            <option value="DEF">DEF (Defender)</option>
                            <option value="MID">MID (Midfielder)</option>
                            <option value="FWD">FWD (Forward)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold py-4 px-6 rounded-xl shadow-xl hover:shadow-emerald-950/50 transition-all transform active:scale-98 text-base tracking-wide"
                  >
                    REGISTER TEAM NOW
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: POOL STANDINGS (4 ROUND ROBIN POOLS) */}
        {/* ============================================================ */}
        {activeTab === 'pools' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-400" />
                  4 Round Robin Pool Standings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Automated live calculation of Points (PTS), Goal Difference (GD), and Wins.</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-950 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-800/50 font-bold">
                  Win = 3 pts
                </span>
                <span className="bg-slate-900 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-800 font-bold">
                  Draw = 1 pt
                </span>
              </div>
            </div>

            {/* Pools Grid A, B, C, D */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {['Pool A', 'Pool B', 'Pool C', 'Pool D'].map((poolName, idx) => {
                const standings = poolName === 'Pool A' ? poolAStandings :
                                 poolName === 'Pool B' ? poolBStandings :
                                 poolName === 'Pool C' ? poolCStandings : poolDStandings;

                return (
                  <div key={poolName} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                        <h3 className="font-extrabold text-lg text-white uppercase tracking-wider">{poolName}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{standings.length} Teams</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-850">
                          <tr>
                            <th className="py-3 px-4">Pos & Team</th>
                            <th className="py-3 px-2 text-center">P</th>
                            <th className="py-3 px-2 text-center">W</th>
                            <th className="py-3 px-2 text-center">D</th>
                            <th className="py-3 px-2 text-center">L</th>
                            <th className="py-3 px-2 text-center">GS</th>
                            <th className="py-3 px-2 text-center">GA</th>
                            <th className="py-3 px-2 text-center">GD</th>
                            <th className="py-3 px-4 text-center text-amber-400 font-extrabold">PTS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {standings.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="py-6 text-center text-slate-500 italic">
                                No teams seeded in {poolName} yet.
                              </td>
                            </tr>
                          ) : (
                            standings.map((team, rank) => (
                              <tr key={team.id} className={`hover:bg-slate-850/50 transition ${rank < 2 ? 'bg-emerald-950/10' : ''}`}>
                                <td className="py-3 px-4 flex items-center space-x-3">
                                  <span className={`font-bold w-4 ${rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {rank + 1}
                                  </span>
                                  <img src={team.logo} alt="" className="h-6 w-6 rounded-full object-cover border border-slate-700" />
                                  <span className="font-bold text-slate-200 truncate max-w-[120px] sm:max-w-[160px]">{team.name}</span>
                                </td>
                                <td className="py-3 px-2 text-center font-medium text-slate-300">{team.played}</td>
                                <td className="py-3 px-2 text-center text-emerald-400">{team.won}</td>
                                <td className="py-3 px-2 text-center text-slate-400">{team.drawn}</td>
                                <td className="py-3 px-2 text-center text-red-400">{team.lost}</td>
                                <td className="py-3 px-2 text-center text-slate-300">{team.gs}</td>
                                <td className="py-3 px-2 text-center text-slate-300">{team.ga}</td>
                                <td className={`py-3 px-2 text-center font-bold ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                  {team.gd > 0 ? `+${team.gd}` : team.gd}
                                </td>
                                <td className="py-3 px-4 text-center font-extrabold text-sm text-amber-400">
                                  {team.totalPts}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: MATCH SCHEDULE & REAL-TIME LIVE SCORES */}
        {/* ============================================================ */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  Tournament Schedule & Real-Time Scores
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Scores update live upon official referee/admin verification.</p>
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-300">No Matches Scheduled Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Check back soon for released pool fixtures & timings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map(m => {
                  const homeTeam = teams.find(t => t.id === m.homeTeamId);
                  const awayTeam = teams.find(t => t.id === m.awayTeamId);

                  return (
                    <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                      {/* Top Bar Status */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs font-semibold">
                        <span className="text-emerald-400 uppercase tracking-wider font-bold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                          {m.stage}
                        </span>
                        <div className="flex items-center space-x-2">
                          {m.status === 'Live' && (
                            <span className="flex items-center gap-1.5 text-xs text-red-400 font-extrabold animate-pulse bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800">
                              <span className="h-2 w-2 rounded-full bg-red-500"></span> LIVE
                            </span>
                          )}
                          {m.status === 'Finished' && (
                            <span className="text-slate-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                              Finished
                            </span>
                          )}
                          {m.status === 'Upcoming' && (
                            <span className="text-amber-400 font-bold bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Score Display */}
                      <div className="flex items-center justify-between py-2">
                        {/* Home */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <img src={homeTeam?.logo || PRESET_LOGOS[0]} alt="" className="h-12 w-12 rounded-xl object-cover border border-slate-700 shadow" />
                          <span className="font-bold text-sm text-slate-100 mt-2 truncate max-w-[130px]">{homeTeam?.name || 'Home Team'}</span>
                        </div>

                        {/* Score Box */}
                        <div className="px-4 text-center">
                          {m.status === 'Upcoming' ? (
                            <div className="text-slate-500 font-bold text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                              VS
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-2xl font-extrabold bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
                              <span className="text-emerald-400">{m.homeScore}</span>
                              <span className="text-slate-600">-</span>
                              <span className="text-emerald-400">{m.awayScore}</span>
                            </div>
                          )}
                        </div>

                        {/* Away */}
                        <div className="flex-1 flex flex-col items-center text-center">
                          <img src={awayTeam?.logo || PRESET_LOGOS[1]} alt="" className="h-12 w-12 rounded-xl object-cover border border-slate-700 shadow" />
                          <span className="font-bold text-sm text-slate-100 mt-2 truncate max-w-[130px]">{awayTeam?.name || 'Away Team'}</span>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" /> {m.date} @ {m.time}</span>
                        <span className="flex items-center gap-1 text-slate-300 font-medium"><MapPin className="h-3.5 w-3.5 text-emerald-400" /> {m.pitch}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: AUTOMATED KNOCKOUT BRACKET STAGE */}
        {/* ============================================================ */}
        {activeTab === 'bracket' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-400" />
                  Knockout Stage Bracket
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Top 2 qualified teams from each pool progress to Quarter-Finals.</p>
              </div>
            </div>

            {!bracket.quarterFinals || bracket.quarterFinals.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto">
                <Award className="h-12 w-12 text-amber-500/60 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-200">Knockout Stage Not Yet Generated</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The automated bracket will be published by the administrator once Round Robin pool matches conclude.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Quarter Finals */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-900/50 pb-2">
                    Quarter-Finals
                  </h3>
                  {bracket.quarterFinals.map((match, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-lg">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{match.title}</div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="truncate">{match.team1}</span>
                        <span className="font-extrabold text-amber-400 ml-2">{match.score1}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="truncate">{match.team2}</span>
                        <span className="font-extrabold text-amber-400 ml-2">{match.score2}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Semi Finals */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-900/50 pb-2">
                    Semi-Finals
                  </h3>
                  {bracket.semiFinals.map((match, idx) => (
                    <div key={idx} className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-2 shadow-2xl">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">{match.title}</div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="truncate">{match.team1}</span>
                        <span className="font-extrabold text-amber-400 ml-2">{match.score1}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-200 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <span className="truncate">{match.team2}</span>
                        <span className="font-extrabold text-amber-400 ml-2">{match.score2}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Final */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-widest border-b border-yellow-500/50 pb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" /> Grand Final
                  </h3>
                  {bracket.final.map((match, idx) => (
                    <div key={idx} className="bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500 rounded-2xl p-5 space-y-3 shadow-2xl">
                      <div className="text-xs text-amber-400 font-extrabold tracking-widest text-center uppercase">{match.title}</div>
                      <div className="flex justify-between items-center text-sm font-extrabold text-white bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                        <span className="truncate">{match.team1}</span>
                        <span className="text-amber-400 ml-2">{match.score1}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-extrabold text-white bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                        <span className="truncate">{match.team2}</span>
                        <span className="text-amber-400 ml-2">{match.score2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: PUBLIC REALTIME ANNOUNCEMENTS BROADCAST FEED */}
        {/* ============================================================ */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Megaphone className="h-6 w-6 text-amber-400" />
                Live Broadcast Announcements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time alerts published by tournament management.</p>
            </div>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
                  No announcements broadcasted yet.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-slate-900 border-l-4 border-l-amber-500 border border-slate-800 p-5 rounded-r-2xl shadow-lg relative">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" /> Axis Cup Organizer
                      </span>
                      <span>{new Date(ann.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">{ann.text}</p>
                    {isAdmin && (
                      <button
                        onClick={() => deleteAnnouncement(ann.id)}
                        className="mt-3 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Alert
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ADMIN CONTROL PANEL (Passcode Protected 'naqvi123') */}
        {/* ============================================================ */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8">
            {/* Admin Header Dashboard Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Master Authority Granted
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Axis Cup Admin Command Center</h2>
                <p className="text-xs text-slate-400 mt-1">Changes made here update globally & instantly for all spectators online.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={toggleRegistration}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                    settings.registrationOpen
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {settings.registrationOpen ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  <span>{settings.registrationOpen ? 'Close Registration' : 'Open Registration'}</span>
                </button>

                <button
                  onClick={generateKnockoutBrackets}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="h-4 w-4" /> Auto-Generate Brackets
                </button>
              </div>
            </div>

            {/* 1. Real-time Announcement Broadcast Publisher */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Megaphone className="h-5 w-5 text-amber-400" />
                Broadcast Live Notification Alert
              </h3>
              <form onSubmit={handlePostAnnouncement} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type real-time alert (e.g. Pool B Match 2 moved to 17:30 Pitch 2)..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
                >
                  Publish Broadcast
                </button>
              </form>
            </div>

            {/* 2. Registered Teams & Pool Seeding Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-400" />
                    Manage Teams & Assign Pools A, B, C, D
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Admin can assign pools, edit manual ranking points, or delete teams.</p>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Total: {teams.length} Teams
                </span>
              </div>

              {teams.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No registered teams currently in database.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map(t => (
                    <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={t.logo} alt="" className="h-10 w-10 rounded-xl object-cover border border-slate-700" />
                          <div>
                            <h4 className="font-bold text-sm text-white">{t.name}</h4>
                            <p className="text-[11px] text-slate-400">Capt: {t.captainContact}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTeam(t.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Delete Team"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Players Roster Accordion Preview */}
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                          7 Registered Players:
                        </span>
                        <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-1 font-medium">
                          {t.players?.map((p, idx) => (
                            <div key={idx} className="truncate">
                              <span className="text-emerald-400 font-bold mr-1">{p.position}</span>
                              {p.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pool Selector & Manual Points Override */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-850">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-semibold text-slate-400">Pool:</span>
                          <select
                            value={t.pool || 'Unassigned'}
                            onChange={(e) => setTeamPool(t.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Pool A">Pool A</option>
                            <option value="Pool B">Pool B</option>
                            <option value="Pool C">Pool C</option>
                            <option value="Pool D">Pool D</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Schedule Fixtures & Match Score Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Fixture */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                  <PlusCircle className="h-5 w-5 text-emerald-400" />
                  Schedule New Match
                </h3>
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Home Team</label>
                    <select
                      value={newMatch.homeTeamId}
                      onChange={(e) => setNewMatch({ ...newMatch, homeTeamId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    >
                      <option value="">Select Home Team</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.pool})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Away Team</label>
                    <select
                      value={newMatch.awayTeamId}
                      onChange={(e) => setNewMatch({ ...newMatch, awayTeamId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    >
                      <option value="">Select Away Team</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.pool})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Stage / Pool</label>
                      <select
                        value={newMatch.stage}
                        onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="Pool A">Pool A</option>
                        <option value="Pool B">Pool B</option>
                        <option value="Pool C">Pool C</option>
                        <option value="Pool D">Pool D</option>
                        <option value="Quarter Final">Quarter Final</option>
                        <option value="Semi Final">Semi Final</option>
                        <option value="Final">Grand Final</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Time</label>
                      <input
                        type="time"
                        value={newMatch.time}
                        onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Pitch Location</label>
                    <input
                      type="text"
                      value={newMatch.pitch}
                      onChange={(e) => setNewMatch({ ...newMatch, pitch: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-md"
                  >
                    Add Fixture to Schedule
                  </button>
                </form>
              </div>

              {/* Match Live Score Updater list */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-400" /> Live Match Score Controller
                  </span>
                  <span className="text-xs text-slate-400">Updates reflect live immediately</span>
                </h3>

                {matches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No fixtures scheduled.</p>
                ) : (
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {matches.map(m => {
                      const hTeam = teams.find(t => t.id === m.homeTeamId);
                      const aTeam = teams.find(t => t.id === m.awayTeamId);

                      return (
                        <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                            <span className="font-bold text-emerald-400">{m.stage}</span>
                            <div className="flex items-center space-x-2">
                              <select
                                value={m.status}
                                onChange={(e) => updateMatchScore(m.id, m.homeScore, m.awayScore, e.target.value, m.approved)}
                                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-0.5"
                              >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Live">Live</option>
                                <option value="Finished">Finished</option>
                              </select>

                              <button
                                onClick={() => deleteMatch(m.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Score Inputs */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 font-bold text-xs text-slate-200 text-right truncate">
                              {hTeam?.name || 'Home'}
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                value={m.homeScore}
                                onChange={(e) => updateMatchScore(m.id, e.target.value, m.awayScore, m.status, m.approved)}
                                className="w-12 bg-slate-900 border border-slate-700 text-center text-sm font-extrabold text-emerald-400 rounded-lg py-1 focus:outline-none focus:border-emerald-500"
                              />
                              <span className="text-slate-600 font-bold">:</span>
                              <input
                                type="number"
                                min="0"
                                value={m.awayScore}
                                onChange={(e) => updateMatchScore(m.id, m.homeScore, e.target.value, m.status, m.approved)}
                                className="w-12 bg-slate-900 border border-slate-700 text-center text-sm font-extrabold text-emerald-400 rounded-lg py-1 focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div className="flex-1 font-bold text-xs text-slate-200 text-left truncate">
                              {aTeam?.name || 'Away'}
                            </div>
                          </div>

                          {/* Result Approval Toggle */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                            <span className="text-slate-400">Approved for Standings?</span>
                            <button
                              onClick={() => updateMatchScore(m.id, m.homeScore, m.awayScore, m.status, !m.approved)}
                              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                                m.approved
                                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                                  : 'bg-slate-900 border border-slate-700 text-slate-400'
                              }`}
                            >
                              {m.approved ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-slate-500" />}
                              <span>{m.approved ? 'Approved & Calculated' : 'Pending Approval'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* ADMIN SECURE LOGIN MODAL (Passcode: naqvi123) */}
      {/* ============================================================ */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowAdminLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-14 w-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Axis Cup Admin Login</h3>
              <p className="text-xs text-slate-400">Enter administrator master security code to unlock privileges.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-300 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Master Passcode</label>
                <input
                  type="password"
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono tracking-widest text-center"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition tracking-wide text-sm"
              >
                UNLOCK ADMIN PANEL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}