import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock3,
  Copy,
  GraduationCap,
  LayoutDashboard,
  Library,
  LockKeyhole,
  LoaderCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';

type View = 'overview' | 'quizzes' | 'live' | 'reports' | 'students' | 'settings';
type Role = 'teacher' | 'student' | 'admin';

type Quiz = {
  id: number;
  title: string;
  topic: string;
  questions: number;
  completion: number;
  status: 'Published' | 'Draft';
  color: string;
  lastPlayed: string;
};

const quizzes: Quiz[] = [
  { id: 1, title: 'The Great Gatsby', topic: 'English Literature', questions: 12, completion: 86, status: 'Published', color: 'coral', lastPlayed: 'Today, 10:24 AM' },
  { id: 2, title: 'Cell Biology Basics', topic: 'Biology', questions: 18, completion: 72, status: 'Published', color: 'violet', lastPlayed: 'Yesterday, 2:10 PM' },
  { id: 3, title: 'World War II', topic: 'History', questions: 20, completion: 64, status: 'Published', color: 'lime', lastPlayed: 'Nov 18, 9:05 AM' },
  { id: 4, title: 'Algebraic Expressions', topic: 'Mathematics', questions: 10, completion: 0, status: 'Draft', color: 'blue', lastPlayed: 'Not played yet' },
];

const wrongQuestions = [
  { question: 'What does the green light symbolize?', topic: 'The Great Gatsby', missed: 18, total: 24, severity: 'high' },
  { question: 'Which organelle makes ATP?', topic: 'Cell Biology', missed: 15, total: 24, severity: 'high' },
  { question: 'When was the Treaty of Versailles signed?', topic: 'World War II', missed: 12, total: 24, severity: 'medium' },
  { question: 'What is the slope of y = 3x + 2?', topic: 'Algebra', missed: 9, total: 18, severity: 'medium' },
];

const students = [
  { name: 'Mia Thompson', initials: 'MT', score: 98, streak: 4, status: 'Online', color: 'coral' },
  { name: 'Noah Williams', initials: 'NW', score: 94, streak: 3, status: 'Online', color: 'violet' },
  { name: 'Ava Johnson', initials: 'AJ', score: 91, streak: 6, status: 'Online', color: 'lime' },
  { name: 'Liam Smith', initials: 'LS', score: 87, streak: 2, status: 'Away', color: 'blue' },
  { name: 'Sofia Martinez', initials: 'SM', score: 84, streak: 5, status: 'Online', color: 'yellow' },
];

const answers = [
  { label: 'It represents Gatsby’s hope', percent: 62, color: 'coral', correct: true },
  { label: 'It represents wealth and success', percent: 21, color: 'violet', correct: false },
  { label: 'It is a warning sign', percent: 13, color: 'blue', correct: false },
  { label: 'It represents Daisy herself', percent: 4, color: 'yellow', correct: false },
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quizzes', label: 'My quizzes', icon: Library },
  { id: 'live', label: 'Live room', icon: Radio },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'students', label: 'Students', icon: Users },
];

