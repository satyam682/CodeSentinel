import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Code2, 
  Bug, 
  Lock, 
  Zap, 
  Search, 
  Github, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Menu,
  X,
  Cpu,
  Layers,
  BarChart3,
  MessageSquare,
  Star,
  User as UserIcon,
  Mail,
  Upload,
  FileCode,
  Loader2,
  LogOut,
  Filter,
  Calendar,
  ChevronDown,
  Settings,
  PieChart,
  Activity,
  Terminal,
  ShieldCheck,
  ZapOff,
  Wand2,
  RefreshCw,
  GitPullRequest,
  Clock,
  Key,
  Copy,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
  api_key?: string;
  custom_rules?: string;
  github_token?: string;
}

interface ReviewIssue {
  line: number;
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  description: string;
  fix?: string; // AI-suggested fix
  cve?: string; // CVE reference if applicable
}

type ReviewProfile = 'Standard' | 'Security' | 'Performance' | 'Clean Code';

interface ReviewResult {
  issues: ReviewIssue[];
}

// --- Utilities ---
const calculateCodeScore = (issues: ReviewIssue[]) => {
  if (!issues || issues.length === 0) return 100;
  
  const penalties = {
    'Critical': 25,
    'Warning': 10,
    'Info': 5
  };
  
  const totalPenalty = issues.reduce((acc, issue) => acc + (penalties[issue.severity] || 0), 0);
  return Math.max(0, 100 - totalPenalty);
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreBgColor = (score: number) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-orange-500';
  return 'bg-red-500';
};

// --- Components ---

