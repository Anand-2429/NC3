import React, { useState, useEffect, useCallback, useRef, useMemo, Fragment } from 'react';

// Theme initialization
const initializeTheme = () => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        return 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        return 'light';
    }
};
import { Award, Shirt, Info, ShieldCheck, MusicIcon, UserCircle, BookOpen, LogIn, UserPlus, Home, LogOut, Settings, PlusCircle, Edit, Trash2, ChevronLeft, Users, Puzzle, Crosshair, Map, ChevronDown, Calendar, ListChecks, FileText, ArrowUp, ArrowDown, ArrowRight, HeartPulse, MailCheck, Menu, X, Shield, Bell, Sun, Moon, CheckCircle, Lock } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Tone from 'tone';
// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch, getCountFromServer, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


// --- FIREBASE CONFIGURATION ---
// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsO2h0smm2jj_YrAH2hCrp-2t7RQIrmkg",
    authDomain: "ncc-progress-tracker.firebaseapp.com",
    projectId: "ncc-progress-tracker",
    storageBucket: "ncc-progress-tracker.appspot.com",
    messagingSenderId: "587734740864",
    appId: "1:587734740864:web:2d8f7b3e0a3d4e9f539b65",
    measurementId: "G-02C3CZWPT5"
};


// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- HELPER FUNCTIONS (IMPROVED) ---
const getYouTubeVideoId = (url) => {
    if (!url) return '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
};

const getYouTubeEmbedUrl = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const getYouTubeThumbnailUrl = (videoUrl) => {
    const videoId = getYouTubeVideoId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/1280x720/e2e8f0/4a5568?text=No+Video';
};

// --- ASSET COMPONENT ---
const NccLogo = ({ className }) => (
    <img 
        src="https://ik.imagekit.io/jywuh6xr2/unnamed__1_-removebg-preview.png?updatedAt=1755544135991" 
        alt="NCC Logo" 
        className={`h-12 w-auto ${className}`} 
    />
);