function viewFromPath(pathname: string): View {
  const path = pathname.replace(/^\//, '') as View;
  return navItems.some((item) => item.id === path) || path === 'settings' ? path : 'overview';
}

const roleCopy: Record<Role, { name: string; initials: string; label: string; title: string; subtitle: string }> = {
  teacher: { name: 'Ms. Rivera', initials: 'MR', label: 'Teacher account', title: 'Make the next question count.', subtitle: 'Your classroom is warmed up. Ready to put their thinking to the test?' },
  student: { name: 'Jamie Lee', initials: 'JL', label: 'Student account', title: 'Ready for your next win?', subtitle: 'Join a room, pick an answer, and see how your class is thinking.' },
  admin: { name: 'Alex Morgan', initials: 'AM', label: 'Admin account', title: 'The classroom pulse is strong.', subtitle: 'Monitor activity across your school and keep every live room running smoothly.' },
};

function App() {
  const [activeView, setActiveView] = useState<View>(() => viewFromPath(window.location.pathname));
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('teacher');
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [pin, setPin] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  const user = roleCopy[role];
  const currentQuiz = quizzes[0];
  const liveProgress = Math.min(100, Math.round((questionIndex / 12) * 100));

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const switchView = (view: View) => {
    setActiveView(view);
    window.history.pushState({}, '', view === 'overview' ? '/' : `/${view}`);
    setMobileNav(false);
  };

  useEffect(() => {
    const handlePopState = () => setActiveView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const startSession = () => {
    setSessionStarted(true);
    setSessionEnded(false);
    setQuestionIndex(1);
    setSelectedAnswer(null);
    switchView('live');
    notify('Live room opened — students can join now.');
  };

  const joinRoom = () => {
    if (pin.length < 6) return;
    setShowJoin(false);
    setSessionStarted(true);
    switchView('live');
    notify(`You joined room ${pin}. Good luck!`);
  };

  const cycleRole = (nextRole: Role) => {
    setRole(nextRole);
    setShowProfile(false);
    switchView('overview');
    notify(`Switched to ${roleCopy[nextRole].label.toLowerCase()}.`);
  };

  if (!authenticated) {
    return <AuthPage onAuthenticated={(nextRole) => { setRole(nextRole); setAuthenticated(true); }} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup" onClick={() => switchView('overview')} role="button" tabIndex={0}>
          <div className="brand-mark"><Zap size={18} fill="currentColor" strokeWidth={3} /></div>
          <span>quiz<span>blitz</span></span>
        </div>

        <div className="account-switcher">
          <div className={`avatar avatar-${roleCopy[role].initials.toLowerCase()}`}>{user.initials}</div>
          <div className="account-meta">
            <strong>{user.name}</strong>
            <span>{user.label}</span>
          </div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <div className="nav-label">Workspace</div>
        <nav className="primary-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activeView === id ? 'active' : ''}`} onClick={() => switchView(id)}>
              <Icon size={17} strokeWidth={activeView === id ? 2.4 : 2} />
              <span>{label}</span>
              {id === 'live' && sessionStarted && <i className="nav-live-dot" />}
            </button>
          ))}
        </nav>

        <div className="nav-label nav-label-spaced">Manage</div>
        <nav className="primary-nav">
          <button className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => switchView('settings')}>
            <Settings size={17} /> <span>Settings</span>
          </button>
          {role === 'admin' && (
            <button className="nav-item" onClick={() => notify('Admin console is ready for your next policy update.')}>
              <ShieldCheck size={17} /> <span>Admin console</span>
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={16} /></div>
            <div><strong>Make class magic.</strong><span>Unlock unlimited rooms.</span></div>
            <ArrowUpRight size={15} />
          </div>
          <button className="help-link" onClick={() => notify('Help center opened in a new workspace.')}><CircleHelp size={16} /> Help center</button>
          <button className="logout-link" onClick={() => setAuthenticated(false)}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{navItems.find((item) => item.id === activeView)?.label ?? 'Settings'}</strong></div>
          <div className="topbar-actions">
            <div className="search-box"><Search size={15} /><input placeholder="Search quizzes, students..." /><kbd>⌘ K</kbd></div>
            <button className="icon-button notification-button" onClick={() => notify('You have 3 new classroom updates.')} aria-label="Notifications"><Bell size={17} /><i /></button>
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => setShowProfile(!showProfile)}>
                <div className={`avatar avatar-small avatar-${user.initials.toLowerCase()}`}>{user.initials}</div>
                <ChevronDown size={14} />
              </button>
              {showProfile && (
                <div className="profile-menu">
                  <div className="profile-menu-heading">Preview as</div>
                  {(['teacher', 'student', 'admin'] as Role[]).map((profileRole) => (
                    <button key={profileRole} className={role === profileRole ? 'selected' : ''} onClick={() => cycleRole(profileRole)}>
                      <span className={`role-dot ${profileRole}`} /> {roleCopy[profileRole].label}
                      {role === profileRole && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {activeView === 'overview' && <Overview role={role} user={user} onStart={startSession} onJoin={() => setShowJoin(true)} onCreate={() => setShowCreate(true)} onView={switchView} notify={notify} />}
          {activeView === 'quizzes' && <Quizzes onCreate={() => setShowCreate(true)} onStart={startSession} notify={notify} />}
          {activeView === 'live' && <LiveRoom role={role} started={sessionStarted} ended={sessionEnded} pin={pin || '481 209'} questionIndex={questionIndex} progress={liveProgress} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} onStart={startSession} onJoin={() => setShowJoin(true)} onEnd={() => { setSessionEnded(true); notify('Session ended — results are ready.'); }} onNext={() => { if (questionIndex >= 12) { setSessionEnded(true); notify('Session ended — results are ready.'); } else { setQuestionIndex(Math.min(12, questionIndex + 1)); setSelectedAnswer(null); notify('Next question is live for the class.'); } }} notify={notify} />}
          {activeView === 'reports' && <Reports notify={notify} />}
          {activeView === 'students' && <Students notify={notify} />}
          {activeView === 'settings' && <SettingsPage role={role} notify={notify} />}
        </div>
      </main>

      {showJoin && <JoinModal pin={pin} setPin={setPin} onClose={() => setShowJoin(false)} onJoin={joinRoom} />}
      {showCreate && <CreateQuizModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); notify('Quiz draft created. Add your first question next.'); }} />}
      {toast && <div className="toast"><CircleCheck size={17} /><span>{toast}</span></div>}
    </div>
  );
}

function AuthPage({ onAuthenticated }: { onAuthenticated: (role: Role) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authRole, setAuthRole] = useState<Role>('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('demo@quizblitz.school');
  const [password, setPassword] = useState('quizblitz');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAuthenticated(authRole);
  };

  return <div className="auth-page">
    <section className="auth-visual">
      <div className="auth-brand"><div className="brand-mark"><Zap size={18} fill="currentColor" strokeWidth={3} /></div><span>quiz<span>blitz</span></span></div>
      <div className="auth-visual-copy"><span className="live-badge"><i /> Live classroom energy</span><h1>Make every answer part of the lesson.</h1><p>Bring teachers and students into the same question, at the same time, with a little more spark.</p></div>
      <div className="auth-visual-stage"><div className="auth-orbit orbit-a" /><div className="auth-orbit orbit-b" /><div className="auth-question-card"><span>Question 08 / 12</span><strong>What does the green light symbolize?</strong><div className="mini-answer selected"><i>A</i> Gatsby’s hope <Check size={13} /></div><div className="mini-answer"><i>B</i> Wealth and success</div></div><div className="auth-score-card"><Trophy size={15} /><strong>+10</strong><span>correct answer</span></div></div>
      <div className="auth-visual-footer"><span><ShieldCheck size={14} /> Role-based access</span><span><Radio size={14} /> Synchronized rooms</span><span><BarChart3 size={14} /> Learning reports</span></div>
    </section>
    <section className="auth-panel">
      <div className="auth-mobile-brand"><div className="brand-mark"><Zap size={17} fill="currentColor" strokeWidth={3} /></div><span>quiz<span>blitz</span></span></div>
      <div className="auth-form-wrap"><span className="section-kicker">{mode === 'login' ? 'Welcome back' : 'New workspace'}</span><h2>{mode === 'login' ? 'Sign in to your classroom.' : 'Create your QuizBlitz account.'}</h2><p className="auth-subtitle">{mode === 'login' ? 'Your next great question is only a click away.' : 'Set up your role and start making class magic.'}</p>
        <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button></div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && <label>Full name<input placeholder="e.g. Ms. Rivera" required /></label>}
          <label>Email address<div className="auth-input-wrap"><UserRound size={15} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.edu" required /></div></label>
          <label>Password<div className="auth-input-wrap"><LockKeyhole size={15} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
          {mode === 'signup' ? <div className="role-picker"><span>Choose your role</span><div>{(['teacher', 'student', 'admin'] as Role[]).map((item) => <button type="button" key={item} className={authRole === item ? 'selected' : ''} onClick={() => setAuthRole(item)}><i className={`role-dot ${item}`} />{item[0].toUpperCase() + item.slice(1)}{authRole === item && <Check size={13} />}</button>)}</div></div> : <div className="auth-options"><label className="check-label"><input type="checkbox" defaultChecked /> <span>Remember me</span></label><button type="button" onClick={() => setPassword('')}>Forgot password?</button></div>}
          <button className="button button-dark auth-submit" type="submit">{mode === 'login' ? 'Sign in to QuizBlitz' : 'Create my account'} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-divider"><span>or use demo access</span></div><button className="demo-access" onClick={() => onAuthenticated(authRole)}><span className="demo-avatar">{authRole === 'teacher' ? 'MR' : authRole === 'student' ? 'JL' : 'AM'}</span><span><strong>Continue as {roleCopy[authRole].name}</strong><small>Explore the {roleCopy[authRole].label.toLowerCase()}</small></span><ArrowUpRight size={15} /></button><p className="auth-legal">By continuing, you agree to QuizBlitz’s classroom terms and privacy policy.</p>
      </div>
      <div className="auth-footer"><span>© 2026 QuizBlitz</span><span>Need help? <strong>Visit support</strong></span></div>
    </section>
  </div>;
}

function Overview({ role, user, onStart, onJoin, onCreate, onView, notify }: { role: Role; user: typeof roleCopy.teacher; onStart: () => void; onJoin: () => void; onCreate: () => void; onView: (view: View) => void; notify: (message: string) => void }) {
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  return (
    <div className="view-stack">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="status-dot" /> {isStudent ? 'Thursday, November 25' : 'Thursday, November 25 · 9:41 AM'}</div>
          <h1>{user.title}</h1>
          <p className="subhead">{user.subtitle}</p>
        </div>
        <div className="welcome-actions">
          {isStudent ? <button className="button button-dark" onClick={onJoin}><Radio size={16} /> Join a live room</button> : <button className="button button-dark" onClick={onStart}><Play size={15} fill="currentColor" /> Launch live room</button>}
          {!isStudent && <button className="button button-outline" onClick={onCreate}><Plus size={16} /> New quiz</button>}
          {isStudent && <button className="button button-outline" onClick={() => notify('Your completed quiz history is up to date.')}><Trophy size={16} /> My results</button>}
        </div>
      </section>

      {isStudent ? <StudentOverview onJoin={onJoin} onView={onView} notify={notify} /> : isAdmin ? <AdminOverview onView={onView} notify={notify} /> : <TeacherOverview onStart={onStart} onCreate={onCreate} onView={onView} notify={notify} />}
    </div>
  );
}

function TeacherOverview({ onStart, onCreate, onView, notify }: { onStart: () => void; onCreate: () => void; onView: (view: View) => void; notify: (message: string) => void }) {
  return <>
    <div className="stats-grid">
      <StatCard label="Quizzes played" value="24" delta="+18.4%" positive icon={<Play size={17} />} foot="vs. last month" />
      <StatCard label="Avg. class score" value="78%" delta="+6.2%" positive icon={<Target size={17} />} foot="across all quizzes" />
      <StatCard label="Students engaged" value="126" delta="+12" positive icon={<Users size={17} />} foot="this week" />
      <StatCard label="Live now" value="1" delta="Active" icon={<Radio size={17} />} foot="Biology · Room 481209" live />
    </div>

    <div className="section-heading-row"><div><span className="section-kicker">Right now</span><h2>Classroom pulse</h2></div><button className="text-button" onClick={() => onView('reports')}>View full report <ArrowRight size={14} /></button></div>
    <div className="pulse-grid">
      <div className="live-card panel-card">
        <div className="live-card-top"><div><span className="live-badge"><i /> Live session</span><h3>Cell Biology Basics</h3><p>Period 3 · 24 students are in the room</p></div><button className="more-button" onClick={() => notify('Room controls are ready.')}><MoreHorizontal size={18} /></button></div>
        <div className="live-room-code"><div><span>Join with PIN</span><strong>481 209</strong></div><button onClick={() => { navigator.clipboard?.writeText('481209'); notify('Room PIN copied to clipboard.'); }}><Copy size={14} /> Copy</button></div>
        <div className="live-card-footer"><div className="avatar-stack"><span className="avatar avatar-tiny avatar-mt">MT</span><span className="avatar avatar-tiny avatar-nw">NW</span><span className="avatar avatar-tiny avatar-aj">AJ</span><span className="avatar avatar-tiny more-avatar">+21</span></div><span>Question 8 of 18</span><button className="button button-lime button-small" onClick={onStart}>Open room <ArrowUpRight size={14} /></button></div>
      </div>
      <div className="activity-card panel-card">
        <div className="card-heading"><div><span className="section-kicker">This week</span><h3>Learning activity</h3></div><button className="more-button" onClick={() => notify('Activity filters opened.')}><MoreHorizontal size={18} /></button></div>
        <div className="mini-chart"><div className="chart-y-labels"><span>100</span><span>50</span><span>0</span></div><div className="chart-area"><div className="chart-lines"><i /><i /><i /></div><svg viewBox="0 0 360 110" preserveAspectRatio="none" className="chart-svg"><path d="M0 82 C24 76 29 45 52 58 S78 91 99 67 S122 49 147 62 S177 20 198 38 S223 74 245 54 S276 26 296 42 S322 62 360 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M0 82 C24 76 29 45 52 58 S78 91 99 67 S122 49 147 62 S177 20 198 38 S223 74 245 54 S276 26 296 42 S322 62 360 16 V110 H0Z" fill="url(#areaFill)" opacity=".22" /><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8277FF" /><stop offset="1" stopColor="#8277FF" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div></div></div>
      </div>
    </div>

    <div className="section-heading-row"><div><span className="section-kicker">Your library</span><h2>Recent quizzes</h2></div><button className="text-button" onClick={() => onView('quizzes')}>See all quizzes <ArrowRight size={14} /></button></div>
    <div className="quiz-grid">{quizzes.slice(0, 3).map((quiz) => <QuizCard key={quiz.id} quiz={quiz} onPlay={onStart} onMenu={() => notify(`${quiz.title} options opened.`)} />)}<button className="add-quiz-card" onClick={onCreate}><span><Plus size={18} /></span><strong>Create a new quiz</strong><small>Start with a blank canvas</small></button></div>
  </>;
}

function StudentOverview({ onJoin, onView, notify }: { onJoin: () => void; onView: (view: View) => void; notify: (message: string) => void }) {
  return <>
    <div className="student-hero panel-card"><div className="student-hero-copy"><span className="live-badge"><i /> Room open</span><h2>Your next classroom challenge is waiting.</h2><p>Ms. Rivera is hosting <strong>Cell Biology Basics</strong>. Join now to answer alongside your class.</p><button className="button button-lime" onClick={onJoin}>Join room <ArrowRight size={15} /></button></div><div className="student-hero-art"><div className="ring ring-one" /><div className="ring ring-two" /><span className="hero-score">+10</span><span className="hero-spark"><Zap size={30} fill="currentColor" /></span></div></div>
    <div className="stats-grid stats-grid-student"><StatCard label="Current streak" value="4 days" delta="Keep it going" icon={<Zap size={17} />} foot="best: 9 days" /><StatCard label="Average score" value="91%" delta="+4.8%" positive icon={<Target size={17} />} foot="this semester" /><StatCard label="Quizzes completed" value="18" delta="+3" positive icon={<CircleCheck size={17} />} foot="this month" /></div>
    <div className="section-heading-row"><div><span className="section-kicker">Your progress</span><h2>Keep climbing</h2></div><button className="text-button" onClick={() => onView('reports')}>See results <ArrowRight size={14} /></button></div>
    <div className="progress-panels"><div className="panel-card skill-card"><div className="card-heading"><div><span className="section-kicker">Topic mastery</span><h3>Where you shine</h3></div><BookOpen size={18} className="muted-icon" /></div><SkillRow label="Cell Biology" value={94} color="lime" /><SkillRow label="English Literature" value={88} color="coral" /><SkillRow label="World History" value={76} color="violet" /></div><div className="panel-card activity-list"><div className="card-heading"><div><span className="section-kicker">Latest wins</span><h3>Recent activity</h3></div><button className="more-button" onClick={() => notify('Activity history opened.')}><MoreHorizontal size={18} /></button></div><ActivityRow icon={<Trophy size={15} />} title="Top 3 in Cell Biology" detail="18 questions · 96%" time="Today" color="lime" /><ActivityRow icon={<BookOpen size={15} />} title="The Great Gatsby" detail="12 questions · 88%" time="Yesterday" color="coral" /><ActivityRow icon={<Zap size={15} />} title="4 day streak" detail="Keep showing up" time="Nov 22" color="violet" /></div></div>
  </>;
}

function AdminOverview({ onView, notify }: { onView: (view: View) => void; notify: (message: string) => void }) {
  return <>
    <div className="stats-grid"><StatCard label="Active classrooms" value="18" delta="+3" positive icon={<Radio size={17} />} foot="across 4 grades" live /><StatCard label="Questions answered" value="8.4k" delta="+22.1%" positive icon={<BarChart3 size={17} />} foot="this month" /><StatCard label="Teacher adoption" value="87%" delta="+9.4%" positive icon={<GraduationCap size={17} />} foot="of active staff" /><StatCard label="Avg. accuracy" value="76%" delta="Stable" icon={<Target size={17} />} foot="school-wide" /></div>
    <div className="section-heading-row"><div><span className="section-kicker">School overview</span><h2>Live classrooms</h2></div><button className="text-button" onClick={() => onView('students')}>Manage access <ArrowRight size={14} /></button></div>
    <div className="admin-table panel-card"><div className="table-head"><span>Classroom</span><span>Teacher</span><span>Students</span><span>Accuracy</span><span>Status</span></div>{[['Biology · Period 3','Ms. Rivera','24','82%','Live'],['English 10 · Period 1','Mr. Singh','28','78%','Live'],['World History · Period 4','Ms. Chen','21','74%','Reviewing']].map((row) => <div className="table-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><span className="score-pill">{row[3]}</span><span><span className={`status-chip ${row[4] === 'Live' ? 'status-live' : 'status-neutral'}`}><i />{row[4]}</span></span></div>)}</div>
    <div className="admin-footer-note"><ShieldCheck size={17} /><span>All sessions are protected with role-based access. Last audit ran 14 minutes ago.</span><button className="text-button" onClick={() => notify('Audit log opened.')}>View audit log <ArrowRight size={14} /></button></div>
  </>;
}

function StatCard({ label, value, delta, positive, icon, foot, live }: { label: string; value: string; delta: string; positive?: boolean; icon: React.ReactNode; foot: string; live?: boolean }) {
  return <div className={`stat-card ${live ? 'stat-card-live' : ''}`}><div className="stat-card-top"><span className="stat-icon">{icon}</span><span className={`stat-delta ${positive ? 'positive' : live ? 'live-text' : ''}`}>{live && <i />}{delta}</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-foot">{foot}</div></div>;
}

function SkillRow({ label, value, color }: { label: string; value: number; color: string }) { return <div className="skill-row"><div><span>{label}</span><strong>{value}%</strong></div><div className="progress-track"><i className={`fill-${color}`} style={{ width: `${value}%` }} /></div></div>; }
function ActivityRow({ icon, title, detail, time, color }: { icon: React.ReactNode; title: string; detail: string; time: string; color: string }) { return <div className="activity-row"><span className={`activity-icon activity-${color}`}>{icon}</span><div><strong>{title}</strong><span>{detail}</span></div><time>{time}</time></div>; }

function Quizzes({ onCreate, onStart, notify }: { onCreate: () => void; onStart: () => void; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('All quizzes');
  const filtered = filter === 'All quizzes' ? quizzes : quizzes.filter((quiz) => quiz.status === filter);
  return <div className="view-stack"><section className="page-title-row"><div><span className="eyebrow"><Library size={13} /> Quiz library</span><h1>Build rooms worth remembering.</h1><p className="subhead">Create, remix, and run quizzes that keep every student in the conversation.</p></div><button className="button button-dark" onClick={onCreate}><Plus size={16} /> New quiz</button></section><div className="toolbar-row"><div className="segmented-control">{['All quizzes', 'Published', 'Draft'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}{item === 'All quizzes' && <span>4</span>}</button>)}</div><button className="filter-button" onClick={() => notify('Sort options opened.')}><Clock3 size={15} /> Recently edited <ChevronDown size={14} /></button></div><div className="quiz-grid quiz-grid-library">{filtered.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} onPlay={onStart} onMenu={() => notify(`${quiz.title} options opened.`)} detailed />)}<button className="add-quiz-card" onClick={onCreate}><span><Plus size={18} /></span><strong>Create a new quiz</strong><small>Start with a blank canvas</small></button></div><div className="library-tip"><Sparkles size={17} /><div><strong>Small tip, big impact.</strong><span>Mix question types and keep your answer options short. Students answer faster and learn more.</span></div><button className="text-button" onClick={() => notify('Quiz design tips opened.')}>Read tips <ArrowRight size={14} /></button></div></div>;
}

function QuizCard({ quiz, onPlay, onMenu, detailed }: { quiz: Quiz; onPlay: () => void; onMenu: () => void; detailed?: boolean }) {
  return <article className={`quiz-card ${detailed ? 'quiz-card-detailed' : ''}`}><div className={`quiz-card-banner banner-${quiz.color}`}><span className="quiz-topic">{quiz.topic}</span><button className="quiz-menu" onClick={onMenu}><MoreHorizontal size={17} /></button><div className="banner-glyph">{quiz.color === 'coral' ? 'Aa' : quiz.color === 'violet' ? '◌' : quiz.color === 'lime' ? '∑' : 'x²'}</div></div><div className="quiz-card-body"><div className="quiz-title-row"><h3>{quiz.title}</h3><span className={`status-chip ${quiz.status === 'Published' ? 'status-live' : 'status-neutral'}`}><i />{quiz.status}</span></div><div className="quiz-meta"><span><BookOpen size={14} /> {quiz.questions} questions</span><span><Users size={14} /> {quiz.completion ? `${quiz.completion}% avg. completion` : 'Not played'}</span></div>{detailed && <div className="quiz-progress-row"><span>Completion</span><strong>{quiz.completion}%</strong><div className="progress-track"><i className={`fill-${quiz.color}`} style={{ width: `${quiz.completion}%` }} /></div></div>}<div className="quiz-card-footer"><span>{quiz.lastPlayed}</span><button className="icon-text-button" onClick={onPlay}><Play size={13} fill="currentColor" /> {quiz.status === 'Draft' ? 'Edit quiz' : 'Play now'}</button></div></div></article>;
}

function LiveRoom({ role, started, ended, pin, questionIndex, progress, selectedAnswer, setSelectedAnswer, onStart, onJoin, onEnd, onNext, notify }: { role: Role; started: boolean; ended: boolean; pin: string; questionIndex: number; progress: number; selectedAnswer: string | null; setSelectedAnswer: (answer: string | null) => void; onStart: () => void; onJoin: () => void; onEnd: () => void; onNext: () => void; notify: (message: string) => void }) {
  const isStudent = role === 'student';
  if (!started) return <div className="empty-live panel-card"><div className="empty-live-icon"><Radio size={26} /></div><span className="section-kicker">Live classroom</span><h1>Bring everyone into the same question.</h1><p>Open a room for your class or join one with a PIN. Every answer lands in the same moment.</p><div className="empty-live-actions">{isStudent ? <button className="button button-dark" onClick={onJoin}><Radio size={16} /> Join with PIN</button> : <button className="button button-dark" onClick={onStart}><Play size={15} fill="currentColor" /> Launch a room</button>}<button className="button button-outline" onClick={() => notify('Room preview is ready.')}>Preview a question</button></div><div className="empty-live-features"><span><ShieldCheck size={15} /> Secure session PINs</span><span><Zap size={15} /> +10 for every correct answer</span><span><BarChart3 size={15} /> Topic-level results</span></div></div>;
  if (ended) return <SessionResults isStudent={isStudent} onStart={onStart} notify={notify} />;
  return <div className="live-stage"><div className="live-stage-top"><div><div className="eyebrow"><span className="status-dot" /> Live now · {isStudent ? 'Student view' : 'Teacher view'}</div><h1>{isStudent ? 'Cell Biology Basics' : 'Cell Biology Basics'} <span className="muted-title">/ Question {questionIndex} of 12</span></h1></div><div className="live-top-actions"><div className="pin-compact"><span>Room PIN</span><strong>{pin}</strong><button onClick={() => { navigator.clipboard?.writeText(pin.replace(' ', '')); notify('PIN copied.'); }}><Copy size={14} /></button></div><button className="button button-outline button-small" onClick={() => notify('Session options opened.')}><MoreHorizontal size={15} /></button></div></div><div className="session-progress"><div style={{ width: `${progress}%` }} /><span>{progress}% complete</span></div><div className="question-layout"><section className="question-card panel-card"><div className="question-card-top"><span className="question-label">Question {questionIndex}</span><span className="timer"><Timer size={15} /> 00:18</span></div><h2>What does the green light symbolize to Gatsby?</h2><p className="question-hint">Choose the answer that best captures the novel’s central theme.</p><div className="answer-grid">{['It represents Gatsby’s hope', 'It represents wealth and success', 'It is a warning sign', 'It represents Daisy herself'].map((answer, index) => <button key={answer} className={`answer-option option-${index + 1} ${selectedAnswer === answer ? 'selected' : ''}`} onClick={() => { setSelectedAnswer(answer); if (isStudent) notify('Answer locked in.'); }}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><strong>{answer}</strong>{selectedAnswer === answer && <Check size={17} />}</button>)}</div><div className="question-footer"><span><Users size={15} /> {isStudent ? '24 classmates answering' : '24 responses so far'}</span>{isStudent ? <span className="locked-label"><LockKeyhole size={14} /> Answering live</span> : <button className="button button-lime" onClick={onNext}>Next question <ArrowRight size={15} /></button>}</div></section><aside className="session-sidebar"><div className="panel-card response-card"><div className="card-heading"><div><span className="section-kicker">Live responses</span><h3>{isStudent ? 'Class pulse' : 'How the room answered'}</h3></div><span className="response-count">24</span></div>{answers.map((answer) => <div className="response-row" key={answer.label}><div><span>{answer.label}</span><strong>{answer.percent}%</strong></div><div className="response-bar"><i className={`fill-${answer.color}`} style={{ width: `${answer.percent}%` }} /></div></div>)}<div className="response-note"><CircleCheck size={15} /> Correct answer is highlighted after reveal.</div></div><div className="panel-card participants-card"><div className="card-heading"><div><span className="section-kicker">In the room</span><h3>Students</h3></div><button className="text-button" onClick={() => notify('Participant list opened.')}>See all</button></div><div className="participant-grid">{students.slice(0, 4).map((student) => <div key={student.name} className="participant"><span className={`avatar avatar-tiny avatar-${student.initials.toLowerCase()}`}>{student.initials}</span><span>{student.name.split(' ')[0]}</span><i className={student.status === 'Online' ? 'online' : 'away'} /></div>)}</div><div className="participant-foot"><span><i className="online" /> 22 answered</span><span><i className="away" /> 2 thinking</span></div></div></aside></div></div>;
}

function SessionResults({ isStudent, onStart, notify }: { isStudent: boolean; onStart: () => void; notify: (message: string) => void }) {
  return <div className="results-screen panel-card"><div className="results-burst"><Trophy size={25} /></div><span className="section-kicker">Quiz complete</span><h1>{isStudent ? 'Nice work, Jamie.' : 'That’s a wrap on Cell Biology.'}</h1><p>{isStudent ? 'You earned points for every correct answer. Here’s how the room finished.' : 'Your class answered 248 questions together. Here’s the final snapshot.'}</p><div className="results-stats"><div><strong>{isStudent ? '110' : '78%'}</strong><span>{isStudent ? 'points earned' : 'class accuracy'}</span></div><div><strong>{isStudent ? '11/12' : '+10'}</strong><span>{isStudent ? 'answers correct' : 'per correct answer'}</span></div><div><strong>{isStudent ? '#3' : '24'}</strong><span>{isStudent ? 'class rank' : 'students joined'}</span></div></div><div className="leaderboard-card"><div className="card-heading"><div><span className="section-kicker">Final leaderboard</span><h3>Top of the room</h3></div><Trophy size={18} className="muted-icon" /></div>{students.slice(0, 3).map((student, index) => <div className="leaderboard-row" key={student.name}><strong className="rank-number">0{index + 1}</strong><span className={`avatar avatar-tiny avatar-${student.initials.toLowerCase()}`}>{student.initials}</span><strong>{student.name}</strong><span className="leaderboard-score">{index === 0 ? 118 : index === 1 ? 114 : 110} pts</span><span className="leaderboard-badge">+10</span></div>)}</div><div className="results-actions"><button className="button button-dark" onClick={onStart}><Play size={15} fill="currentColor" /> Run it again</button><button className="button button-outline" onClick={() => notify('Detailed results are ready in Reports.')}><BarChart3 size={15} /> View detailed report</button></div></div>;
}

function Reports({ notify }: { notify: (message: string) => void }) {
  const topicStats = useMemo(() => [{ topic: 'The Great Gatsby', value: 75, color: 'coral', note: '18 missed' }, { topic: 'Cell Biology', value: 63, color: 'violet', note: '15 missed' }, { topic: 'World War II', value: 50, color: 'lime', note: '12 missed' }, { topic: 'Algebra', value: 50, color: 'blue', note: '9 missed' }], []);
  return <div className="view-stack"><section className="page-title-row"><div><span className="eyebrow"><BarChart3 size={13} /> Learning report</span><h1>Turn wrong answers into next steps.</h1><p className="subhead">A quick read on the questions your students found toughest, grouped by topic.</p></div><button className="button button-outline" onClick={() => notify('Report exported as CSV.')}><Send size={15} /> Export report</button></section><div className="report-summary"><div className="report-summary-main"><span className="section-kicker">Across 4 quizzes</span><strong>78%</strong><span>average class accuracy</span><div className="report-trend"><TrendingUpIcon /> Up 6.2% from last month</div></div><div className="report-summary-stat"><span>Questions answered</span><strong>248</strong><small>+32 this week</small></div><div className="report-summary-stat"><span>Most missed topic</span><strong>The Great Gatsby</strong><small>75% missed at least once</small></div></div><div className="report-grid"><div className="panel-card topic-report"><div className="card-heading"><div><span className="section-kicker">Grouped by topic</span><h3>Where the class needs a nudge</h3></div><button className="filter-button" onClick={() => notify('Report filter changed.')}><Clock3 size={14} /> This month <ChevronDown size={13} /></button></div>{topicStats.map((topic) => <div className="topic-row" key={topic.topic}><div className={`topic-icon topic-${topic.color}`}>{topic.topic === 'Algebra' ? 'x²' : topic.topic === 'Cell Biology' ? '◌' : topic.topic === 'World War II' ? '∑' : 'Aa'}</div><div className="topic-row-main"><div><strong>{topic.topic}</strong><span>{topic.note}</span></div><strong>{topic.value}% <small>missed</small></strong><div className="progress-track"><i className={`fill-${topic.color}`} style={{ width: `${topic.value}%` }} /></div></div></div>)}</div><div className="panel-card report-callout"><div className="callout-mark"><Sparkles size={19} /></div><span className="section-kicker">Coach’s note</span><h3>Start with Gatsby’s green light.</h3><p>It’s the clearest opportunity to unlock the next lesson. Try a quick 2-minute discussion before your next live room.</p><button className="text-button" onClick={() => notify('Lesson prompt saved.')}><Plus size={14} /> Save lesson prompt</button></div></div><div className="panel-card wrong-table"><div className="card-heading"><div><span className="section-kicker">Question-level detail</span><h3>Most missed questions</h3></div><button className="text-button" onClick={() => notify('All question results opened.')}>View all <ArrowRight size={14} /></button></div><div className="table-scroll"><div className="table-head wrong-head"><span>Question</span><span>Topic</span><span>Students missed</span><span>Action</span></div>{wrongQuestions.map((item) => <div className="table-row wrong-row" key={item.question}><div className="wrong-question"><span className={`severity-dot ${item.severity}`} /><strong>{item.question}</strong></div><span className="topic-text">{item.topic}</span><span><strong>{item.missed}/{item.total}</strong><small className="missed-percent"> ({Math.round((item.missed / item.total) * 100)}%)</small></span><button className="row-action" onClick={() => notify('Question review opened.')}><ArrowUpRight size={15} /></button></div>)}</div></div></div>;
}
function TrendingUpIcon() { return <span className="trend-arrow">↗</span>; }

function Students({ notify }: { notify: (message: string) => void }) { return <div className="view-stack"><section className="page-title-row"><div><span className="eyebrow"><Users size={13} /> Classroom roster</span><h1>Know who’s in the room.</h1><p className="subhead">A simple view of your learners, their streaks, and recent performance.</p></div><button className="button button-dark" onClick={() => notify('Invite link copied to clipboard.')}><Plus size={16} /> Invite students</button></section><div className="roster-summary"><div><strong>28</strong><span>Total students</span></div><div><strong>24</strong><span>Active this week</span></div><div><strong>86%</strong><span>Avg. completion</span></div><div><strong>7</strong><span>On a streak</span></div></div><div className="panel-card roster-table"><div className="roster-table-head"><span>Student</span><span>Score</span><span>Streak</span><span>Last active</span><span>Status</span><span /></div>{students.map((student, index) => <div className="roster-row" key={student.name}><div className="student-cell"><span className={`avatar avatar-tiny avatar-${student.initials.toLowerCase()}`}>{student.initials}</span><div><strong>{student.name}</strong><span>{index % 2 === 0 ? 'Group A' : 'Group B'}</span></div></div><strong className="score-strong">{student.score}%</strong><span className="streak-value"><Zap size={14} fill="currentColor" /> {student.streak} days</span><span>{index === 0 ? 'Just now' : `${index + 1}h ago`}</span><span className={`status-chip ${student.status === 'Online' ? 'status-live' : 'status-neutral'}`}><i />{student.status}</span><button className="more-button" onClick={() => notify(`${student.name}'s profile opened.`)}><MoreHorizontal size={17} /></button></div>)}</div></div>; }

function SettingsPage({ role, notify }: { role: Role; notify: (message: string) => void }) { return <div className="view-stack"><section className="page-title-row"><div><span className="eyebrow"><Settings size={13} /> Workspace settings</span><h1>Set the room up your way.</h1><p className="subhead">Manage the details that keep your classroom feeling like yours.</p></div><button className="button button-dark" onClick={() => notify('Settings saved successfully.')}><Check size={16} /> Save changes</button></section><div className="settings-grid"><div className="panel-card settings-card"><div className="card-heading"><div><span className="section-kicker">Profile</span><h3>Your account</h3></div><UserRound size={18} className="muted-icon" /></div><label>Display name<input defaultValue={roleCopy[role].name} /></label><label>Email address<input defaultValue={`${role}@quizblitz.school`} /></label><label>Role<select defaultValue={role}><option value="teacher">Teacher</option><option value="student">Student</option><option value="admin">Admin</option></select></label></div><div className="panel-card settings-card"><div className="card-heading"><div><span className="section-kicker">Classroom defaults</span><h3>Make launch easy</h3></div><SlidersIcon /></div><div className="setting-toggle"><div><strong>Show leaderboard after each question</strong><span>Keep the room competitive and transparent.</span></div><button className="toggle active" onClick={() => notify('Leaderboard preference updated.')}><i /></button></div><div className="setting-toggle"><div><strong>Auto-advance timer</strong><span>Move on when the countdown reaches zero.</span></div><button className="toggle" onClick={() => notify('Auto-advance preference updated.')}><i /></button></div><div className="setting-toggle"><div><strong>Sound effects</strong><span>Play a small cue for correct answers.</span></div><button className="toggle active" onClick={() => notify('Sound preference updated.')}><i /></button></div></div></div></div>; }
function SlidersIcon() { return <span className="sliders-symbol">☷</span>; }

function JoinModal({ pin, setPin, onClose, onJoin }: { pin: string; setPin: (value: string) => void; onClose: () => void; onJoin: () => void }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal join-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon modal-icon-lime"><Radio size={21} /></div><span className="section-kicker">Student join</span><h2>What’s the room PIN?</h2><p>Ask your teacher for the 6-digit code. You’ll enter the live room right away.</p><label className="pin-label">Room PIN<input autoFocus value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000 000" inputMode="numeric" /></label><button className="button button-dark button-wide" onClick={onJoin} disabled={pin.length < 6}>Join room <ArrowRight size={16} /></button><span className="modal-footnote"><ShieldCheck size={13} /> Your answer is saved securely to this session.</span></div></div>; }

function CreateQuizModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) { const [title, setTitle] = useState(''); const [topic, setTopic] = useState(''); const [questionCount, setQuestionCount] = useState('10'); return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal create-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon modal-icon-violet"><Sparkles size={21} /></div><span className="section-kicker">New quiz</span><h2>Start with a strong question.</h2><p>Give your quiz a name and a topic. You can add answer options next.</p><label>Quiz title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Photosynthesis in 10 questions" /></label><div className="form-two-col"><label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">Choose a topic</option><option>Biology</option><option>English Literature</option><option>History</option><option>Mathematics</option><option>Custom topic</option></select></label><label>Questions<input type="number" min="1" max="50" value={questionCount} onChange={(event) => setQuestionCount(event.target.value)} /></label></div><div className="modal-actions"><button className="button button-outline" onClick={onClose}>Save for later</button><button className="button button-dark" onClick={onCreated} disabled={!title || !topic || !questionCount}>Create quiz <ArrowRight size={15} /></button></div><span className="modal-footnote"><CircleHelp size={13} /> Next, add options and mark the correct answer.</span></div></div>; }

export default App;