const Navbar = ({ user, onLogout, githubConnected, onConnectGitHub, onDisconnectGitHub }: { 
  user: User | null, 
  onLogout: () => void,
  githubConnected: boolean,
  onConnectGitHub: () => void,
  onDisconnectGitHub: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-border-soft py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="p-1.5 bg-primary-accent rounded-lg group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 text-deep-accent" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">CodeSentinel</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <div className="flex items-center gap-4 border-r border-border-soft pr-8 mr-2">
                {githubConnected ? (
                  <button 
                    onClick={onDisconnectGitHub}
                    className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-all"
                  >
                    <Github className="w-3.5 h-3.5" /> Connected
                  </button>
                ) : (
                  <button 
                    onClick={onConnectGitHub}
                    className="flex items-center gap-2 text-xs font-bold text-secondary bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <Github className="w-3.5 h-3.5" /> Connect GitHub
                  </button>
                )}
              </div>
              <span className="text-sm font-medium text-secondary">Welcome, {user.name}</span>
              <button onClick={onLogout} className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="text-sm font-medium text-secondary hover:text-deep-accent transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-secondary hover:text-deep-accent transition-colors">Pricing</a>
              <button className="bg-deep-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-deep-accent/20">
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border-soft overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {user ? (
                <>
                  <span className="text-lg font-medium">Welcome, {user.name}</span>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-lg font-medium text-red-500">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="#features" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                  <a href="#pricing" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                  <button className="bg-deep-accent text-white px-5 py-3 rounded-lg font-semibold w-full">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthForm = ({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 mesh-gradient">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-border-soft"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-accent rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-deep-accent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">{isLogin ? 'Welcome Back' : 'Join CodeSentinel'}</h2>
          <p className="text-secondary mt-2 text-sm sm:text-base">{isLogin ? 'Sign in to continue your reviews' : 'Start shipping cleaner code today'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-secondary/70 ml-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-border-soft rounded-2xl focus:ring-2 focus:ring-deep-accent/20 outline-none transition-all text-sm sm:text-base"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary/70 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-border-soft rounded-2xl focus:ring-2 focus:ring-deep-accent/20 outline-none transition-all text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-secondary/70 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-border-soft rounded-2xl focus:ring-2 focus:ring-deep-accent/20 outline-none transition-all text-sm sm:text-base"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-deep-accent text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-deep-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-deep-accent hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for students and hobbyists",
      features: ["10 AI Reviews / month", "Standard AI Model", "File Upload Support", "Community Support"],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "$19",
      description: "For professional developers",
      features: ["Unlimited AI Reviews", "Advanced command-a-03-2025 Model", "Review History", "Priority Support", "Custom Style Guides"],
      cta: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Team",
      price: "$49",
      description: "For small engineering teams",
      features: ["Everything in Pro", "Team Collaboration", "Shared History", "GitHub Integration", "Admin Dashboard"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-secondary max-w-2xl mx-auto">Choose the plan that fits your workflow. Start for free and upgrade as you grow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`p-8 rounded-[2.5rem] border ${plan.highlight ? 'border-deep-accent bg-deep-accent/5 shadow-2xl shadow-deep-accent/10' : 'border-border-soft bg-white'} flex flex-col`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className="text-secondary text-sm">/month</span>
              </div>
              <p className="text-sm text-secondary mb-8">{plan.description}</p>
              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-deep-accent" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.highlight ? 'bg-deep-accent text-white shadow-lg shadow-deep-accent/20' : 'bg-gray-50 text-secondary hover:bg-gray-100'}`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Dashboard = ({ user, onUserUpdate, githubConnected, onConnectGitHub }: { 
  user: User, 
  onUserUpdate: (user: User) => void,
  githubConnected: boolean,
  onConnectGitHub: () => void
}) => {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('main.js');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'github' | 'analytics' | 'settings' | 'pull-requests' | 'dashboard'>('editor');
  const [repoMetrics, setRepoMetrics] = useState<any | null>(null);
  const [fetchingMetrics, setFetchingMetrics] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [repoContents, setRepoContents] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [fetchingContents, setFetchingContents] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historySeverity, setHistorySeverity] = useState<'All' | 'Critical' | 'Warning' | 'Info'>('All');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest' | 'issues-high' | 'issues-low'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reviewProfile, setReviewProfile] = useState<ReviewProfile>('Standard');
  const [isLiveAnalysis, setIsLiveAnalysis] = useState(false);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [fetchingPRs, setFetchingPRs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tourStarted = useRef(false);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { 
          element: '#dashboard-tabs', 
          popover: { 
            title: 'Navigation', 
            description: 'Switch between the Editor, History, GitHub integration, and Analytics.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#code-editor', 
          popover: { 
            title: 'Code Editor', 
            description: 'Paste your code here for analysis. We support most major programming languages.', 
            side: "right", 
            align: 'start' 
          } 
        },
        { 
          element: '#upload-button', 
          popover: { 
            title: 'Upload Files', 
            description: 'You can also upload local files directly from your computer.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#run-review-button', 
          popover: { 
            title: 'Run AI Review', 
            description: 'Click here to start the AI-powered code review. Our agents will check for bugs, security flaws, and performance issues.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#review-results', 
          popover: { 
            title: 'Review Results', 
            description: 'Once the review is complete, findings will appear here with detailed explanations and suggested fixes.', 
            side: "left", 
            align: 'start' 
          } 
        },
        { 
          element: '#github-tab', 
          popover: { 
            title: 'GitHub Integration', 
            description: 'Connect your GitHub account to review entire repositories and pull requests automatically.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#analytics-tab', 
          popover: { 
            title: 'Analytics', 
            description: 'Track your code quality trends over time and see how your team is improving.', 
            side: "bottom", 
            align: 'start' 
          } 
        },
      ]
    });

    driverObj.drive();
  };

  useEffect(() => {
    if (!tourStarted.current) {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        setTimeout(() => {
          startTour();
          localStorage.setItem('hasSeenTour', 'true');
        }, 1000);
      }
      tourStarted.current = true;
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    if (githubConnected) {
      fetchRepos();
    }
  }, [githubConnected]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) setHistory(data.reviews);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const fetchRepos = async () => {
    setFetchingRepos(true);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (res.ok) setRepos(data.repos);
    } catch (err) {
      console.error('Failed to fetch repos');
    } finally {
      setFetchingRepos(false);
    }
  };

  const fetchContents = async (owner: string, repo: string, path: string = '') => {
    setFetchingContents(true);
    try {
      const res = await fetch(`/api/github/repo/${owner}/${repo}/contents?path=${path}`);
      const data = await res.json();
      if (res.ok) {
        setRepoContents(data.contents);
        setCurrentPath(path);
      }
    } catch (err) {
      console.error('Failed to fetch contents');
    } finally {
      setFetchingContents(false);
    }
  };

  const handleFileSelect = async (owner: string, repo: string, path: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/github/repo/${owner}/${repo}/file?path=${path}`);
      const data = await res.json();
      if (res.ok) {
        setCode(data.content);
        setFileName(data.fileName);
        setActiveTab('editor');
      }
    } catch (err) {
      setError('Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setReview(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, fileName, profile: reviewProfile }),
      });
      const data = await res.json();
      if (res.ok) {
        setReview(data.review);
        fetchHistory();
      } else if (res.status === 403 && data.isLimitReached) {
        setShowUpgrade(true);
      } else {
        setError(data.error || 'Review failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPRs = async (owner: string, repo: string) => {
    setFetchingPRs(true);
    try {
      const res = await fetch(`/api/github/repo/${owner}/${repo}/pulls`);
      const data = await res.json();
      if (res.ok) setPullRequests(data.pulls);
    } catch (err) {
      console.error('Failed to fetch PRs');
    } finally {
      setFetchingPRs(false);
    }
  };

  const fetchMetrics = async (owner: string, repo: string) => {
    setFetchingMetrics(true);
    try {
      const res = await fetch(`/api/github/repo/${owner}/${repo}/metrics`);
      const data = await res.json();
      if (res.ok) setRepoMetrics(data.metrics);
    } catch (err) {
      console.error('Failed to fetch metrics');
    } finally {
      setFetchingMetrics(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/auth/upgrade', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onUserUpdate(data.user);
        setShowUpgrade(false);
      }
    } catch (err) {
      console.error('Upgrade failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
        setFileName(data.fileName);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(historySearch.toLowerCase());
    const matchesSeverity = historySeverity === 'All' || item.result.issues.some((i: any) => i.severity === historySeverity);
    
    const itemDate = new Date(item.timestamp);
    const matchesStartDate = !startDate || itemDate >= new Date(startDate);
    const matchesEndDate = !endDate || itemDate <= new Date(endDate + 'T23:59:59');
    
    return matchesSearch && matchesSeverity && matchesStartDate && matchesEndDate;
  }).sort((a, b) => {
    if (historySort === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (historySort === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (historySort === 'issues-high') return b.result.issues.length - a.result.issues.length;
    if (historySort === 'issues-low') return a.result.issues.length - b.result.issues.length;
    return 0;
  });

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 px-4 md:px-8 bg-[#F8FBFF] overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div>
              <h1 className="text-2xl font-display font-bold">Developer Dashboard</h1>
              <p className="text-secondary text-sm">Review your code and track your history.</p>
            </div>
            <button 
              onClick={startTour}
              className="lg:hidden p-2 bg-white border border-border-soft rounded-xl text-deep-accent hover:bg-gray-50 transition-all"
              title="Start Tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={startTour}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-border-soft rounded-xl text-sm font-bold text-deep-accent hover:bg-gray-50 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Take a Tour
            </button>
            <div id="dashboard-tabs" className="flex items-center gap-2 bg-white p-1 rounded-xl border border-border-soft overflow-x-auto custom-scrollbar max-w-full">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'editor' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              History ({history.length})
            </button>
            <button 
              id="github-tab"
              onClick={() => setActiveTab('github')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'github' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button 
              onClick={() => setActiveTab('pull-requests')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pull-requests' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              <GitPullRequest className="w-4 h-4" /> Pull Requests
            </button>
            <button 
              id="analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'analytics' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              <ShieldCheck className="w-4 h-4" /> Live Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'bg-deep-accent text-white shadow-md' : 'text-secondary hover:bg-gray-50'}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </div>
      </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6 sm:gap-8 min-w-0">
          {activeTab === 'editor' ? (
            <>
              {/* Code Input Area */}
              <div className="space-y-6 min-w-0">
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-border-soft shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-accent/20 rounded-lg">
                        <FileCode className="w-5 h-5 text-deep-accent" />
                      </div>
                      <input 
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="font-mono text-sm font-bold outline-none bg-transparent border-b border-transparent focus:border-deep-accent w-full sm:w-auto"
                        placeholder="filename.js"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <button 
                        id="upload-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-none bg-white border border-border-soft text-secondary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span className="hidden sm:inline">Upload File</span>
                        <span className="sm:hidden">Upload</span>
                      </button>
                      <button 
                        id="run-review-button"
                        onClick={handleReview}
                        disabled={loading || !code.trim()}
                        className="flex-1 sm:flex-none bg-deep-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-deep-accent/20 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Run Review
                      </button>
                    </div>
                  </div>
                  <div id="code-editor" className="relative font-mono text-sm">
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="// Paste your code here or upload a file for a senior-level review..."
                      className="w-full h-[400px] sm:h-[550px] p-4 sm:p-6 bg-[#0D1117] text-white/90 rounded-2xl outline-none resize-none leading-relaxed custom-scrollbar"
                    />
                  </div>
                </div>
              </div>

              {/* Review Results Area */}
              <div className="space-y-6 min-w-0">
              <div id="review-results" className="bg-white p-4 sm:p-6 rounded-3xl border border-border-soft shadow-sm h-full flex flex-col min-h-[400px] overflow-hidden">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-deep-accent" />
                    <h3 className="font-display font-bold text-lg">Review Results</h3>
                  </div>

                  {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <Loader2 className="w-12 h-12 text-deep-accent animate-spin mb-4" />
                      <p className="font-bold text-secondary">Analyzing your code...</p>
                      <p className="text-sm text-secondary/60 mt-2">Our AI agents are inspecting every line for bugs and security flaws.</p>
                    </div>
                  )}

                  {!loading && !review && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <Search className="w-12 h-12 mb-4" />
                      <p className="font-bold">No review yet</p>
                      <p className="text-sm">Paste some code and click "Run Review" to get started.</p>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm mb-4">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {review && (
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[500px]">
                      {review.issues.length === 0 ? (
                        <div className="p-8 text-center">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="font-bold text-green-600">Looks Great!</p>
                          <p className="text-sm text-secondary">No major issues detected in this snippet.</p>
                        </div>
                      ) : (
                        review.issues.map((issue, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-4 rounded-2xl border ${
                              issue.severity === 'Critical' ? 'bg-red-50 border-red-100' :
                              issue.severity === 'Warning' ? 'bg-orange-50 border-orange-100' :
                              'bg-blue-50 border-blue-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                issue.severity === 'Critical' ? 'bg-red-500 text-white' :
                                issue.severity === 'Warning' ? 'bg-orange-500 text-white' :
                                'bg-blue-500 text-white'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-xs font-mono font-bold text-secondary/60">Line {issue.line}</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                              {issue.title}
                              {issue.cve && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-mono font-bold border border-red-200">
                                  {issue.cve}
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-secondary leading-relaxed mb-3">{issue.description}</p>
                            {issue.fix && (
                              <div className="mt-3 pt-3 border-t border-black/5">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                                    <Wand2 className="w-3 h-3 text-deep-accent" /> AI Suggested Fix
                                  </span>
                                  <button 
                                    onClick={() => {
                                      // Simple line replacement logic (simulation)
                                      const lines = code.split('\n');
                                      if (issue.line > 0 && issue.line <= lines.length) {
                                        lines[issue.line - 1] = issue.fix || '';
                                        setCode(lines.join('\n'));
                                      }
                                    }}
                                    className="text-[10px] font-bold text-deep-accent hover:underline flex items-center gap-1 shrink-0"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Apply Locally
                                  </button>
                                  {selectedRepo && (
                                    <button 
                                      onClick={async () => {
                                        const confirmed = window.confirm(`This will directly push a commit to ${selectedRepo.name}. Continue?`);
                                        if (!confirmed) return;
                                        
                                        const res = await fetch('/api/github/autofix', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            owner: selectedRepo.owner.login,
                                            repo: selectedRepo.name,
                                            path: currentPath || fileName,
                                            branch: selectedRepo.default_branch || 'main',
                                            fixCode: (code.split('\n').map((l, idx) => idx + 1 === issue.line ? issue.fix : l)).join('\n'),
                                            message: `CodeSentinel AI Fix: Resolved "${issue.title}" on line ${issue.line}`
                                          })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                          alert('Successfully committed to GitHub! Commit URL: ' + data.commitUrl);
                                        } else {
                                          alert('Auto-fix failed: ' + data.error);
                                        }
                                      }}
                                      className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded hover:bg-green-100 flex items-center gap-1 shrink-0 ml-2 border border-green-200"
                                    >
                                      <GitPullRequest className="w-3 h-3" /> Auto-Fix Commit to GitHub
                                    </button>
                                  )}
                                </div>
                                <pre className="text-[10px] font-mono bg-white/50 p-2 rounded border border-black/5 overflow-x-auto whitespace-pre-wrap break-all">
                                  {issue.fix}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {review && (
                    <div className="mt-6 pt-6 border-t border-border-soft">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-secondary">Overall Score</span>
                        <span className={`text-xl font-display font-bold ${getScoreColor(calculateCodeScore(review.issues))}`}>
                          {calculateCodeScore(review.issues)}/100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateCodeScore(review.issues)}%` }}
                          className={`h-full ${getScoreBgColor(calculateCodeScore(review.issues))}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeTab === 'history' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-deep-accent" />
                    <h2 className="text-xl font-display font-bold">Review History</h2>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
                      <input 
                        type="text"
                        placeholder="Search file..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-border-soft rounded-xl text-sm focus:border-deep-accent outline-none transition-all w-full sm:w-48"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-gray-50 border border-border-soft rounded-xl px-3 py-2">
                      <Filter className="w-4 h-4 text-secondary/40" />
                      <select 
                        value={historySeverity}
                        onChange={(e) => setHistorySeverity(e.target.value as any)}
                        className="bg-transparent text-sm outline-none cursor-pointer font-bold text-secondary"
                      >
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="Warning">Warning</option>
                        <option value="Info">Info</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-border-soft rounded-xl px-3 py-2">
                      <ChevronDown className="w-4 h-4 text-secondary/40" />
                      <select 
                        value={historySort}
                        onChange={(e) => setHistorySort(e.target.value as any)}
                        className="bg-transparent text-sm outline-none cursor-pointer font-bold text-secondary"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="issues-high">Most Issues</option>
                        <option value="issues-low">Least Issues</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-primary-accent/10 rounded-2xl border border-primary-accent/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-deep-accent" />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">Date Range:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs outline-none focus:border-deep-accent"
                    />
                    <span className="text-secondary/40">to</span>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white border border-border-soft rounded-lg px-3 py-1.5 text-xs outline-none focus:border-deep-accent"
                    />
                  </div>
                  {(startDate || endDate || historySearch || historySeverity !== 'All') && (
                    <button 
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setHistorySearch('');
                        setHistorySeverity('All');
                      }}
                      className="text-xs font-bold text-deep-accent hover:underline ml-auto"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-20 opacity-40">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-bold">No matching reviews</p>
                    <p>Try adjusting your filters or search terms.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHistory.map((item, i) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-50 p-6 rounded-2xl border border-border-soft hover:border-deep-accent transition-all cursor-pointer group"
                        onClick={() => {
                          setReview(item.result);
                          setActiveTab('editor');
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-white rounded-lg border border-border-soft">
                            <FileCode className="w-4 h-4 text-deep-accent" />
                          </div>
                          <span className="text-[10px] text-secondary/60 font-mono">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-2 truncate">{item.fileName}</h4>
                        <p className="text-xs text-secondary line-clamp-2 mb-4 font-mono bg-white p-2 rounded border border-border-soft">
                          {item.codeSnippet}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                              {item.result.issues.length} Issues
                            </span>
                            {item.result.issues.some((iss: any) => iss.severity === 'Critical') && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-deep-accent opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'github' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                {!githubConnected ? (
                  <div className="text-center py-20">
                    <Github className="w-16 h-16 mx-auto mb-6 text-secondary/40" />
                    <h2 className="text-2xl font-display font-bold mb-4">Connect your GitHub</h2>
                    <p className="text-secondary mb-8 max-w-md mx-auto">
                      Connect your GitHub account to review code directly from your repositories.
                    </p>
                    <button 
                      onClick={onConnectGitHub}
                      className="bg-deep-accent text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-deep-accent/20 flex items-center gap-3 mx-auto"
                    >
                      <Github className="w-5 h-5" /> Connect GitHub Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Github className="w-6 h-6 text-deep-accent" />
                        <h2 className="text-xl font-display font-bold">GitHub Repositories</h2>
                      </div>
                      <button 
                        onClick={fetchRepos}
                        disabled={fetchingRepos}
                        className="text-sm font-bold text-deep-accent hover:underline flex items-center gap-2"
                      >
                        {fetchingRepos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Refresh Repos
                      </button>
                    </div>

                    {!selectedRepo ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fetchingRepos ? (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse border border-border-soft" />
                          ))
                        ) : (
                          repos.map((repo) => (
                            <motion.div 
                              key={repo.id}
                              whileHover={{ y: -5 }}
                              onClick={() => {
                                setSelectedRepo(repo);
                                fetchContents(repo.owner.login, repo.name);
                              }}
                              className="p-5 bg-gray-50 rounded-2xl border border-border-soft hover:border-deep-accent transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white rounded-lg border border-border-soft">
                                  <Layers className="w-4 h-4 text-deep-accent" />
                                </div>
                                <h4 className="font-bold text-sm truncate">{repo.name}</h4>
                              </div>
                              <p className="text-[10px] text-secondary line-clamp-2 mb-4 h-8">
                                {repo.description || "No description provided."}
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-bold text-secondary/60 uppercase tracking-wider">
                                <span>{repo.language || "Unknown"}</span>
                                <span>{repo.stargazers_count} stars</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-border-soft">
                          <button 
                            onClick={() => {
                              setSelectedRepo(null);
                              setPullRequests([]);
                            }}
                            className="p-2 bg-white rounded-lg border border-border-soft hover:bg-gray-50 transition-all"
                          >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </button>
                          <div>
                            <h3 className="font-bold text-sm">{selectedRepo.full_name}</h3>
                            <p className="text-[10px] text-secondary">Browsing: /{currentPath}</p>
                          </div>
                          <button 
                            onClick={() => {
                              fetchPRs(selectedRepo.owner.login, selectedRepo.name);
                              setActiveTab('pull-requests');
                            }}
                            className="ml-auto flex items-center gap-2 text-xs font-bold text-deep-accent bg-white px-3 py-1.5 rounded-lg border border-border-soft hover:bg-gray-50 transition-all"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" /> 
                            {fetchingPRs ? 'Loading...' : 'View PRs'}
                          </button>
                        </div>

                        <div className="grid gap-2">
                          {fetchingContents ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 text-deep-accent animate-spin" />
                            </div>
                          ) : (
                            repoContents.map((item) => (
                              <button 
                                key={item.sha}
                                onClick={() => {
                                  if (item.type === 'dir') {
                                    fetchContents(selectedRepo.owner.login, selectedRepo.name, item.path);
                                  } else {
                                    handleFileSelect(selectedRepo.owner.login, selectedRepo.name, item.path);
                                  }
                                }}
                                className="flex items-center justify-between p-4 bg-white border border-border-soft rounded-xl hover:border-deep-accent transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  {item.type === 'dir' ? (
                                    <Layers className="w-4 h-4 text-deep-accent" />
                                  ) : (
                                    <FileCode className="w-4 h-4 text-secondary" />
                                  )}
                                  <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-deep-accent opacity-0 group-hover:opacity-100 transition-all" />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'pull-requests' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-6 h-6 text-deep-accent" />
                    <h2 className="text-xl font-display font-bold">Active Pull Requests</h2>
                  </div>
                  {selectedRepo && (
                    <div className="text-xs font-bold text-secondary bg-gray-50 px-3 py-1.5 rounded-lg border border-border-soft">
                      {selectedRepo.full_name}
                    </div>
                  )}
                </div>

                {!githubConnected ? (
                  <div className="text-center py-20">
                    <Github className="w-16 h-16 mx-auto mb-6 text-secondary/40" />
                    <h2 className="text-xl font-bold mb-2">Connect GitHub</h2>
                    <p className="text-secondary text-sm mb-6">Connect your account to see pull requests.</p>
                    <button onClick={onConnectGitHub} className="bg-deep-accent text-white px-6 py-3 rounded-xl font-bold">Connect Now</button>
                  </div>
                ) : !selectedRepo ? (
                  <div className="text-center py-20">
                    <Search className="w-16 h-16 mx-auto mb-6 text-secondary/40" />
                    <h2 className="text-xl font-bold mb-2">No Repository Selected</h2>
                    <p className="text-secondary text-sm mb-6">Select a repository in the GitHub tab to view its active pull requests.</p>
                    <button onClick={() => setActiveTab('github')} className="text-deep-accent font-bold hover:underline">Go to GitHub Tab</button>
                  </div>
                ) : fetchingPRs ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-deep-accent animate-spin" />
                    <p className="text-secondary font-medium">Fetching active pull requests...</p>
                  </div>
                ) : pullRequests.length === 0 ? (
                  <div className="text-center py-20">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-500/40" />
                    <h2 className="text-xl font-bold mb-2">No Active PRs</h2>
                    <p className="text-secondary text-sm">There are no open pull requests for this repository.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pullRequests.map((pr) => (
                      <div key={pr.id} className="p-6 bg-gray-50 rounded-2xl border border-border-soft hover:border-deep-accent transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-deep-accent bg-deep-accent/10 px-2 py-0.5 rounded">#{pr.number}</span>
                              <h3 className="font-bold text-sm group-hover:text-deep-accent transition-colors">{pr.title}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-secondary/60 font-medium">
                              <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {pr.user.login}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(pr.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setError('Deep PR analysis is being initialized. This will scan all changed files in the PR.');
                            }}
                            className="bg-white text-deep-accent border border-border-soft px-4 py-2 rounded-xl text-xs font-bold hover:bg-deep-accent hover:text-white transition-all shadow-sm"
                          >
                            Analyze PR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-deep-accent" />
                    <h2 className="text-xl font-display font-bold">Team Analytics</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-border-soft">
                    <Activity className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Live Quality Trends</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Total Reviews', value: history.length, icon: FileCode, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Critical Issues', value: history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.severity === 'Critical').length, 0), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
                    { 
                      label: 'Code Quality', 
                      value: history.length > 0 
                        ? `${Math.round(history.reduce((acc, curr) => acc + calculateCodeScore(curr.result.issues), 0) / history.length)}%` 
                        : '100%', 
                      icon: ShieldCheck, 
                      color: 'text-green-500', 
                      bg: 'bg-green-50' 
                    },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-black/5`}>
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">Last 30 Days</span>
                      </div>
                      <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-secondary/60">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="h-[300px] w-full">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-deep-accent" /> Issue Trends Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history.slice().reverse().map((h, i) => ({ name: `Rev ${i+1}`, issues: h.result.issues.length }))}>
                        <defs>
                          <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="issues" stroke="#2563eb" fillOpacity={1} fill="url(#colorIssues)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="h-[250px]">
                      <h3 className="text-sm font-bold mb-4">Severity Distribution</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Critical', count: history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.severity === 'Critical').length, 0), color: '#ef4444' },
                          { name: 'Warning', count: history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.severity === 'Warning').length, 0), color: '#f97316' },
                          { name: 'Info', count: history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.severity === 'Info').length, 0), color: '#3b82f6' },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#3b82f6'][index]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-border-soft">
                      <h3 className="text-sm font-bold mb-4">Quality Insights</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            label: 'Security Compliance', 
                            score: history.length > 0 
                              ? Math.max(40, 100 - history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.severity === 'Critical' && i.title.toLowerCase().includes('security')).length * 30, 0) / history.length) 
                              : 100 
                          },
                          { 
                            label: 'Performance Optimization', 
                            score: history.length > 0 
                              ? Math.max(30, 100 - history.reduce((acc, curr) => acc + curr.result.issues.filter((i: any) => i.title.toLowerCase().includes('performance')).length * 15, 0) / history.length) 
                              : 100 
                          },
                          { 
                            label: 'Maintainability Index', 
                            score: history.length > 0 
                              ? Math.max(20, 100 - history.reduce((acc, curr) => acc + curr.result.issues.length * 2, 0) / history.length) 
                              : 100 
                          },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-medium text-secondary">{item.label}</span>
                              <span className="text-xs font-bold text-deep-accent">{Math.round(item.score)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-deep-accent rounded-full" style={{ width: `${item.score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'dashboard' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-deep-accent" />
                    <h2 className="text-xl font-display font-bold">Security & Tech Debt Dashboard</h2>
                  </div>
                </div>

                {!githubConnected ? (
                  <div className="text-center py-20">
                    <Github className="w-16 h-16 mx-auto mb-6 text-secondary/40" />
                    <h2 className="text-xl font-bold mb-2">Connect GitHub</h2>
                    <p className="text-secondary text-sm mb-6">Connect your account to view live repository metrics.</p>
                    <button onClick={onConnectGitHub} className="bg-deep-accent text-white px-6 py-3 rounded-xl font-bold">Connect Now</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-border-soft">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Select Repository</label>
                        <select 
                          className="w-full sm:w-64 bg-white border border-border-soft rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-deep-accent"
                          value={selectedRepo?.full_name || ''}
                          onChange={(e) => {
                            const repo = repos.find((r) => r.full_name === e.target.value);
                            setSelectedRepo(repo || null);
                            if (repo) fetchMetrics(repo.owner.login, repo.name);
                          }}
                        >
                          <option value="">-- Choose a repository --</option>
                          {repos.map(r => (
                            <option key={r.id} value={r.full_name}>{r.full_name}</option>
                          ))}
                        </select>
                      </div>
                      {selectedRepo && (
                        <button 
                          onClick={() => fetchMetrics(selectedRepo.owner.login, selectedRepo.name)}
                          disabled={fetchingMetrics}
                          className="mt-6 sm:mt-0 flex items-center justify-center gap-2 bg-white border border-border-soft text-deep-accent px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          {fetchingMetrics ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                          Refresh Live Data
                        </button>
                      )}
                    </div>

                    {!selectedRepo ? (
                      <div className="text-center py-20 opacity-40">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-bold">No Repository Selected</p>
                        <p>Select a repository above to run live analysis.</p>
                      </div>
                    ) : fetchingMetrics ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-deep-accent animate-spin" />
                        <p className="font-bold text-secondary">Fetching live metrics from GitHub...</p>
                      </div>
                    ) : repoMetrics ? (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className={`p-6 rounded-3xl border ${repoMetrics.securityScore >= 90 ? 'bg-green-50 border-green-100' : repoMetrics.securityScore >= 70 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-bold opacity-80 uppercase tracking-wide">Security Health</span>
                              <Shield className="w-5 h-5 opacity-80" />
                            </div>
                            <div className="text-5xl font-display font-bold mb-2">{repoMetrics.securityScore}/100</div>
                            <p className="text-xs opacity-70">Based on live security issues and vulnerabilities.</p>
                          </div>
                          <div className={`p-6 rounded-3xl border ${repoMetrics.techDebtScore >= 90 ? 'bg-green-50 border-green-100' : repoMetrics.techDebtScore >= 70 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-bold opacity-80 uppercase tracking-wide">Tech Debt</span>
                              <Activity className="w-5 h-5 opacity-80" />
                            </div>
                            <div className="text-5xl font-display font-bold mb-2">{repoMetrics.techDebtScore}/100</div>
                            <p className="text-xs opacity-70">Based on open pull requests and bug backlogs.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Open Issues', value: repoMetrics.openIssues, color: 'text-gray-700' },
                            { label: 'Pending PRs', value: repoMetrics.openPRs, color: 'text-blue-600' },
                            { label: 'Bug Reports', value: repoMetrics.bugCount, color: 'text-orange-500' },
                            { label: 'Security Alerts', value: repoMetrics.securityCount, color: 'text-red-500' },
                          ].map((stat, i) => (
                            <div key={i} className="bg-gray-50 border border-border-soft p-4 rounded-2xl text-center">
                              <div className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                              <div className="text-[10px] font-bold text-secondary uppercase tracking-wider">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="h-[300px] w-full mt-8">
                          <h3 className="text-sm font-bold mb-4">Repository Issue Distribution</h3>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { name: 'Bug Reports', count: repoMetrics.bugCount, fill: '#f97316' },
                                { name: 'Security Alerts', count: repoMetrics.securityCount, fill: '#ef4444' },
                                { name: 'Other Issues', count: Math.max(0, repoMetrics.openIssues - repoMetrics.bugCount - repoMetrics.securityCount), fill: '#94a3b8' }
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={60} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border-soft shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Settings className="w-6 h-6 text-deep-accent" />
                  <h2 className="text-xl font-display font-bold">Review Settings</h2>
                </div>

                <div className="grid gap-8">
                  <section>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-deep-accent" /> Security & Compliance Profiles
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { id: 'Standard', desc: 'Balanced review of all aspects.', icon: Zap },
                        { id: 'Security', desc: 'Deep dive into vulnerabilities & CVEs.', icon: Lock },
                        { id: 'Performance', desc: 'Optimize for speed and memory.', icon: Activity },
                        { id: 'Clean Code', desc: 'Focus on SOLID and maintainability.', icon: Terminal },
                      ].map((profile) => (
                        <button 
                          key={profile.id}
                          onClick={() => setReviewProfile(profile.id as ReviewProfile)}
                          className={`p-4 rounded-2xl border text-left transition-all ${reviewProfile === profile.id ? 'border-deep-accent bg-deep-accent/5 ring-1 ring-deep-accent' : 'border-border-soft hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <profile.icon className={`w-4 h-4 ${reviewProfile === profile.id ? 'text-deep-accent' : 'text-secondary'}`} />
                            <span className="text-sm font-bold">{profile.id}</span>
                          </div>
                          <p className="text-xs text-secondary/60">{profile.desc}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="pt-8 border-t border-border-soft">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-deep-accent" /> Custom Organization Style Guides
                    </h3>
                    <div className="space-y-3">
                      <p className="text-xs text-secondary/60">Define specific rules, architectures, and naming conventions for your engineering team. The AI will enforce these on every review.</p>
                      <textarea 
                        value={user.custom_rules || ''}
                        onChange={(e) => onUserUpdate({ ...user, custom_rules: e.target.value })}
                        placeholder="e.g., Always use React.FC for components. Never use absolute imports."
                        className="w-full h-32 px-4 py-3 bg-gray-50 border border-border-soft rounded-xl focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition-all text-sm font-mono custom-scrollbar"
                      />
                      <button 
                        onClick={async () => {
                          await fetch('/api/user/rules', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ customRules: user.custom_rules })
                          });
                          alert('Custom rules saved successfully!');
                        }}
                        className="bg-deep-accent text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-opacity-90 transition-all shadow-md shadow-deep-accent/20"
                      >
                        Save Custom Rules
                      </button>
                    </div>
                  </section>

                  <section className="pt-8 border-t border-border-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-deep-accent" /> Real-time "Live" Analysis
                        </h3>
                        <p className="text-xs text-secondary/60">Analyze code as you type (Beta)</p>
                      </div>
                      <button 
                        onClick={() => setIsLiveAnalysis(!isLiveAnalysis)}
                        className={`w-12 h-6 rounded-full transition-all relative ${isLiveAnalysis ? 'bg-deep-accent' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLiveAnalysis ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </section>

                  <section className="pt-8 border-t border-border-soft">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Github className="w-4 h-4 text-deep-accent" /> GitHub Integration
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-border-soft flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${githubConnected ? 'bg-green-100' : 'bg-gray-200'}`}>
                          <Github className={`w-4 h-4 ${githubConnected ? 'text-green-600' : 'text-secondary'}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{githubConnected ? 'Connected to GitHub' : 'GitHub Not Connected'}</p>
                          <p className="text-[10px] text-secondary/60">Manage your repository access</p>
                        </div>
                      </div>
                      <button 
                        onClick={githubConnected ? () => {} : onConnectGitHub}
                        className="text-xs font-bold text-deep-accent hover:underline"
                      >
                        {githubConnected ? 'Manage' : 'Connect'}
                      </button>
                    </div>
                  </section>

                  <section className="pt-8 border-t border-border-soft">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4 text-deep-accent" /> API Access (VS Code Extension)
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-border-soft">
                      <p className="text-xs text-secondary mb-2">Use this key to authenticate with the CodeSentinel VS Code extension.</p>
                      <ul className="text-xs text-secondary/80 list-disc ml-4 mb-4 space-y-1">
                        <li>Open the <strong><code>codesentinel-vscode</code></strong> folder in Visual Studio Code.</li>
                        <li>Press <strong>F5</strong> to launch the extension testing window.</li>
                        <li>In the new window, open VS Code Settings, search for <em>CodeSentinel</em>, and paste this API Key.</li>
                        <li>Run <strong>CodeSentinel: Review Active File</strong> from the Command Palette (Ctrl+Shift+P) to see it in action!</li>
                      </ul>
                      {user.api_key ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white border border-border-soft px-4 py-2 rounded-xl font-mono text-xs overflow-hidden text-ellipsis">
                            {user.api_key}
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(user.api_key || '');
                              // Could add a toast here
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4 text-secondary" />
                          </button>
                          <button 
                            onClick={async () => {
                              const res = await fetch('/api/auth/api-key', { method: 'POST' });
                              const data = await res.json();
                              if (res.ok) onUserUpdate({ ...user, api_key: data.apiKey });
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Regenerate
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={async () => {
                            const res = await fetch('/api/auth/api-key', { method: 'POST' });
                            const data = await res.json();
                            if (res.ok) onUserUpdate({ ...user, api_key: data.apiKey });
                          }}
                          className="bg-deep-accent text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-opacity-90 transition-all shadow-lg shadow-deep-accent/20"
                        >
                          Generate API Key
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 space-y-6">
              {/* Fallback for other tabs or empty state */}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgrade(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-deep-accent" />
              <div className="text-center">
                <div className="inline-flex p-4 bg-primary-accent rounded-2xl mb-6">
                  <Zap className="w-10 h-10 text-deep-accent" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Upgrade to Pro</h2>
                <p className="text-secondary mb-8">
                  You've reached the limit of 10 reviews on the Free plan. 
                  Upgrade to Pro for unlimited reviews, advanced models, and history tracking.
                </p>
                <div className="space-y-4 mb-10 text-left bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Unlimited AI Code Reviews</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Advanced command-a-03-2025 Model</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Full Review History & Trends</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleUpgrade}
                    className="flex-1 bg-deep-accent text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-deep-accent/20"
                  >
                    Upgrade Now — $19/mo
                  </button>
                  <button 
                    onClick={() => setShowUpgrade(false)}
                    className="flex-1 bg-gray-50 text-secondary py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const GitHubCredentialsModal = ({ 
  isOpen, 
  onClose, 
  onConnect 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConnect: (clientId: string, clientSecret: string) => void 
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border-soft"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-accent rounded-xl">
              <Github className="w-6 h-6 text-deep-accent" />
            </div>
            <h2 className="text-xl font-display font-bold">GitHub Credentials</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>

        <p className="text-sm text-secondary mb-6">
          To connect your GitHub account, please provide your OAuth App credentials. 
          You can create these in your <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-deep-accent hover:underline font-bold">GitHub Developer Settings</a>.
          <br /><br />
          <span className="text-xs font-bold text-red-500">Important:</span> Set your <strong>Authorization callback URL</strong> exactly to: <br/>
          <code className="bg-gray-100 px-2 py-1 rounded text-deep-accent select-all">{window.location.origin}/api/auth/github/callback</code>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 ml-1">Client ID</label>
            <input 
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. Ov23li..."
              className="w-full px-4 py-3 bg-gray-50 border border-border-soft rounded-xl focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition-all text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 ml-1">Client Secret</label>
            <input 
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="••••••••••••••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-border-soft rounded-xl focus:border-deep-accent focus:ring-2 focus:ring-deep-accent/10 outline-none transition-all text-sm font-mono"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-border-soft rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConnect(clientId, clientSecret)}
            disabled={!clientId || !clientSecret}
            className="flex-1 px-6 py-3 bg-deep-accent text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-deep-accent/20 disabled:opacity-50"
          >
            Continue to GitHub
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) {
        console.error('Auth check failed');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      checkGitHubStatus();
    }
  }, [user]);

  const checkGitHubStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      setGithubConnected(data.connected);
    } catch (err) {
      console.error('GitHub status check failed');
    }
  };

  const handleConnectGitHub = async (clientId?: string, clientSecret?: string) => {
    if (!clientId || !clientSecret) {
      setIsGitHubModalOpen(true);
      return;
    }

    try {
      const originParam = encodeURIComponent(window.location.origin);
      const res = await fetch(`/api/auth/github/url?clientId=${clientId}&clientSecret=${clientSecret}&origin=${originParam}`);
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to get auth URL');
        return;
      }

      const { url } = data;
      setIsGitHubModalOpen(false);
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        'github_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert('Please allow popups to connect your GitHub account.');
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
          setGithubConnected(true);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('GitHub connection failed');
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await fetch('/api/github/disconnect', { method: 'POST' });
      setGithubConnected(false);
    } catch (err) {
      console.error('GitHub disconnect failed');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setGithubConnected(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-deep-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-primary-accent selection:text-deep-accent overflow-x-hidden">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        githubConnected={githubConnected}
        onConnectGitHub={() => setIsGitHubModalOpen(true)}
        onDisconnectGitHub={handleDisconnectGitHub}
      />
      <main>
        {user ? (
          <Dashboard 
            user={user} 
            onUserUpdate={setUser} 
            githubConnected={githubConnected}
            onConnectGitHub={() => setIsGitHubModalOpen(true)}
          />
        ) : (
          <>
            <AuthForm onAuthSuccess={setUser} />
            <Pricing />
          </>
        )}
      </main>
      
      <GitHubCredentialsModal 
        isOpen={isGitHubModalOpen} 
        onClose={() => setIsGitHubModalOpen(false)}
        onConnect={handleConnectGitHub}
      />
      
      <footer className="bg-white border-t border-primary-accent/30 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-deep-accent" />
            <span className="font-display font-bold text-xl">CodeSentinel</span>
          </div>
          <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
            AI Code Review for Engineers Who Care. Real static analysis meets multi-agent intelligence.
          </p>
          <div className="pt-8 border-t border-border-soft text-xs text-secondary/60">
            <p>© 2026 CodeSentinel AI. Built with Cohere & Claude by Satyam Kadavla</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