// --- UI COMPONENTS ---
const Header = ({ setPage, user, setUser, userData, theme, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        sessionStorage.removeItem('hasSeenWelcomeAnimation');
        await signOut(auth);
        setUser(null);
        setPage('login');
        setIsMenuOpen(false);
    };

    const handleNavClick = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => handleNavClick(user ? (userData?.role === 'admin' ? 'admin' : 'dashboard') : 'login')}>
                        <NccLogo />
                        <h1 className="ml-3 text-xl font-bold tracking-wider">Cadet Compass</h1>
                    </div>

                    <div className="flex items-center">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white mr-4">
                            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        </button>
                        <nav className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <>
                                    <button onClick={() => handleNavClick('dashboard')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"><Home className="w-4 h-4 mr-1" />Dashboard</button>
                                    {userData?.role === 'admin' && (
                                        <button onClick={() => handleNavClick('admin')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-yellow-500 hover:bg-yellow-600"><Settings className="w-4 h-4 mr-1" />Admin Panel</button>
                                    )}
                                    <button onClick={() => handleNavClick('profile')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                                        {userData?.photoURL ? (
                                            <img src={userData.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover mr-2" />
                                        ) : (
                                            <UserCircle className="w-5 h-5 mr-2" />
                                        )}
                                        Profile
                                    </button>
                                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><LogOut className="w-4 h-4 mr-1" />Logout</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleNavClick('login')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"><LogIn className="w-4 h-4 mr-1" />Login</button>
                                    <button onClick={() => handleNavClick('signup')} className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><UserPlus className="w-4 h-4 mr-1" />Sign Up</button>
                                </>
                            )}
                        </nav>
                        <div className="md:hidden ml-2">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <button onClick={() => handleNavClick('dashboard')} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"><Home className="w-5 h-5 mr-3" />Dashboard</button>
                                {userData?.role === 'admin' && (
                                    <button onClick={() => handleNavClick('admin')} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium bg-yellow-500 hover:bg-yellow-600"><Settings className="w-5 h-5 mr-3" />Admin Panel</button>
                                )}
                                <button onClick={() => handleNavClick('profile')} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"><UserCircle className="w-5 h-5 mr-3" />Profile</button>
                                <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"><LogOut className="w-5 h-5 mr-3" />Logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleNavClick('login')} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"><LogIn className="w-5 h-5 mr-3" />Login</button>
                                <button onClick={() => handleNavClick('signup')} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"><UserPlus className="w-5 h-5 mr-3" />Sign Up</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Cadet Compass. Jai Hind! 🇮🇳</p>
        </div>
    </footer>
);

// --- PAGE COMPONENTS ---
const LoginPage = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResetMessage('');
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Password reset link sent! Check your email inbox.');
        } catch (err) {
            setError('Failed to send reset email. Please check the address.');
        }
        setLoading(false);
    };

    if (isResettingPassword) {
        return (
            <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                    <div className="text-center mb-8"><h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2></div>
                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg" placeholder="Enter your registered email" required />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        {resetMessage && <p className="text-green-500 text-sm text-center">{resetMessage}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                    </form>
                    <p className="text-center mt-6 text-sm"><button onClick={() => setIsResettingPassword(false)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">&larr; Back to Login</button></p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center">
                        <NccLogo className="h-24" />
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Cadet Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg" placeholder="Email Address" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mt-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg" placeholder="Password" required />
                    <div className="text-right text-sm"><button type="button" onClick={() => setIsResettingPassword(true)} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Forgot password?</button></div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">Not registered? <button onClick={() => setPage('signup')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign Up</button></p>
            </div>
        </div>
    );
};

const SignupPage = ({ setPage }) => {
    const [formData, setFormData] = useState({ fullName: '', email: '', serviceNumber: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                serviceNumber: formData.serviceNumber,
                currentPhase: 1,
                role: 'cadet',
                photoURL: ''
            });
            await sendEmailVerification(user);
        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use': setError('This email address is already registered.'); break;
                case 'auth/invalid-email': setError('Please enter a valid email address.'); break;
                case 'auth/weak-password': setError('Password must be at least 6 characters long.'); break;
                default: setError('Failed to register. Please try again.'); console.error("Signup error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center">
                        <NccLogo className="h-24" />
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Cadet Registration</h2>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                    <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg" required />
                    <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg" required />
                    <input type="text" name="serviceNumber" placeholder="Service Number" onChange={handleChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg" required />
                    <input type="password" name="password" placeholder="Password (min. 6 characters)" onChange={handleChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-lg" required />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">{loading ? 'Registering...' : 'Register'}</button>
                </form>
                <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">Already have an account? <button onClick={() => setPage('login')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Login</button></p>
            </div>
        </div>
    );
};

const VerifyEmailPage = ({ setPage }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResendVerification = async () => {
        setLoading(true);
        setMessage('');
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                setMessage('A new verification link has been sent to your email.');
            } else {
                setMessage('You are not logged in. Please log in again.');
            }
        } catch (error) {
            setMessage('Failed to send verification email.');
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        setPage('login');
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
                <MailCheck className="mx-auto h-12 w-12 text-blue-500" />
                <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Verify Your Email</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">A verification link has been sent to <strong>{auth.currentUser?.email}</strong>. Please click the link to activate your account.</p>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Once verified, please log out and log back in.</p>
                {message && <p className="mt-4 text-blue-600 dark:text-blue-400 font-semibold">{message}</p>}
                <div className="mt-8 space-y-4">
                    <button onClick={handleResendVerification} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">{loading ? 'Sending...' : 'Resend Verification Email'}</button>
                    <button onClick={handleLogout} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg">Logout</button>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsPage = ({ setPage }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
            setAnnouncements(announcementsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const formatDate = (date) => date ? date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => setPage('dashboard')} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4"><FileText className="w-6 h-6 mr-3 text-green-600" /><h2 className="text-3xl font-bold text-gray-800 dark:text-white">Unit Announcements</h2></div>
                {loading ? <p className="dark:text-white">Loading announcements...</p> : (
                    <div className="space-y-4">
                        {announcements.length > 0 ? announcements.map(ann => (
                            <div key={ann.id} className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-gray-700 rounded-r-lg">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-green-800 dark:text-green-300 text-lg">{ann.title}</h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap ml-4">{formatDate(ann.createdAt)}</span>
                                </div>
                                <p className="mt-1 text-gray-700 dark:text-gray-300">{ann.content}</p>
                            </div>
                        )) : <p className="dark:text-gray-400">No announcements found.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const lyrics = [
  { time: 0.0, text: "....Music" },
  { time: 13.2, text: "Hum Sab Bharatiya Hain, Hum Sab Bharatiya Hain" },
  { time: 21.0, text: "Apni Manzil Ek Hai," },
  { time: 24.0, text: "Haa Haa Haa Ek Hai, Ho Ho Ho Ek Hai." },
  { time: 28.8, text: "Hum Sab Bharatiya Hain, Hum Sab Bharatiya Hain." },
  { time: 36.5, text: "Kashmir Ki Dharti Rani Hai," },
  { time: 41.2, text: "Sartaj Himalaya Hai," },
  { time: 45.5, text: "Saadiyon Se Humne Isko Apne Khoon Se Pala Hai" },
  { time: 54.0, text: "Desh Ki Raksha Ki Khatir Hum Shamshir Utha Lenge," },
  { time: 63.5, text: "Hum Shamshir Utha Lenge." },
  { time: 68.0, text: "Bikhre Bikhre Taare Hain Hum, Lekin Jhilmil Ek Hai," },
  { time: 75.0, text: "Haa Haa Haa Ek Hai, Ho Ho Ho Ek Hai." },
  { time: 79.0, text: "Hum Sab Bharatiya Hain, Hum Sab Bharatiya Hain." },
  { time: 87.0, text: "Mandir Gurudwaare Bhi Hain Yahan," },
  { time: 90.5, text: "Aur Masjid Bhi Hai Yahan," },
  { time: 94.5, text: "Girija Ka Hai Ghariyaal Kahin," },
  { time: 98.5, text: "Mullah ki Kahin Hai Azaan" },
  { time: 102.8, text: "Ek Hee Apna Ram Hain, Ek hi Allah Taala Hai," },
  { time: 112.0, text: "Ek hi Allah Taala Hai." },
  { time: 116.2, text: "Rang Birange Deepak Hain Hum, Lekin Jagmag Ek Hai," },
  { time: 122.6, text: "Haa Haa Haa Ek Hai, Ho Ho Ho Ek Hai." },
  { time: 127.5, text: "Hum Sab Bharatiya Hain, Hum Sab Bharatiya Hain." },
  { time: 136.5, text: "Apni Manzil Ek Hai," },
  { time: 138.5, text: "Haa Haa Haa Ek Hai, Ho Ho Ho Ek Hai." },
  { time: 143.0, text: "Hum Sab Bharatiya Hain, Hum Sab Bharatiya Hain." },
  { time: 150.0, text: "Music...." }
];

const songUrl = "https://ik.imagekit.io/srlsan767/NCC%20SONG.mp3?updatedAt=1756033311744";

function MusicPlayerModal({ onClose }) {
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      const newIndex = lyrics.findIndex((line, i) => {
        const nextLine = lyrics[i + 1];
        return audio.currentTime >= line.time && (!nextLine || audio.currentTime < nextLine.time);
      });
      if (newIndex !== currentLineIndex) {
        setCurrentLineIndex(newIndex);
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentLineIndex]);

  useEffect(() => {
    if (currentLineIndex >= 0 && lyricsContainerRef.current) {
      const activeLine = lyricsContainerRef.current.children[currentLineIndex];
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(error => console.error("Audio play failed:", error));
    }
    return () => {
      if (audio) audio.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl text-white p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close player">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h1 className="text-2xl font-bold text-green-400 mb-4 text-center">NCC Song - Hum Sab Bharatiya Hain</h1>
        <audio ref={audioRef} controls className="w-full mb-4 rounded-lg">
          <source src={songUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div ref={lyricsContainerRef} className="h-64 overflow-y-auto bg-gray-900 rounded-lg p-4 text-center border border-gray-700">
          {lyrics.map((line, index) => (
            <p key={index} className={`my-4 p-2 text-lg leading-relaxed rounded-md transition-all duration-300 ${index === currentLineIndex ? 'text-white font-bold bg-green-500/20 scale-105' : 'text-gray-400'}`}>
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- ANIMATED DASHBOARD COMPONENT ---
const WelcomeAnimation = ({ onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(() => onAnimationEnd(), 3500);
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    const containerStyle = {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#111827', animation: 'fadeOut 0.5s 3s forwards', zIndex: 9999,
    };
    const svgStyle = { 
        width: '90%', height: '90%',
        fontFamily: "'Montserrat', sans-serif", fontWeight: 'bold', 
    };
    const textBaseStyle = {
        strokeWidth: 2, fill: 'transparent',
        strokeDasharray: 1000, strokeDashoffset: 1000,
    };

    return (
        <div style={containerStyle}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');
                @keyframes draw { to { stroke-dashoffset: 0; } }
                @keyframes fillN { to { fill: #F97316; } } /* Orange */
                @keyframes fillC { to { fill: #FFFFFF; } } /* White */
                @keyframes fill3 { to { fill: #22C55E; } } /* Green */
                @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }

                .anim-draw-n { stroke: #D97706; animation: draw 1s linear 0s forwards, fillN 0.5s linear 1.5s forwards; }
                .anim-draw-c { stroke: #A0A0A0; animation: draw 1s linear 0.5s forwards, fillC 0.5s linear 2.0s forwards; }
                .anim-draw-3 { stroke: #15803D; animation: draw 1s linear 1.0s forwards, fill3 0.5s linear 2.5s forwards; }

                /* Default: Desktop view */
                .mobile-text { display: none; }
                .desktop-text { display: block; font-size: 100px; }

                /* Mobile view */
                @media (max-width: 768px) {
                    .desktop-text { display: none; }
                    .mobile-text { display: block; font-size: 150px; }
                }
            `}</style>
            <svg style={svgStyle} viewBox="0 0 400 450">
                {/* Horizontal Layout for Desktop */}
                <g className="desktop-text" textAnchor="middle">
                    <text x="100" y="225" style={textBaseStyle} className="anim-draw-n">N</text>
                    <text x="200" y="225" style={textBaseStyle} className="anim-draw-c">C</text>
                    <text x="300" y="225" style={textBaseStyle} className="anim-draw-3">3</text>
                </g>
                {/* Vertical Layout for Mobile */}
                <g className="mobile-text" textAnchor="middle">
                    <text x="200" y="100" style={textBaseStyle} className="anim-draw-n">N</text>
                    <text x="200" y="225" style={textBaseStyle} className="anim-draw-c">C</text>
                    <text x="200" y="350" style={textBaseStyle} className="anim-draw-3">3</text>
                </g>
            </svg>
        </div>
    );
};


const KnotIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.8 8.2 6.8 9.5"/><path d="M12 22a10 10 0 0 0 10-10c0-4.4-2.8-8.2-6.8-9.5"/><path d="M12 2a10 10 0 0 1 10 10c0 4.4-2.8 8.2-6.8 9.5"/><path d="M12 22a10 10 0 0 1-10-10c0-4.4 2.8 8.2-6.8-9.5"/><path d="M6.8 14.5c.5-2.5 4.2-2.5 4.2-5 0-2.8-2.2-5-5-5"/><path d="M17.2 9.5c-.5 2.5-4.2 2.5-4.2 5 0 2.8 2.2 5 5 5"/>
    </svg>
);

const Dashboard = ({ setPage, setTopicId, userData }) => {
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
    const [stats, setStats] = useState({ topicsCompleted: 0, totalTopics: 1, overallProgress: 0 });
    
    const [showAnimation, setShowAnimation] = useState(!sessionStorage.getItem('hasSeenWelcomeAnimation'));
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
            setAnnouncements(announcementsData);
            if (announcementsData.length > 0) {
                const latestTimestamp = announcementsData[0].createdAt.getTime();
                const lastSeenTimestamp = localStorage.getItem('lastSeenAnnouncement');
                if (!lastSeenTimestamp || latestTimestamp > parseInt(lastSeenTimestamp)) {
                    setHasNewAnnouncements(true);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAnnouncementsClick = () => {
        if (announcements.length > 0) {
            localStorage.setItem('lastSeenAnnouncement', announcements[0].createdAt.getTime().toString());
        }
        setHasNewAnnouncements(false);
        setPage('announcements');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userData || !auth.currentUser) {
                setLoading(false);
                return;
            }
            try {
                const phasesQuery = query(collection(db, "phases"), orderBy("phaseNumber"));
                const topicsQuery = collection(db, "topics");
                const progressQuery = query(collection(db, "progress"), where("cadetId", "==", auth.currentUser.uid));

                const [phasesSnapshot, topicsSnapshot, progressSnapshot] = await Promise.all([getDocs(phasesQuery), getDocs(topicsQuery), getDocs(progressQuery)]);

                const phasesData = phasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const topicsData = topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const progressData = progressSnapshot.docs.map(doc => doc.data());
                const completedTopicIds = new Set(progressData.filter(p => p.passed).map(p => p.topicId));

                const combinedData = phasesData.map(phase => {
                    const phaseTopics = topicsData.filter(topic => topic.phaseNumber === phase.phaseNumber);
                    const completedTopicsInPhase = phaseTopics.filter(topic => completedTopicIds.has(topic.id)).length;
                    const progress = phaseTopics.length > 0 ? (completedTopicsInPhase / phaseTopics.length) * 100 : 0;
                    return { ...phase, topics: phaseTopics.map(topic => ({ ...topic, completed: completedTopicIds.has(topic.id) })), isUnlocked: phase.phaseNumber <= userData.currentPhase, progress: Math.round(progress) };
                });

                setPhases(combinedData);
                const totalTopics = topicsData.length;
                const topicsCompleted = completedTopicIds.size;
                const overallProgress = totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0;
                setStats({ topicsCompleted, totalTopics, overallProgress });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [userData]);

    const handleAnimationEnd = () => {
        sessionStorage.setItem('hasSeenWelcomeAnimation', 'true');
        setShowAnimation(false);
    };

    if (showAnimation) {
        return <WelcomeAnimation onAnimationEnd={handleAnimationEnd} />;
    }
    if (loading) {
        return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Loading Dashboard...</p></div>;
    }
    if (!userData) {
        return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Loading User Data...</p></div>;
    }

    const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const quickAccessItems = [
        { page: 'rifleSimulator', icon: Puzzle, title: 'Rifle Simulator', color: 'blue' },
        { page: 'shootingSimulator', icon: Crosshair, title: 'Shooting Range', color: 'green' },
        { page: 'mapChallenge', icon: Map, title: 'Map Reading', color: 'orange' },
        { page: 'knotTyingGuide', icon: KnotIcon, title: 'Knot Tying', color: 'teal' },
        { page: 'firstAidSimulator', icon: HeartPulse, title: 'First-Aid Sim', color: 'red' },
        { page: 'drillGuide', icon: Shield, title: 'Drill Guide', color: 'purple' },
        { page: 'eventCalendar', icon: Calendar, title: 'Event Calendar', color: 'indigo' },
        { page: 'campChecklists', icon: ListChecks, title: 'Camp Checklists', color: 'pink' },
        { page: 'uniformGuide', icon: Shirt, title: 'Uniform Guide', color: 'yellow' },
        { page: 'rankStructure', icon: Award, title: 'Rank Structure', color: 'green' },
    ];

    const colorMap = {
    blue: {
        bg: 'bg-blue-100/50 dark:bg-blue-900/30',
        hoverBg: 'hover:bg-blue-200/70 dark:hover:bg-blue-900/60',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
        bg: 'bg-green-100/50 dark:bg-green-900/30',
        hoverBg: 'hover:bg-green-200/70 dark:hover:bg-green-900/60',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400',
    },
    orange: {
        bg: 'bg-orange-100/50 dark:bg-orange-900/30',
        hoverBg: 'hover:bg-orange-200/70 dark:hover:bg-orange-900/60',
        text: 'text-orange-800 dark:text-orange-200',
        icon: 'text-orange-600 dark:text-orange-400',
    },
    teal: {
        bg: 'bg-teal-100/50 dark:bg-teal-900/30',
        hoverBg: 'hover:bg-teal-200/70 dark:hover:bg-teal-900/60',
        text: 'text-teal-800 dark:text-teal-200',
        icon: 'text-teal-600 dark:text-teal-400',
    },
    red: {
        bg: 'bg-red-100/50 dark:bg-red-900/30',
        hoverBg: 'hover:bg-red-200/70 dark:hover:bg-red-900/60',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
    },
    purple: {
        bg: 'bg-purple-100/50 dark:bg-purple-900/30',
        hoverBg: 'hover:bg-purple-200/70 dark:hover:bg-purple-900/60',
        text: 'text-purple-800 dark:text-purple-200',
        icon: 'text-purple-600 dark:text-purple-400',
    },
    indigo: {
        bg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
        hoverBg: 'hover:bg-indigo-200/70 dark:hover:bg-indigo-900/60',
        text: 'text-indigo-800 dark:text-indigo-200',
        icon: 'text-indigo-600 dark:text-indigo-400',
    },
    pink: {
        bg: 'bg-pink-100/50 dark:bg-pink-900/30',
        hoverBg: 'hover:bg-pink-200/70 dark:hover:bg-pink-900/60',
        text: 'text-pink-800 dark:text-pink-200',
        icon: 'text-pink-600 dark:text-pink-400',
    },
    yellow: {
        bg: 'bg-yellow-100/50 dark:bg-yellow-900/30',
        hoverBg: 'hover:bg-yellow-200/70 dark:hover:bg-yellow-900/60',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-600 dark:text-yellow-400',
    },
};

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl shadow-lg p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-500 dark:text-${color}-300`}><Icon className="w-8 h-8" /></div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    );

    const PhaseCard = ({ phase }) => (
        <div className={`p-6 rounded-2xl shadow-lg transition-all duration-300 ${phase.isUnlocked ? 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm' : 'bg-gray-200/50 dark:bg-gray-800/30 backdrop-blur-sm grayscale'}`}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800 dark:text-white">Phase {phase.phaseNumber}</h3>{phase.isUnlocked ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Lock className="w-6 h-6 text-gray-500" />}</div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold mb-4">{phase.title}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${phase.progress}%` }}></div></div>
            <p className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">{phase.progress}% Complete</p>
            <div className="mt-4 space-y-2">{phase.topics.map(topic => (<button key={topic.id} onClick={() => { if (phase.isUnlocked) { setPage('topic'); setTopicId(topic.id); } }} disabled={!phase.isUnlocked} className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:cursor-not-allowed"><div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${topic.completed ? 'bg-blue-500' : 'border-2 border-gray-400'}`}>{topic.completed && <CheckCircle className="w-4 h-4 text-white" />}</div><span className="font-medium text-gray-700 dark:text-gray-300">{topic.title}</span></button>))}</div>
        </div>
    );

    const QuickAccessCard = ({ item }) => { const Icon = item.icon; return (<button onClick={() => setPage(item.page)} className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center bg-${item.color}-100/50 dark:bg-${item.color}-900/30 hover:bg-${item.color}-200/70 dark:hover:bg-${item.color}-900/60 transition-all duration-300 transform hover:-translate-y-1`}><Icon className={`w-10 h-10 text-${item.color}-600 dark:text-${item.color}-400 mb-2`} /><span className={`font-bold text-sm text-${item.color}-800 dark:text-${item.color}-200`}>{item.title}</span></button>); };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {userData?.fullName?.split(' ')[0] || 'Cadet'}!</h1><p className="text-gray-500 dark:text-gray-400">{dateString}</p></div>
                <div className="flex items-center space-x-2">
                    {/* ** NEW: Music Player Button ** */}
                    <button onClick={() => setIsPlayerVisible(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Play NCC Song">
                        <MusicIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                    </button>
                    {/* ** Existing Bell Button ** */}
                    <button onClick={handleAnnouncementsClick} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="View Announcements">
                        <Bell className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                        {hasNewAnnouncements && <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-100 dark:border-gray-900"></div>}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><StatCard title="Current Phase" value={userData.currentPhase} icon={Award} color="blue" /><StatCard title="Topics Completed" value={`${stats.topicsCompleted} / ${stats.totalTopics}`} icon={CheckCircle} color="green" /><StatCard title="Overall Progress" value={`${stats.overallProgress}%`} icon={Home} color="purple" /></div>
            <div className="mb-8"><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Training Syllabus</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{phases.map(phase => <PhaseCard key={phase.id} phase={phase} />)}</div></div>
            <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tools & Resources</h2><div className="grid grid-cols-2 md:grid-cols-5 gap-4">{quickAccessItems.map(item => <QuickAccessCard key={item.page} item={item} />)}</div></div>

            {isPlayerVisible && <MusicPlayerModal onClose={() => setIsPlayerVisible(false)} />}
        </div>
    );
};

// --- NEW VIDEO MODAL COMPONENT ---
const VideoModal = ({ isOpen, onClose, embedUrl, title }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 w-full h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="w-full flex-grow relative">
                    <iframe 
                        className="absolute top-0 left-0 w-full h-full" 
                        src={`${embedUrl}?autoplay=1&rel=0`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

const ContentModal = ({ isOpen, onClose, title, htmlContent }) => {
    if (!isOpen) return null;

    // We can add some basic styling to ensure the content is readable in both light and dark modes.
    const styledHtmlContent = `
        <style>
            body { 
                padding: 1rem;
                margin: 0; 
                font-family: sans-serif;
                color: ${localStorage.getItem('theme') === 'dark' ? '#e5e7eb' : '#111827'};
                background-color: ${localStorage.getItem('theme') === 'dark' ? '#1f2937' : '#ffffff'};
            }
        </style>
        ${htmlContent}
    `;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="w-full flex-grow overflow-hidden">
                    <iframe 
                        srcDoc={styledHtmlContent}
                        title="Topic Content"
                        sandbox="allow-same-origin" // Security sandbox
                        className="w-full h-full border-none"
                    />
                </div>
            </div>
        </div>
    );
};

const SparkleBookButton = ({ onClick }) => {
    // This style tag injects the custom animation directly into the document head.
    // This makes the component self-contained and easy to use.
    const animationStyle = `
        @keyframes sparkle-effect {
            0% {
                transform: scale(0) translateY(0) rotate(0);
                opacity: 1;
            }
            80% {
                transform: scale(1.2) translateY(-40px) rotate(180deg);
                opacity: 1;
            }
            100% {
                transform: scale(1.2) translateY(-40px) rotate(180deg);
                opacity: 0;
            }
        }
        .sparkle {
            animation: sparkle-effect 0.8s ease-out forwards;
        }
    `;

    return (
        <div className="flex justify-center my-8">
            <style>{animationStyle}</style>
            <button
                onClick={onClick}
                className="group relative flex h-40 w-64 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800/50 shadow-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
            >
                {/* --- The Book Icon --- */}
                <svg
                    className="w-20 h-20 text-black dark:text-gray-900 transition-transform duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M19 2H9C6.24 2 4 4.24 4 7v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 16H6c-.55 0-1-.45-1-1V7c0-1.65 1.35-3 3-3h8v12z"></path>
                    <path d="M13 8h2v2h-2z"></path>
                </svg>

                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    {/* --- Sparkles Container --- */}
                    {/* We only render the sparkles on hover for better performance */}
                    <div className="absolute -left-4 -top-8 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        {/* Individual sparkle elements with different positions and delays */}
                        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2">
                            <span className="sparkle absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-yellow-400" style={{ animationDelay: '0.1s' }}></span>
                            <span className="sparkle absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-yellow-400" style={{ animationDelay: '0.25s' }}></span>
                            <span className="sparkle absolute -left-1 -top-1 block h-3 w-3 rounded-full bg-yellow-500" style={{ animationDelay: '0.4s' }}></span>
                            <span className="sparkle absolute -left-1 -top-1 block h-1 w-1 rounded-full bg-yellow-400" style={{ animationDelay: '0.55s' }}></span>
                            <span className="sparkle absolute -left-1 -top-1 block h-2 w-2 rounded-full bg-yellow-500" style={{ animationDelay: '0.7s' }}></span>
                        </div>
                    </div>
                </div>
                <span className="absolute bottom-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Read Theory</span>
            </button>
        </div>
    );
};

const TopicView = ({ setPage, topicId, setQuizTopicId }) => {
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false); // State for the new content modal

    useEffect(() => {
        const fetchTopic = async () => {
            if (!topicId) { setLoading(false); return; }
            setLoading(true);
            const docRef = doc(db, "topics", topicId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTopic(docSnap.data());
            }
            setLoading(false);
        };
        fetchTopic();
    }, [topicId]);

    if (loading) return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Loading Topic...</p></div>;
    if (!topic) return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Topic not found.</p></div>;

    const embedUrl = getYouTubeEmbedUrl(topic.videoUrl);
    const thumbnailUrl = getYouTubeThumbnailUrl(topic.videoUrl);

    return (
        <>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <button onClick={() => setPage('dashboard')} className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"><ChevronLeft className="w-4 h-4 mr-2" />Back to Dashboard</button>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Phase {topic.phaseNumber}</span>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-1 mb-4">{topic.title}</h2>
                        
                        {/* --- BOOK ICON BUTTON --- */}
                        <SparkleBookButton onClick={() => setIsContentModalOpen(true)} />
                        {/* --- END OF BUTTON --- */}

                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Demonstration Video</h3>
                        <div 
                            onClick={() => setIsVideoModalOpen(true)}
                            className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md group cursor-pointer relative"
                        >
                            <img src={thumbnailUrl} alt={`Video thumbnail for ${topic.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                                <svg className="w-16 h-16 text-white opacity-90" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 text-center"><button onClick={() => { setQuizTopicId(topicId); setPage('quiz'); }} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105">Start Test &rarr;</button></div>
                </div>
            </div>
            {/* Render the modals */}
            <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} embedUrl={embedUrl} title={topic.title} />
            <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} title={topic.title} htmlContent={topic.theoryContent} />
        </>
    );
};

const Quiz = ({ setPage, topicId, user, userData, setUserData }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            const q = query(collection(db, "quizzes"), where("topicId", "==", topicId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setQuiz({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [topicId]);

    const checkPhaseCompletion = useCallback(async (currentUser, currentUserData, setCurrentUserData) => {
        const currentPhase = currentUserData.currentPhase;
        const topicsInPhaseQuery = query(collection(db, "topics"), where("phaseNumber", "==", currentPhase));
        const progressQuery = query(collection(db, "progress"), where("cadetId", "==", currentUser.uid), where("passed", "==", true));

        const [topicsSnapshot, progressSnapshot] = await Promise.all([getDocs(topicsInPhaseQuery), getDocs(progressQuery)]);

        const topicIdsInPhase = new Set(topicsSnapshot.docs.map(doc => doc.id));
        const completedTopicIds = new Set(progressSnapshot.docs.map(doc => doc.data().topicId));
        completedTopicIds.add(topicId);

        if ([...topicIdsInPhase].every(id => completedTopicIds.has(id)) && topicIdsInPhase.size > 0) {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { currentPhase: currentPhase + 1 });
            setCurrentUserData({ ...currentUserData, currentPhase: currentPhase + 1 });
        }
    }, [topicId]);

    const handleNext = async () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            let correctAnswers = 0;
            quiz.questions.forEach((q, index) => { if (selectedAnswers[index] === q.correctAnswer) correctAnswers++; });
            const finalScore = (correctAnswers / quiz.questions.length) * 100;
            setScore(finalScore);
            setShowResult(true);

            const passed = finalScore >= 75;
            await setDoc(doc(db, "progress", `${user.uid}_${topicId}`), { cadetId: user.uid, topicId: topicId, score: finalScore, passed: passed, completedAt: new Date() });
            if (passed) {
                await checkPhaseCompletion(user, userData, setUserData);
            }
        }
    };

    if (loading) return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Loading Quiz...</p></div>;
    if (!quiz || quiz.questions.length === 0) return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">No quiz for this topic.</p><button onClick={() => setPage('dashboard')} className="ml-4 bg-gray-500 text-white px-4 py-2 rounded">Back</button></div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (showResult) {
        const passed = score >= 75;
        return (
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-4 dark:text-white">Quiz Result</h2>
                    <div className={`text-6xl font-bold mb-4 ${passed ? 'text-blue-500' : 'text-red-500'}`}>{score.toFixed(0)}%</div>
                    <p className={`text-xl font-semibold mb-6 ${passed ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{passed ? 'Congratulations! You Passed!' : 'Better Luck Next Time!'}</p>
                    {passed && <p className="text-gray-600 dark:text-gray-300 mb-6">You may have unlocked the next phase!</p>}
                    <button onClick={() => setPage('dashboard')} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                <div className="mb-6"><p className="text-sm text-gray-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p><h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{currentQuestion.questionText}</h2></div>
                <div className="space-y-4">{currentQuestion.options.map(option => (<button key={option} onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: option })} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswers[currentQuestionIndex] === option ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{option}</button>))}</div>
                <div className="mt-8 text-right"><button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400">Next</button></div>
            </div>
        </div>
    );
};


// --- ADMIN COMPONENTS ---
const AdminDashboard = ({ setAdminPage }) => {
    const [stats, setStats] = useState({ users: 0, phases: 0, topics: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const usersSnap = await getCountFromServer(collection(db, "users"));
            const phasesSnap = await getCountFromServer(collection(db, "phases"));
            const topicsSnap = await getCountFromServer(collection(db, "topics"));
            setStats({
                users: usersSnap.data().count,
                phases: phasesSnap.data().count,
                topics: topicsSnap.data().count,
            });
        };
        fetchStats();
    }, []);

    const adminActions = [
        { page: 'manageUsers', icon: Users, title: 'Manage Cadets', description: 'View users, change roles and phases.', color: 'blue' },
        { page: 'managePhases', icon: BookOpen, title: 'Manage Phases', description: 'Add, edit, or delete training phases.', color: 'indigo' },
        { page: 'manageTopics', icon: Edit, title: 'Manage Topics & Quizzes', description: 'Create lessons and manage quizzes.', color: 'purple' },
        { page: 'manageAnnouncements', icon: FileText, title: 'Manage Announcements', description: 'Post real-time updates for all cadets.', color: 'green' },
        { page: 'manageEvents', icon: Calendar, title: 'Manage Events', description: 'Update the unit event calendar.', color: 'red' },
        { page: 'manageChecklists', icon: ListChecks, title: 'Manage Checklists', description: 'Create and edit camp packing lists.', color: 'pink' },
    ];

    const colorMap = {
    blue: {
        bg: 'bg-blue-100/50 dark:bg-blue-900/30',
        hoverBg: 'hover:bg-blue-200/70 dark:hover:bg-blue-900/60',
        text: 'text-blue-800 dark:text-blue-200',
        iconBg: 'bg-blue-500/20',
        iconText: 'text-blue-500 dark:text-blue-300',
    },
    indigo: {
        bg: 'bg-indigo-100/50 dark:bg-indigo-900/30',
        hoverBg: 'hover:bg-indigo-200/70 dark:hover:bg-indigo-900/60',
        text: 'text-indigo-800 dark:text-indigo-200',
        iconBg: 'bg-indigo-500/20',
        iconText: 'text-indigo-500 dark:text-indigo-300',
    },
    purple: {
        bg: 'bg-purple-100/50 dark:bg-purple-900/30',
        hoverBg: 'hover:bg-purple-200/70 dark:hover:bg-purple-900/60',
        text: 'text-purple-800 dark:text-purple-200',
        iconBg: 'bg-purple-500/20',
        iconText: 'text-purple-500 dark:text-purple-300',
    },
    green: {
        bg: 'bg-green-100/50 dark:bg-green-900/30',
        hoverBg: 'hover:bg-green-200/70 dark:hover:bg-green-900/60',
        text: 'text-green-800 dark:text-green-200',
        iconBg: 'bg-green-500/20',
        iconText: 'text-green-500 dark:text-green-300',
    },
    red: {
        bg: 'bg-red-100/50 dark:bg-red-900/30',
        hoverBg: 'hover:bg-red-200/70 dark:hover:bg-red-900/60',
        text: 'text-red-800 dark:text-red-200',
        iconBg: 'bg-red-500/20',
        iconText: 'text-red-500 dark:text-red-300',
    },
    pink: {
        bg: 'bg-pink-100/50 dark:bg-pink-900/30',
        hoverBg: 'hover:bg-pink-200/70 dark:hover:bg-pink-900/60',
        text: 'text-pink-800 dark:text-pink-200',
        iconBg: 'bg-pink-500/20',
        iconText: 'text-pink-500 dark:text-pink-300',
    },
};

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-xl shadow-lg p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-500 dark:text-${color}-300`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    );

    const ActionCard = ({ action }) => (
        <button onClick={() => setAdminPage(action.page)} className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left group`}>
            <div className={`p-3 rounded-full bg-${action.color}-500/20 text-${action.color}-500 dark:text-${action.color}-300 inline-block`}>
                <action.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-4">{action.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
            <div className="mt-4 text-right text-gray-400 dark:text-gray-500 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                <ArrowRight className="w-6 h-6" />
            </div>
        </button>
    );


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Control Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Cadets" value={stats.users} icon={Users} color="blue" />
                <StatCard title="Training Phases" value={stats.phases} icon={BookOpen} color="indigo" />
                <StatCard title="Syllabus Topics" value={stats.topics} icon={FileText} color="purple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminActions.map(action => <ActionCard key={action.page} action={action} />)}
            </div>
        </div>
    );
};

const ManageUsers = ({ backToAdmin }) => {
    const [users, setUsers] = useState([]);
    const [phases, setPhases] = useState([]);

    const fetchUsersAndPhases = useCallback(async () => {
        const usersSnapshot = await getDocs(collection(db, "users"));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const phasesSnapshot = await getDocs(query(collection(db, "phases"), orderBy("phaseNumber")));
        setPhases(phasesSnapshot.docs.map(doc => doc.data().phaseNumber));
    }, []);

    useEffect(() => { fetchUsersAndPhases(); }, [fetchUsersAndPhases]);

    const handleUpdateUser = async (userId, field, value) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { [field]: value });
        fetchUsersAndPhases();
    };

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Cadets</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4 dark:text-white">Name</th>
                                <th className="p-4 dark:text-white">Email</th>
                                <th className="p-4 dark:text-white">Phase</th>
                                <th className="p-4 dark:text-white">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-4 dark:text-gray-300">{user.fullName}</td>
                                    <td className="p-4 dark:text-gray-300">{user.email}</td>
                                    <td className="p-4">
                                        <select value={user.currentPhase} onChange={(e) => handleUpdateUser(user.id, 'currentPhase', Number(e.target.value))} className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            {phases.map(pNum => <option key={pNum} value={pNum}>{pNum}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <select value={user.role} onChange={(e) => handleUpdateUser(user.id, 'role', e.target.value)} className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                            <option value="cadet">Cadet</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const ManagePhases = ({ backToAdmin }) => {
    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState({ title: '', phaseNumber: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchPhases = useCallback(async () => {
        const q = query(collection(db, "phases"), orderBy("phaseNumber"));
        const snapshot = await getDocs(q);
        setPhases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, []);

    useEffect(() => { fetchPhases(); }, [fetchPhases]);

    const handleSave = async (e) => {
        e.preventDefault();
        const data = { title: currentPhase.title, phaseNumber: Number(currentPhase.phaseNumber) };
        if (isEditing) {
            await updateDoc(doc(db, 'phases', currentPhase.id), data);
        } else {
            await addDoc(collection(db, 'phases'), data);
        }
        resetForm();
        fetchPhases();
    };

    const handleEdit = (phase) => { setIsEditing(true); setCurrentPhase(phase); };
    const handleDelete = async (id) => { await deleteDoc(doc(db, 'phases', id)); fetchPhases(); };
    const resetForm = () => { setIsEditing(false); setCurrentPhase({ title: '', phaseNumber: '' }); };

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Phases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{isEditing ? 'Edit Phase' : 'Add New Phase'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <input type="number" placeholder="Phase Number" value={currentPhase.phaseNumber} onChange={e => setCurrentPhase({ ...currentPhase, phaseNumber: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input type="text" placeholder="Phase Title" value={currentPhase.title} onChange={e => setCurrentPhase({ ...currentPhase, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <div className="flex space-x-2"><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Save'}</button><button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button></div>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Phases</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">{phases.map(phase => (<div key={phase.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"><span className="dark:text-gray-200">{phase.phaseNumber}: {phase.title}</span><div className="flex space-x-2"><button onClick={() => handleEdit(phase)}><Edit className="w-5 h-5 text-blue-500" /></button><button onClick={() => handleDelete(phase.id)}><Trash2 className="w-5 h-5 text-red-500" /></button></div></div>))}</div>
                </div>
            </div>
        </div>
    );
};

const ManageTopicsAndQuizzes = ({ backToAdmin }) => {
    const [topics, setTopics] = useState([]);
    const [phases, setPhases] = useState([]);
    const [currentTopic, setCurrentTopic] = useState(null);

    const fetchTopicsAndPhases = useCallback(async () => {
        const topicsSnapshot = await getDocs(query(collection(db, "topics"), orderBy("phaseNumber")));
        setTopics(topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const phasesSnapshot = await getDocs(query(collection(db, "phases"), orderBy("phaseNumber")));
        setPhases(phasesSnapshot.docs.map(doc => doc.data()));
    }, []);

    useEffect(() => { fetchTopicsAndPhases(); }, [fetchTopicsAndPhases]);

    const handleDeleteTopic = async (id) => {
        await deleteDoc(doc(db, 'topics', id));
        const quizQuery = query(collection(db, "quizzes"), where("topicId", "==", id));
        const quizSnapshot = await getDocs(quizQuery);
        const batch = writeBatch(db);
        quizSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        fetchTopicsAndPhases();
    };

    if (currentTopic) {
        return <TopicEditor topic={currentTopic} phases={phases} onSave={() => { setCurrentTopic(null); fetchTopicsAndPhases(); }} onCancel={() => setCurrentTopic(null)} />;
    }

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Manage Topics & Quizzes</h2>
                <button onClick={() => setCurrentTopic({ title: '', phaseNumber: 1, theoryContent: '', videoUrl: '' })} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"><PlusCircle className="w-5 h-5 mr-2" />Add New Topic</button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="space-y-2">
                    {topics.map(topic => (
                        <div key={topic.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="dark:text-gray-200">{topic.title} (Phase {topic.phaseNumber})</span>
                            <div className="flex space-x-4">
                                <button onClick={() => setCurrentTopic(topic)} className="text-blue-600 dark:text-blue-400 hover:underline">Edit Topic & Quiz</button>
                                <button onClick={() => handleDeleteTopic(topic.id)}><Trash2 className="w-5 h-5 text-red-500" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TopicEditor = ({ topic, phases, onSave, onCancel }) => {
    const [currentTopic, setCurrentTopic] = useState(topic);
    const [quiz, setQuiz] = useState({ questions: [] });
    const [isEditingQuiz, setIsEditingQuiz] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (topic.id) {
                const q = query(collection(db, "quizzes"), where("topicId", "==", topic.id));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setQuiz({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                }
            }
        };
        fetchQuiz();
    }, [topic.id]);

    const handleTopicSave = async (e) => {
        e.preventDefault();
        const data = { ...currentTopic, phaseNumber: Number(currentTopic.phaseNumber) };
        if (currentTopic.id) {
            await updateDoc(doc(db, 'topics', currentTopic.id), data);
        } else {
            const newTopicRef = await addDoc(collection(db, 'topics'), data);
            setCurrentTopic({ ...currentTopic, id: newTopicRef.id });
        }
        // Using a custom modal/toast is better than alert()
        // For this example, we'll keep it simple.
        console.log("Topic saved!");
    };

    const handleQuizSave = async (questions) => {
        const quizData = { topicId: currentTopic.id, questions: questions };
        if (quiz.id) {
            await updateDoc(doc(db, 'quizzes', quiz.id), quizData);
        } else {
            const newQuizRef = await addDoc(collection(db, 'quizzes'), quizData);
            setQuiz({ ...quiz, id: newQuizRef.id });
        }
        setQuiz({ ...quiz, questions });
        setIsEditingQuiz(false);
    };

    return (
        <div className="p-8">
            <button onClick={onCancel} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Topics List</button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{currentTopic.id ? 'Edit Topic' : 'Add New Topic'}</h3>
                    <form onSubmit={handleTopicSave} className="space-y-4">
                        <input type="text" placeholder="Topic Title" value={currentTopic.title} onChange={e => setCurrentTopic({ ...currentTopic, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <select value={currentTopic.phaseNumber} onChange={e => setCurrentTopic({ ...currentTopic, phaseNumber: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            {phases.map(p => <option key={p.phaseNumber} value={p.phaseNumber}>Phase {p.phaseNumber}: {p.title}</option>)}
                        </select>
                        <textarea placeholder="Theory Content (HTML allowed)" value={currentTopic.theoryContent} onChange={e => setCurrentTopic({ ...currentTopic, theoryContent: e.target.value })} rows="5" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input type="text" placeholder="YouTube Video URL (embed link)" value={currentTopic.videoUrl} onChange={e => setCurrentTopic({ ...currentTopic, videoUrl: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save Topic Details</button>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Manage Quiz</h3>
                    {currentTopic.id ? (
                        isEditingQuiz ? (
                            <QuizEditor initialQuestions={quiz.questions} onSave={handleQuizSave} onCancel={() => setIsEditingQuiz(false)} />
                        ) : (
                            <div>
                                <p className="mb-4 dark:text-gray-300">{quiz.questions.length} questions currently in this quiz.</p>
                                <button onClick={() => setIsEditingQuiz(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit Questions</button>
                            </div>
                        )
                    ) : <p className="text-gray-500 dark:text-gray-400">Save the topic first to add a quiz.</p>}
                </div>
            </div>
            <button onClick={onSave} className="mt-8 bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-900">Finish Editing & Return</button>
        </div>
    );
};

const QuizEditor = ({ initialQuestions, onSave, onCancel }) => {
    const [questions, setQuestions] = useState(initialQuestions);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 space-y-3">
                    <textarea placeholder={`Question ${qIndex + 1}`} value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
                    {q.options.map((opt, oIndex) => (
                        <input key={oIndex} type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
                    ))}
                    <input type="text" placeholder="Correct Answer (must match an option exactly)" value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} className="w-full p-2 border rounded bg-yellow-100 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-white" />
                    <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:underline">Remove Question</button>
                </div>
            ))}
            <button onClick={addQuestion} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Question</button>
            <div className="flex space-x-2 mt-4">
                <button onClick={() => onSave(questions)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save All Questions</button>
                <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
        </div>
    );
};

const ManageAnnouncements = ({ backToAdmin }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState({ title: '', content: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchAnnouncements = useCallback(async () => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, []);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    const handleSave = async (e) => {
        e.preventDefault();
        const data = { ...currentAnnouncement, createdAt: new Date() };
        if (isEditing) {
            await updateDoc(doc(db, 'announcements', currentAnnouncement.id), data);
        } else {
            await addDoc(collection(db, 'announcements'), data);
        }
        resetForm();
        fetchAnnouncements();
    };

    const handleEdit = (announcement) => { setIsEditing(true); setCurrentAnnouncement(announcement); };
    const handleDelete = async (id) => { await deleteDoc(doc(db, 'announcements', id)); fetchAnnouncements(); };
    const resetForm = () => { setIsEditing(false); setCurrentAnnouncement({ title: '', content: '' }); };

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Announcements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{isEditing ? 'Edit Announcement' : 'Add New Announcement'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <input type="text" placeholder="Title" value={currentAnnouncement.title} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <textarea placeholder="Content" value={currentAnnouncement.content} onChange={e => setCurrentAnnouncement({ ...currentAnnouncement, content: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="4" required />
                        <div className="flex space-x-2"><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Save'}</button><button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button></div>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Recent Announcements</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">{announcements.map(ann => (<div key={ann.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded"><div className="dark:text-gray-200"><p className="font-semibold">{ann.title}</p><p className="text-sm text-gray-500 dark:text-gray-400">{ann.createdAt.toDate().toLocaleDateString()}</p></div><div className="flex space-x-2"><button onClick={() => handleEdit(ann)}><Edit className="w-5 h-5 text-blue-500" /></button><button onClick={() => handleDelete(ann.id)}><Trash2 className="w-5 h-5 text-red-500" /></button></div></div>))}</div>
                </div>
            </div>
        </div>
    );
};


const AdminPage = () => {
    const [adminPage, setAdminPage] = useState('dashboard');

    const renderAdminPage = () => {
        switch (adminPage) {
            case 'manageUsers': return <ManageUsers backToAdmin={() => setAdminPage('dashboard')} />;
            case 'manageTopics': return <ManageTopicsAndQuizzes backToAdmin={() => setAdminPage('dashboard')} />;
            case 'managePhases': return <ManagePhases backToAdmin={() => setAdminPage('dashboard')} />;
            case 'manageEvents': return <ManageEvents backToAdmin={() => setAdminPage('dashboard')} />;
            case 'manageChecklists': return <ManageChecklists backToAdmin={() => setAdminPage('dashboard')} />;
            case 'manageAnnouncements': return <ManageAnnouncements backToAdmin={() => setAdminPage('dashboard')} />;
            default: return <AdminDashboard setAdminPage={setAdminPage} />;
        }
    };
    return <div className="container mx-auto">{renderAdminPage()}</div>;
};

const ProfilePage = ({ userData, setUserData }) => {
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            handleUpload(file);
        }
    };

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload || !auth.currentUser) return;
        setLoading(true);
        setMessage('');
        setIsMenuOpen(false);

        const CLOUD_NAME = 'dloael0tt';
        const UPLOAD_PRESET = 'goodone';

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('upload_preset', UPLOAD_PRESET);
        
        const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            
            if (data.secure_url) {
                const downloadURL = data.secure_url;
                const userDocRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(userDocRef, {
                    photoURL: downloadURL
                });
                
                setUserData(prevData => ({...prevData, photoURL: downloadURL}));

                setMessage('Profile photo updated successfully!');
                setPhoto(null);
            } else {
                throw new Error(data.error.message || 'Cloudinary upload failed.');
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            setMessage(`Upload failed: ${error.message}. Ensure the '${UPLOAD_PRESET}' preset is 'unsigned'.`);
        }
        setLoading(false);
    };

    if (!userData) return <div className="flex-grow flex items-center justify-center"><p className="dark:text-white">Loading Profile...</p></div>;
    
    return (
        <>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Cadet Profile</h2>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                        
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:cursor-not-allowed" disabled={loading}>
                                {userData.photoURL ? (
                                    <img src={userData.photoURL} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                                ) : (
                                    <UserCircle className="w-32 h-32 text-gray-400 dark:text-gray-500" />
                                )}
                                {loading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </button>
                            {isMenuOpen && !loading && (
                                <div ref={menuRef} className="absolute top-0 left-0 w-32 h-32 bg-black bg-opacity-60 rounded-full flex flex-col items-center justify-center space-y-2 transition-opacity duration-300">
                                    <button onClick={() => { if(userData.photoURL) {setIsViewerOpen(true); setIsMenuOpen(false);} }} className="text-white text-sm font-semibold hover:underline disabled:opacity-50" disabled={!userData.photoURL}>View</button>
                                    <button onClick={() => fileInputRef.current.click()} className="text-white text-sm font-semibold hover:underline">Update</button>
                                </div>
                            )}
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />

                        <div className="text-center sm:text-left">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{userData.fullName}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{userData.email}</p>
                            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">Service No: {userData.serviceNumber}</div>
                                <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-sm font-semibold px-3 py-1 rounded-full">Phase: {userData.currentPhase}</div>
                                <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-sm font-semibold px-3 py-1 rounded-full capitalize">{userData.role}</div>
                            </div>
                        </div>
                    </div>
                     {message && <p className={`mt-6 text-center text-sm font-semibold ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
                </div>
            </div>

            {isViewerOpen && userData.photoURL && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setIsViewerOpen(false)}>
                    <img src={userData.photoURL} alt="Profile" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
                    <button onClick={() => setIsViewerOpen(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
                        <X size={32} />
                    </button>
                </div>
            )}
        </>
    );
};

// --- RIFLE SIMULATOR COMPONENT ---

// --- NEW 3D RIFLE SIMULATOR COMPONENT ---

// --- Helper & Static Data ---
const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x6B4F3A, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x5a6270, roughness: 0.4, metalness: 0.7 });
const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.3, metalness: 0.8 });
const scopeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.2, metalness: 0.5 });
const lensMaterial = new THREE.MeshStandardMaterial({ color: 0xADD8E6, roughness: 0, metalness: 0.2, transparent: true, opacity: 0.4 });

// Part Definitions
const partDefinitions = {
    stock: {
        name: 'Stock',
        info: 'The stock, or buttstock, is the part of the rifle that rests against the shooter\'s shoulder. It provides stability, absorbs recoil, and helps with aiming.',
        create: () => {
            const group = new THREE.Group();
            const stockShape = new THREE.Shape();
            stockShape.moveTo(-2.5, 0.2);
            stockShape.lineTo(0.5, 0.3);
            stockShape.lineTo(0.8, -0.1);
            stockShape.lineTo(0.4, -0.1);
            stockShape.lineTo(0.2, -0.2);
            stockShape.lineTo(-0.2, -0.8);
            stockShape.lineTo(-0.8, -1.0);
            stockShape.lineTo(-1.2, -0.4);
            stockShape.lineTo(-2.5, -0.3);
            stockShape.lineTo(-2.5, 0.2);
            const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
            const stockGeom = new THREE.ExtrudeGeometry(stockShape, extrudeSettings);
            const stockMesh = new THREE.Mesh(stockGeom, woodMaterial);
            stockMesh.position.z = -0.1;
            group.add(stockMesh);
            const buttPadGeom = new THREE.BoxGeometry(0.1, 0.55, 0.22);
            const buttPadMesh = new THREE.Mesh(buttPadGeom, darkMetalMaterial);
            buttPadMesh.position.set(-2.55, -0.05, 0);
            group.add(buttPadMesh);
            return group;
        },
        startPos: new THREE.Vector3(-10, 0, 0),
        endPos: new THREE.Vector3(-1.0, 0.2, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
    barrel_receiver: {
        name: 'Barrel & Receiver',
        info: 'The barrel is the metal tube that the bullet travels through when fired. The receiver is the main body of the rifle that houses the bolt and firing mechanism.',
        create: () => {
            const group = new THREE.Group();
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 3.5, 16), metalMaterial);
            barrel.rotation.z = Math.PI / 2;
            barrel.position.x = 2.25;
            group.add(barrel);
            const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.3), darkMetalMaterial);
            receiver.position.x = 0;
            group.add(receiver);
            const port = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.1), new THREE.MeshStandardMaterial({color: 0x111111}));
            port.position.set(0, 0.05, 0.15);
            group.add(port);
            return group;
        },
        startPos: new THREE.Vector3(10, 2, 0),
        endPos: new THREE.Vector3(1.25, 0.3, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
    trigger_group: {
        name: 'Trigger Group',
        info: 'The trigger group contains the trigger, hammer, and sear. Pressing the trigger initiates the firing sequence.',
        create: () => {
            const group = new THREE.Group();
            const housing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.25), metalMaterial);
            group.add(housing);
            const guardPath = new THREE.CatmullRomCurve3([ new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0.25, -0.25, 0), new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(-0.25, -0.25, 0), new THREE.Vector3(-0.3, 0, 0) ]);
            const guardGeom = new THREE.TubeGeometry(guardPath, 20, 0.03, 8, false);
            const triggerGuard = new THREE.Mesh(guardGeom, metalMaterial);
            group.add(triggerGuard);
            const triggerShape = new THREE.Shape();
            triggerShape.moveTo(0,0);
            triggerShape.absarc(0, -0.1, 0.1, Math.PI * 1.5, Math.PI * 2.1, false);
            triggerShape.lineTo(0.02, 0);
            const trigger = new THREE.Mesh(new THREE.ExtrudeGeometry(triggerShape, {depth: 0.02, bevelEnabled: false}), darkMetalMaterial);
            trigger.position.set(-0.05, -0.05, -0.01);
            group.add(trigger);
            return group;
        },
        startPos: new THREE.Vector3(-10, -3, 0),
        endPos: new THREE.Vector3(0.1, 0.05, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
    bolt: {
        name: 'Bolt',
        info: 'The bolt is a mechanical part that seals the back of the barrel when firing and extracts the spent casing after firing.',
        create: () => {
            const group = new THREE.Group();
            const mainBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 12), metalMaterial);
            mainBolt.rotation.z = Math.PI / 2;
            group.add(mainBolt);
            const handleArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), metalMaterial);
            handleArm.position.set(0.2, 0, 0.2);
            handleArm.rotation.x = Math.PI / 2.5;
            group.add(handleArm);
            const handleKnob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), metalMaterial);
            handleKnob.position.set(0.2, 0, 0.45);
            group.add(handleKnob);
            return group;
        },
        startPos: new THREE.Vector3(10, -3, 0),
        endPos: new THREE.Vector3(0.2, 0.3, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
    scope: {
        name: 'Scope',
        info: 'A scope is an optical sight that helps with aiming at distant targets. It magnifies the view and provides a crosshair for precision.',
        create: () => {
            const group = new THREE.Group();
            const mainTube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 20), scopeMaterial);
            mainTube.rotation.z = Math.PI / 2;
            group.add(mainTube);
            const frontBell = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.5, 20), scopeMaterial);
            frontBell.position.x = 1.15;
            frontBell.rotation.z = Math.PI / 2;
            group.add(frontBell);
            const rearBell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.4, 20), scopeMaterial);
            rearBell.position.x = -1.1;
            rearBell.rotation.z = Math.PI / 2;
            group.add(rearBell);
            const frontLens = new THREE.Mesh(new THREE.CircleGeometry(0.25, 20), lensMaterial);
            frontLens.position.x = 1.4;
            group.add(frontLens);
            const rearLens = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), lensMaterial);
            rearLens.position.x = -1.3;
            group.add(rearLens);
            const topTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 12), scopeMaterial);
            topTurret.position.y = 0.2;
            group.add(topTurret);
            const sideTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 12), scopeMaterial);
            sideTurret.position.z = 0.2;
            sideTurret.rotation.x = Math.PI / 2;
            group.add(sideTurret);
            const mount1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), darkMetalMaterial);
            mount1.position.set(0.5, -0.2, 0);
            group.add(mount1);
            const mount2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), darkMetalMaterial);
            mount2.position.set(-0.5, -0.2, 0);
            group.add(mount2);
            return group;
        },
        startPos: new THREE.Vector3(0, 10, 0),
        endPos: new THREE.Vector3(0.5, 0.65, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
    magazine: {
        name: 'Magazine',
        info: 'The magazine holds ammunition and feeds it into the chamber. This detachable box magazine allows for quick reloading.',
        create: () => {
            const shape = new THREE.Shape();
            shape.moveTo(-0.2, 0);
            shape.lineTo(0.4, 0);
            shape.lineTo(0.35, -0.9);
            shape.lineTo(-0.15, -0.8);
            shape.lineTo(-0.2, 0);
            const extrudeSettings = { depth: 0.25, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mag = new THREE.Mesh(geometry, darkMetalMaterial);
            mag.position.z = -0.125;
            return mag;
        },
        startPos: new THREE.Vector3(0, -10, 0),
        endPos: new THREE.Vector3(0.6, 0.05, 0),
        endRot: new THREE.Euler(0, 0, 0),
    },
};

const assemblyOrder = ['stock', 'barrel_receiver', 'trigger_group', 'bolt', 'scope', 'magazine'];
const disassemblyOrder = [...assemblyOrder].reverse();

const speakerIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>`;
const spinnerIconSVG = `<svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

// Main App Component
function RifleSimulator({ setPage }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const animationFrameId = useRef(null);
    const activeAnimations = useRef([]);
    const clock = useRef(new THREE.Clock());

    const [gameState, setGameState] = useState({
        mode: 'assembly',
        step: 0,
        parts: {},
        isComplete: false,
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        partId: null,
    });
    
    const [isTtsPlaying, setIsTtsPlaying] = useState(false);
    const ttsAudioRef = useRef(null);

    // --- Sound & TTS Managers ---
    const soundManager = useRef(null);
    useEffect(() => {
        soundManager.current = {
            isReady: false,
            async init() {
                if (this.isReady || typeof Tone === 'undefined') return;
                await Tone.start();
                this.isReady = true;
                this.successSynth = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.1, release: 0.1 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
                this.disassemblySynth = new Tone.MetalSynth({ frequency: 200, envelope: { attack: 0.001, decay: 0.15, release: 0.1 }, harmonicity: 3.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
                this.errorSynth = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 2, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } }).toDestination();
                this.completeSynth = new Tone.PolySynth(Tone.Synth, { envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination();
            },
            playSuccess() { if (this.isReady) this.successSynth.triggerAttackRelease("C5", "8n", Tone.now()); },
            playDisassembly() { if (this.isReady) this.disassemblySynth.triggerAttackRelease("A3", "8n", Tone.now()); },
            playError() { if (this.isReady) this.errorSynth.triggerAttackRelease("C2", "8n", Tone.now()); },
            playAssemblyComplete() { if (this.isReady) this.completeSynth.triggerAttackRelease(["C4", "E4", "G4"], "4n", Tone.now()); },
            playDisassemblyComplete() { if (this.isReady) this.completeSynth.triggerAttackRelease(["G4", "E4", "C4"], "4n", Tone.now()); }
        };
        document.body.addEventListener('click', () => soundManager.current.init(), { once: true });
    }, []);

    const handleSpeak = useCallback(async (textToSpeak, partName) => {
        if (isTtsPlaying) {
            if (ttsAudioRef.current) {
                ttsAudioRef.current.pause();
                ttsAudioRef.current.currentTime = 0;
            }
            setIsTtsPlaying(false);
            return;
        }
        setIsTtsPlaying(true);

        try {
            const prompt = `Say the following information about the ${partName}: ${textToSpeak}`;
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } },
                model: "gemini-2.5-flash-preview-tts"
            };
            const apiKey = ""; // Environment handles the API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
            
            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType?.startsWith("audio/")) {
                const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                const wavBlob = pcmToWav(pcm16, 1, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                ttsAudioRef.current = new Audio(audioUrl);
                ttsAudioRef.current.play();
                ttsAudioRef.current.onended = () => setIsTtsPlaying(false);
            } else {
                throw new Error("No audio data in API response");
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsTtsPlaying(false);
        }
    }, [isTtsPlaying]);

    // --- Core Logic ---
    const updateGameState = useCallback((id, updates) => {
        setGameState(prev => ({
            ...prev,
            parts: {
                ...prev.parts,
                [id]: { ...prev.parts[id], ...updates }
            }
        }));
    }, []);

    const createAnimation = useCallback((part, toStart) => {
        const startPos = toStart ? part.def.endPos : part.def.startPos;
        const targetPos = toStart ? part.def.startPos : part.def.endPos;
        const startRot = new THREE.Quaternion().setFromEuler(part.mesh.rotation);
        const targetRot = new THREE.Quaternion().setFromEuler(part.def.endRot);
        return { mesh: part.mesh, startPos: new THREE.Vector3().copy(startPos), targetPos, startRot, targetRot, progress: 0, duration: 1.0 };
    }, []);

    const assemblePart = useCallback((id) => {
        soundManager.current.playSuccess();
        const part = gameState.parts[id];
        part.mesh.visible = true;
        const anim = createAnimation(part, false);
        anim.onComplete = () => {
            updateGameState(id, { assembled: true });
            setGameState(prev => {
                const nextStep = prev.step + 1;
                const isComplete = nextStep === assemblyOrder.length;
                if (isComplete) soundManager.current.playAssemblyComplete();
                return { ...prev, step: nextStep, isComplete };
            });
        };
        activeAnimations.current.push(anim);
        updateGameState(id, {}); // Trigger re-render for UI update
    }, [gameState.parts, createAnimation, updateGameState]);
    
    const disassemblePart = useCallback((id) => {
        soundManager.current.playDisassembly();
        const part = gameState.parts[id];
        const anim = createAnimation(part, true);
        anim.onComplete = () => {
            part.mesh.visible = false;
            updateGameState(id, { assembled: false });
            setGameState(prev => {
                const nextStep = prev.step + 1;
                const isComplete = nextStep === disassemblyOrder.length;
                if (isComplete) soundManager.current.playDisassemblyComplete();
                return { ...prev, step: nextStep, isComplete };
            });
        };
        activeAnimations.current.push(anim);
        updateGameState(id, {}); // Trigger re-render for UI update
    }, [gameState.parts, createAnimation, updateGameState]);

    const handlePartClick = useCallback((id) => {
        if (gameState.isComplete) return;
        if (gameState.mode === 'assembly') {
            if (id === assemblyOrder[gameState.step]) assemblePart(id);
            else soundManager.current.playError();
        } else {
            if (id === disassemblyOrder[gameState.step]) disassemblePart(id);
            else soundManager.current.playError();
        }
    }, [gameState, assemblePart, disassemblePart]);

    const resetSimulator = useCallback(() => {
        activeAnimations.current = [];
        const newPartsState = {};
        Object.keys(gameState.parts).forEach(id => {
            const part = gameState.parts[id];
            part.mesh.visible = false;
            part.mesh.position.copy(part.def.startPos);
            part.mesh.rotation.set(0,0,0);
            newPartsState[id] = { ...part, assembled: false };
        });
        setGameState({
            mode: 'assembly',
            step: 0,
            isComplete: false,
            parts: newPartsState
        });
    }, [gameState.parts]);

    const startDisassembly = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            mode: 'disassembly',
            step: 0,
            isComplete: false,
        }));
    }, []);

    // --- Three.js Initialization and Animation Loop ---
    useEffect(() => {
        const mountNode = mountRef.current;
        sceneRef.current.background = new THREE.Color(0x111827);

        // Camera
        cameraRef.current = new THREE.PerspectiveCamera(50, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
        cameraRef.current.position.set(0, 1.5, 8);

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(mountNode.clientWidth, mountNode.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        mountNode.appendChild(rendererRef.current.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        sceneRef.current.add(ambientLight);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 10, 7.5);
        sceneRef.current.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-5, -5, -10);
        sceneRef.current.add(fillLight);

        // Controls
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.minDistance = 4;
        controlsRef.current.maxDistance = 25;
        controlsRef.current.maxPolarAngle = Math.PI / 1.8;
        controlsRef.current.target.set(0.5, 0, 0);

        

        // Create and add parts to scene, then set initial state
        const initialParts = {};
        for (const id in partDefinitions) {
            const def = partDefinitions[id];
            const mesh = def.create();
            mesh.position.copy(def.startPos);
            mesh.visible = false;
            sceneRef.current.add(mesh);
            initialParts[id] = { id, name: def.name, mesh, assembled: false, def };
        }
        setGameState(prev => ({ ...prev, parts: initialParts }));

        
        // Animation loop
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);
            const delta = clock.current.getDelta();
            
            for (let i = activeAnimations.current.length - 1; i >= 0; i--) {
                const anim = activeAnimations.current[i];
                anim.progress = Math.min(1, anim.progress + delta / anim.duration);
                const easeProgress = 1 - Math.pow(1 - anim.progress, 3);
                anim.mesh.position.lerpVectors(anim.startPos, anim.targetPos, easeProgress);
                anim.mesh.quaternion.copy(anim.startRot).slerp(anim.targetRot, easeProgress);
                if (anim.progress >= 1) {
                    activeAnimations.current.splice(i, 1);
                    if (anim.onComplete) anim.onComplete();
                }
            }

            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            const { clientWidth, clientHeight } = mountNode;
            rendererRef.current.setSize(clientWidth, clientHeight);
            cameraRef.current.aspect = clientWidth / clientHeight;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId.current);
            if (mountNode && rendererRef.current.domElement) {
                mountNode.removeChild(rendererRef.current.domElement);
            }
            // Dispose of Three.js objects to free up memory
            sceneRef.current.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, []);

    const getFeedbackMessage = () => {
        if (gameState.isComplete) {
            return gameState.mode === 'assembly' ? 'Assembly complete! Excellent work.' : 'Disassembly complete! Ready for cleaning.';
        }
        if (gameState.mode === 'assembly') {
            if (gameState.step === 0) return "Begin assembly by selecting the Stock.";
            const nextPartName = partDefinitions[assemblyOrder[gameState.step]].name;
            return `Now, install the ${nextPartName}.`;
        } else {
            const nextPartName = partDefinitions[disassemblyOrder[gameState.step]].name;
            return `Now, remove the ${nextPartName}.`;
        }
    };

    return (
        <div className="w-screen h-screen bg-gray-900 font-sans">
            <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
            
            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 sm:p-8">
                <div className="mt-9 w-full max-w-4xl mx-auto text-center md:text-left flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>3D Rifle Simulator</h1>
                        <p className="mt-2 text-lg text-gray-300" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                            {getFeedbackMessage()}
                        </p>
                    </div>
                    <button onClick={() => setPage('main')} className="pointer-events-auto px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-white font-semibold transition-all shadow-lg">Back</button>
                </div>

                <div className="w-full flex flex-col items-center gap-4 pointer-events-auto">
                    <div className="bg-gray-900 bg-opacity-70 backdrop-blur-sm p-3 rounded-lg shadow-lg flex flex-wrap justify-center gap-2 max-w-3xl">
                        {assemblyOrder.map(id => {
                            const part = gameState.parts[id];
                            const isAssembled = part?.assembled;
                            const isNextPart = id === (gameState.mode === 'assembly' ? assemblyOrder[gameState.step] : disassemblyOrder[gameState.step]);
                            let isDisabled = true;
                            if (gameState.mode === 'assembly') {
                                isDisabled = isAssembled || (!isNextPart && !gameState.isComplete);
                            } else {
                                isDisabled = !isAssembled || (!isNextPart && !gameState.isComplete);
                            }

                            return (
                                <div key={id} className={`flex items-center bg-gray-700 rounded-md transition-all duration-200 ${!isDisabled && !isAssembled ? 'hover:bg-blue-500' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${isAssembled ? 'bg-green-600 opacity-70' : ''}`}>
                                    <button onClick={() => handlePartClick(id)} disabled={isDisabled} className="py-2 px-3 text-white font-semibold bg-transparent border-none cursor-pointer">
                                        {part?.name || partDefinitions[id].name}
                                    </button>
                                    <button onClick={() => setModalState({ isOpen: true, partId: id })} className="p-2 mr-1 rounded-full leading-none hover:bg-white/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-2">
                        {gameState.isComplete && gameState.mode === 'assembly' && (
                            <button onClick={startDisassembly} className="px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-700 text-white font-semibold transition-all shadow-lg">Disassemble</button>
                        )}
                        {gameState.isComplete && (
                             <button onClick={resetSimulator} className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 text-white font-semibold transition-all shadow-lg">Reset</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {modalState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md relative text-gray-200 pointer-events-auto">
                        <button onClick={() => setModalState({ isOpen: false, partId: null })} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-white">{partDefinitions[modalState.partId].name}</h2>
                        <p className="mb-6">{partDefinitions[modalState.partId].info}</p>
                        <div className="flex justify-end">
                            <button onClick={() => handleSpeak(partDefinitions[modalState.partId].info, partDefinitions[modalState.partId].name)} disabled={isTtsPlaying} className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-wait" dangerouslySetInnerHTML={{ __html: isTtsPlaying ? spinnerIconSVG : speakerIconSVG }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
const ShootingSimulator = ({ setPage }) => {
    const canvasRef = useRef(null);
    const gameContainerRef = useRef(null); // Ref for the main container
    const gameLoopId = useRef(null);
    const isTouchDevice = useRef(false);

    // Game state that needs to be mutable within the game loop.
    const shots = useRef([]);
    const target = useRef({ x: 0, y: 0, dx: 0, dy: 0, maxRadius: 0 });
    const eye = useRef({ x: 0, y: 0 });
    const rearSight = useRef({ x: 0, y: 0 });
    const foreSight = useRef({ y: 0 });
    const wobble = useRef({ x: 0, y: 0, xPhase: Math.random() * Math.PI * 2, yPhase: Math.random() * Math.PI * 2, xSpeed: 0.03, ySpeed: 0.04, xAmplitude: 4.0, yAmplitude: 4.0 });
    const shake = useRef({ intensity: 0, duration: 0, maxDuration: 15, maxIntensity: 15 });
    const movementState = useRef({
        eye: { up: false, down: false, left: false, right: false },
        rearSight: { up: false, down: false, left: false, right: false },
        foreSight: { up: false, down: false }
    });
    const wobbleMultiplier = useRef(1.0);
    const initialEyeY = useRef(0);
    const moveSpeed = useRef(0);

    // useState is used for game state that, when changed, should trigger a re-render of the UI.
    const [totalScore, setTotalScore] = useState(0);
    const [lastShotScore, setLastShotScore] = useState('-');
    const [shotsLeft, setShotsLeft] = useState(10);
    const [isCocked, setIsCocked] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState({ text: '', visible: false });
    const [controls, setControls] = useState('desktop');

    const showMessage = useCallback((text, duration = 1500) => {
        setMessage({ text, visible: true });
        if (duration !== Infinity) {
            setTimeout(() => {
                setMessage({ text: '', visible: false });
            }, duration);
        }
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = gameContainerRef.current;
        if (!container) return;

        // The drawing coordinates are based on the container's size, not the scaled canvas size.
        const viewWidth = container.clientWidth;
        const viewHeight = container.clientHeight;

        ctx.save();
        // Apply recoil shake effect if active
        if (shake.current.duration > 0) {
            const shakeX = (Math.random() - 0.5) * 2 * shake.current.intensity;
            const shakeY = (Math.random() - 0.5) * 2 * shake.current.intensity;
            ctx.translate(shakeX, shakeY);
        }

        ctx.clearRect(-shake.current.maxIntensity, -shake.current.maxIntensity, viewWidth + shake.current.maxIntensity * 2, viewHeight + shake.current.maxIntensity * 2);

        // --- Draw Target ---
        const maxRadius = target.current.maxRadius;
        for (let i = 10; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(target.current.x, target.current.y, (maxRadius / 10) * (11 - i), 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? '#d1d5db' : '#f9fafb';
            ctx.fill();
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(target.current.x, target.current.y, maxRadius / 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // --- Draw Shots ---
        shots.current.forEach(shot => {
            const absoluteX = target.current.x + shot.x;
            const absoluteY = target.current.y + shot.y;
            ctx.beginPath();
            ctx.arc(absoluteX, absoluteY, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fill();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // --- Draw Sights ---
        const sightScale = Math.min(viewWidth, viewHeight);
        const centerX = viewWidth / 2;
        const centerY = viewHeight / 2;
        const finalEyeX = eye.current.x + wobble.current.x;
        const finalEyeY = eye.current.y + wobble.current.y;
        const rearSightBaseY = centerY + sightScale * 0.1;
        const rearSightRadius = sightScale * 0.2;
        const rearSightThickness = sightScale * 0.03;
        const foreSightThickness = sightScale * 0.02;

        ctx.save();
        ctx.translate(centerX + rearSight.current.x + finalEyeX, rearSightBaseY + rearSight.current.y + finalEyeY);
        ctx.beginPath();
        ctx.arc(0, 0, rearSightRadius, 0, Math.PI, false);
        ctx.lineWidth = rearSightThickness;
        ctx.strokeStyle = '#323232'; // Solid color for crispness
        ctx.stroke();
        ctx.restore();

        const foreSightHeight = sightScale * 0.15;
        const foreSightTopY = rearSightBaseY;
        ctx.save();
        ctx.translate(centerX + finalEyeX, foreSightTopY + foreSightHeight + foreSight.current.y + finalEyeY);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -foreSightHeight);
        ctx.lineWidth = foreSightThickness;
        ctx.strokeStyle = '#212121'; // Solid color for crispness
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }, []);

    const resetGame = useCallback(() => {
        shots.current = [];
        setTotalScore(0);
        setLastShotScore('-');
        setShotsLeft(10);
        setIsCocked(false);
        setGameOver(false);
        wobbleMultiplier.current = 1.0;

        const container = gameContainerRef.current;
        if (!container) return;

        eye.current = { x: 0, y: initialEyeY.current };
        rearSight.current = { x: 0, y: 0 };
        foreSight.current = { y: 0 };
        target.current.x = container.clientWidth / 2;
        target.current.y = container.clientHeight / 2;
        target.current.dx = (Math.random() - 0.5) * 0.8;
        target.current.dy = (Math.random() - 0.5) * 0.8;
        shake.current = { intensity: 0, duration: 0, maxDuration: 15, maxIntensity: 15 };
        
        setMessage({ text: '', visible: false });
    }, [showMessage]);

    const fireShot = useCallback(() => {
        if (!isCocked || gameOver) {
            showMessage(!isCocked ? "Cock the rifle first!" : "Game Over! Press Reset.", 2000);
            return;
        }
        if (shotsLeft <= 0) { 
            setGameOver(true);
            return;
        }

        setIsCocked(false);
        setShotsLeft(prev => prev - 1);
        shake.current = { ...shake.current, intensity: shake.current.maxIntensity, duration: shake.current.maxDuration };
        wobbleMultiplier.current += 0.6;
        
        const container = gameContainerRef.current;
        if (!container) return;
        
        const offsetX = -rearSight.current.x + eye.current.x + wobble.current.x;
        const offsetY = -rearSight.current.y - foreSight.current.y + (eye.current.y - initialEyeY.current) + wobble.current.y;
        const shotX = container.clientWidth / 2 + offsetX;
        const shotY = container.clientHeight / 2 + offsetY;
        const relativeX = shotX - target.current.x;
        const relativeY = shotY - target.current.y;
        shots.current.push({ x: relativeX, y: relativeY });

        const distance = Math.sqrt(Math.pow(shotX - target.current.x, 2) + Math.pow(shotY - target.current.y, 2));
        let score = 0;
        if (target.current.maxRadius > 0 && distance <= target.current.maxRadius) {
            score = Math.max(0, Math.round(10.49 - (distance / target.current.maxRadius) * 10));
        }
        
        setTotalScore(prev => prev + score);
        setLastShotScore(score);
        
        if (shotsLeft - 1 <= 0) {
            setGameOver(true);
        } else {
             if (score === 10) {
                showMessage("BULLSEYE!", 500);
            } else {
                showMessage(`Score: ${score}!`, 1000);
            }
        }
    }, [isCocked, gameOver, shotsLeft, showMessage]);
    
    const cockRifle = useCallback(() => {
        if (gameOver) return;
        if (!isCocked) {
            setIsCocked(true);
            showMessage("Cocked!", 800);
        }
    }, [gameOver, isCocked, showMessage]);

    // Main game loop
    useEffect(() => {
        const gameLoop = () => {
            if (gameOver) {
                showMessage(`Game Over!\nFinal Score: ${totalScore}`, Infinity);
                return; // Stop the loop
            }

            const container = gameContainerRef.current;
            if (!container) return;

            // Handle Movement
            if (movementState.current.eye.up) eye.current.y -= moveSpeed.current;
            if (movementState.current.eye.down) eye.current.y += moveSpeed.current;
            if (movementState.current.eye.left) eye.current.x -= moveSpeed.current;
            if (movementState.current.eye.right) eye.current.x += moveSpeed.current;
            if (movementState.current.rearSight.up) rearSight.current.y -= moveSpeed.current;
            if (movementState.current.rearSight.down) rearSight.current.y += moveSpeed.current;
            if (movementState.current.rearSight.left) rearSight.current.x -= moveSpeed.current;
            if (movementState.current.rearSight.right) rearSight.current.x += moveSpeed.current;
            if (movementState.current.foreSight.up) foreSight.current.y -= moveSpeed.current;
            if (movementState.current.foreSight.down) foreSight.current.y += moveSpeed.current;

            // Update Target Position
            target.current.x += target.current.dx;
            target.current.y += target.current.dy;
            const centerX = container.clientWidth / 2;
            const centerY = container.clientHeight / 2;
            const maxOffset = 19;
            if (target.current.x > centerX + maxOffset) { target.current.x = centerX + maxOffset; target.current.dx *= -1; }
            else if (target.current.x < centerX - maxOffset) { target.current.x = centerX - maxOffset; target.current.dx *= -1; }
            if (target.current.y > centerY + maxOffset) { target.current.y = centerY + maxOffset; target.current.dy *= -1; }
            else if (target.current.y < centerY - maxOffset) { target.current.y = centerY - maxOffset; target.current.dy *= -1; }

            // Update Wobble
            wobble.current.xPhase += wobble.current.xSpeed;
            wobble.current.yPhase += wobble.current.ySpeed;
            wobble.current.x = Math.sin(wobble.current.xPhase) * wobble.current.xAmplitude * wobbleMultiplier.current;
            wobble.current.y = Math.cos(wobble.current.yPhase) * wobble.current.yAmplitude * wobbleMultiplier.current;

            // Update Shake
            if (shake.current.duration > 0) {
                shake.current.duration--;
                if (shake.current.duration <= 0) shake.current.intensity = 0;
            }

            draw();
            gameLoopId.current = requestAnimationFrame(gameLoop);
        };

        gameLoopId.current = requestAnimationFrame(gameLoop);
        return () => { if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current); };
    }, [gameOver, totalScore, draw, showMessage]);

    // Effect for keyboard and touch event listeners
    useEffect(() => {
        const setMovementStateKey = (key, value) => {
            switch (key) {
                case 'ArrowUp': movementState.current.rearSight.up = value; break;
                case 'ArrowDown': movementState.current.rearSight.down = value; break;
                case 'ArrowLeft': movementState.current.rearSight.left = value; break;
                case 'ArrowRight': movementState.current.rearSight.right = value; break;
                case 't': case 'T': movementState.current.foreSight.up = value; break;
                case 'g': case 'G': movementState.current.foreSight.down = value; break;
                case 'w': case 'W': movementState.current.eye.up = value; break;
                case 's': case 'S': movementState.current.eye.down = value; break;
                case 'a': case 'A': movementState.current.eye.left = value; break;
                case 'd': case 'D': movementState.current.eye.right = value; break;
                default: break;
            }
        };

        const handleKeyDown = (e) => {
            setMovementStateKey(e.key, true);
            if (e.key === 'r' || e.key === 'R') cockRifle();
            if (e.key === ' ') { e.preventDefault(); fireShot(); }
        };
        const handleKeyUp = (e) => setMovementStateKey(e.key, false);

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [cockRifle, fireShot]);

    // THE DEFINITIVE FIX: Use ResizeObserver to set up the canvas
    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;

        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            initialEyeY.current = -rect.height * 0.08;
            moveSpeed.current = rect.height * 0.004;

            target.current.x = rect.width / 2;
            target.current.y = rect.height / 2;
            target.current.maxRadius = Math.min(rect.width, rect.height) * 0.12;
            
            if (!gameOver) {
                eye.current.y = initialEyeY.current;
            }
            draw();
        };

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        // Start observing the container. The first call will set up the canvas correctly.
        resizeObserver.observe(container);
        
        // Initial setup
        isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setControls(isTouchDevice.current ? 'touch' : 'desktop');
        resetGame();
        showMessage("Align sights and fire!", 2500);

        return () => resizeObserver.disconnect();
    }, [resetGame, draw, showMessage, gameOver]);


    // Touch event handlers
    const handleTouchStart = (e) => {
        e.preventDefault();
        const button = e.target.closest('.touch-button');
        if (!button) return;
        const action = button.dataset.action;

        if (action === 'fire') { fireShot(); return; }
        if (action === 'cock') { cockRifle(); return; }
        
        const [control, direction] = action.split('-');
        if (movementState.current[control] && direction) {
            movementState.current[control][direction] = true;
        }
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        // Reset all movement states on any touchend to prevent sticky buttons
        Object.keys(movementState.current).forEach(control => {
            Object.keys(movementState.current[control]).forEach(direction => {
                movementState.current[control][direction] = false;
            });
        });
    };

    return (
        <>
            <style>{`
                .simulator-body { font-family: 'Roboto Mono', monospace; overflow: hidden; background-color: #334155; overscroll-behavior: none; height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 0.5rem; }
                @media (min-width: 768px) { .simulator-body { padding: 1rem; } }
                .simulator-canvas { background-color: #f0f8ff; cursor: crosshair; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); touch-action: none; width: 100%; height: 100%; }
                .control-panel { background-color: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); }
                .key { display: inline-block; padding: 0.5rem 0.75rem; border: 1px solid #475569; border-radius: 0.375rem; background-color: #1e293b; color: #e2e8f0; font-weight: bold; box-shadow: 0 2px 0 #475569; transform: translateY(-2px); }
                .touch-button { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: rgba(30, 41, 59, 0.7); border: 1px solid rgba(71, 85, 105, 0.8); border-radius: 0.5rem; font-size: 1.5rem; font-weight: bold; color: white; user-select: none; -webkit-user-select: none; }
                .touch-button:active { background-color: rgba(71, 85, 105, 0.9); }
                #orientation-overlay { display: none; position: fixed; inset: 0; background-color: #1e293b; color: white; z-index: 9999; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                @media (max-width: 768px) and (orientation: portrait) { #orientation-overlay { display: flex; } #game-container { display: none; } }
            `}</style>

            <div className="simulator-body">
                <div id="orientation-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw mb-4"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 12"></path></svg>
                    <h2 className="text-2xl font-bold">Please rotate your device</h2>
                    <p className="mt-2 text-slate-300">This experience is best viewed in landscape mode.</p>
                    <button onClick={() => setPage('dashboard')} className="mt-4 pointer-events-auto px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-white font-semibold transition-all shadow-lg">Back</button>
                </div>

                <div id="game-container" className="flex flex-col items-center justify-between w-full h-full">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-slate-100 shrink-0">Rifle Firing Range</h1>

                    <div ref={gameContainerRef} className="relative w-full max-w-4xl grow">
                        <canvas ref={canvasRef} className="simulator-canvas"></canvas>
                        {message.visible && (
                            <div className="absolute inset-0 flex items-center justify-center text-center text-4xl font-bold text-yellow-300 bg-black bg-opacity-50 rounded-lg p-4 whitespace-pre-line">
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Desktop Control Panel */}
                    {controls === 'desktop' && (
                        <div className="control-panel w-full max-w-4xl mt-4 p-4 rounded-lg shadow-lg grid-cols-1 md:grid-cols-3 gap-4 text-center hidden md:grid shrink-0">
                            <div className="flex flex-col justify-center items-center bg-slate-800 p-3 rounded-md">
                                <h2 className="text-lg font-bold text-slate-300">SCORE</h2>
                                <p className="text-4xl font-bold text-green-400">{totalScore}</p>
                                <h2 className="text-lg font-bold text-slate-300 mt-2">LAST SHOT</h2>
                                <p className="text-2xl font-bold text-cyan-400">{lastShotScore}</p>
                            </div>
                            <div className="flex flex-col justify-center items-center bg-slate-800 p-3 rounded-md">
                                <h2 className="text-lg font-bold text-slate-300 mb-2">CONTROLS</h2>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="text-left">
                                        <p><span className="key">←</span> <span className="key">→</span> : Rear Sight Wind.</p>
                                        <p><span className="key">↑</span> <span className="key">↓</span> : Rear Sight Elev.</p>
                                        <p><span className="key">T</span> / <span className="key">G</span> : Fore Sight Elev.</p>
                                    </div>
                                    <div className="text-left">
                                        <p><span className="key">W</span> <span className="key">A</span> <span className="key">S</span> <span className="key">D</span> : Eye Position</p>
                                        <p><span className="key">R</span> : Cock Rifle</p>
                                        <p><span className="key">SPACE</span> : Fire</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reset Game</button>
                                    <button onClick={() => setPage('dashboard')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg">Back</button>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center bg-slate-800 p-3 rounded-md">
                                <h2 className="text-lg font-bold text-slate-300">STATUS</h2>
                                <p className={`text-2xl font-bold ${isCocked ? 'text-green-500' : 'text-red-500'}`}>{isCocked ? 'COCKED' : 'UNCOCKED'}</p>
                                <h2 className="text-lg font-bold text-slate-300 mt-2">SHOTS LEFT</h2>
                                <p className="text-4xl font-bold text-yellow-400">{shotsLeft}</p>
                            </div>
                        </div>
                    )}

                    {/* Mobile Touch Controls */}
                    {controls === 'touch' && (
                        <div className="w-full mt-2 flex grow flex-col px-2" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                            <div className="flex justify-around items-center text-center mb-2 shrink-0">
                                <div><h3 className="text-xs text-slate-300">SCORE</h3><p className="text-xl font-bold text-green-400">{totalScore}</p></div>
                                <div><h3 className="text-xs text-slate-300">STATUS</h3><p className={`text-xl font-bold ${isCocked ? 'text-green-500' : 'text-red-500'}`}>{isCocked ? 'COCKED' : 'UNCOCKED'}</p></div>
                                <div><h3 className="text-xs text-slate-300">SHOTS LEFT</h3><p className="text-xl font-bold text-yellow-400">{shotsLeft}</p></div>
                                <button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">RESET</button>
                                <button onClick={() => setPage('dashboard')} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors">Back</button>
                            </div>
                            <div className="relative flex justify-center items-center gap-4 grow">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20"><button className="touch-button w-full h-full rounded-full text-lg" data-action="cock">COCK</button></div>
                                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28">
                                    <div className="col-start-2 row-start-1"><button className="touch-button" data-action="eye-up">▲</button></div>
                                    <div className="col-start-1 row-start-2"><button className="touch-button" data-action="eye-left">◀</button></div>
                                    <div className="col-start-3 row-start-2"><button className="touch-button" data-action="eye-right">▶</button></div>
                                    <div className="col-start-2 row-start-3"><button className="touch-button" data-action="eye-down">▼</button></div>
                                    <div className="col-start-2 row-start-2 text-xs flex items-center justify-center text-slate-400">EYE</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28">
                                        <div className="col-start-2 row-start-1"><button className="touch-button" data-action="rearSight-up">▲</button></div>
                                        <div className="col-start-1 row-start-2"><button className="touch-button" data-action="rearSight-left">◀</button></div>
                                        <div className="col-start-3 row-start-2"><button className="touch-button" data-action="rearSight-right">▶</button></div>
                                        <div className="col-start-2 row-start-3"><button className="touch-button" data-action="rearSight-down">▼</button></div>
                                        <div className="col-start-2 row-start-2 text-xs flex items-center justify-center text-slate-400">REAR</div>
                                    </div>
                                    <div className="grid grid-cols-1 grid-rows-3 gap-1 w-14 h-28">
                                        <div className="row-start-1"><button className="touch-button" data-action="foreSight-up">▲</button></div>
                                        <div className="row-start-2 text-xs flex items-center justify-center text-slate-400">FORE</div>
                                        <div className="row-start-3"><button className="touch-button" data-action="foreSight-down">▼</button></div>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20"><button className="touch-button w-full h-full rounded-full text-lg" data-action="fire">FIRE</button></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};


// --- MAP CHALLENGE COMPONENT --

// --- Helper Data & Components (Shared) ---

const skills = {
  "Map Fundamentals": [
    "Map Symbology",
    "Scale and Distance",
    "Marginal Data",
  ],
  "Grid Reference System": [
    "Understanding Grid Lines",
    "Reading Grid References (4, 6, 8-figure)",
    "Plotting Grid References",
  ],
  "Direction and Bearings": [
    "The Three Norths (True, Grid, Magnetic)",
    "Grid-Magnetic (G-M) Angle",
    "Measuring Bearings (Grid & Magnetic)",
    "Converting Bearings",
    "Back Bearings",
  ],
  "Terrain Interpretation": [
    "Contour Lines",
    "Major Terrain Features",
    "Minor Terrain Features",
    "Slope Analysis",
  ],
  "Position Fixing": [
    "Resection",
    "Intersection",
  ],
  "Route Planning": [
    "Route Selection",
    "Legs and Checkpoints",
    "Route Card Preparation",
  ],
};

const Icon = ({ path, className = "w-6 h-6", path2, stroke }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke={stroke} className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
    {path2 && <path d={path2} />}
  </svg>
);

// --- Icon Components ---
const CompassIcon = () => <Icon path="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13.586l4.293 4.293-1.414 1.414L12 8.414l-2.879 2.879-1.414-1.414L12 6.414zM12 12l2.879 2.879 1.414-1.414L12 13.586l-4.293 4.293 1.414 1.414L12 15.586l2.879-2.879z" />;
const RulerIcon = () => <Icon path="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />;
const ProtractorIcon = () => <Icon path="M12 2C6.48 2 2 6.48 2 12h10V2zM12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c0 5.52-4.48 10-10 10S2 19.52 2 14h10v10c5.52 0 10-4.48 10-10z" />;
const WaypointIcon = () => <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />;
const BookIcon = () => <Icon path="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />;
const ChevronUpIcon = () => <Icon path="M12 8.293l6.293 6.293 1.414-1.414L12 5.464 4.293 13.172l1.414 1.414L12 8.293z" />
const ChevronDownIcon = () => <Icon path="M12 15.707l-6.293-6.293-1.414 1.414L12 18.536l7.707-7.707-1.414-1.414L12 15.707z" />
const GridIcon = () => <Icon path="M3 3h18v18H3V3zm2 2v4h4V5H5zm6 0v4h4V5h-4zm6 0v4h4V5h-4zM5 11v4h4v-4H5zm6 0v4h4v-4h-4zm6 0v4h4v-4h-4zM5 17v2h4v-2H5zm6 0v2h4v-2h-4zm6 0v2h4v-2h-4z" />;
const MissionIcon = () => <Icon path="M12 2.5l2.94 2.94-1.42 1.41-1.52-1.52v3.17h-2v-3.17l-1.52 1.52-1.41-1.41L12 2.5zM12 21.5l-2.94-2.94 1.42-1.41 1.52 1.52v-3.17h2v3.17l1.52-1.52 1.41 1.41L12 21.5zM2.5 12l2.94-2.94 1.41 1.42-1.52 1.52h3.17v2h-3.17l1.52 1.52-1.41 1.41L2.5 12zM21.5 12l-2.94 2.94-1.41-1.42 1.52-1.52h-3.17v-2h3.17l-1.52-1.52 1.41-1.41L21.5 12z" />
const BackIcon = () => <Icon path="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />;
const MenuIcon = () => <Icon path="M4 6h16M4 12h16M4 18h16" stroke="white" />;
const CloseIcon = () => <Icon path="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />;


// --- Components for MapChallenge ---

function Sidebar({ selectedSkill, setSelectedSkill, setMode, resetMission, setPage, isMobileOpen, setIsMobileOpen }) {
  // State for desktop sidebar expansion
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[1050] transition-opacity md:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white flex flex-col fixed inset-y-0 left-0 z-[1100]
                       md:relative md:inset-auto md:translate-x-0
                       transition-all duration-300 ease-in-out
                       ${isMobileOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80'} 
                       ${expanded ? 'md:w-80' : 'md:w-16'}`}>
        <div className="p-4 bg-gray-900 flex items-center justify-between">
          <h2 className={`font-bold text-lg whitespace-nowrap overflow-hidden ${!expanded && 'md:hidden'}`}>Navigation Skills</h2>
          {/* Close button for mobile */}
          <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-700 md:hidden">
            <CloseIcon />
          </button>
          {/* Expand/Collapse button for desktop */}
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-md hover:bg-gray-700 hidden md:block">
            <MenuIcon />
          </button>
        </div>
        <div className="flex-grow p-2 overflow-y-auto">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="mb-4">
              <h3 className={`font-semibold text-green-400 mb-2 px-2 ${(expanded ? '' : 'md:text-center')}`}>
                {expanded ? category : <span className="md:hidden">{category}</span>}
                {!expanded && <span className="hidden md:inline">{category.substring(0,1)}</span>}
              </h3>
              <ul className={`${(expanded ? 'block' : 'md:hidden')}`}>
                {skillList.map(skill => (
                  <li key={skill}>
                    <button
                      onClick={() => {
                        setSelectedSkill({ category, skill });
                        setMode('learn');
                        setIsMobileOpen(false); // Close sidebar on selection
                      }}
                      className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors ${selectedSkill?.skill === skill ? 'bg-green-600 font-semibold' : 'hover:bg-gray-700'}`}
                    >
                      {skill}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-gray-700 space-y-2">
          <button onClick={() => { setMode('mission'); resetMission(); setIsMobileOpen(false); }} className="w-full flex items-center justify-center p-3 rounded-md text-sm font-bold text-yellow-300 hover:bg-yellow-600 hover:text-white transition-colors">
            <MissionIcon className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-2 ${(expanded ? '' : 'md:hidden')}`}>Start Mission</span>
          </button>
          <button onClick={() => setPage('main')} className="w-full flex items-center justify-center p-3 rounded-md text-sm font-bold text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
            <BackIcon className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-2 ${(expanded ? '' : 'md:hidden')}`}>Back to Menu</span>
          </button>
        </div>
      </div>
    </>
  );
}

function Toolbar({ activeTool, setActiveTool, showGrid, setShowGrid }) {
  const tools = [
    { name: 'Compass', icon: <CompassIcon /> },
    { name: 'Ruler', icon: <RulerIcon /> },
    { name: 'Protractor', icon: <ProtractorIcon /> },
    { name: 'Waypoint', icon: <WaypointIcon /> },
  ];

  const handleToolClick = (toolName) => {
    setActiveTool(currentTool => (currentTool === toolName ? null : toolName));
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white p-2 rounded-lg shadow-2xl flex items-center space-x-1 sm:space-x-2 z-[1001]">
      {tools.map(tool => (
        <button 
          key={tool.name} 
          title={tool.name} 
          onClick={() => handleToolClick(tool.name)}
          className={`p-2 sm:p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${activeTool === tool.name ? 'bg-green-600' : 'hover:bg-green-600'}`}
        >
          {tool.icon}
        </button>
      ))}
      <div className="border-l border-gray-600 h-8 mx-1"></div>
      <button 
        title="Toggle Grid" 
        onClick={() => setShowGrid(!showGrid)}
        className={`p-2 sm:p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${showGrid ? 'bg-green-600' : 'hover:bg-green-600'}`}
      >
        <GridIcon />
      </button>
    </div>
  );
}

function Compass() {
  return (
    <div className="absolute top-24 left-4 bg-gray-800 bg-opacity-70 rounded-full w-24 h-24 flex items-center justify-center text-white shadow-lg z-[1000] pointer-events-none">
      <div className="relative w-full h-full">
        {/* North Arrow */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 
          border-l-[8px] border-l-transparent
          border-r-[8px] border-r-transparent
          border-b-[16px] border-b-red-500">
        </div>
        {/* South Arrow */}
         <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 
          border-l-[8px] border-l-transparent
          border-r-[8px] border-r-transparent
          border-t-[16px] border-t-white">
        </div>
        {/* Markings */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 font-bold text-sm">N</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 font-bold text-sm">S</span>
        <span className="absolute top-1/2 -translate-y-1/2 left-1 font-bold text-sm">W</span>
        <span className="absolute top-1/2 -translate-y-1/2 right-1 font-bold text-sm">E</span>
      </div>
    </div>
  );
}

function MapView({ activeTool, setActiveTool, showGrid, setShowGrid, mode, mission, waypoints, setWaypoints, showOptimalRoute, toggleMobileSidebar }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const gridLayerRef = useRef(null);
    const temporaryLayerRef = useRef(null);
    const missionLayerRef = useRef(null);
    const routeLayerRef = useRef(null);
    const [scriptsReady, setScriptsReady] = useState(false);
    const [toolPoints, setToolPoints] = useState([]);
    const [measurement, setMeasurement] = useState("");
    const [cursorGrid, setCursorGrid] = useState("");
    const [gridInput, setGridInput] = useState("");

    // --- UTILITY FUNCTIONS ---
    const calculateBearing = (start, end) => {
        const toRad = (deg) => deg * Math.PI / 180;
        const lat1 = toRad(start.lat);
        const lon1 = toRad(start.lng);
        const lat2 = toRad(end.lat);
        const lon2 = toRad(end.lng);

        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        brng = (brng + 360) % 360;
        return brng;
    };

    const clearTemporaryLayers = () => {
        if (temporaryLayerRef.current) {
            temporaryLayerRef.current.clearLayers();
        }
        setToolPoints([]);
        setMeasurement("");
    };

    // --- EFFECTS ---
    useEffect(() => {
        const loadScript = (id, src, callback) => {
            if (document.getElementById(id)) {
                if (callback) callback();
                return;
            }
            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.async = true;
            script.onload = () => { if (callback) callback(); };
            script.onerror = () => console.error(`Failed to load script: ${src}`);
            document.body.appendChild(script);
        };

        const loadCss = (id, href) => {
            if (document.getElementById(id)) return;
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        };
        
        loadCss('leaflet-css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        loadScript('leaflet-js', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', () => {
            setScriptsReady(true);
        });
    }, []);
    
    // Effect to initialize map
    useEffect(() => {
        if (scriptsReady && window.L && mapContainerRef.current && !mapRef.current) {
            mapRef.current = window.L.map(mapContainerRef.current, { center: [28.6139, 77.2090], zoom: 13 });
            window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
            }).addTo(mapRef.current);
            temporaryLayerRef.current = window.L.layerGroup().addTo(mapRef.current);
            gridLayerRef.current = window.L.layerGroup();
            missionLayerRef.current = window.L.layerGroup().addTo(mapRef.current);
            routeLayerRef.current = window.L.layerGroup().addTo(mapRef.current);

            setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 0);

            mapRef.current.on('mousemove', (e) => {
                const { lat, lng } = e.latlng;
                setCursorGrid(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            });

            mapRef.current.on('mouseout', () => {
                setCursorGrid("");
            });
        }
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [scriptsReady]);

    // Effect to handle mode changes (mission start/end)
    useEffect(() => {
        if (!mapRef.current || !missionLayerRef.current) return;

        missionLayerRef.current.clearLayers(); // Clear previous mission markers

        if (mode === 'mission' && mission) {
            const startPoint = window.L.marker(mission.start, { title: "Start" }).addTo(missionLayerRef.current);
            startPoint.bindPopup("<b>Mission Start</b>").openPopup();

            const endPoint = window.L.marker(mission.end, { title: "Target" }).addTo(missionLayerRef.current);
            endPoint.bindPopup("<b>Mission Target</b>");

            if(mission.obstacle) {
                window.L.polygon(mission.obstacle, { color: 'red', fillColor: 'red', fillOpacity: 0.4 }).addTo(missionLayerRef.current);
            }

            const bounds = window.L.latLngBounds([mission.start, mission.end]);
            mapRef.current.fitBounds(bounds.pad(0.5)); // Zoom to fit mission area
        }
    }, [mode, mission, scriptsReady]);
    
    // Effect to show optimal route
    useEffect(() => {
        if (showOptimalRoute && mapRef.current && missionLayerRef.current && mission.optimalRoute) {
            window.L.polyline(mission.optimalRoute, { color: 'cyan', weight: 4, dashArray: '5, 10' }).addTo(missionLayerRef.current);
        }
    }, [showOptimalRoute, mission]);
    
     // Effect to draw user's route
    useEffect(() => {
        if (!mapRef.current || !routeLayerRef.current) return;
        routeLayerRef.current.clearLayers();

        if (mode === 'mission' && waypoints.length > 0) {
            const routePoints = [mission.start, ...waypoints.map(wp => wp.getLatLng())];
            window.L.polyline(routePoints, { color: 'yellow', weight: 3 }).addTo(routeLayerRef.current);
        }
    }, [waypoints, mode, mission]);


    // Effect to handle tool changes
    useEffect(() => {
        if (activeTool !== 'Compass') {
            clearTemporaryLayers();
        }
    }, [activeTool]);

    // Grid drawing effect
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !scriptsReady) return;

        const drawGrid = () => {
            if (!gridLayerRef.current) return;
            gridLayerRef.current.clearLayers();

            const bounds = map.getBounds();
            const zoom = map.getZoom();

            let interval = 0;
            if (zoom > 15) interval = 0.005; else if (zoom > 12) interval = 0.01;
            else if (zoom > 9) interval = 0.1; else if (zoom > 6) interval = 1.0;
            else if (zoom > 4) interval = 5.0; else return;

            const gridStyle = { color: '#4A5568', weight: 1, opacity: 0.7 };
            const north = bounds.getNorth(); const south = bounds.getSouth();
            const east = bounds.getEast(); const west = bounds.getWest();

            const startLng = Math.floor(west / interval) * interval;
            for (let lng = startLng; lng < east; lng += interval) {
                window.L.polyline([[north, lng], [south, lng]], gridStyle).addTo(gridLayerRef.current);
            }

            const startLat = Math.floor(south / interval) * interval;
            for (let lat = startLat; lat < north; lat += interval) {
                window.L.polyline([[lat, west], [lat, east]], gridStyle).addTo(gridLayerRef.current);
            }
        };

        if (showGrid) {
            map.addLayer(gridLayerRef.current);
            map.on('moveend zoomend', drawGrid);
            drawGrid();
        }

        return () => {
            if (map) {
                map.off('moveend zoomend', drawGrid);
                if (gridLayerRef.current && map.hasLayer(gridLayerRef.current)) {
                    map.removeLayer(gridLayerRef.current);
                }
            }
        };
    }, [showGrid, scriptsReady]);

    // Effect to handle map clicks for all tools
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handleMapClick = (e) => {
            const newPoint = e.latlng;

            if (activeTool === 'Waypoint') {
                const waypointId = Date.now(); // Simple unique ID
                const popupContent = `
                    <div>
                        Waypoint ${waypoints.length + 1}<br/>
                        Lat: ${newPoint.lat.toFixed(4)}, Lng: ${newPoint.lng.toFixed(4)}
                        <br/>
                        <button id="remove-wp-${waypointId}" class="bg-red-500 text-white text-xs px-2 py-1 rounded mt-1">Remove</button>
                    </div>
                `;

                const newWaypoint = window.L.marker(newPoint).addTo(map).bindPopup(popupContent);
                newWaypoint._waypointId = waypointId;

                newWaypoint.on('popupopen', () => {
                    const removeBtn = document.getElementById(`remove-wp-${waypointId}`);
                    removeBtn.onclick = () => {
                        map.removeLayer(newWaypoint);
                        setWaypoints(prev => prev.filter(wp => wp._waypointId !== waypointId));
                    };
                });
                
                setWaypoints(prev => [...prev, newWaypoint]);
                return;
            }

            if (activeTool === 'Ruler' || activeTool === 'Protractor') {
                const updatedPoints = [...toolPoints, newPoint];
                setToolPoints(updatedPoints);

                if (updatedPoints.length === 2) {
                    const [start, end] = updatedPoints;
                    window.L.polyline([start, end], { color: 'yellow', weight: 3, opacity: 0.8 }).addTo(temporaryLayerRef.current);
                    
                    if (activeTool === 'Ruler') {
                        const distance = map.distance(start, end);
                        const formattedDistance = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(0)} m`;
                        setMeasurement(`Distance: ${formattedDistance}`);
                    } else if (activeTool === 'Protractor') {
                        const bearing = calculateBearing(start, end);
                        setMeasurement(`Bearing: ${bearing.toFixed(1)}°`);
                    }
                    setTimeout(() => clearTemporaryLayers(), 4000);
                } else {
                    window.L.circleMarker(newPoint, { radius: 4, color: 'yellow', fillOpacity: 1, fillColor: 'yellow' }).addTo(temporaryLayerRef.current);
                }
            }
        };

        if (activeTool && activeTool !== 'Compass') map.on('click', handleMapClick);
        return () => { if (map) map.off('click', handleMapClick); };
    }, [activeTool, toolPoints, waypoints, scriptsReady, setWaypoints]);

    // Effect to update map cursor
    useEffect(() => {
        const mapContainer = mapContainerRef.current;
        if (mapContainer) {
            if (activeTool && activeTool !== 'Compass') {
                mapContainer.style.cursor = 'crosshair';
            } else {
                mapContainer.style.cursor = 'grab';
            }
        }
    }, [activeTool]);
    
    const handleGoToGrid = () => {
        if (!mapRef.current || !gridInput) return;
        const coords = gridInput.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            const [lat, lng] = coords;
            mapRef.current.setView([lat, lng], 16);
            const marker = window.L.marker([lat, lng]).addTo(temporaryLayerRef.current);
            marker.bindPopup(`Coords: ${lat}, ${lng}`).openPopup();
            setMeasurement(`Moved to ${lat}, ${lng}`);
            setTimeout(() => setMeasurement(""), 4000);
        } else {
            setMeasurement("Error: Invalid Coords");
            setTimeout(() => setMeasurement(""), 4000);
        }
    };

    return (
        <div className="w-full h-full relative">
            {/* Mobile Sidebar Toggle */}
            <button onClick={toggleMobileSidebar} className="md:hidden absolute top-4 left-4 z-[1001] bg-gray-800 p-3 rounded-md text-white shadow-lg">
                <MenuIcon />
            </button>
            
            <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} showGrid={showGrid} setShowGrid={setShowGrid} />
            {activeTool === 'Compass' && <Compass />}
            <div ref={mapContainerRef} className="w-full h-full" id="map"></div>
            <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-80 text-white p-2 md:p-3 rounded-lg shadow-lg text-sm z-[1000] w-56 md:w-64">
                <p><span className="font-bold text-green-400">Scale:</span> 1:50,000</p>
                <p><span className="font-bold text-green-400">Grid:</span> {showGrid ? 'Lat/Lng' : 'Off'}</p>
                <p className="h-5 truncate"><span className="font-bold text-green-400">Cursor:</span> {cursorGrid}</p>
                {measurement && <p className="font-bold text-yellow-400 mt-2">{measurement}</p>}
                <div className="mt-3 pt-3 border-t border-gray-600">
                    <label htmlFor="grid-input" className="font-bold text-green-400 text-xs">Go to Lat, Lng</label>
                    <div className="flex flex-col sm:flex-row items-center mt-1 space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                            id="grid-input"
                            type="text"
                            value={gridInput}
                            onChange={(e) => setGridInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGoToGrid()}
                            placeholder="e.g. 28.6, 77.2"
                            className="bg-gray-900 text-white text-xs rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button onClick={handleGoToGrid} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-xs w-full sm:w-auto">
                            Go
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LessonDisplay({ selectedSkill, lessonContent }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const headerContent = () => {
    if (!selectedSkill) {
      return (
        <>
          <BookIcon className="w-8 h-8 text-green-400 mr-4 flex-shrink-0" />
          <h2 className="text-lg md:text-xl font-bold">Welcome to the Simulator</h2>
        </>
      );
    }
    return (
      <>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold uppercase text-green-400 tracking-wider truncate">{selectedSkill.category}</h2>
          <h1 className="text-lg md:text-xl font-bold text-white truncate">{selectedSkill.skill}</h1>
        </div>
      </>
    );
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md text-white shadow-2xl rounded-t-lg border-t-4 border-green-600 transition-all duration-300 ease-in-out z-[1000] ${isExpanded ? 'h-auto max-h-[60vh] md:h-2/5' : 'h-16'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center min-w-0">{headerContent()}</div>
        <button className="p-2 rounded-full hover:bg-gray-700 flex-shrink-0">
          {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </button>
      </div>
      
      <div className={`px-4 md:px-8 pb-8 overflow-y-auto h-[calc(100%-4rem)] transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {selectedSkill ? (
          <div className="prose prose-sm prose-invert max-w-none text-gray-300">
            {lessonContent[selectedSkill.skill] || <p>Content for this topic is coming soon.</p>}
          </div>
        ) : (
           <p className="text-gray-400">Select a skill from the sidebar to begin your training.</p>
        )}
      </div>
    </div>
  );
}

function MissionMode({ mission, handleEndMission, nextMission, resetCurrentMission, calculateScore, score, feedback, setShowOptimalRoute, waypoints }) {
    if (!mission) return null;

    return (
        <div className={`absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md text-white shadow-2xl rounded-t-lg border-t-4 border-yellow-400 transition-all duration-300 ease-in-out z-[1000] h-auto max-h-[70vh] md:h-2/5`}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center min-w-0">
                    <MissionIcon className="w-8 h-8 text-yellow-400 mr-4 flex-shrink-0" />
                    <div className="overflow-hidden">
                        <h2 className="text-sm font-bold uppercase text-yellow-400 tracking-wider">Mission Briefing</h2>
                        <h1 className="text-lg md:text-xl font-bold text-white truncate">{mission.title}</h1>
                    </div>
                </div>
                 <button onClick={handleEndMission} className="bg-gray-700 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md text-xs flex-shrink-0">
                    End
                </button>
            </div>
            <div className="px-4 md:px-8 pb-8 space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
                {!score ? (
                    <>
                        <p>{mission.description}</p>
                        <p><strong className="text-yellow-300">Start:</strong> {mission.start[0]}, {mission.start[1]}</p>
                        <p><strong className="text-yellow-300">Target:</strong> {mission.end[0]}, {mission.end[1]}</p>
                        {mission.obstacle && <p className="text-red-400 font-bold">Warning: Avoid the marked No-Go Zone.</p>}
                        <div className="flex items-center flex-wrap gap-2">
                            <button onClick={calculateScore} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                Submit Route
                            </button>
                            <button onClick={resetCurrentMission} className="mt-2 bg-gray-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                                Reset
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-lg font-bold text-yellow-300">Mission Debrief</h3>
                        <p>Overall Score: <span className="font-bold text-2xl">{score.overall.toFixed(0)} / 100</span></p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>Route Correctness: <span className={score.correctness > 0 ? 'text-green-400' : 'text-red-400'}>{feedback.correctness}</span></li>
                            <li>Distance Efficiency: {score.distance.toFixed(0)}/100 - {feedback.distance}</li>
                            <li>Your Waypoints: {waypoints.length} (Optimal: {mission.optimalWaypoints})</li>
                        </ul>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={nextMission} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                Next Mission
                            </button>
                            <button onClick={resetCurrentMission} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                                Re-attempt
                            </button>
                             <button onClick={() => setShowOptimalRoute(true)} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                Show Optimal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Encapsulated Simulator Component ---

const lessonContent = {
  "Map Symbology": (
    <div>
      <h4>Understanding Map Symbols</h4>
      <p>Military maps use a standard set of symbols and colors to represent real-world features. Knowing these allows you to quickly interpret the terrain and identify key points.</p>
      <h5>Key Colors:</h5>
      <ul>
        <li><strong>Black:</strong> Man-made features like buildings, roads, and railways.</li>
        <li><strong>Blue:</strong> Water features such as lakes, rivers, and swamps.</li>
        <li><strong>Green:</strong> Vegetation like forests, orchards, and vineyards.</li>
        <li><strong>Brown:</strong> All relief features, such as contour lines.</li>
        <li><strong>Red:</strong> Major roads, built-up areas, and special features.</li>
      </ul>
      <p>Practice identifying different symbols on the map. For example, a small black square is a building, a dashed line is a trail, and solid green areas are forests.</p>
    </div>
  ),
  "Scale and Distance": (
    <div>
      <h4>Map Scale and Measuring Distance</h4>
      <p>The map scale tells you the ratio of a distance on the map to the actual distance on the ground. A common military scale is 1:50,000, meaning 1 cm on the map equals 50,000 cm (or 500 meters) on the ground.</p>
      <h5>Using the Bar Scale:</h5>
      <ol>
        <li>Find the bar scales in the map's marginal data (usually at the bottom).</li>
        <li>Take a straight edge of a piece of paper and place it on the map between the two points you want to measure.</li>
        <li>Mark the start and end points on the paper.</li>
        <li>Move the paper to the bar scale, align the start mark with 0, and read the ground distance from the scale.</li>
      </ol>
      <p><strong>Practice:</strong> Use the <strong>Ruler</strong> tool to measure the distance between two points on the map. The tool will automatically calculate the ground distance for you based on the map's scale.</p>
    </div>
  ),
  "Marginal Data": (
    <div>
      <h4>Reading Marginal Data</h4>
      <p>The information in the margins of a map is crucial for its correct use. It provides context and technical data.</p>
      <h5>Key Information Includes:</h5>
      <ul>
        <li><strong>Sheet Name and Number:</strong> Identifies the map area.</li>
        <li><strong>Scale and Contour Interval:</strong> Found at the bottom center. Tells you the map's scale (e.g., 1:50,000) and the vertical distance between contour lines.</li>
        <li><strong>Declination Diagram:</strong> Shows the angular relationship between True North, Grid North, and Magnetic North. This is critical for converting bearings.</li>
        <li><strong>Legend:</strong> Explains the symbols used on the map for features not covered by standard military symbology.</li>
        <li><strong>Adjoining Sheets Diagram:</strong> Shows which maps cover the surrounding areas.</li>
      </ul>
    </div>
  ),
  "Understanding Grid Lines": (
    <div>
      <h4>The Grid System</h4>
      <p>Military maps are covered by a grid of evenly spaced horizontal and vertical lines. These lines form squares and are used to report locations precisely.</p>
      <ul>
        <li><strong>Eastings:</strong> Vertical grid lines. Their numbers increase as you move east (to the right).</li>
        <li><strong>Northings:</strong> Horizontal grid lines. Their numbers increase as you move north (upwards).</li>
      </ul>
      <p>The fundamental rule for reading grid references is: <strong>READ RIGHT, THEN UP.</strong></p>
      <p><strong>Practice:</strong> Enable the grid overlay using the toolbar. Observe how the Latitude and Longitude lines form a grid over the map.</p>
    </div>
  ),
  "Reading Grid References (4, 6, 8-figure)": (
    <div>
      <h4>Reading Grid References</h4>
      <p>Grid references pinpoint a location. The more digits, the more precise the location.</p>
      <ul>
        <li><strong>4-figure (e.g., 1234):</strong> Identifies a 1,000m x 1,000m grid square. First two digits are the Easting, last two are the Northing. Refers to the entire square.</li>
        <li><strong>6-figure (e.g., 123345):</strong> Identifies a 100m x 100m area. You mentally divide the 4-figure square into a 10x10 grid. The 3rd digit is how many tenths you go right, and the 6th is how many tenths you go up.</li>
        <li><strong>8-figure (e.g., 12343456):</strong> Identifies a 10m x 10m area. The principle is the same, but you divide the grid square into a 100x100 grid.</li>
      </ul>
      <p><strong>Practice:</strong> Use the map's "Go to Lat, Lng" feature as a proxy for plotting grids. Enter coordinates and see where you land.</p>
    </div>
  ),
  "Plotting Grid References": (
    <div>
      <h4>Plotting a Grid Reference</h4>
      <p>To plot a grid, you reverse the reading process.</p>
      <ol>
        <li><strong>Read Right:</strong> Find the vertical Easting line on the map.</li>
        <li><strong>Read Up:</strong> Find the horizontal Northing line on the map. This identifies the bottom-left corner of the grid square.</li>
        <li>For a 6-figure grid, use a protractor's coordinate scale to measure the required number of tenths to the right (East) and then up (North) to pinpoint the location.</li>
      </ol>
      <p><strong>Practice:</strong> Pick a feature on the map (like a bridge or building) and try to determine its 6-figure grid reference.</p>
    </div>
  ),
  "The Three Norths (True, Grid, Magnetic)": (
    <div>
      <h4>The Three Norths</h4>
      <p>To navigate accurately, you must understand the three different "norths."</p>
      <ul>
        <li><strong>True North:</strong> The direction to the geographic North Pole. It's a fixed point.</li>
        <li><strong>Grid North (GN):</strong> The direction of the vertical grid lines on your map.</li>
        <li><strong>Magnetic North (MN):</strong> The direction your compass needle points, towards the Earth's magnetic pole. This location wanders over time.</li>
      </ul>
      <p>These three norths are rarely in the same place. The angular difference between them is shown on the map's declination diagram.</p>
    </div>
  ),
  "Grid-Magnetic (G-M) Angle": (
    <div>
      <h4>The G-M Angle</h4>
      <p>The Grid-Magnetic (G-M) Angle is the angular difference between Grid North and Magnetic North. It is the most important angle for land navigation.</p>
      <p>You use the G-M angle to convert bearings:
        <ul>
          <li><strong>Grid to Magnetic:</strong> When you measure a bearing on your map (a grid bearing) and want to follow it with your compass (a magnetic bearing).</li>
          <li><strong>Magnetic to Grid:</strong> When you take a bearing in the field with your compass (magnetic) and want to plot it on your map (grid).</li>
        </ul>
      </p>
      <p>The conversion rule is often summarized as: <strong>"Grid to Mag, ADD. Mag to Grid, GET RID (Subtract)."</strong> This can vary depending on location, so always check the declination diagram.</p>
    </div>
  ),
  "Measuring Bearings (Grid & Magnetic)": (
    <div>
      <h4>Measuring Bearings</h4>
      <h5>Measuring a Grid Bearing (on the map):</h5>
      <ol>
        <li>Draw a line between your start point and destination.</li>
        <li>Place the center of your protractor on the start point.</li>
        <li>Align the protractor's baseline with the vertical (North-South) grid line.</li>
        <li>Read the angle in degrees where your drawn line intersects the protractor's edge. This is your grid bearing.</li>
      </ol>
      <h5>Measuring a Magnetic Bearing (in the field):</h5>
      <ol>
        <li>Point your compass's direction-of-travel arrow at the target object.</li>
        <li>Rotate the compass bezel until the magnetic needle is aligned inside the orienting arrow ("Red in the Shed").</li>
        <li>Read the bearing at the index line. This is your magnetic bearing.</li>
      </ol>
      <p><strong>Practice:</strong> Use the <strong>Protractor</strong> tool to measure the bearing between two points on the map.</p>
    </div>
  ),
  "Converting Bearings": (
    <div>
      <h4>Converting Bearings</h4>
      <p>You must convert bearings to move between the map and the real world.</p>
      <p>Find the G-M angle on your map's declination diagram. Let's say it's 10° East.</p>
      <ul>
        <li><strong>Grid to Magnetic:</strong> You measure 150° on the map. Your compass bearing is 150° - 10° = 140°. (For Easterly G-M angle, you subtract).</li>
        <li><strong>Magnetic to Grid:</strong> Your compass reads 230°. Your map bearing is 230° + 10° = 240°. (For Easterly G-M angle, you add).</li>
      </ul>
      <p>The mnemonic is often "LARS": Left Add, Right Subtract (when going from Magnetic to Grid). Always refer to the diagram on your specific map sheet.</p>
    </div>
  ),
  "Back Bearings": (
    <div>
      <h4>Calculating Back Bearings</h4>
      <p>A back bearing is the opposite direction of a bearing. It's essential for checking your position or plotting a return route.</p>
      <h5>The Rule:</h5>
      <ul>
        <li>If the original bearing is <strong>less than 180°</strong>, you <strong>ADD 180°</strong>. (e.g., Bearing of 50° → Back Bearing is 50 + 180 = 230°).</li>
        <li>If the original bearing is <strong>greater than 180°</strong>, you <strong>SUBTRACT 180°</strong>. (e.g., Bearing of 300° → Back Bearing is 300 - 180 = 120°).</li>
      </ul>
      <p>This calculation is the same for both grid and magnetic bearings.</p>
    </div>
  ),
  "Contour Lines": (
    <div>
      <h4>Understanding Contour Lines</h4>
      <p>Contour lines are brown lines on a map that connect points of equal elevation. They are the key to visualizing the shape of the terrain.</p>
      <ul>
        <li><strong>Contour Interval:</strong> The vertical distance between adjacent contour lines. This is stated in the marginal data.</li>
        <li><strong>Index Contours:</strong> Every fifth contour line is thicker and is usually labeled with its elevation.</li>
        <li><strong>Intermediate Contours:</strong> The thinner, unlabeled lines between index contours.</li>
      </ul>
      <p>The most important rule: <strong>The closer the contour lines are together, the steeper the slope.</strong> The farther apart they are, the flatter the terrain.</p>
    </div>
  ),
  "Major Terrain Features": (
    <div>
      <h4>Five Major Terrain Features</h4>
      <p>You can identify these features by their contour line signatures:</p>
      <ul>
        <li><strong>Hill:</strong> A series of concentric, closed contour lines. The smallest loop is the hilltop.</li>
        <li><strong>Valley:</strong> A stretched-out U or V shape. The closed end of the U/V points toward higher ground. A stream or river is often present.</li>
        <li><strong>Ridge:</strong> A line of high ground with lower ground on three sides. Contour lines form a U or V shape, but they point *away* from high ground.</li>
        <li><strong>Saddle:</strong> A dip or low point between two areas of higher ground. Represented as an hourglass or figure-eight shape on the map.</li>
        <li><strong>Depression:</strong> A low point in the ground, like a sinkhole. Represented by closed contour lines with tick marks pointing inward.</li>
      </ul>
    </div>
  ),
  "Minor Terrain Features": (
    <div>
      <h4>Three Minor Terrain Features</h4>
      <p>These are smaller, but equally important, features:</p>
      <ul>
        <li><strong>Spur:</strong> A short, continuous sloping line of higher ground, normally jutting out from the side of a ridge.</li>
        <li><strong>Draw:</strong> Similar to a valley, but smaller. There is no level ground, and therefore, little or no maneuver room within its confines.</li>
        <li><strong>Cliff:</strong> A vertical or near-vertical feature. Represented by contour lines very close together or even converging into a single line with tick marks pointing to the low ground.</li>
      </ul>
    </div>
  ),
  "Slope Analysis": (
    <div>
      <h4>Analyzing Slope</h4>
      <p>The spacing of contour lines allows you to analyze the slope of the ground, which is critical for route planning.</p>
      <ul>
        <li><strong>Gentle Slope:</strong> Contour lines are widely spaced. Easy to traverse.</li>
        <li><strong>Steep Slope:</strong> Contour lines are close together. Difficult to traverse, may require climbing.</li>
        <li><strong>Concave Slope:</strong> Contour lines are widely spaced at the top and closely spaced at the bottom.</li>
        <li><strong>Convex Slope:</strong> Contour lines are closely spaced at the top and widely spaced at the bottom. The crest of the hill is not visible from the base.</li>
      </ul>
      <p>When planning a route, especially with heavy gear, try to choose paths that follow gentle slopes or run parallel to contour lines to conserve energy.</p>
    </div>
  ),
  "Resection": (
    <div>
      <h4>Position Fixing: Resection</h4>
      <p>Resection is the method of locating your unknown position by sighting on at least two known features.</p>
      <ol>
        <li>Identify two or three known, visible features on the ground and find them on your map (e.g., a mountain peak, a water tower).</li>
        <li>Using your compass, measure the magnetic bearing to one of the features.</li>
        <li>Convert that magnetic bearing to a grid bearing.</li>
        <li>Calculate the back bearing for that grid bearing.</li>
        <li>From the known feature on the map, draw a line along this back bearing.</li>
        <li>Repeat steps 2-5 for the second (and third) known feature.</li>
        <li>The point where the lines intersect is your location. Using a third feature helps confirm accuracy.</li>
      </ol>
    </div>
  ),
  "Intersection": (
    <div>
      <h4>Position Fixing: Intersection</h4>
      <p>Intersection is the method of locating an unknown point by successively occupying at least two known positions and sighting on the unknown point.</p>
      <ol>
        <li>Orient your map and identify your location (Position A).</li>
        <li>Take a magnetic bearing with your compass to the unknown point.</li>
        <li>Convert the magnetic bearing to a grid bearing.</li>
        <li>Draw a line on your map from your location (A) along this grid bearing.</li>
        <li>Move to a second known location (Position B) and repeat steps 2-4.</li>
        <li>The point where the two lines cross is the location of the unknown point.</li>
      </ol>
    </div>
  ),
  "Route Selection": (
    <div>
      <h4>Principles of Route Selection</h4>
      <p>A good route is not always the most direct. Consider the following factors (often remembered by the acronym METT-TC):</p>
      <ul>
        <li><strong>Mission:</strong> What is the objective? Speed or stealth?</li>
        <li><strong>Enemy:</strong> Where are potential threats? Avoid open areas.</li>
        <li><strong>Terrain and Weather:</strong> What is the most efficient and safest path? Avoid swamps, cliffs, and consider the weather's effect on the ground.</li>
        <li><strong>Troops and Support:</strong> What is the physical condition of your team? What equipment do you have?</li>
        <li><strong>Time Available:</strong> How much time do you have to get there?</li>
        <li><strong>Civilian Considerations:</strong> Impact on the local population.</li>
      </ul>
      <p>Use terrain features like ridges and valleys as "handrails" to guide your movement.</p>
    </div>
  ),
  "Legs and Checkpoints": (
    <div>
      <h4>Legs and Checkpoints</h4>
      <p>Break your route down into smaller, manageable sections called "legs." The end of each leg is a "checkpoint."</p>
      <h5>Good Checkpoints are:</h5>
      <ul>
        <li><strong>Easily Identifiable:</strong> A stream junction, a distinct hilltop, a road intersection.</li>
        <li><strong>Positive:</strong> Something you can't miss. A large feature is better than a small one.</li>
      </ul>
      <p>For each leg, you will determine the grid bearing, distance, and estimated travel time. This forms the basis of your route card.</p>
    </div>
  ),
  "Route Card Preparation": (
    <div>
      <h4>Preparing a Route Card</h4>
      <p>A route card is a simple table that organizes your navigation plan. It's a critical tool, especially at night or in poor visibility.</p>
      <h5>A basic route card includes columns for:</h5>
      <ul>
        <li><strong>Leg No.:</strong> 1, 2, 3...</li>
        <li><strong>From (Checkpoint):</strong> Starting point of the leg.</li>
        <li><strong>To (Checkpoint):</strong> End point of the leg.</li>
        <li><strong>Grid Bearing:</strong> Bearing measured on the map.</li>
        <li><strong>Magnetic Bearing:</strong> Converted bearing for your compass.</li>
        <li><strong>Distance (m):</strong> Ground distance for the leg.</li>
        <li><strong>Pace Count:</strong> Number of paces to cover the distance.</li>
        <li><strong>Notes:</strong> Key features to look for, dangers, etc.</li>
      </ul>
    </div>
  ),
};


function MapChallenge({ setPage }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [mode, setMode] = useState('learn'); // 'learn' or 'mission'
  const [currentMission, setCurrentMission] = useState(1);
  const [waypoints, setWaypoints] = useState([]);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showOptimalRoute, setShowOptimalRoute] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const missions = {
      1: {
          title: "Objective: Navigate to Target",
          description: "Plot a route from the designated start point to the target coordinates. Use your tools to determine the correct bearing and distance.",
          start: [28.6139, 77.2090], // India Gate
          end: [28.6562, 77.2410], // Red Fort
          optimalDistance: 4900, // meters, direct line
          optimalWaypoints: 1,
          optimalRoute: [[28.6139, 77.2090], [28.6562, 77.2410]],
      },
      2: {
          title: "Mission 2: Obstacle Avoidance",
          description: "A direct path to the target is blocked by a No-Go Zone. Plot a multi-leg route to safely navigate around the obstacle.",
          start: [25.42, 81.85], // Near New Yamuna Bridge, Prayagraj
          end: [25.435, 81.87], // Allahabad Fort
          obstacle: [ [25.425, 81.855], [25.43, 81.865], [25.425, 81.875], [25.42, 81.865] ],
          optimalDistance: 2900, // meters, approx
          optimalWaypoints: 2,
          optimalRoute: [[25.42, 81.85], [25.432, 81.86], [25.435, 81.87]],
      }
  };
  
  // Helper function to clear all mission-related state and map layers
  const clearMissionState = () => {
    // Programmatically remove each waypoint marker from the map
    waypoints.forEach(wp => {
        if (wp && typeof wp.remove === 'function') {
            wp.remove();
        }
    });
    // Reset all mission-related state variables
    setWaypoints([]);
    setScore(null);
    setFeedback(null);
    setShowOptimalRoute(false);
  };

  // Resets to the very first mission, called from the main sidebar
  const resetMission = () => {
      clearMissionState();
      setCurrentMission(1);
  }

  // Resets the current mission to allow the user to re-attempt it
  const resetCurrentMission = () => {
      clearMissionState();
  }

  // Advances to the next mission in the sequence
  const nextMission = () => {
      clearMissionState();
      setCurrentMission(prev => (missions[prev + 1] ? prev + 1 : 1));
  }
  
  const handleEndMission = () => {
    clearMissionState();
    setMode('learn');
  };
  
  const lineIntersects = (p1, q1, p2, q2) => {
    const onSegment = (p, q, r) => {
        return q.lat <= Math.max(p.lat, r.lat) && q.lat >= Math.min(p.lat, r.lat) &&
               q.lng <= Math.max(p.lng, r.lng) && q.lng >= Math.min(p.lng, r.lng);
    }
    const orientation = (p, q, r) => {
        const val = (q.lng - p.lng) * (r.lat - q.lat) - (q.lat - p.lat) * (r.lng - q.lng);
        if (val == 0) return 0;
        return (val > 0) ? 1 : 2;
    }
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);
    if (o1 != o2 && o3 != o4) return true;
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    return false;
  }

  const calculateScore = () => {
    const mission = missions[currentMission];
    if (!mission || waypoints.length < 1) {
        setScore({ overall: 0, correctness: 0, distance: 0, waypoints: 0 });
        setFeedback({ correctness: "Route is incomplete.", distance: "N/A", waypoints: "N/A" });
        return;
    }

    let isCorrect = true;
    let feedbackCorrectness = ""; // Start with an empty message
    const routePoints = [window.L.latLng(mission.start), ...waypoints.map(wp => wp.getLatLng())];
    const target = window.L.latLng(mission.end);

    // 1. Correctness Check: Obstacle
    if (mission.obstacle && window.L) {
        const obstaclePoints = mission.obstacle.map(p => window.L.latLng(p));
        for (let i = 0; i < routePoints.length - 1; i++) {
            const userLegStart = routePoints[i];
            const userLegEnd = routePoints[i+1];
            for (let j = 0; j < obstaclePoints.length; j++) {
                const obstacleEdgeStart = obstaclePoints[j];
                const obstacleEdgeEnd = obstaclePoints[(j + 1) % obstaclePoints.length];
                if (lineIntersects(userLegStart, userLegEnd, obstacleEdgeStart, obstacleEdgeEnd)) {
                    isCorrect = false;
                    feedbackCorrectness = "Route passes through the No-Go Zone.";
                    break;
                }
            }
            if (!isCorrect) break;
        }
    }

    // 2. Correctness Check: Reached Target
    const lastWaypoint = routePoints[routePoints.length - 1];
    if (lastWaypoint.distanceTo(target) > 200) { // 200m tolerance
        isCorrect = false;
        if (!feedbackCorrectness) {
            feedbackCorrectness = "Final waypoint is too far from the target.";
        }
    }
    
    if (isCorrect) {
        feedbackCorrectness = "Route is clear of obstacles and reaches the target.";
    }

    // 4. Distance Score Calculation
    let userDistance = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
        userDistance += routePoints[i].distanceTo(routePoints[i+1]);
    }
    userDistance += lastWaypoint.distanceTo(target);

    const distanceScore = Math.max(0, Math.min(100, 100 * (mission.optimalDistance / userDistance)));
    let feedbackDistance = `Your route was ${Math.round(userDistance)}m. Optimal is ~${mission.optimalDistance}m.`;
    if(distanceScore > 95) feedbackDistance = "Excellent! Your route was very efficient.";

    const waypointScore = Math.max(0, 100 - (Math.abs(waypoints.length - mission.optimalWaypoints) * 25));
    
    const correctnessScore = isCorrect ? 100 : 0;
    const overallScore = (correctnessScore * 0.5) + (distanceScore * 0.3) + (waypointScore * 0.2);

    setScore({
        overall: overallScore,
        correctness: correctnessScore,
        distance: distanceScore,
        waypoints: waypointScore,
    });
    setFeedback({
        correctness: feedbackCorrectness,
        distance: feedbackDistance,
    });
  };

  return (
    <div className="font-sans bg-gray-900 fixed inset-0 z-50 h-full w-full flex md:flex-row overflow-hidden">
      <Sidebar 
        selectedSkill={selectedSkill} 
        setSelectedSkill={setSelectedSkill} 
        setMode={setMode} 
        resetMission={resetMission}
        setPage={setPage} 
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      <main className="flex-grow h-full relative z-0">
        <MapView 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            showGrid={showGrid} 
            setShowGrid={setShowGrid}
            mode={mode}
            mission={missions[currentMission]}
            waypoints={waypoints}
            setWaypoints={setWaypoints}
            showOptimalRoute={showOptimalRoute}
            toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        {mode === 'learn' 
            ? <LessonDisplay selectedSkill={selectedSkill} lessonContent={lessonContent} /> 
            : <MissionMode 
                mission={missions[currentMission]} 
                handleEndMission={handleEndMission}
                nextMission={nextMission}
                resetCurrentMission={resetCurrentMission}
                calculateScore={calculateScore}
                score={score}
                feedback={feedback}
                setShowOptimalRoute={setShowOptimalRoute}
                waypoints={waypoints}
              />
        }
      </main>
    </div>
  );
}
// --- NEW: EVENT & CHECKLIST COMPONENTS ---

const EventCalendar = ({ setPage }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const q = query(collection(db, "events"), orderBy("date", "asc"));
            const snapshot = await getDocs(q);
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchEvents();
    }, []);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => setPage('dashboard')} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Unit Event Calendar</h2>
            {loading ? <p className="dark:text-white">Loading events...</p> : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                    {events.length > 0 ? events.map(event => (
                        <div key={event.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-gray-700 rounded-r-lg">
                            <p className="font-bold text-indigo-800 dark:text-indigo-300 text-lg">{event.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">{event.description}</p>
                        </div>
                    )) : <p className="dark:text-gray-400">No upcoming events found.</p>}
                </div>
            )}
        </div>
    );
};

const CampChecklists = ({ setPage }) => {
    const [checklists, setChecklists] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChecklists = async () => {
            const q = query(collection(db, "checklists"), orderBy("title"));
            const snapshot = await getDocs(q);
            setChecklists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };
        fetchChecklists();
    }, []);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => setPage('dashboard')} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Camp Packing Checklists</h2>
            {loading ? <p className="dark:text-white">Loading checklists...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h3 className="font-bold text-xl mb-4 dark:text-white">Select a Camp</h3>
                        <div className="space-y-2">
                            {checklists.map(list => (
                                <button key={list.id} onClick={() => setSelectedChecklist(list)} className={`w-full text-left p-3 rounded-lg font-semibold ${selectedChecklist?.id === list.id ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/80'}`}>{list.title}</button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        {selectedChecklist ? (
                            <div>
                                <h3 className="font-bold text-2xl mb-4 text-pink-800 dark:text-pink-300">{selectedChecklist.title}</h3>
                                <ul className="space-y-3">
                                    {selectedChecklist.items.map(item => (
                                        <li key={item.id} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <ListChecks className="w-5 h-5 mr-3 text-pink-500" />
                                            <span className="dark:text-gray-200">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p className="text-center text-gray-500 dark:text-gray-400">Please select a camp checklist to view the items.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NEW: ADMIN MANAGEMENT FOR EVENTS & CHECKLISTS ---

const ManageEvents = ({ backToAdmin }) => {
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState({ title: '', date: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchEvents = useCallback(async () => {
        const q = query(collection(db, "events"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateDoc(doc(db, 'events', currentEvent.id), currentEvent);
        } else {
            await addDoc(collection(db, 'events'), currentEvent);
        }
        resetForm();
        fetchEvents();
    };

    const handleEdit = (event) => { setIsEditing(true); setCurrentEvent(event); };
    const handleDelete = async (id) => { await deleteDoc(doc(db, 'events', id)); fetchEvents(); };
    const resetForm = () => { setIsEditing(false); setCurrentEvent({ title: '', date: '', description: '' }); };

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <input type="text" placeholder="Event Title" value={currentEvent.title} onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input type="date" value={currentEvent.date} onChange={e => setCurrentEvent({ ...currentEvent, date: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <textarea placeholder="Event Description" value={currentEvent.description} onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3" required />
                        <div className="flex space-x-2"><button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Save'}</button><button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button></div>
                    </form>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Events</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">{events.map(event => (<div key={event.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded"><div className="dark:text-gray-200"><p className="font-semibold">{event.title}</p><p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p></div><div className="flex space-x-2"><button onClick={() => handleEdit(event)}><Edit className="w-5 h-5 text-blue-500" /></button><button onClick={() => handleDelete(event.id)}><Trash2 className="w-5 h-5 text-red-500" /></button></div></div>))}</div>
                </div>
            </div>
        </div>
    );
};

const ManageChecklists = ({ backToAdmin }) => {
    const [checklists, setChecklists] = useState([]);
    const [currentChecklist, setCurrentChecklist] = useState(null);

    const fetchChecklists = useCallback(async () => {
        const q = query(collection(db, "checklists"), orderBy("title"));
        const snapshot = await getDocs(q);
        setChecklists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, []);

    useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

    const handleDeleteChecklist = async (id) => {
        await deleteDoc(doc(db, 'checklists', id));
        fetchChecklists();
    };

    const handleSave = async (id, title, items) => {
        if (id) {
            await updateDoc(doc(db, 'checklists', id), { title, items });
        } else {
            await addDoc(collection(db, 'checklists'), { title, items });
        }
        fetchChecklists();
        setCurrentChecklist(null);
    };

    if (currentChecklist) {
        return <ChecklistEditor checklist={currentChecklist} onSave={handleSave} onCancel={() => setCurrentChecklist(null)} />;
    }

    return (
        <div className="p-8">
            <button onClick={backToAdmin} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Admin</button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Manage Camp Checklists</h2>
                <button onClick={() => setCurrentChecklist({ id: null, title: '', items: [] })} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"><PlusCircle className="w-5 h-5 mr-2" />Add New Checklist</button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Existing Checklists</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {checklists.map(list => (
                        <div key={list.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="font-semibold dark:text-gray-200">{list.title}</span>
                            <div className="flex space-x-4">
                                <button onClick={() => setCurrentChecklist(list)} className="text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteChecklist(list.id)}><Trash2 className="w-5 h-5 text-red-500" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChecklistEditor = ({ checklist, onSave, onCancel }) => {
    const [title, setTitle] = useState(checklist.title);
    const [items, setItems] = useState(checklist.items || []);
    const [newItemText, setNewItemText] = useState('');

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemText) return;
        setItems([...items, { id: crypto.randomUUID(), text: newItemText }]);
        setNewItemText('');
    };

    const handleUpdateItem = (id, newText) => {
        setItems(items.map(item => item.id === id ? { ...item, text: newText } : item));
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="p-8">
            <button onClick={onCancel} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Checklist List</button>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{checklist.id ? 'Editing Checklist' : 'Creating New Checklist'}</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Camp Name" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded font-bold text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    <div>
                        <h3 className="font-semibold mb-2 dark:text-white">Required Materials</h3>
                        <form onSubmit={handleAddItem} className="flex space-x-2 mb-4">
                            <input type="text" placeholder="Add new item..." value={newItemText} onChange={e => setNewItemText(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add</button>
                        </form>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <input type="text" value={item.text} onChange={e => handleUpdateItem(item.id, e.target.value)} className="w-full p-1 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
                                    <button onClick={() => handleRemoveItem(item.id)}><Trash2 className="w-5 h-5 text-red-500" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex space-x-2">
                    <button onClick={() => onSave(checklist.id, title, items)} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Save Checklist</button>
                    <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        </div>
    );
};

// --- KNOT TYING SVG COMPONENTS ---
const NavButton = ({ onClick, children, primary = false }) => (
  <button
    onClick={onClick}
    className={`${primary ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105`}
  >
    {children}
  </button>
);

const Sidenavbar = ({ isOpen, knots, currentPageKey, onNavigateToIndex, onClose, onBack }) => {
    return (
        // Changed back to 'fixed' and increased z-index to ensure it's on top
        <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 flex flex-col`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold">Knot Guide</h2>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white focus:outline-none"
                  aria-label="Close sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto">
                <ul>
                    {Object.keys(knots).map((key, index) => (
                        <li key={key}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigateToIndex(index);
                                    onClose(); // Sidebar will now close on any selection
                                }}
                                className={`block p-4 text-sm hover:bg-gray-700 transition-colors duration-200 ${currentPageKey === key ? 'bg-blue-600 font-semibold' : ''}`}
                            >
                                {knots[key].title.replace("Learn to Tie a ", "")}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Back to Menu Button is now at the bottom */}
            <div className="flex-shrink-0">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onBack();
                    }}
                    className="block p-4 text-sm font-bold bg-gray-900 hover:bg-gray-700 transition-colors duration-200 border-t border-gray-700"
                >
                    ← Back to Main Menu
                </a>
            </div>
        </aside>
    );
};

// --- Knot Page Layout ---

const KnotPageLayout = ({ title, description, videoSrc, videoTitle, steps, children }) => {

    const getEmbedUrl = (src) => {
    const isYouTube = src.includes("youtube.com");
    const videoId = isYouTube 
      ? src.split("/").pop().split("?")[0] 
      : src.split("/").pop();

    let url = src.startsWith("http") ? src.split("?")[0] : `https://www.youtube.com/embed/${videoId}`;
    url = url.replace("/shorts/", "/embed/");
    if (!url.includes("/embed/")) {
      url = `https://www.youtube.com/embed/${videoId}`;
    }

    // autoplay + loop + mute
    url += `?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    return url;
  };

  return(
  <div className="dark:bg-gray-800 container mx-auto p-4 sm:p-6 lg:p-8 pt-20">
    <header className="text-center mb-8">
      <h1 className="dark:text-gray-200 text-3xl md:text-4xl font-bold text-gray-800">{title}</h1>
      <p className="dark:text-gray-200 text-md md:text-lg text-gray-600 mt-2">{description}</p>
    </header>
    <main className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative" style={{ paddingBottom: '177.78%' }}>
          <iframe
              src={getEmbedUrl(videoSrc)}
              title={videoTitle}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
        </div>
      </div>
      <div className="dark:bg-gray-800 w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="dark:text-gray-200 text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Step-by-Step Guide</h2>
        <div className="dark:text-gray-200 space-y-4 text-gray-700">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start">
              <div className={`dark:text-gray-200 flex-shrink-0 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4 ${step.isFinal ? 'bg-green-500' : 'bg-blue-500'}`}>
                {step.isFinal ? '✓' : index + 1}
              </div>
              <p className={`flex-1 ${step.isFinal ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: step.text }}></p>
            </div>
          ))}
        </div>
      </div>
    </main>
    <footer className="flex justify-between items-center mt-8">
      {children}
    </footer>
  </div>
);
};


// --- Individual Knot Data ---

const knotData = {
  squareKnot: {
    title: "Learn to Tie a Square Knot",
    description: "Follow the video and the steps below!",
    videoSrc: "https://youtube.com/shorts/TsRto-G6-aY?si=tD8RfuU3lJs51dgR",
    videoTitle: "Square Knot",
    steps: [
      { text: "Take two ends of your rope. Cross the <b>right end OVER</b> the left end." },
      { text: "Tuck the right end <b>UNDER</b> the left end and pull it through." },
      { text: "Now, cross the left end (which is now on your right) <b>OVER</b> the other end." },
      { text: "Tuck that same end <b>UNDER</b> the other and pull it through to complete the knot." },
      { text: "Pull both ends to tighten. A correct square knot will be flat and symmetrical.", isFinal: true },
    ],
  },
  cloveHitch: {
    title: "Learn to Tie a Clove Hitch",
    description: "A great knot for tying a rope to a post or rail.",
    videoSrc: "https://www.youtube.com/embed/rWTJ-pBHrOU",
    steps: [
        { text: "Wrap the end of your rope around the post or object." },
        { text: "Cross the working end <b>OVER</b> the standing part of the rope, forming an 'X'." },
        { text: "Wrap the rope around the post a second time, parallel to the first wrap." },
        { text: "Tuck the working end of the rope <b>UNDER</b> the second wrap (the 'X' you made)." },
        { text: "Pull both ends tight. The two wraps should cinch down on the post.", isFinal: true },
    ]
  },
  slipKnot: {
    title: "Learn to Tie a Slip Knot",
    description: "Creates an adjustable loop in a rope.",
    videoSrc: "https://www.youtube.com/embed/Lbwsk89ML08",
    steps: [
        { text: "Make a loop in the rope, crossing the working end over the standing part." },
        { text: "Reach through the loop you just made and grab the standing part of the rope." },
        { text: "Pull the standing part through the original loop. This will form a new, smaller loop." },
        { text: "Pull on the working end and the new loop to tighten the knot. You can adjust the size of the loop by pulling on the standing end.", isFinal: true },
    ]
  },
  bowlineKnot: {
    title: "Learn to Tie a Bowline Knot",
    description: "Creates a fixed, non-slipping loop at the end of a rope.",
    videoSrc: "https://www.youtube.com/embed/gqfYB1bsGMc",
    steps: [
        { text: "Make a small loop (the 'rabbit hole') in the standing part of the rope." },
        { text: "Bring the working end ('the rabbit') up through the hole from behind." },
        { text: "Wrap the working end around the standing part ('the tree')." },
        { text: "Bring the working end back down into the hole." },
        { text: "Hold the working end and the two sides of the loop, and pull the standing end to tighten.", isFinal: true },
    ]
  },
  fireEscapeKnot: {
    title: "Learn to Tie a Fire Escape Knot",
    description: "Also known as the Handcuff Knot, it creates two adjustable loops.",
    videoSrc: "https://www.youtube.com/embed/WHnmEQWMUgY",
    steps: [
        { text: "Create two loops, one in each hand, with the rope crossing in the middle." },
        { text: "Ensure one loop's end goes over the center rope, and the other goes under." },
        { text: "Pass the left loop through the right loop." },
        { text: "Simultaneously, pass the right loop through the left loop." },
        { text: "Pull the standing ends of the rope to tighten the two loops.", isFinal: true },
    ]
  },
  poachersKnot: {
    title: "Learn to Tie a Poacher's Knot",
    description: "A simple running knot that forms a noose.",
    videoSrc: "https://www.youtube.com/embed/jmFvTvO-b8M",
    steps: [
        { text: "Make a loop with the working end of the rope." },
        { text: "Wrap the working end around the standing part inside the main loop 3-4 times." },
        { text: "Pass the working end through the small loop created by the wraps." },
        { text: "Pull on the main loop to tighten the wraps into a secure knot.", isFinal: true },
    ]
  },
  timberHitch: {
    title: "Learn to Tie a Timber Hitch",
    description: "Used to attach a rope to a cylindrical object, like a log.",
    videoSrc: "https://www.youtube.com/embed/rgu_Rq2xOAg",
    steps: [
        { text: "Pass the rope around the object." },
        { text: "Wrap the working end around the standing part to form a loop." },
        { text: "Tuck the working end back under itself, inside the loop." },
        { text: "Twist or wrap the working end around the looped part of the rope at least three times." },
        { text: "Pull the standing end to tighten the hitch securely against the object.", isFinal: true },
    ]
  },
  hangingLoop: {
    title: "Learn to Tie a Hanging Loop",
    description: "Also known as the Scaffold Knot, creates a strong, non-slipping loop.",
    videoSrc: "https://www.youtube.com/embed/RZeNzqoEzQs",
    steps: [
        { text: "Make a large loop (bight) in the rope." },
        { text: "Create a smaller loop on top of the standing part." },
        { text: "Wrap the working end around the standing part inside the large loop several times." },
        { text: "Pass the working end through the small loop you created in step 2." },
        { text: "Pull the standing part to tighten the wraps into a secure knot, forming the hanging loop.", isFinal: true },
    ]
  }
};

const pages = Object.keys(knotData);

// --- Main Exported Component ---
function KnotTyingGuide({ setPage }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // This effect will run when the component mounts and whenever the currentPageIndex changes.
  useEffect(() => {
    // Scrolls the window to the top left corner.
    window.scrollTo(0, 0);
  }, [currentPageIndex]);

  const handleNavigate = (direction) => {
    if (direction === 'next') {
      setCurrentPageIndex((prevIndex) => (prevIndex + 1) % pages.length);
    } else if (direction === 'prev') {
      setCurrentPageIndex((prevIndex) => (prevIndex - 1 + pages.length) % pages.length);
    } else if (direction === 'start') {
      setCurrentPageIndex(0);
    }
  };

  const navigateToIndex = (index) => {
    setCurrentPageIndex(index);
  };

  const currentPageKey = pages[currentPageIndex];
  const currentKnot = knotData[currentPageKey];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;
  const prevPageKey = pages[(currentPageIndex - 1 + pages.length) % pages.length];
  const nextPageKey = pages[(currentPageIndex + 1) % pages.length];

  return (
    // Removed relative positioning and top padding from the main container
    <div className="bg-gray-100 min-h-screen font-sans antialiased dark:bg-gray-800">
      <Sidenavbar
        isOpen={isSidebarOpen}
        knots={knotData}
        currentPageKey={currentPageKey}
        onNavigateToIndex={navigateToIndex}
        onClose={() => setIsSidebarOpen(false)}
        onBack={() => setPage('main')} // Example: navigates back to 'mainMenu'
      />
      
      {/* This overlay will cover the content when the sidebar is open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 dark:text-gray-200"
          aria-hidden="true"
        ></div>
      )}

      {/* The main content area no longer shifts */}
      <div className="relative min-h-screen dark:text-gray-200">
        {!isSidebarOpen && (
          // The open button is fixed to the window
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="fixed top-20 dark:text-gray-200 left-4 z-30 bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg className="dark:text-gray-200 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        )}
        
        <KnotPageLayout
          title={currentKnot.title}
          description={currentKnot.description}
          videoSrc={currentKnot.videoSrc}
          videoTitle={currentKnot.title}
          steps={currentKnot.steps}
        >
          {!isFirstPage ? (
            <NavButton onClick={() => handleNavigate('prev')}>
              ← Previous: {knotData[prevPageKey].title.replace("Learn to Tie a ", "")}
            </NavButton>
          ) : <div />}
          
          {!isLastPage ? (
            <NavButton onClick={() => handleNavigate('next')} primary>
              Next: {knotData[nextPageKey].title.replace("Learn to Tie a ", "")} →
            </NavButton>
          ) : (
            <NavButton onClick={() => handleNavigate('start')} primary>
              Back to Start
            </NavButton>
          )}
        </KnotPageLayout>
      </div>
    </div>
  );
}

// --- NEW FIRST-AID SIMULATOR COMPONENT ---

// --- DATA ---
const scenarios = [
  {
    title: "Heat Stroke",
    timeLimit: 45, // in seconds
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_s_Heat_Stroke_During_Parade.mp4?updatedAt=1755408997339",
    description: "A fellow cadet has collapsed during a parade under the hot sun. They have hot, red, dry skin, a rapid pulse, and are likely unconscious or confused.",
    items: [
      { name: 'Cold Water / Wet Cloth', isCorrect: true, explanation: "Correct. Rapidly cooling the body is the top priority in a heat stroke emergency." },
      { name: 'Move to a Shady Area', isCorrect: true, explanation: "Correct. This is the first step to remove the person from the direct heat source." },
      { name: 'Painkillers', isCorrect: false, explanation: "Incorrect. Painkillers can interfere with the body's ability to regulate temperature and may harm the liver." },
      { name: 'Energy Drink', isCorrect: false, explanation: "Incorrect. The caffeine and sugar in energy drinks can worsen dehydration and strain the heart." },
      { name: 'Bandage', isCorrect: false, explanation: "Incorrect. A bandage is not relevant for treating the systemic effects of heat stroke." },
      { name: 'Loosen Clothing', isCorrect: true, explanation: "Correct. Removing or loosening clothing helps heat escape from the body more effectively." },
    ],
    procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Heat Stroke</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Call for Emergency Help:</span> Immediately call for medical assistance. Heat stroke is a life-threatening emergency.</li>
                <li><span className="font-semibold">Move to a Cooler Place:</span> Move the person out of the sun and into a shady or air-conditioned space.</li>
                <li><span className="font-semibold">Cool the Person Down:</span> This is the most critical step. Apply cool, wet cloths to the neck, armpits, and groin.</li>
                <li><span className="font-semibold">Loosen Clothing:</span> Remove any unnecessary or tight clothing.</li>
                <li><span className="font-semibold">Do NOT Give Fluids to Drink:</span> Unless they are conscious and alert. Avoid sugary or caffeinated drinks.</li>
            </ol>
        </>
    )
  },
  {
    title: "Dehydration",
    timeLimit: 40,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_s_Dehydration_During_Parade.mp4?updatedAt=1755410313702",
    description: "During a long drill, a cadet appears dizzy, fatigued, and complains of a headache and extreme thirst. Their performance is suffering.",
    items: [
      { name: 'Give Water / ORS', isCorrect: true, explanation: "Correct. Replenishing lost fluids is essential. An Oral Rehydration Solution (ORS) also replaces vital electrolytes." },
      { name: 'Rest in a Shady Area', isCorrect: true, explanation: "Correct. Resting in a cool place reduces further fluid loss through sweat and helps the body recover." },
      { name: 'Give a Sugary Soda', isCorrect: false, explanation: "Incorrect. High sugar content can actually hinder the body's ability to absorb water." },
      { name: 'Apply Hot Packs', isCorrect: false, explanation: "Incorrect. This would raise body temperature and be counterproductive to cooling the person down." },
      { name: 'Encourage Finishing the Drill', isCorrect: false, explanation: "Incorrect. Pushing someone with dehydration is dangerous and can lead to heat stroke." },
      { name: 'Loosen Clothing', isCorrect: true, explanation: "Correct. This helps the body to cool down more efficiently by allowing air to circulate." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Dehydration</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Stop the Activity:</span> Immediately have the person stop all physical exertion.</li>
                <li><span className="font-semibold">Move to a Cooler Place:</span> Move them to a shady or cool environment.</li>
                <li><span className="font-semibold">Rehydrate:</span> Provide cool water or an oral rehydration solution (ORS) to sip slowly. Avoid gulping.</li>
                <li><span className="font-semibold">Loosen Clothing:</span> Remove any tight or unnecessary gear to help them cool down.</li>
                <li><span className="font-semibold">Monitor Symptoms:</span> If symptoms worsen (confusion, fainting), seek immediate medical help.</li>
            </ol>
        </>
    )
  },
  {
    title: "Fatigue / Exhaustion",
    timeLimit: 35,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Exhausted_Cadet_s_Field_Training_Rest.mp4?updatedAt=1755412026495",
    description: "After a strenuous field exercise, a cadet is visibly drained, struggling to keep up, and showing signs of mental and physical exhaustion.",
    items: [
      { name: 'Rest and Recovery', isCorrect: true, explanation: "Correct. Rest is the most critical treatment for exhaustion to allow the body to recover." },
      { name: 'Hydration and Nutrition', isCorrect: true, explanation: "Correct. Replenishing fluids and energy with water and food is vital for recovery." },
      { name: 'Administer Stimulants', isCorrect: false, explanation: "Incorrect. Stimulants like caffeine can mask exhaustion, leading to a dangerous 'crash' later." },
      { name: 'Continue Training', isCorrect: false, explanation: "Incorrect. Pushing through severe exhaustion increases the risk of injury and medical emergencies." },
      { name: 'Check for Injury', isCorrect: true, explanation: "Correct. Exhaustion can mask pain. It's important to check for underlying injuries." },
      { name: 'Isolate the Cadet', isCorrect: false, explanation: "Incorrect. The cadet should be monitored by a buddy or leader, not left alone." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Fatigue / Exhaustion</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Stop the Activity:</span> Find a safe place for the cadet to stop and rest immediately.</li>
                <li><span className="font-semibold">Rest and Recover:</span> Allow for a significant rest period. This is non-negotiable.</li>
                <li><span className="font-semibold">Hydrate and Refuel:</span> Provide water and a balanced snack or meal with carbohydrates and protein.</li>
                <li><span className="font-semibold">Check for Underlying Issues:</span> Talk to the cadet to rule out injury, illness, or other medical problems contributing to the exhaustion.</li>
                <li><span className="font-semibold">Do Not Push Further:</span> Pushing through severe exhaustion can lead to injury or more serious medical conditions.</li>
            </ol>
        </>
    )
  },
  {
    title: "Muscle Cramps",
    timeLimit: 30,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_s_Cramp_Teammate_s_Support.mp4?updatedAt=1755412294332",
    description: "During a physical test, a cadet suddenly stops, grimacing in pain from a severe muscle cramp in their leg.",
    items: [
      { name: 'Stretch the Muscle', isCorrect: true, explanation: "Correct. Gently stretching the cramped muscle is the most effective way to relieve the spasm." },
      { name: 'Gentle Massage', isCorrect: true, explanation: "Correct. Massaging the area can help the muscle to relax and improve blood flow." },
      { name: 'Continue the Activity', isCorrect: false, explanation: "Incorrect. This can cause further pain or even tear the muscle." },
      { name: 'Apply Ice Pack', isCorrect: false, explanation: "Incorrect. Heat is generally better for relaxing a muscle cramp. Ice is used for inflammation or injury." },
      { name: 'Hydrate (Water/ORS)', isCorrect: true, explanation: "Correct. Cramps are often caused by dehydration and electrolyte imbalance, so rehydrating is crucial." },
      { name: 'Ignore the Pain', isCorrect: false, explanation: "Incorrect. Ignoring a cramp can lead to more severe muscle issues." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Muscle Cramps</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Stop the Activity:</span> Immediately stop the activity that caused the cramp.</li>
                <li><span className="font-semibold">Gently Stretch:</span> Gently stretch and hold the affected muscle. For a calf cramp, pull the top of your foot toward your head.</li>
                <li><span className="font-semibold">Massage the Area:</span> Gently massage the cramped muscle to help it relax.</li>
                <li><span className="font-semibold">Apply Heat (Optional):</span> After the initial stretch, applying a warm towel can help relax the muscle. Ice can be used later if there is soreness.</li>
                <li><span className="font-semibold">Hydrate:</span> Drink water or an electrolyte drink, as dehydration is a common cause of cramps.</li>
            </ol>
        </>
    )
  },
  {
    title: "Blistering from Marching",
    timeLimit: 30,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_s_Post_March_Recovery%20(1).mp4?updatedAt=1755412252386",
    description: "After a long march, a cadet removes their boots to reveal painful blisters on their heels and toes.",
    items: [
      { name: 'Clean the Area', isCorrect: true, explanation: "Correct. Cleaning the area with mild soap and water helps prevent infection." },
      { name: 'Apply Moleskin/Bandage', isCorrect: true, explanation: "Correct. Protecting the blister with a 'donut' bandage or moleskin reduces friction and pain." },
      { name: 'Pop the Blister', isCorrect: false, explanation: "Incorrect. Puncturing a blister removes the protective layer of skin, significantly increasing the risk of infection." },
      { name: 'Ignore and Continue', isCorrect: false, explanation: "Incorrect. Continued friction will make the blister worse and could lead to an open wound." },
      { name: 'Apply Tight Socks', isCorrect: false, explanation: "Incorrect. Tight socks will increase pressure and friction on the blister." },
      { name: 'Air it Out', isCorrect: true, explanation: "Correct. When resting, allowing the blister to air out can help it heal faster." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Blisters</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Wash Hands:</span> Before touching the blister, wash your hands thoroughly.</li>
                <li><span className="font-semibold">Clean Gently:</span> Clean the area around the blister with mild soap and water.</li>
                <li><span className="font-semibold">Do Not Puncture:</span> Do not intentionally pop the blister, as the skin provides a natural barrier against infection.</li>
                <li><span className="font-semibold">Protect It:</span> Apply a moleskin donut or a loose bandage to protect the blister from friction.</li>
                <li><span className="font-semibold">Keep it Dry and Clean:</span> Change the bandage daily and monitor for signs of infection (redness, pus).</li>
            </ol>
        </>
    )
  },
  {
    title: "Minor Injury (Scrape)",
    timeLimit: 35,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_First_Aid_After_Obstacle_Course.mp4?updatedAt=1755412953733",
    description: "On an obstacle course, a cadet slips and gets a minor scrape on their forearm. It's bleeding slightly but is not deep.",
    items: [
      { name: 'Clean with Antiseptic', isCorrect: true, explanation: "Correct. Cleaning the wound removes dirt and bacteria, which is the most important step to prevent infection." },
      { name: 'Apply Bandage/Dressing', isCorrect: true, explanation: "Correct. Covering the wound keeps it clean and protects it from further injury." },
      { name: 'Rub Dirt on It', isCorrect: false, explanation: "Incorrect. This is an old myth and is extremely dangerous as it introduces bacteria directly into the wound." },
      { name: 'Continue without Treatment', isCorrect: false, explanation: "Incorrect. Even small scrapes can become seriously infected if not cleaned and protected." },
      { name: 'Assess for Severity', isCorrect: true, explanation: "Correct. Always check if the injury is more than a simple scrape (e.g., deep cut, embedded object)." },
      { name: 'Apply Tourniquet', isCorrect: false, explanation: "Incorrect. A tourniquet is a last resort for life-threatening bleeding and is completely unnecessary for a minor scrape." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Minor Scrapes</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Stop the Bleeding:</span> Apply gentle, direct pressure with a clean cloth or bandage.</li>
                <li><span className="font-semibold">Clean the Wound:</span> Rinse the scrape with clean water to remove dirt and debris. Use antiseptic wipes to clean the surrounding skin.</li>
                <li><span className="font-semibold">Apply Antibiotic Ointment:</span> A thin layer can help prevent infection and keep the wound moist.</li>
                <li><span className="font-semibold">Cover the Wound:</span> Apply a sterile bandage or dressing to keep the area clean and protected.</li>
                <li><span className="font-semibold">Change Dressing Daily:</span> Change the bandage at least once a day or whenever it becomes wet or dirty.</li>
            </ol>
        </>
    )
  },
  {
    title: "Sunburn",
    timeLimit: 30,
    videoUrl: "https://ik.imagekit.io/jywuh6xr2/Cadet_s_Sunburn_After_Parade.mp4?updatedAt=1755412953693",
    description: "After a day of outdoor training with inadequate sun protection, a cadet's skin is red, painful, and hot to the touch.",
    items: [
      { name: 'Apply Cool Compress', isCorrect: true, explanation: "Correct. A cool compress or bath helps to draw heat from the skin and reduce pain." },
      { name: 'Hydrate', isCorrect: true, explanation: "Correct. Sunburn draws fluid to the skin surface and away from the rest of the body, so rehydrating is important." },
      { name: 'Apply Aloe Vera', isCorrect: true, explanation: "Correct. Aloe vera has soothing and anti-inflammatory properties that are excellent for sunburn." },
      { name: 'Wear Tight Clothing', isCorrect: false, explanation: "Incorrect. Tight clothing will rub against the sensitive skin and cause more pain." },
      { name: 'Peel the Skin', isCorrect: false, explanation: "Incorrect. Peeling the skin can lead to scarring and increases the risk of infection." },
      { name: 'Apply Butter/Oil', isCorrect: false, explanation: "Incorrect. Greasy substances can trap heat in the skin and make the burn worse." },
    ],
      procedure: (
        <>
            <h3 className="font-bold text-lg mb-2">Correct First Aid Procedure for Sunburn</h3>
            <ol className="list-decimal list-inside space-y-2">
                <li><span className="font-semibold">Get Out of the Sun:</span> Move indoors or to a shady area immediately.</li>
                <li><span className="font-semibold">Cool the Skin:</span> Apply cool compresses or take a cool bath/shower to soothe the burn.</li>
                <li><span className="font-semibold">Moisturize:</span> Apply aloe vera gel or a gentle moisturizer to the affected skin. Avoid oil-based products.</li>
                <li><span className="font-semibold">Hydrate:</span> Drink plenty of water to help your body recover.</li>
                <li><span className="font-semibold">Do Not Break Blisters:</span> If blisters form, do not pop them. Allow them to heal naturally.</li>
            </ol>
        </>
    )
  }
];


// --- MAIN SIMULATOR COMPONENT ---

function FirstAidSimulator({ setPage }) {
  // --- HELPER COMPONENTS (defined inside to be self-contained) ---

  const Icon = ({ name, className = "w-8 h-8" }) => {
    const icons = {
        'Cold Water / Wet Cloth': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Move to a Shady Area': "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 6.75z",
        'Rest in a Shady Area': "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 6.75z",
        'Painkillers': "M10.5 6h3m-6.75 3h9.75m-1.5 3h-6.75m-1.5 3h9.75M12 21a9 9 0 110-18 9 9 0 010 18z",
        'Energy Drink': "M9.75 3.104v5.714a2.25 2.25 0 01-.5 1.591L5.25 15.25v2.25h9.5v-2.25l-4-4.841a2.25 2.25 0 01-.5-1.591V3.104A2.25 2.25 0 009.75 3.104z",
        'Bandage': "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
        'Loosen Clothing': "M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.25-4.5L7.5 12m0 0l2.25 2.25M9.75 12l2.25-2.25M9.75 12l-2.25 2.25m0-4.5l2.25 2.25",
        'Give Water / ORS': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Hydration and Nutrition': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Give a Sugary Soda': "M9.75 3.104v5.714a2.25 2.25 0 01-.5 1.591L5.25 15.25v2.25h9.5v-2.25l-4-4.841a2.25 2.25 0 01-.5-1.591V3.104A2.25 2.25 0 009.75 3.104z",
        'Apply Hot Packs': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Encourage Finishing the Drill': "M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        'Rest and Recovery': "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
        'Administer Stimulants': "M10.5 6h3m-6.75 3h9.75m-1.5 3h-6.75m-1.5 3h9.75M12 21a9 9 0 110-18 9 9 0 010 18z",
        'Continue Training': "M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        'Check for Injury': "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
        'Isolate the Cadet': "M15 12a3 3 0 11-6 0 3 3 0 016 0z M12 14a5 5 0 00-5 5h10a5 5 0 00-5-5z",
        'Stretch the Muscle': "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
        'Gentle Massage': "M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        'Apply Ice Pack': "M21.75 9.75v4.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 14.25v-4.5A2.25 2.25 0 014.5 7.5h15A2.25 2.25 0 0121.75 9.75z",
        'Hydrate (Water/ORS)': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Ignore the Pain': "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
        'Clean the Area': "M4.5 3.75l7.5 7.5-7.5 7.5",
        'Apply Moleskin/Bandage': "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
        'Pop the Blister': "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
        'Ignore and Continue': "M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        'Apply Tight Socks': "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
        'Air it Out': "M12 3.75a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008a.75.75 0 01.75-.75h.008zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008a.75.75 0 01.75-.75h.008zM12 9.375a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008a.75.75 0 01.75-.75h.008z",
        'Clean with Antiseptic': "M9.75 3.104v5.714a2.25 2.25 0 01-.5 1.591L5.25 15.25v2.25h9.5v-2.25l-4-4.841a2.25 2.25 0 01-.5-1.591V3.104A2.25 2.25 0 009.75 3.104z",
        'Apply Bandage/Dressing': "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
        'Rub Dirt on It': "M12 21a9 9 0 110-18 9 9 0 010 18z",
        'Continue without Treatment': "M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        'Assess for Severity': "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
        'Apply Tourniquet': "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
        'Apply Cool Compress': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Hydrate': "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z",
        'Apply Aloe Vera': "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
        'Wear Tight Clothing': "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
        'Peel the Skin': "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
        'Apply Butter/Oil': "M12 21a9 9 0 110-18 9 9 0 010 18z"
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icons[name] || ""} />
        </svg>
    );
  };
  
  const CorrectProcedure = ({ children }) => (
    <div className="w-full max-w-2xl bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg animate-fade-in dark:bg-green-900/50 dark:border-green-500 dark:text-green-200">
        {children}
    </div>
  );

  const FirstAidKit = ({ onClick, isOpen }) => (
      <div className="relative z-10 flex flex-col items-center">
          {!isOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-blue-500 text-white px-3 py-1 rounded-full text-sm animate-bounce">
                  Open First Aid Kit
              </div>
          )}
          <button onClick={onClick} className="bg-red-600 p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,6h-4V4c0-1.1-0.9-2-2-2h-4C8.9,2,8,2.9,8,4v2H4C2.9,6,2,6.9,2,8v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M10,4h4v2h-4V4z M13,16h-2v-3H8v-2h3v-3h2v3h3v2h-3V16z"/>
              </svg>
          </button>
      </div>
  );

  const AidSideBar = ({ isOpen, scenarios, currentScenarioIndex, onNavigateToIndex, onClose, onStartTest, onBackToMain }) => {
      return (
          <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[1000] flex flex-col`}>
              <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                  <h2 className="text-xl font-bold">Scenarios</h2>
                  <button 
                      onClick={onClose} 
                      className="text-gray-400 hover:text-white focus:outline-none"
                      aria-label="Close sidebar"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
              </div>
              <nav className="flex-grow overflow-y-auto">
                  <ul>
                      {scenarios.map((scenario, index) => (
                          <li key={scenario.title}>
                              <a
                                  href="#"
                                  onClick={(e) => {
                                      e.preventDefault();
                                      onNavigateToIndex(index);
                                      onClose();
                                  }}
                                  className={`block p-4 text-sm hover:bg-gray-700 transition-colors duration-200 ${currentScenarioIndex === index ? 'bg-blue-600 font-semibold' : ''}`}
                              >
                                  {index + 1}. {scenario.title}
                              </a>
                          </li>
                      ))}
                  </ul>
              </nav>
              <div className="p-4 border-t border-gray-700 space-y-2">
                  <button
                      onClick={onStartTest}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                      Start Test
                  </button>
                  <button
                      onClick={onBackToMain}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                      ← Back to Main Menu
                  </button>
              </div>
          </aside>
      );
  };

  const FeedbackPopup = ({ message, isCorrect, onClose }) => {
    if (!message) return null;

    const bgColor = isCorrect ? 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-500' : 'bg-red-100 border-red-500 dark:bg-red-900 dark:border-red-500';
    const textColor = isCorrect ? 'text-green-800 dark:text-green-100' : 'text-red-800 dark:text-red-100';
    const title = isCorrect ? 'Correct!' : 'Incorrect';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4 animate-fade-in">
        <div className={`relative max-w-md w-full p-6 rounded-lg shadow-xl border-l-4 ${bgColor} ${textColor}`}>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-sm">{message}</p>
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close feedback"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    );
  };

  const ScoreTimerBar = ({ score, timeLeft }) => {
      const timerColor = timeLeft <= 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200';
      return (
          <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-6">
              <div className="text-lg">
                  <span className="font-bold text-gray-700 dark:text-gray-200">Score: </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{score}</span>
              </div>
              <div className={`text-lg font-bold ${timerColor}`}>
                  <span className="font-bold">Time Left: </span>
                  <span className="font-mono">{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</span>
              </div>
          </div>
      );
  };

  // --- COMPONENT STATE AND LOGIC ---

  const [mode, setMode] = useState('guide'); // 'guide' or 'test'
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [isKitOpen, setIsKitOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(scenarios[0].timeLimit);
  const [finalScore, setFinalScore] = useState(null);

  const currentScenario = scenarios[currentScenarioIndex];
  const firstAidItems = currentScenario.items;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (mode !== 'test') return;

    setTimeLeft(currentScenario.timeLimit);
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentScenarioIndex, currentScenario.timeLimit, mode]);

  const correctItems = useMemo(() => firstAidItems.filter(item => item.isCorrect), [firstAidItems]);

  const allCorrectItemsSelected = useMemo(() => {
    if (Object.keys(selections).length < correctItems.length) return false;
    return correctItems.every(item => selections[item.name] === true);
  }, [selections, correctItems]);

  const handleItemClick = (item) => {
    if (selections[item.name] !== undefined || (mode === 'test' && timeLeft <= 0)) return;

    setSelections(prev => ({ ...prev, [item.name]: item.isCorrect }));
    
    if (mode === 'guide') {
        setFeedback({ message: item.explanation, isCorrect: item.isCorrect });
    }
    
    if (mode === 'test') {
        if (item.isCorrect) {
          setScore(prev => prev + 10);
        } else {
          setScore(prev => prev - 5);
        }
    }
  };

  const resetForScenario = (index) => {
    setCurrentScenarioIndex(index);
    setSelections({});
    setIsKitOpen(false);
    setFeedback(null);
  }

  const handleNextScenario = () => {
    const isLastScenario = currentScenarioIndex >= scenarios.length - 1;

    if (isLastScenario && mode === 'test') {
        endTest();
        return;
    }
    
    const nextIndex = isLastScenario ? 0 : currentScenarioIndex + 1;
    resetForScenario(nextIndex);
  };
  
  const handlePreviousScenario = () => {
      const prevIndex = (currentScenarioIndex - 1 + scenarios.length) % scenarios.length;
      resetForScenario(prevIndex);
  };

  const handleNavigateToIndex = (index) => {
      if (mode === 'guide') {
          resetForScenario(index);
      }
  };

  const startTest = () => {
    setMode('test');
    setScore(0);
    setFinalScore(null);
    resetForScenario(0);
    setIsSidebarOpen(false);
  };

  const endTest = () => {
    setFinalScore(score);
    setMode('guide');
    resetForScenario(0);
  };
  
  const getBorderColor = (itemName) => {
    if (selections[itemName] === undefined) return 'border-gray-300 hover:border-blue-500 dark:border-gray-500';
    return selections[itemName] ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';
  };
  
  const getRingColor = (itemName) => {
    if (selections[itemName] === undefined) return 'hover:ring-blue-200 dark:hover:ring-blue-500/50';
    return selections[itemName] ? 'ring-green-200 dark:ring-green-500/50' : 'ring-red-200 dark:ring-red-500/50';
  };

  const calculateItemPosition = (index, totalItems) => {
    const arc = 170; 
    const startAngle = (180 - arc) / 2; 
    const angle = startAngle + (arc / (totalItems - 1)) * index;
    const angleRad = angle * (Math.PI / 180);
    const radius = 180;
    
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    
    return {
        transform: `translate(-50%, -50%) translate(${-x}px, ${-y}px) scale(${isKitOpen ? 1 : 0})`,
        transitionDelay: `${isKitOpen ? index * 50 : (totalItems - index - 1) * 50}ms`
    };
  };

  const timeIsUp = mode === 'test' && timeLeft <= 0;
  const showProcedure = allCorrectItemsSelected || timeIsUp;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 relative pb-40">
      {mode === 'guide' && (
        <>
          <AidSideBar
            isOpen={isSidebarOpen}
            scenarios={scenarios}
            currentScenarioIndex={currentScenarioIndex}
            onNavigateToIndex={handleNavigateToIndex}
            onClose={() => setIsSidebarOpen(false)}
            onStartTest={startTest}
            onBackToMain={() => setPage('dashboard')}
          />
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-[999]"></div>}
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-20 left-5 z-[998] bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700" aria-label="Open sidebar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </>
      )}

      {mode === 'test' && (
          <button onClick={endTest} className="fixed top-20 right-5 z-30 bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors" aria-label="Exit Test">
              Exit Test
          </button>
      )}

      <FeedbackPopup 
        message={feedback?.message} 
        isCorrect={feedback?.isCorrect} 
        onClose={() => setFeedback(null)} 
      />

      {finalScore !== null && (
        <FeedbackPopup
            message={`Test Complete! Your final score is ${finalScore}.`}
            isCorrect={true}
            onClose={() => setFinalScore(null)}
        />
      )}
      
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
        
        <header className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Cadet First Aid Guide</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'test' ? 'TEST MODE' : 'Guide Mode'} - Scenario {currentScenarioIndex + 1} of {scenarios.length}
          </p>
        </header>

        {mode === 'test' && <ScoreTimerBar score={score} timeLeft={timeLeft} />}

        <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-1/2 rounded-lg overflow-hidden shadow-lg border-4 border-gray-200 dark:border-gray-600">
                <video 
                    key={currentScenario.videoUrl}
                    src={currentScenario.videoUrl} 
                    autoPlay loop muted playsInline className="w-full h-full object-cover"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="w-full lg:w-1/2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg dark:bg-red-900/50 dark:text-red-200">
                <h2 className="font-bold text-xl mb-2">EMERGENCY: {currentScenario.title}</h2>
                <p className="text-sm">{currentScenario.description}</p>
                <p className="mt-3 font-semibold">Your task: Select the correct first aid items/actions to take immediately.</p>
            </div>
        </div>

        {showProcedure && (
            <div className="flex flex-col items-center mt-6">
                {timeIsUp && !allCorrectItemsSelected && (
                    <div className="text-center p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg w-full max-w-2xl dark:bg-yellow-900/50 dark:text-yellow-200">
                        <h3 className="font-bold text-lg">Time's Up!</h3>
                        <p>In an emergency, quick action is key. Let's review the correct procedure.</p>
                    </div>
                )}
                
                <div className="flex justify-between w-full max-w-2xl mb-4">
                    {mode === 'guide' ? (
                        <button 
                          onClick={handlePreviousScenario}
                          className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          Previous
                        </button>
                    ) : <div />}
                    
                    <button 
                      onClick={handleNextScenario}
                      className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      {currentScenarioIndex < scenarios.length - 1 ? 'Next Scenario' : (mode === 'test' ? 'Finish Test' : 'Restart Guide')}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                </div>

                <CorrectProcedure>{currentScenario.procedure}</CorrectProcedure>
            </div>
        )}
      </div>
      
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="relative flex items-center justify-center">
                {firstAidItems.map((item, index) => (
                    <div
                        key={item.name}
                        className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out"
                        style={calculateItemPosition(index, firstAidItems.length)}
                    >
                        <button
                            onClick={() => handleItemClick(item)}
                            disabled={timeIsUp}
                            className={`flex flex-col items-center justify-center w-28 h-28 p-2 text-center rounded-full border-2 bg-white dark:bg-gray-700 shadow-md transition-all duration-200 ease-in-out transform hover:!scale-110 focus:outline-none focus:ring-4 ${getBorderColor(item.name)} ${getRingColor(item.name)} ${timeIsUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="text-blue-600 dark:text-blue-400 mb-1"><Icon name={item.name} /></div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-xs">{item.name}</span>
                            {selections[item.name] !== undefined && (
                                <div className={`mt-1 text-xl font-bold ${selections[item.name] ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {selections[item.name] ? '✓' : '✗'}
                                </div>
                            )}
                        </button>
                    </div>
                ))}
                <FirstAidKit onClick={() => setIsKitOpen(!isKitOpen)} isOpen={isKitOpen} />
            </div>
       </div>

       <footer className="w-full text-center mt-8 text-gray-500 dark:text-gray-400 text-sm absolute bottom-0 pb-2">
            <p>This guide is for training purposes only. Always seek professional medical help in a real emergency.</p>
        </footer>
    </div>
  );
}

// --- DRILL SIMULATOR SVG STANCES ---
const drillData = {
    savdhan: {
        title: "Learn to Do Savdhan",
        description: "The position of attention in drill.",
        videoSrc: "https://www.youtube.com/embed/PjLMrbzxaEg",
        steps: [
            { text: "Stand perfectly straight with your body erect and head up." },
            { text: "Your heels should be together, with feet forming a 30-degree angle." },
            { text: "Keep your hands tightly clenched in a fist, thumbs pointing downwards." },
            { text: "Arms should be straight down, aligned with the seams of your trousers." },
            { text: "Look straight ahead. Do not move or talk.", isFinal: true },
        ]
    },
    vishram: {
        title: "Learn to Do Vishram",
        description: "The position of standing at ease.",
        videoSrc: "https://www.youtube.com/embed/Op_Jp5eg6Ik",
        steps: [
            { text: "From the Savdhan position, lift your left foot smartly." },
            { text: "Place your left foot about 12 inches to your left." },
            { text: "Simultaneously, bring your hands behind your back." },
            { text: "The right hand holds the left wrist, with palms facing outwards." },
            { text: "Distribute your body weight evenly on both feet.", isFinal: true },
        ]
    },
    dahineSalute: {
        title: "Learn to Do Samne Salute",
        description: "The standard right-hand salute.",
        videoSrc: "https://www.youtube.com/embed/jYjdQ_HrNe0",
        steps: [
            { text: "Begin in the <b>Savdhan</b> (attention) position, standing perfectly straight." },
            { text: "Raise your right hand, taking the shortest possible route up." },
            { text: "Your upper arm should be parallel to the ground." },
            { text: "Keep your fingers and thumb straight and pressed firmly together." },
            { text: "Your palm should be flat and facing the ground." },
            { text: "Gently touch the tip of your forefinger to your right eyebrow." },
            { text: "To finish, bring your hand down in a sharp, straight line to your side." },
            { text: "Return completely to the Savdhan position.", isFinal: true },
        ]
    }
};
const drillKeys = Object.keys(drillData);

// --- REUSABLE DRILL COMPONENTS ---
const DrillNavButton = ({ onClick, children, primary = false }) => (
    <button
        onClick={onClick}
        className={`${primary ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105`}
    >
        {children}
    </button>
);

const DrillSidebar = ({ isOpen, items, currentPageKey, onNavigateToIndex, onClose, onBack, title }) => {
    return (
        <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 flex flex-col`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none" aria-label="Close sidebar">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto">
                <ul>
                    {Object.keys(items).map((key, index) => (
                        <li key={key}>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToIndex(index); onClose(); }} className={`block p-4 text-sm hover:bg-gray-700 transition-colors duration-200 ${currentPageKey === key ? 'bg-blue-600 font-semibold' : ''}`}>
                                {items[key].title.replace("Learn to Do ", "")}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex-shrink-0">
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="block p-4 text-sm font-bold bg-gray-900 hover:bg-gray-700 transition-colors duration-200 border-t border-gray-700">
                    ← Back to Dashboard
                </a>
            </div>
        </aside>
    );
};

const DrillPageLayout = ({ title, description, videoSrc, videoTitle, steps, children, setPage, modelReady }) => {
    const getEmbedUrl = (src) => {
        const isYouTube = src.includes('youtube.com');
        const videoId = isYouTube ? src.split('/').pop().split('?')[0] : src.split('/').pop();
        let url = src.startsWith('http') ? src.split('?')[0] : `https://www.youtube.com/embed/${videoId}`;
        url = url.replace('/shorts/', '/embed/');
        if (!url.includes('/embed/')) { url = `https://www.youtube.com/embed/${videoId}`; }
        url += `?autoplay=1&loop=1`;
        if (isYouTube) { url += `&mute=1&playlist=${videoId}`; } else { url += `&muted=1`; }
        return url;
    };

    return (
        <div className="dark:bg-gray-900 bg-gray-100 container mx-auto p-4 sm:p-6 lg:p-8 pt-8">
            <header className="text-center mb-8">
                <h1 className="dark:text-white text-3xl md:text-4xl font-bold text-gray-800">{title}</h1>
                <p className="dark:text-gray-300 text-md md:text-lg text-gray-600 mt-2">{description}</p>
            </header>
            <main className="flex flex-col md:flex-row gap-8">
                <div className="dark:bg-gray-800 w-full md:w-1/3 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="relative" style={{ paddingBottom: '177.78%' }}>
                        <iframe src={getEmbedUrl(videoSrc)} title={videoTitle} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full"></iframe>
                    </div>
                </div>
                <div className="dark:bg-gray-800 w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    <h2 className="dark:text-white text-2xl font-semibold text-gray-800 mb-4 border-b dark:border-gray-600 border-gray-200 pb-2">Step-by-Step Guide</h2>
                    <div className="dark:text-gray-300 space-y-4 text-gray-700">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start">
                                <div className={`flex-shrink-0 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4 ${step.isFinal ? 'bg-green-500' : 'bg-blue-500'}`}>
                                    {step.isFinal ? '✓' : index + 1}
                                </div>
                                <p className={`flex-1 ${step.isFinal ? 'font-semibold' : ''}`} dangerouslySetInnerHTML={{ __html: step.text }}></p>
                            </div>
                        ))}
                    </div>
                    {/* Conditional button rendering for AI checkers */}
                    <div className="mt-8 pt-6 border-t dark:border-gray-700 border-gray-200 text-center">
                        {title === "Learn to Do Savdhan" && (
                             <>
                                <h3 className="text-xl font-semibold text-white mb-4">Ready to practice Savdhan?</h3>
                                <button
                                    onClick={() => setPage('postureChecker')}
                                    disabled={!modelReady}
                                    className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${!modelReady ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                                >
                                    {modelReady ? 'Practice Savdhan with AI' : 'AI Checker Loading...'}
                                </button>
                             </>
                        )}
                         {title === "Learn to Do Vishram" && (
                             <>
                                <h3 className="text-xl font-semibold text-white mb-4">Ready to practice Vishram?</h3>
                                <button
                                    onClick={() => setPage('vishramPostureChecker')}
                                    disabled={!modelReady}
                                    className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${!modelReady ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                                >
                                    {modelReady ? 'Practice Vishram with AI' : 'AI Checker Loading...'}
                                </button>
                            </>
                        )}
                        {title === "Learn to Do Samne Salute" && (
                             <>
                                <h3 className="text-xl font-semibold text-white mb-4">Ready to practice the Salute?</h3>
                                <button
                                    onClick={() => setPage('dahineSalutePostureChecker')}
                                    disabled={!modelReady}
                                    className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${!modelReady ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                                >
                                    {modelReady ? 'Practice Salute with AI' : 'AI Checker Loading...'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <footer className="flex justify-between items-center mt-8">
                {children}
            </footer>
        </div>
    );
};

// --- DRILL GUIDE COMPONENT ---
const DrillGuide = ({ setPage, modelReady, currentPageIndex, setCurrentPageIndex }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, [currentPageIndex]);

    const handleNavigate = (direction) => {
        if (direction === 'next') { setCurrentPageIndex((prev) => (prev + 1) % drillKeys.length); }
        else if (direction === 'prev') { setCurrentPageIndex((prev) => (prev - 1 + drillKeys.length) % drillKeys.length); }
        else if (direction === 'start') { setCurrentPageIndex(0); }
    };

    // UPDATED: This function now also resets the page index in the App state
    const handleBack = () => {
        setPage('dashboard');
        setCurrentPageIndex(0);
    };

    const currentPageKey = drillKeys[currentPageIndex];
    const currentItem = drillData[currentPageKey];
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === drillKeys.length - 1;
    const prevPageKey = drillKeys[(currentPageIndex - 1 + drillKeys.length) % drillKeys.length];
    const nextPageKey = drillKeys[(currentPageIndex + 1) % drillKeys.length];

    return (
        <div className="bg-gray-100 min-h-screen font-sans antialiased dark:bg-gray-900">
            <DrillSidebar isOpen={isSidebarOpen} items={drillData} currentPageKey={currentPageKey} onNavigateToIndex={setCurrentPageIndex} onClose={() => setIsSidebarOpen(false)} onBack={handleBack} title="Drill Guide" />
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>}
            <div className="relative min-h-screen">
                {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="fixed top-1/2 -translate-y-1/2 left-4 z-30 bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700" aria-label="Open sidebar">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                )}
                <DrillPageLayout
                    title={currentItem.title}
                    description={currentItem.description}
                    videoSrc={currentItem.videoSrc}
                    videoTitle={currentItem.title}
                    steps={currentItem.steps}
                    setPage={setPage}
                    modelReady={modelReady}
                >
                    {!isFirstPage ? <DrillNavButton onClick={() => handleNavigate('prev')}>← Previous: {drillData[prevPageKey].title.replace("Learn to Do ", "")}</DrillNavButton> : <div />}
                    {!isLastPage ? <DrillNavButton onClick={() => handleNavigate('next')} primary>Next: {drillData[nextPageKey].title.replace("Learn to Do ", "")} →</DrillNavButton> : <DrillNavButton onClick={() => handleNavigate('start')} primary>Back to Start</DrillNavButton>}
                </DrillPageLayout>
            </div>
        </div>
    );
}

// --- BASE POSTURE CHECKER LOGIC (REUSABLE HOOK) ---
const usePostureChecker = (model, analyzePose, onPerfectPose) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const smoothedPoseRef = useRef(null);
    const streamRef = useRef(null); // UPDATED: Added a ref to hold the camera stream directly.

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [feedback, setFeedback] = useState({ message: "Start camera to begin", color: "text-blue-400" });
    const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
    const [isPerfectPose, setIsPerfectPose] = useState(false);

    const stopCamera = useCallback(() => {
        // UPDATED: More robust camera stop logic.
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        setIsPerfectPose(false);
        setFeedback({ message: "Camera off. Start to resume.", color: "text-blue-400" });
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, []);

    useEffect(() => {
        // This cleanup function runs when the component unmounts, ensuring the camera is turned off.
        return () => {
            stopCamera();
             if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [stopCamera]);

    const drawPose = (pose, ctx) => {
        if (!window.poseDetection) return;
        const keypoints = pose.keypoints;
        keypoints.forEach(keypoint => {
            if (keypoint.score > 0.6) {
                ctx.beginPath(); ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#34D399'; ctx.fill();
            }
        });
        const adjacentKeyPoints = window.poseDetection.util.getAdjacentPairs(window.poseDetection.SupportedModels.MoveNet);
        adjacentKeyPoints.forEach(([i, j]) => {
            const kp1 = keypoints[i]; const kp2 = keypoints[j];
            if (kp1.score > 0.6 && kp2.score > 0.6) {
                ctx.beginPath(); ctx.moveTo(kp1.x, kp1.y); ctx.lineTo(kp2.x, kp2.y);
                ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 2; ctx.stroke();
            }
        });
    };
    
    const captureScreenshot = (pose) => {
        const video = videoRef.current; 
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth; 
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.scale(-1, 1); 
        ctx.translate(-tempCanvas.width, 0);
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform before drawing pose
        if (pose) {
            const poseCtx = tempCanvas.getContext('2d');
            // Pose coordinates are based on the non-flipped video, so we need to flip them for the screenshot
            const flippedPose = { ...pose, keypoints: pose.keypoints.map(kp => ({...kp, x: tempCanvas.width - kp.x})) };
            drawPose(flippedPose, poseCtx);
        }
        return tempCanvas.toDataURL('image/jpeg');
    };

    useEffect(() => {
        const detectPose = async () => {
            if (!isCameraOn || !model || !videoRef.current || videoRef.current.readyState < 4) {
                animationFrameId.current = requestAnimationFrame(detectPose); return;
            }
            try {
                const poses = await model.estimatePoses(videoRef.current);
                const ctx = canvasRef.current.getContext('2d');
                ctx.save();
                ctx.scale(-1, 1);
                ctx.translate(-dimensions.width, 0);
                ctx.clearRect(0, 0, dimensions.width, dimensions.height);
                if (poses && poses.length > 0) {
                    let currentPose = poses[0];
                    const SMOOTHING_FACTOR = 0.4;
                    if (smoothedPoseRef.current) {
                        currentPose.keypoints.forEach((keypoint, i) => {
                            const prevKeypoint = smoothedPoseRef.current.keypoints[i];
                            keypoint.x = SMOOTHING_FACTOR * keypoint.x + (1 - SMOOTHING_FACTOR) * prevKeypoint.x;
                            keypoint.y = SMOOTHING_FACTOR * keypoint.y + (1 - SMOOTHING_FACTOR) * prevKeypoint.y;
                            keypoint.score = SMOOTHING_FACTOR * keypoint.score + (1 - SMOOTHING_FACTOR) * prevKeypoint.score;
                        });
                    }
                    smoothedPoseRef.current = currentPose;
                    drawPose(currentPose, ctx);
                    analyzePose(currentPose.keypoints, () => { // Pass a callback to onPerfect
                        if (!isPerfectPose) {
                            const screenshot = captureScreenshot(currentPose);
                            onPerfectPose(screenshot);
                            setIsPerfectPose(true);
                        }
                    });
                } else {
                    smoothedPoseRef.current = null;
                    setFeedback({ message: "No person detected.", color: "text-yellow-400" });
                }
                ctx.restore();
            } catch (error) { console.error("Error during pose detection:", error); }
            animationFrameId.current = requestAnimationFrame(detectPose);
        };
        if (isCameraOn) { detectPose(); }
        else { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); }
        return () => { if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
    }, [isCameraOn, model, dimensions, isPerfectPose, analyzePose, onPerfectPose]);

    const toggleCamera = async () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            setFeedback({ message: "Starting camera...", color: "text-blue-400" });
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
                    streamRef.current = stream; // UPDATED: Store the stream directly in the ref.
                    const video = videoRef.current;
                    if (!video) return;
                    video.srcObject = stream;
                    const handleCanPlay = async () => {
                        try {
                            await video.play();
                            canvasRef.current.width = video.videoWidth;
                            canvasRef.current.height = video.videoHeight;
                            setDimensions({ width: video.videoWidth, height: video.videoHeight });
                            setIsCameraOn(true);
                            setFeedback({ message: "Detecting pose...", color: "text-blue-400" });
                        } catch (playError) {
                            console.error("Error playing video:", playError);
                            setFeedback({ message: "Could not start video.", color: "text-red-400" });
                        }
                        video.removeEventListener('canplay', handleCanPlay);
                    };
                    video.addEventListener('canplay', handleCanPlay);
                } catch (error) {
                    console.error("Error accessing webcam:", error);
                    let message = "Could not access the camera.";
                    if (error.name === "NotAllowedError") {
                        message = "Camera access was denied. Please allow camera access in your browser settings.";
                    } else if (error.name === "NotFoundError") {
                        message = "No camera was found on your device.";
                    } else if (error.name === "NotReadableError") {
                        message = "The camera is currently in use by another app or has a hardware issue.";
                    }
                    setFeedback({ message, color: "text-red-400" });
                }
            }
        }
    };

    return { videoRef, canvasRef, isCameraOn, feedback, setFeedback, toggleCamera, stopCamera };
};

// --- SAVDHAN CHECKER COMPONENT ---
const SavdhanPostureChecker = ({ setPage, model }) => {
    const [lastScreenshot, setLastScreenshot] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const handlePerfectPose = useCallback((screenshot) => {
        setLastScreenshot(screenshot);
        setShowModal(true);
        postureCheckerRef.current.stopCamera();
    }, []);

    const analyzeSavdhaan = useCallback((keypoints, onPerfect, setFeedback) => {
        const getKeypoint = (kps, name) => kps.find(kp => kp.name === name);
        const CONFIDENCE_THRESHOLD = 0.5;
        const requiredKeypoints = ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'];
        const visibleKeypoints = requiredKeypoints.map(name => getKeypoint(keypoints, name));

        if (visibleKeypoints.some(kp => !kp || kp.score < CONFIDENCE_THRESHOLD)) {
            setFeedback({ message: "Make sure your full body is clearly visible.", color: "text-yellow-400" }); return;
        }

        const [nose, leftShoulder, rightShoulder, leftHip, rightHip, leftAnkle, rightAnkle, leftElbow, rightElbow, leftWrist, rightWrist] = visibleKeypoints;
        let issues = [];
        const shoulderMidPoint = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
        const hipMidPoint = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
        const ankleMidPoint = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 };
        const torsoHeight = Math.hypot(shoulderMidPoint.x - hipMidPoint.x, shoulderMidPoint.y - hipMidPoint.y);
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

        if (torsoHeight < 50) { setFeedback({ message: "Please move closer to the camera.", color: "text-yellow-400" }); return; }

        const shoulderToHipLean = Math.abs(shoulderMidPoint.x - hipMidPoint.x);
        const hipToAnkleLean = Math.abs(hipMidPoint.x - ankleMidPoint.x);
        if ((shoulderToHipLean + hipToAnkleLean) / torsoHeight > 0.25) issues.push("Body not straight");
        if (Math.abs(leftHip.x - rightHip.x) > shoulderWidth * 1.05) issues.push("Chest out");
        if ((shoulderMidPoint.y - nose.y) / torsoHeight < 0.1) issues.push("Chin up");
        if (Math.abs(nose.x - shoulderMidPoint.x) / shoulderWidth > 0.15) issues.push("Keep head straight");
        if (Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y) / torsoHeight > 0.25) issues.push("Bring your feet together");
        const isAngleStraight = (p1, p2, p3) => Math.abs(180 - Math.abs((Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)) * 180.0 / Math.PI)) < 15;
        if (!isAngleStraight(leftShoulder, leftElbow, leftWrist)) issues.push("Straighten your left arm");
        if (!isAngleStraight(rightShoulder, rightElbow, rightWrist)) issues.push("Straighten your right arm");
        if (Math.abs(leftWrist.x - leftHip.x) / torsoHeight > 0.3) issues.push("Keep left hand by your side");
        if (Math.abs(rightWrist.x - rightHip.x) / torsoHeight > 0.3) issues.push("Keep right hand by your side");

        if (issues.length > 0) { setFeedback({ message: issues[0], color: "text-orange-400" }); }
        else {
            setFeedback({ message: "Excellent! Position is correct.", color: "text-green-400" });
            onPerfect();
        }
    }, []);

    const { videoRef, canvasRef, isCameraOn, feedback, setFeedback, toggleCamera, stopCamera } = usePostureChecker(model, (kp, onPerfect) => analyzeSavdhaan(kp, onPerfect, setFeedback), handlePerfectPose);
    
    const postureCheckerRef = useRef();
    postureCheckerRef.current = { stopCamera };

    return (
        <Fragment>
            <div className="w-full min-h-screen mx-auto p-4 flex flex-col items-center bg-gray-900 text-white">
                <div className="w-full max-w-7xl">
                    <div className="flex justify-start mb-4">
                        <button onClick={() => setPage('drillGuide')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            ← Back to Guide
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                        Savdhan Drill Posture Checker
                    </h1>
                    <p className="text-gray-400 mb-6 text-center">Using a high-precision model. Stand in the "Attention" position.</p>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl mb-6 flex-grow">
                        <div className="relative w-full max-w-4xl mx-auto aspect-video">
                            <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-700" style={{ transform: 'scaleX(-1)' }}></video>
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
                        </div>
                    </div>
                    <div className="mb-6 h-12 flex items-center justify-center">
                        <div className="bg-gray-700 p-3 rounded-lg w-full max-w-2xl mx-auto"><p className={`text-lg font-semibold transition-colors duration-300 text-center ${feedback.color}`}>{feedback.message}</p></div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <button onClick={toggleCamera} disabled={!model} className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 ${!model ? 'bg-gray-600 cursor-not-allowed' : isCameraOn ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50'}`}>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</button>
                    </div>
                </div>
            </div>
            {showModal && lastScreenshot && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full text-center">
                        <h3 className="text-2xl font-bold mb-4 text-teal-300">Posture Snapshot</h3>
                        <img src={lastScreenshot} alt="Posture screenshot" className="rounded-lg mx-auto shadow-lg mb-6" />
                        <div className="flex justify-center space-x-4">
                            <a href={lastScreenshot} download="savdhan_posture.jpg" className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Download</a>
                            <button onClick={() => { setShowModal(false); setLastScreenshot(null); }} className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

// --- VISHRAM CHECKER COMPONENT ---
const VishramPostureChecker = ({ setPage, model }) => {
    const [lastScreenshot, setLastScreenshot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handlePerfectPose = useCallback((screenshot) => {
        setLastScreenshot(screenshot);
        setShowModal(true);
        postureCheckerRef.current.stopCamera();
    }, []);

    const analyzeVishram = useCallback((keypoints, onPerfect, setFeedback) => {
        const getKeypoint = (kps, name) => kps.find(kp => kp.name === name);
        const CORE_CONFIDENCE = 0.4;

        // Check that the main body parts are visible. Wrists are handled separately.
        const requiredBodyParts = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle', 'left_elbow', 'right_elbow'];
        const bodyVisible = requiredBodyParts.every(part => {
            const kp = getKeypoint(keypoints, part);
            return kp && kp.score > CORE_CONFIDENCE;
        });

        if (!bodyVisible) {
            setFeedback({ message: "Make sure your full body and elbows are visible.", color: "text-yellow-400" });
            return;
        }

        const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
        const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
        const leftAnkle = getKeypoint(keypoints, 'left_ankle');
        const rightAnkle = getKeypoint(keypoints, 'right_ankle');
        const leftWrist = getKeypoint(keypoints, 'left_wrist'); // Still get wrist data to check its score
        const rightWrist = getKeypoint(keypoints, 'right_wrist');

        let issues = [];
        const shoulderWidth = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);

        // 1. Feet distance check (approximating 12 inches)
        const ankleDistance = Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y);
        const feetRatio = ankleDistance / shoulderWidth;
        if (feetRatio < 0.6) issues.push("Spread your feet wider (approx. 12 inches)");
        else if (feetRatio > 1.4) issues.push("Bring your feet closer (approx. 12 inches)");

        // 2. NEW LOGIC: Check if wrists are HIDDEN (low confidence score)
        const WRIST_HIDDEN_CONFIDENCE = 0.35; // A threshold to consider a wrist "hidden"
        const leftWristHidden = !leftWrist || leftWrist.score < WRIST_HIDDEN_CONFIDENCE;
        const rightWristHidden = !rightWrist || rightWrist.score < WRIST_HIDDEN_CONFIDENCE;

        if (!leftWristHidden || !rightWristHidden) {
            issues.push("Place your forearms behind your back");
        }

        // 3. Body straightness check
        const shoulderMidPoint = { x: (leftShoulder.x + rightShoulder.x) / 2 };
        const ankleMidPoint = { x: (leftAnkle.x + rightAnkle.x) / 2 };
        const lean = Math.abs(shoulderMidPoint.x - ankleMidPoint.x);
        if (lean / shoulderWidth > 0.25) issues.push("Stand straight, balance your weight");

        if (issues.length > 0) {
            setFeedback({ message: issues[0], color: "text-orange-400" });
        } else {
            setFeedback({ message: "Excellent! Vishram position is correct.", color: "text-green-400" });
            onPerfect();
        }
    }, []);


    const { videoRef, canvasRef, isCameraOn, feedback, setFeedback, toggleCamera, stopCamera } = usePostureChecker(model, (kp, onPerfect) => analyzeVishram(kp, onPerfect, setFeedback), handlePerfectPose);
    
    const postureCheckerRef = useRef();
    postureCheckerRef.current = { stopCamera };

    return (
        <Fragment>
            <div className="w-full min-h-screen mx-auto p-4 flex flex-col items-center bg-gray-900 text-white">
                <div className="w-full max-w-7xl">
                    <div className="flex justify-start mb-4">
                        <button onClick={() => setPage('drillGuide')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            ← Back to Guide
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-300">
                        Vishram Drill Posture Checker
                    </h1>
                    <p className="text-gray-400 mb-6 text-center">Using a high-precision model. Stand in the "At Ease" position.</p>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl mb-6 flex-grow">
                        <div className="relative w-full max-w-4xl mx-auto aspect-video">
                            <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-700" style={{ transform: 'scaleX(-1)' }}></video>
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
                        </div>
                    </div>
                    <div className="mb-6 h-12 flex items-center justify-center">
                        <div className="bg-gray-700 p-3 rounded-lg w-full max-w-2xl mx-auto"><p className={`text-lg font-semibold transition-colors duration-300 text-center ${feedback.color}`}>{feedback.message}</p></div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <button onClick={toggleCamera} disabled={!model} className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 ${!model ? 'bg-gray-600 cursor-not-allowed' : isCameraOn ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50'}`}>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</button>
                    </div>
                </div>
            </div>
            {showModal && lastScreenshot && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full text-center">
                        <h3 className="text-2xl font-bold mb-4 text-cyan-300">Posture Snapshot</h3>
                        <img src={lastScreenshot} alt="Posture screenshot" className="rounded-lg mx-auto shadow-lg mb-6" />
                        <div className="flex justify-center space-x-4">
                            <a href={lastScreenshot} download="vishram_posture.jpg" className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Download</a>
                            <button onClick={() => { setShowModal(false); setLastScreenshot(null); }} className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

// --- DAHINE SALUTE CHECKER COMPONENT ---
const DahineSalutePostureChecker = ({ setPage, model }) => {
    const [lastScreenshot, setLastScreenshot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handlePerfectPose = useCallback((screenshot) => {
        setLastScreenshot(screenshot);
        setShowModal(true);
        postureCheckerRef.current.stopCamera();
    }, []);

    const analyzeDahineSalute = useCallback((keypoints, onPerfect, setFeedback) => {
        const getKeypoint = (kps, name) => kps.find(kp => kp.name === name);
        const CONFIDENCE = 0.4;

        const requiredKeypointNames = [
            'right_shoulder', 'right_elbow', 'right_wrist', 'right_eye',
            'left_shoulder', 'left_elbow', 'left_wrist',
            'left_hip', 'right_hip',
            'left_ankle', 'right_ankle'
        ];

        const keypointData = {};
        for(const name of requiredKeypointNames) {
            const kp = getKeypoint(keypoints, name);
            if (!kp || kp.score < CONFIDENCE) {
                setFeedback({ message: `Make sure your ${name.replace(/_/g, ' ')} is visible.`, color: "text-yellow-400" });
                return;
            }
            keypointData[name] = kp;
        }

        const {
            right_shoulder: rightShoulder, right_elbow: rightElbow, right_wrist: rightWrist, right_eye: rightEye,
            left_shoulder: leftShoulder, left_elbow: leftElbow, left_wrist: leftWrist,
            left_hip: leftHip, right_hip: rightHip,
            left_ankle: leftAnkle, right_ankle: rightAnkle
        } = keypointData;

        let issues = [];
        const shoulderMidPoint = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
        const hipMidPoint = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
        const torsoHeight = Math.hypot(shoulderMidPoint.x - hipMidPoint.x, shoulderMidPoint.y - hipMidPoint.y);

        if (Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y) / torsoHeight > 0.25) {
             issues.push("Bring your feet together");
        }
        const ankleMidPoint = { x: (leftAnkle.x + rightAnkle.x) / 2 };
        if (Math.abs(shoulderMidPoint.x - ankleMidPoint.x) / torsoHeight > 0.2) {
            issues.push("Stand straight");
        }
        
        const isLeftArmStraight = Math.abs(180 - Math.abs((Math.atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x) - Math.atan2(leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x)) * 180.0 / Math.PI)) < 25;
        if (!isLeftArmStraight) {
            issues.push("Straighten your left arm");
        }
        if (Math.abs(leftWrist.x - leftHip.x) / torsoHeight > 0.3) {
            issues.push("Keep your left hand by your side");
        }

        if (Math.abs(rightShoulder.y - rightElbow.y) / torsoHeight > 0.1) {
            issues.push("Keep your upper arm parallel to the ground");
        }
        
        const elbowAngleRad = Math.atan2(rightWrist.y - rightElbow.y, rightWrist.x - rightElbow.x) - Math.atan2(rightShoulder.y - rightElbow.y, rightShoulder.x - rightElbow.x);
        let elbowAngleDeg = Math.abs(elbowAngleRad * 180 / Math.PI);
        if (elbowAngleDeg > 180) {
            elbowAngleDeg = 360 - elbowAngleDeg;
        }

        if (elbowAngleDeg < 35 || elbowAngleDeg > 40) {
            issues.push("Bend your forearm to the correct angle 45 degree");
        }
        
        if (issues.length > 0) {
            setFeedback({ message: issues[0], color: "text-orange-400" });
        } else {
            setFeedback({ message: "Excellent! Salute is correct.", color: "text-green-400" });
            onPerfect();
        }
    }, []);

    const { videoRef, canvasRef, isCameraOn, feedback, setFeedback, toggleCamera, stopCamera } = usePostureChecker(model, (kp, onPerfect) => analyzeDahineSalute(kp, onPerfect, setFeedback), handlePerfectPose);
    
    const postureCheckerRef = useRef();
    postureCheckerRef.current = { stopCamera };

    return (
        <Fragment>
            <div className="w-full min-h-screen mx-auto p-4 flex flex-col items-center bg-gray-900 text-white">
                <div className="w-full max-w-7xl">
                    <div className="flex justify-start mb-4">
                        <button onClick={() => setPage('drillGuide')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            ← Back to Guide
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Dahine Salute Posture Checker
                    </h1>
                    <p className="text-gray-400 mb-6 text-center">Using a high-precision model. Perform the right-hand salute.</p>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl mb-6 flex-grow">
                        <div className="relative w-full max-w-4xl mx-auto aspect-video">
                            <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full rounded-lg bg-gray-700" style={{ transform: 'scaleX(-1)' }}></video>
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
                        </div>
                    </div>
                    <div className="mb-6 h-12 flex items-center justify-center">
                        <div className="bg-gray-700 p-3 rounded-lg w-full max-w-2xl mx-auto"><p className={`text-lg font-semibold transition-colors duration-300 text-center ${feedback.color}`}>{feedback.message}</p></div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <button onClick={toggleCamera} disabled={!model} className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 ${!model ? 'bg-gray-600 cursor-not-allowed' : isCameraOn ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50'}`}>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</button>
                    </div>
                </div>
            </div>
            {showModal && lastScreenshot && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full text-center">
                        <h3 className="text-2xl font-bold mb-4 text-pink-400">Salute Snapshot</h3>
                        <img src={lastScreenshot} alt="Posture screenshot" className="rounded-lg mx-auto shadow-lg mb-6" />
                        <div className="flex justify-center space-x-4">
                            <a href={lastScreenshot} download="dahine_salute_posture.jpg" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Download</a>
                            <button onClick={() => { setShowModal(false); setLastScreenshot(null); }} className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

// --- NEW UNIFORM GUIDE COMPONENT ---
// const ChevronLeft = (props) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//         <path d="m15 18-6-6 6-6" />
//     </svg>
// );

// const ChevronDown = (props) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//         <path d="m6 9 6 6 6-6" />
//     </svg>
// );

const BeretIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 17a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2.2a2 2 0 0 0-.6-1.4l-1.9-1.9a2 2 0 0 1-.6-1.4V7a5 5 0 0 0-5-5h-6a5 5 0 0 0-5 5v3.1a2 2 0 0 1-.6 1.4L2.6 13.4A2 2 0 0 0 2 14.8V17Z" />
        <path d="M12 18v-1" />
    </svg>
);

const ShirtIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
);

const ShoulderIcon = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 8.5V17a2 2 0 0 1-2 2v2" />
        <path d="M6 8.5V17a2 2 0 0 0 2 2v2" />
        <path d="M12 15a2.5 2.5 0 0 0-2.5-2.5c-1.22.21-2.21.8-2.5 2.5" />
        <path d="M12 15a2.5 2.5 0 0 1 2.5-2.5c1.22.21 2.21.8 2.5 2.5" />
        <path d="M12 2v3" />
        <path d="M12 8.5a4.5 4.5 0 0 1 4.5 4.5c0 .73-.18 1.41-.5 2" />
        <path d="M12 8.5A4.5 4.5 0 0 0 7.5 13c0 .73.18 1.41.5 2" />
    </svg>
);

// --- UNIFORM GUIDE (MAIN COMPONENT) ---
const UniformGuide = ({ setPage }) => {
    const [activeTab, setActiveTab] = useState('placement');

    const renderContent = () => {
        switch (activeTab) {
            case 'placement': return <BadgePlacementGuide />;
            case 'beret': return <BeretShapingGuide />;
            case 'checklist': return <TurnoutChecklist />;
            default: return <BadgePlacementGuide />;
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
            <button onClick={() => setPage('dashboard')} className="mb-6 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">NCC Uniform & Turnout Guide</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">A comprehensive guide to NCC uniform standards and parade turnout.</p>
                    <div className="flex justify-center border-b border-gray-200 dark:border-gray-700 mb-8">
                        <button onClick={() => setActiveTab('placement')} className={`px-4 py-2 font-semibold text-sm sm:text-base transition-colors ${activeTab === 'placement' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Uniform Layout</button>
                        <button onClick={() => setActiveTab('beret')} className={`px-4 py-2 font-semibold text-sm sm:text-base transition-colors ${activeTab === 'beret' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Beret Guide</button>
                        <button onClick={() => setActiveTab('checklist')} className={`px-4 py-2 font-semibold text-sm sm:text-base transition-colors ${activeTab === 'checklist' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Parade Checklist</button>
                    </div>
                    <div>{renderContent()}</div>
                </div>
            </div>
        </div>
    );
};

// --- Data for the interactive guide ---
const guideData = [
    {
        id: 'headwear',
        title: 'Headwear (Beret)',
        icon: <BeretIcon className="w-6 h-6 mr-3 text-yellow-600" />,
        points: [
            "<strong>Cap Badge:</strong> Positioned directly over the left eye.",
            "<strong>Fit:</strong> The beret should be pulled down towards the right ear, with the leather band level around the head.",
        ],
    },
    {
        id: 'rightSide',
        title: 'Right Side of Uniform',
        icon: <ShirtIcon className="w-6 h-6 mr-3 text-yellow-600" />,
        points: [
            "<strong>Name Plate:</strong> Worn centrally on the flap of the right breast pocket.",
            "<strong>Lanyard:</strong> Worn over the right shoulder, passing under the epaulette, and tucked into the right breast pocket.",
            "<strong>Formation Patch:</strong> Worn on the right sleeve, 2cm below the shoulder seam.",
        ],
    },
    {
        id: 'leftSide',
        title: 'Left Side of Uniform',
        icon: <ShirtIcon className="w-6 h-6 mr-3 text-yellow-600 scale-x-[-1]" />,
        points: [
            "<strong>Proficiency Badges:</strong> Worn centered above the left breast pocket.",
            "<strong>Other Badges:</strong> Worn on the flap of the left breast pocket.",
            "<strong>Note:</strong> Always confirm with your unit's PI Staff for the most current regulations.",
        ],
    },
    {
        id: 'shoulders',
        title: 'Shoulders (Epaulettes)',
        icon: <ShoulderIcon className="w-6 h-6 mr-3 text-yellow-600" />,
        points: [
            "<strong>Rank Chevrons:</strong> Worn on the epaulettes of both shoulders.",
            "<strong>Direction:</strong> The point of the chevron must face away from the collar (outwards).",
        ],
    },
];

// --- ACCORDION ITEM (Interactive Component) ---
const AccordionItem = ({ item, isOpen, onClick }) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    {item.icon}
                    <span>{item.title}</span>
                </div>
                <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </h2>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
                    {item.points.map((point, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                </ul>
            </div>
        </div>
    </div>
);


// --- BADGE PLACEMENT GUIDE ---
const BadgePlacementGuide = () => {
    const [openId, setOpenId] = useState(guideData[0].id); // Default to first item open

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Official Badge & Accoutrement Placement</h3>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/2 flex-shrink-0">
                    <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg sticky top-8">
                        <img 
                            src="https://ik.imagekit.io/jywuh6xr2/mygov-10000000001296218262.jpg?updatedAt=1755630880255" 
                            alt="NCC Uniform Badge Placement Guide" 
                            className="rounded-md w-full h-auto shadow-md"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x800/e2e8f0/4a5568?text=Image+Not+Found'; }}
                        />
                    </div>
                </div>
                <div className="w-full lg:w-1/2">
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                        Select a section below to view the detailed placement guidelines for each part of the uniform.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        {guideData.map(item => (
                            <AccordionItem 
                                key={item.id}
                                item={item}
                                isOpen={openId === item.id}
                                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Data for the Beret Shaping Guide ---
const beretSteps = [
    { title: "Soak", description: "Submerge the beret in warm (not hot) water until completely soaked." },
    { title: "Squeeze", description: "Gently squeeze out excess water. Do not twist or wring it out." },
    { title: "Shape", description: "Place on your head with the badge over your left eye. Pull excess material down to the right." },
    { title: "Crease", description: "Create a sharp crease behind the badge and smooth the rest of the material down." },
    { title: "Dry", description: "Keep it on your head to dry for a perfect mold, or lay it flat, maintaining its shape." },
    { title: "Shave", description: "Once dry, carefully shave off any fuzz with a razor for a clean, sharp look." },
];

// --- BERET SHAPING GUIDE (NEW DECORATIVE VERSION) ---
const BeretShapingGuide = () => (
    <div>
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">How to Shape Your Beret</h3>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Image Column */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg sticky top-8">
                    <img 
                        src="https://ik.imagekit.io/jywuh6xr2/41dh5jVAZ2L._UY1100_.jpg?updatedAt=1755633235815" 
                        alt="NCC Beret" 
                        className="rounded-md w-full h-auto shadow-md"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/800x800/e2e8f0/4a5568?text=Image+Not+Found'; }}
                    />
                </div>
            </div>

            {/* Decorative Steps Column */}
            <div className="w-full lg:w-2/3">
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    A well-shaped beret is a sign of a sharp cadet. Follow these steps for a perfect shape:
                </p>
                <div className="space-y-4">
                    {beretSteps.map((step, index) => (
                        <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm border-l-4 border-yellow-500">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-yellow-500 text-white font-bold text-xl mr-4">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{step.title}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


// --- TURNOUT CHECKLIST ---
const TurnoutChecklist = () => {
    const items = [
        { id: 1, text: 'Uniform ironed, no creases' },
        { id: 2, text: 'Beret shaped, shaved, and clean' },
        { id: 3, text: 'Cap badge polished' },
        { id: 4, text: 'Boots polished to a high shine ("mirror finish")' },
        { id: 5, text: 'Belt brass polished' },
        { id: 6, text: 'Socks are black and pulled up' },
        { id: 7, text: 'Lanyard is clean and properly worn' },
        { id: 8, text: 'All badges and ranks are correctly placed' },
        { id: 9, text: 'Clean shave / Hair tied back neatly in a bun' },
        { id: 10, text: 'Name plate is clean and straight' },
    ];
    const [checkedItems, setCheckedItems] = useState({});

    const toggleCheck = (id) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 dark:text-white">Pre-Parade Turnout Checklist</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Use this checklist before every parade to ensure your turnout is immaculate.</p>
            <div className="space-y-3">
                {items.map(item => (
                    <label key={item.id} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={!!checkedItems[item.id]} 
                            onChange={() => toggleCheck(item.id)} 
                            className="h-5 w-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" 
                        />
                        <span className={`ml-3 text-gray-800 dark:text-gray-200 ${checkedItems[item.id] ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{item.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

// --- NEW RANK STRUCTURE GUIDE COMPONENT ---
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

// Icon for Sergeant (3 chevrons)
const SergeantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M4 18l6-6-6-6" />
        <path d="M10 18l6-6-6-6" />
        <path d="M16 18l6-6-6-6" />
    </svg>
);

// Icon for Corporal (2 chevrons)
const CorporalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M7 18l6-6-6-6" />
        <path d="M13 18l6-6-6-6" />
    </svg>
);

// Icon for Lance Corporal (1 chevron)
const LanceCorporalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M10 18l6-6-6-6" />
    </svg>
);

// Default icon for Cadet
const CadetIcon = () => (
    <div className="w-3 h-3 bg-white rounded-full"></div>
);

// --- Main Components ---

// const ChevronLeft = (props) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//         <path d="m15 18-6-6 6-6" />
//     </svg>
// );

const RankStructureGuide = ({ setPage }) => {
    // This effect runs once when the component mounts, scrolling the window to the top.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Added an 'icon' property to each rank object.
    const cadetRanks = [
        { name: 'Senior Under Officer (SUO)', description: 'Insignia: Three stars on shoulder straps. Commands the entire company.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Parade_Ground_Video%20(1).mp4?updatedAt=1755578171319', icon: <StarIcon /> },
        { name: 'Under Officer (UO)', description: 'Insignia: Two stars on shoulder straps. Assists in company command.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Parade_Ground_Video_Creation.mp4?updatedAt=1755578168474', icon: <StarIcon /> },
        { name: 'Sergeant (Sgt)', description: 'Insignia: Three chevrons. Responsible for a platoon.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Parade_Ground_Video__11.mp4?updatedAt=1755578167569', icon: <SergeantIcon /> },
        { name: 'Corporal (Cpl)', description: 'Insignia: Two chevrons. Responsible for a section.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Parade_Ground_Video_Generationuu.mp4?updatedAt=1755578164632', icon: <CorporalIcon /> },
        { name: 'Lance Corporal (L/Cpl)', description: 'Insignia: One chevron. The first leadership role.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Video_Generation.mp4?updatedAt=1755578170009', icon: <LanceCorporalIcon /> },
        { name: 'Cadet', description: 'Insignia: Plain shoulder straps. The foundational rank.', videoUrl: 'https://ik.imagekit.io/jywuh6xr2/NCC_Cadet_Parade_Ground_Video.mp4?updatedAt=1755578171496', icon: <CadetIcon /> }
    ];

    const TimelineItem = ({ rank, isLeft }) => (
        <div className="relative mb-8">
            {/* The content card with video and text */}
            <div className={`w-full md:w-5/12 ${isLeft ? 'md:ml-auto md:mr-10' : 'md:ml-10'} p-1`}>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
                    <video className="w-full rounded-md mb-3 shadow-md" src={rank.videoUrl} autoPlay loop muted playsInline aria-label={`${rank.name} demonstration video`} />
                    <h3 className={`text-xl font-bold text-gray-900 dark:text-white`}>{rank.name}</h3>
                    <p className={`mt-2 text-sm text-gray-700 dark:text-gray-300`}>{rank.description}</p>
                </div>
            </div>

            {/* The circular node and the horizontal connector line */}
            <div className={`absolute top-8 w-full md:w-auto ${isLeft ? 'right-auto md:right-1/2' : 'left-auto md:left-1/2'} flex items-center ${isLeft ? 'flex-row-reverse' : ''}`}>
                {/* Horizontal Line */}
                <div className="hidden md:block w-10 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
                {/* Node with Icon */}
                <div className="z-10 bg-green-700 w-8 h-8 rounded-full border-4 border-gray-100 dark:border-gray-900 flex items-center justify-center">
                    {rank.icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 dark:bg-gray-900 font-sans min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <button onClick={() => setPage('dashboard')} className="mb-8 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors duration-200">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                </button>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-12 text-center">
                    NCC Cadet Rank Structure
                </h2>

                <div className="relative">
                    {/* The vertical timeline bar */}
                    <div className="absolute left-4 md:left-1/2 w-1 h-full bg-gray-300 dark:bg-gray-700 transform md:-translate-x-1/2"></div>
                    
                    <div>
                        {cadetRanks.map((rank, index) => (
                            <TimelineItem key={rank.name} rank={rank} isLeft={index % 2 !== 0} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    // States from your main application
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [page, setPage] = useState('login'); // Default to login
    const [topicId, setTopicId] = useState(null);
    const [quizTopicId, setQuizTopicId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // NEW: State for the current drill page index is now in the main App component
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // States for the AI posture checker model
    const [model, setModel] = useState(null);
    const [modelReady, setModelReady] = useState(false);

    // --- EFFECTS ---

    // Theme toggling effect
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Tidio chat script effect
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://code.tidio.co/vi6bshjh0vlrhivlrmfe5bsbox6vcfic.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            const tidioElements = document.querySelectorAll('[id^="tidio-"]');
            tidioElements.forEach(el => el.remove());
            if (script.parentNode) {
                document.body.removeChild(script);
            }
        }
    }, []);

    // Firebase authentication and user data effect
    useEffect(() => {
        let unsubscribeFirestore = null;
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            if (unsubscribeFirestore) unsubscribeFirestore();
            if (currentUser) {
                currentUser.reload().then(() => {
                    const freshUser = auth.currentUser;
                    if (!freshUser.emailVerified) {
                        setUser(freshUser);
                        setUserData(null);
                        setPage('verifyEmail');
                        setLoading(false);
                    } else {
                        const docRef = doc(db, "users", freshUser.uid);
                        unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
                            if (docSnap.exists()) {
                                const fetchedUserData = docSnap.data();
                                setUserData(fetchedUserData);
                                setUser(freshUser);
                                if (page === 'login' || page === 'signup' || page === 'verifyEmail') {
                                    setPage(fetchedUserData.role === 'admin' ? 'admin' : 'dashboard');
                                }
                            } else {
                                signOut(auth);
                            }
                            setLoading(false);
                        }, (error) => {
                            console.error("Firestore snapshot error:", error);
                            signOut(auth);
                            setLoading(false);
                        });
                    }
                });
            } else {
                setUserData(null);
                setUser(null);
                setPage('login');
                setLoading(false);
            }
        });
        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) unsubscribeFirestore();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // AI Model loading effect
    useEffect(() => {
        const scriptUrls = [
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.10.0',
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.10.0',
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.10.0',
            'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3'
        ];

        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve(); return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.head.appendChild(script);
        });

        async function initialize() {
            try {
                for (const url of scriptUrls) { await loadScript(url); }
                console.log("All TensorFlow and Pose Detection scripts loaded.");
                if (window.poseDetection) {
                    const detectorConfig = { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
                    const detector = await window.poseDetection.createDetector(window.poseDetection.SupportedModels.MoveNet, detectorConfig);
                    setModel(() => detector);
                    setModelReady(true);
                    console.log("MoveNet model loaded successfully.");
                } else {
                     console.error("Pose detection library not found.");
                }
            } catch (error) {
                console.error("Error loading scripts or initializing the model:", error);
            }
        }
        
        if (!window.tfInitializing) {
            window.tfInitializing = true;
            initialize();
        }
    }, []);

    // --- PAGE RENDER LOGIC ---
    const renderPage = () => {
        if (loading) return <div className="flex-grow flex items-center justify-center dark:text-white"><p>Loading Application...</p></div>;
        if (!user) return page === 'signup' ? <SignupPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
        if (page === 'verifyEmail') return <VerifyEmailPage setPage={setPage} />;
        if (!userData) return <div className="flex-grow flex items-center justify-center dark:text-white"><p>Loading Cadet Data...</p></div>;

        switch (page) {
            case 'dashboard': return <Dashboard setPage={setPage} setTopicId={setTopicId} userData={userData} />;
            case 'topic': return <TopicView setPage={setPage} topicId={topicId} setQuizTopicId={setQuizTopicId} />;
            case 'quiz': return <Quiz setPage={setPage} topicId={quizTopicId} user={user} userData={userData} setUserData={setUserData} />;
            case 'profile': return <ProfilePage userData={userData} setUserData={setUserData}/>;
            case 'admin': return <AdminPage setPage={setPage}/>;
            case 'announcements': return <AnnouncementsPage setPage={setPage} />;
            case 'rifleSimulator': return <RifleSimulator setPage={setPage} />;
            case 'shootingSimulator': return <ShootingSimulator setPage={setPage} />;
            case 'mapChallenge': return <MapChallenge setPage={setPage} />;
            case 'eventCalendar': return <EventCalendar setPage={setPage} />;
            case 'campChecklists': return <CampChecklists setPage={setPage} />;
            case 'knotTyingGuide': return <KnotTyingGuide setPage={setPage} />;
            case 'firstAidSimulator': return <FirstAidSimulator setPage={setPage} />;
            case 'uniformGuide': return <UniformGuide setPage={setPage} />;
            case 'rankStructure': return <RankStructureGuide setPage={setPage} />;
            
            // --- Integrated Drill Guide & Checkers ---
            // UPDATED: Pass the currentPageIndex state and its setter to the DrillGuide
            case 'drillGuide': return <DrillGuide setPage={setPage} modelReady={modelReady} currentPageIndex={currentPageIndex} setCurrentPageIndex={setCurrentPageIndex} />;
            case 'postureChecker': return <SavdhanPostureChecker setPage={setPage} model={model} />;
            case 'vishramPostureChecker': return <VishramPostureChecker setPage={setPage} model={model} />;
            case 'dahineSalutePostureChecker': return <DahineSalutePostureChecker setPage={setPage} model={model} />;
            
            default: return <Dashboard setPage={setPage} setTopicId={setTopicId} userData={userData} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 font-sans">
            <Header setPage={setPage} user={user} setUser={setUser} userData={userData} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow">{renderPage()}</main>
            {user && user.emailVerified && <Footer />}
        </div>
    );
}
