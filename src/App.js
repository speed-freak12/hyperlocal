import React, { useState, useEffect, useRef } from 'react'; // All imports must be at the top
// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,     
    signInWithPopup,        
    RecaptchaVerifier,      
    signInWithPhoneNumber   
} from "firebase/auth";
// --- CSS Import ---
import './App.css';

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  // --- !!! PASTE YOUR KEY HERE !!! ---
  apiKey: "AIzaSyB_iCtl8qTCJAkUxKdyK_vd2DP-bFOvzoM", 
  // --- !!! THIS IS THE LINE TO FIX !!! ---
  authDomain: "hyperlocal-f6f64.firebaseapp.com",
  projectId: "hyperlocal-f6f64",
  storageBucket: "hyperlocal-f6f64.appspot.com",
  messagingSenderId: "819123093717",
  appId: "1:819123093717:web:48e1eb5519c9664155e25c",
  measurementId: "G-FLK587VYSW"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// --- 2. TEACHER DATA (Initial State) ---
const initialTeachersData = [
    // --- Karan S ---
    {
      id: 7, // Unique ID
      skill: 'Technology (Coding, Web Design)',
      name: 'Karan S',
      rating: 4.2, // Placeholder rating
      years: 2,   // Placeholder years
      location: 'Malleshwaram', // From previous info
      price: '₹1200/hr', // Placeholder price
      description: 'Tech enthusiast offering lessons in Coding and Web Design. Also skilled in Fitness (Yoga, Dance). Available weekend afternoons.',
      color: '#3498db', // Placeholder color (Blue)
      uid: 'karan_s_placeholder_uid' // Placeholder UID
    },
    // --- Rohan D M ---
    {
      id: 8, // Unique ID
      skill: 'Fitness (Yoga, Dance)', // Assumed skill
      name: 'Rohan D M',
      rating: 4.5, // Placeholder rating
      years: 3,   // Placeholder years
      location: 'Nagarbhavi', // From image_96a308.png
      price: '₹1000/hr', // Placeholder price
      description: 'Fitness instructor specializing in Yoga and Dance. Available weekend afternoons.',
      color: '#2ecc71', // Placeholder color (Green)
      uid: 'rohan_dm_placeholder_uid' // Placeholder UID
    },
    // --- Adityan ---
    {
      id: 9, // Unique ID
      skill: 'Photography', // Assumed skill
      name: 'Adityan',
      rating: 4.7, // Placeholder rating
      years: 4,   // Placeholder years
      location: 'Jp nagar', // From image_96a308.png
      price: '₹1500/hr', // Placeholder price
      description: 'Photography enthusiast teaching fundamentals and creative techniques. Available weekend afternoons.',
      color: '#e74c3c', // Placeholder color (Red)
      uid: 'adityan_placeholder_uid' // Placeholder UID
    },
];

// --- 3. COMPONENTS ---

/**
 * Notification Component
 */
const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  const isError = message.toLowerCase().includes('failed');
  const notificationClass = `notification-container ${isError ? 'error' : ''}`;
  return (
    <div className={notificationClass}>
      <p>{message}</p>
      <button className="notification-close-button" onClick={onClose}>&times;</button>
    </div>
  );
};

/**
 * Confirmation Modal
 */
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-button confirm" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
);

/**
 * NavBar Component
 */
const NavBar = ({ currentUser, onLogout, onHome, onDashboard, onSettings, onPageChange, currentPage, handleBrowseClick }) => {
  if (!currentUser) {
    return null; // Don't render NavBar if no user is logged in
  }
  return (
    <nav className="navbar">
      <h1 onClick={onHome}>hyperlocal.</h1>
      <div className="nav-links">
          <> {/* No need for ternary, only shows if logged in */}
            <button className="link-button" onClick={handleBrowseClick}>Browse</button>
            <button className="link-button" onClick={onDashboard}>Dashboard</button>
            <button className="nav-settings-button" onClick={onSettings}>Settings</button>
            <button className="nav-logout-button" onClick={onLogout}>Logout</button>
          </>
      </div>
    </nav>
  );
};

/**
 * Hero Section - Only shown when logged out, part of Home component
 */
const HeroSection = ({ onPageChange }) => ( // Pass onPageChange here
    <div className="hero-container">
      {/* --- ADDED PUBLIC NAV TO HERO --- */}
      <div className="hero-public-nav">
          <button className="auth-link-button" onClick={() => onPageChange('home')}>Browse Skills</button>
          <button className="auth-link-button" onClick={() => onPageChange('howItWorks')}>How It Works</button>
          <button className="auth-link-button" onClick={() => onPageChange('signup-teacher')}>Become a Teacher</button>
          <button className="auth-link-button login" onClick={() => onPageChange('login')}>Login</button>
      </div>

      <h2>Learn anything,<br />from anyone next door.</h2>
      <p>From cooking to coding, connect with local experts for face-to-face lessons. Learn a new skill, meet your neighbors.</p>
      <div className="hero-search-bar">
        <input type="text" placeholder="What do you want to learn" /><input type="text" placeholder="Enter your location" /><button>Search</button>
      </div>
    </div>
);

/**
 * ProfileSettings Component
 */
const ProfileSettings = ({ currentUser, onSave, onBack }) => {
    const [name, setName] = useState(currentUser?.displayName || currentUser?.email || '');
    const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || 'Koramangala');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const handleSave = () => { onSave({ ...currentUser, displayName: name, name: name, neighborhood: neighborhood, bio: bio }); };
  return (
    <div className="form-container profile-settings-form">
      <button className="back-button" onClick={onBack}>&larr; Back to Settings</button>
      <h2>My Profile Settings</h2>
      <label>Full Name:</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
      <label>My Neighborhood:</label><input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g., Koramangala" />
      <label>About Me (Bio):</label><textarea rows="5" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people..."></textarea>
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

/**
 * Dashboard Component
 */
const Dashboard = ({ currentUser, onBrowse, onCreateListing, teachers, confirmDelete }) => {
  const myTeachersListings = currentUser ? teachers.filter(teacher => teacher.uid === currentUser.uid) : [];
  if (!currentUser) { return <div className="loading-container">Loading...</div>; }
  return (
    <div className="dashboard-container">
      <h2>Welcome, {currentUser.displayName || currentUser.email}!</h2>
      <p>This is your personal dashboard. Manage your skills and messages here.</p>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>My Messages</h3>
          <div className="message-preview"><p><strong>Rohan Mehta</strong> (Yoga)</p><p>5 PM Tuesday good? ...</p></div>
          <div className="message-preview"><p><strong>Aisha Khan</strong> (Guitar)</p><p>Yes, I can teach G chord...</p></div>
          <button>View All Messages</button>
        </div>
        <div className="dashboard-card">
          {currentUser.role === 'teacher' ? (
            <>
              <h3>My Skill Listings</h3>
              {myTeachersListings.length > 0 ? (
                <ul className="my-listings-list">
                  {myTeachersListings.map(listing => ( <li key={listing.id}><span>{listing.skill}</span><button className="delete-listing-button" onClick={() => confirmDelete(listing.id, listing.skill)}>Delete</button></li> ))}
                </ul>
              ) : (<p>No listings yet.</p>)}
              <button onClick={onCreateListing} style={{ marginTop: '1rem' }}>+ Create New Skill</button>
            </>
          ) : (
            <><h3>My Learning</h3><p>Learning: <strong>Guitar Lessons</strong></p><button onClick={onBrowse}>Browse More</button></>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * Login Component
 */
const Login = ({ showSignUp, showNotification, onPageChange }) => { 
  const [loginMethod, setLoginMethod] = useState('email'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const recaptchaContainerRef = useRef(null); 

  // Setup reCAPTCHA verifier
  useEffect(() => {
    if (loginMethod === 'phone' && recaptchaContainerRef.current) {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("reCAPTCHA solved, proceeding with phone auth.");
                },
                'expired-callback': () => {
                    console.log("reCAPTCHA expired, please try again.");
                    showNotification("reCAPTCHA expired. Please try sending the OTP again.");
                }
            });
            window.recaptchaVerifier.render().catch(err => {
                console.error("Recaptcha render error:", err);
                showNotification("Could not initialize reCAPTCHA. Please refresh.");
            });
        }
    }
  }, [loginMethod, showNotification]); 

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      showNotification(`Google Sign-In Failed: ${error.message} 😞`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change handles redirect
    } catch (error) {
      console.error("Email Login Error:", error.code, error.message);
      let msg = "Login Failed. Check email/password.";
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) msg = "Incorrect email or password.";
      else if (error.code === 'auth/invalid-email') msg = "Please enter a valid email.";
      else if (error.code === 'auth/api-key-not-valid') msg = "Configuration error. Please contact support.";
      showNotification(msg + " 😞");
    } finally { setLoading(false); }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    showNotification("Sending OTP...");
    try {
      const verifier = window.recaptchaVerifier;
      const fullPhoneNumber = `+91${phone}`; 
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      showNotification("OTP Sent successfully! 📱");
    } catch (error) {
      console.error("Phone Sign-In Error (Send):", error);
      showNotification(`Failed to send OTP: ${error.message} 😞`);
      if (window.grecaptcha && window.recaptchaVerifier) {
          window.recaptchaVerifier.render().then(widgetId => {
              window.grecaptcha.reset(widgetId);
          });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!confirmationResult) {
      showNotification("Error: Please send OTP first. 😞");
      setLoading(false);
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      // Auth state change handles redirect
    } catch (error) {
      console.error("Phone Sign-In Error (Verify):", error);
      showNotification(`Invalid OTP. Please try again. 😞`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page-container login-page">
      <div className="auth-left-panel purple-gradient">
          <div className="auth-left-content">
              <h1 className="auth-main-title">Welcome to Hyperlocal</h1>
              <p className="auth-description">Connect locally, learn skills face-to-face.</p>
              <h2 className="auth-sub-title">Welcome back!</h2>
              <p>Sign in to access your account.</p>
          </div>
      </div>

      <div className="auth-right-panel light-bg">
          <div className="auth-form-container">
              <h2>Sign In</h2>

              <button className="auth-google-button" onClick={handleGoogleSignIn} disabled={loading}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                  Sign in with Google
              </button>

              <div className="auth-divider">OR</div>

              <div className="auth-method-toggle">
                  <button 
                    className={`toggle-button ${loginMethod === 'email' ? 'active' : ''}`} 
                    onClick={() => setLoginMethod('email')}>
                    Use Email
                  </button>
                  <button 
                    className={`toggle-button ${loginMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => setLoginMethod('phone')}>
                    Use Phone
                  </button>
              </div>

              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin}>
                  <div className="auth-input-group icon-left"><span>👤</span><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="auth-input-group icon-left"><span>🔒</span><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <div className="auth-options"><label className="auth-checkbox-label"><input type="checkbox" /> Remember me</label><button type="button" className="auth-link-button small-text">Forgot?</button></div>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
                </form>
              )}

              {loginMethod === 'phone' && !confirmationResult && (
                <form onSubmit={handleSendOtp}>
                  <div className="auth-input-group icon-left"><span>📞</span><input type="tel" placeholder="Phone Number (e.g. 9876543210)" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                  <p className="sub-label" style={{textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem'}}>Country code +91 will be added automatically.</p>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
                </form>
              )}
              {loginMethod === 'phone' && confirmationResult && (
                <form onSubmit={handleVerifyOtp}>
                  <p className="form-subtitle">Enter the 6-digit OTP sent to +91{phone}</p>
                  <div className="auth-input-group icon-left"><span>🔢</span><input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" /></div>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Sign In'}</button>
                  <button type="button" className="auth-link-button small-text" onClick={() => { setConfirmationResult(null); setOtp(''); }}>Resend OTP</button>
                </form>
              )}
              
              <p className="auth-switch-prompt small-text">New here? <button type="button" className="auth-link-button small-text" onClick={showSignUp}>Create Account</button></p>
          </div>
      </div>
      {/* Invisible reCAPTCHA container, referenced by ref */}
      <div ref={recaptchaContainerRef} id="recaptcha-container"></div>
    </div>
  );
};

/**
 * SignUp Component
 */
const SignUp = ({ showLogin, showNotification, onPageChange }) => { 
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const recaptchaContainerRef = useRef(null);

  // Setup reCAPTCHA verifier
  useEffect(() => {
    if (signupMethod === 'phone' && recaptchaContainerRef.current) {
        if (!window.recaptchaVerifierSignup) { // Use a different verifier instance
            window.recaptchaVerifierSignup = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response) => { console.log("reCAPTCHA solved"); },
                'expired-callback': () => {
                    console.log("reCAPTCHA expired, please try again.");
                    showNotification("reCAPTCHA expired. Please try sending the OTP again.");
                }
            });
            window.recaptchaVerifierSignup.render().catch(err => {
                 console.error("Signup Recaptcha render error:", err);
                 showNotification("Could not initialize reCAPTCHA. Please refresh.");
            });
        }
    }
  }, [signupMethod, showNotification]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { showNotification(`Google Sign-In Failed: ${error.message} 😞`); } 
    finally { setLoading(false); }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      showNotification("Account created! Welcome! 🎉");
    } catch (error) {
      let msg = `Sign Up Failed: ${error.message} 😞`;
      if (error.code === 'auth/email-already-in-use') msg = "Email already registered. Please login.";
      else if (error.code === 'auth/invalid-email') msg = "Please enter a valid email.";
      else if (error.code === 'auth/weak-password') msg = "Password needs 6+ characters.";
      showNotification(msg);
    } finally { setLoading(false); }
  };
  
  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    showNotification("Sending OTP...");
    try {
      const verifier = window.recaptchaVerifierSignup; // Use signup verifier
      const fullPhoneNumber = `+91${phone}`; 
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      showNotification("OTP Sent successfully! 📱");
    } catch (error) {
      console.error("Phone Sign-Up Error (Send):", error);
      showNotification(`Failed to send OTP: ${error.message} 😞`);
      if (window.grecaptcha && window.recaptchaVerifierSignup) {
          window.recaptchaVerifierSignup.render().then(widgetId => {
              window.grecaptcha.reset(widgetId);
          });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!confirmationResult) {
      showNotification("Error: Please send OTP first. 😞");
      setLoading(false); return;
    }
    try {
      const result = await confirmationResult.confirm(otp);
      if (fullName && result.user) {
        await updateProfile(result.user, { displayName: fullName });
      }
      showNotification("Account created! Welcome! 🎉");
    } catch (error) {
      console.error("Phone Sign-Up Error (Verify):", error);
      showNotification(`Invalid OTP. Please try again. 😞`);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="auth-page-container signup-page">
      <div className="auth-left-panel purple-gradient">
          <div className="auth-left-content">
              <h1 className="auth-main-title">Join Hyperlocal</h1>
              <p className="auth-description">Start your learning journey today.</p>
          </div>
      </div>
      <div className="auth-right-panel light-bg">
          <div className="auth-form-container">
              <h2>Create Learner Account</h2>

              <button type="button" className="auth-google-button" onClick={handleGoogleSignIn} disabled={loading}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                  Sign up with Google
              </button>
              <div className="auth-divider">OR</div>

              <div className="auth-method-toggle">
                  <button 
                    className={`toggle-button ${signupMethod === 'email' ? 'active' : ''}`} 
                    onClick={() => setSignupMethod('email')}>
                    Sign up with Email
                  </button>
                  <button 
                    className={`toggle-button ${signupMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => setSignupMethod('phone')}>
                    Sign up with Phone
                  </button>
              </div>

              {signupMethod === 'email' && (
                <form onSubmit={handleEmailSignUp}>
                  <div className="auth-input-group icon-left"><span>👤</span><input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                  <div className="auth-input-group icon-left"><span>✉️</span><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="auth-input-group icon-left"><span>🔒</span><input type="password" placeholder="Password (min. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6"/></div>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
                </form>
              )}

              {signupMethod === 'phone' && !confirmationResult && (
                <form onSubmit={handleSendOtp}>
                  <div className="auth-input-group icon-left"><span>👤</span><input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                  <div className="auth-input-group icon-left"><span>📞</span><input type="tel" placeholder="Phone Number (e.g. 9876543210)" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                  <p className="sub-label" style={{textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem'}}>Country code +91 will be added automatically.</p>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
                </form>
              )}
              {signupMethod === 'phone' && confirmationResult && (
                 <form onSubmit={handleVerifyOtp}>
                  <p className="form-subtitle">Welcome, {fullName}! Enter the 6-digit OTP sent to +91{phone}</p>
                  <div className="auth-input-group icon-left"><span>🔢</span><input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" /></div>
                  <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Verify & Create Account' : 'Verify & Create Account'}</button>
                  <button type="button" className="auth-link-button small-text" onClick={() => { setConfirmationResult(null); setOtp(''); }}>Resend OTP</button>
                </form>
              )}
              
              <p className="auth-switch-prompt small-text">Have an account? <button type="button" className="auth-link-button small-text" onClick={showLogin}>Sign In</button></p>
          </div>
      </div>
      {/* Invisible reCAPTCHA container for phone signup */}
      <div ref={recaptchaContainerRef} id="recaptcha-container-signup"></div>
    </div>
  );
};

/**
 * TeacherApplicationForm
 */
const TeacherApplicationForm = ({ showLogin, showNotification, onPageChange }) => { 
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // ... state for other fields

  const handleSubmit = async () => {
    setLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification("Application submitted! Reviewing soon. ✨");
        showLogin(); 
    } catch (error) { console.error("Teacher App Error:", error); showNotification(`Submit Failed: ${error.message} 😞`); }
    finally { setLoading(false); }
  };
  const skills = [ 'Music', 'Tech', 'Cooking', 'Arts', 'Fitness', 'Languages', 'Gardening', 'Academic', 'Sports']; 
  return (
    <div className="teacher-form-container">
       <div className="teacher-form-public-nav">
          <button className="auth-link-button" onClick={() => onPageChange('home')}>Browse Skills</button>
          <button className="auth-link-button" onClick={() => onPageChange('howItWorks')}>How It Works</button>
          <button className="auth-link-button" onClick={showLogin}>Login</button>
        </div>

      <div className="teacher-form-content">
        {/* Progress Bar */}
        <div className="progress-bar">{[1,2,3,4].map(num => (<React.Fragment key={num}><div className={`progress-step ${step >= num ? 'active' : ''}`}><span>{num}</span><p>{['Personal','Skills','Details','Review'][num-1]}</p></div>{num < 4 && <div className={`progress-line ${step >= num + 1 ? 'active' : ''}`}></div>}</React.Fragment>))}</div>
        {/* Steps */}
        {step === 1 && (<div className="form-step-content"><h2 className="form-title">Personal Info</h2><div className="input-group"><input type="text" id="name" placeholder=" " required /><label htmlFor="name">Name</label></div><div className="input-group"><input type="email" id="email" placeholder=" " value={email} onChange={e=>setEmail(e.target.value)} required /><label htmlFor="email">Email</label></div><div className="input-group"><input type="password" id="password" placeholder=" " value={password} onChange={e=>setPassword(e.target.value)} required minLength="6"/><label htmlFor="password">Password</label></div><div className="input-group"><input type="tel" id="phone" placeholder=" " required /><label htmlFor="phone">Phone</label></div><div className="input-group"><input type="text" id="neighborhood" placeholder=" " required /><label htmlFor="neighborhood">Neighborhood</label></div><div className="form-navigation"><button className="nav-button-primary" onClick={() => setStep(2)}>Next</button></div></div>)}
        {step === 2 && (<div className="form-step-content"><h2 className="form-title">Skills</h2><div className="skill-options-grid">{skills.map((skill, index) => (<div className="skill-option" key={index}><input type="checkbox" id={`skill-${index}`} /><label htmlFor={`skill-${index}`}>{skill}</label></div>))}</div><div className="input-group other-skill-input"><input type="text" id="other-skill" placeholder=" " /><label htmlFor="other-skill">Other Skill</label></div><div className="form-navigation"><button className="nav-button-secondary" onClick={() => setStep(1)}>Back</button><button className="nav-button-primary" onClick={() => setStep(3)}>Next</button></div></div>)}
        {step === 3 && (<div className="form-step-content"><h2 className="form-title">Details</h2><div className="input-group text-area-group"><textarea id="qualifications" rows="4" placeholder=" "></textarea><label htmlFor="qualifications">Qualifications</label></div><div className="upload-section"><p>Upload file (Optional)</p><button className="upload-button">Add File</button></div><div className="radio-group"><p className="input-group-label">Compensation?</p>{['Monetary','Skill Exchange','Both'].map(o=>(<div className="radio-option" key={o}><input type="radio" id={o} name="compensation" /><label htmlFor={o}>{o}</label></div>))}</div><div className="radio-group"><p className="input-group-label">Availability?</p>{['Weekday Mornings','Weekday Afternoons','Weekday Evenings','Weekend Mornings','Weekend Afternoons'].map(o=>(<div className="radio-option" key={o}><input type="radio" id={o} name="availability" /><label htmlFor={o}>{o}</label></div>))}</div><div className="form-navigation"><button className="nav-button-secondary" onClick={() => setStep(2)}>Back</button><button className="nav-button-primary" onClick={() => setStep(4)}>Next</button></div></div>)}
        {step === 4 && (<div className="form-step-content text-center"><h2 className="form-title">Review</h2><p><em>(Review section)</em></p><div className="final-submit-icon">✨</div><div className="form-navigation"><button className="nav-button-secondary" onClick={() => setStep(3)}>Back</button><button className="submit-button" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button></div></div>)}
        <p className="form-login-prompt">Have an account? <button className="link-button" onClick={showLogin}>Login</button></p>
      </div>
    </div>
  );
};


/**
 * Home Component
 */
const Home = ({ teachers, onSelectTeacher, onCreateListing, currentUser, onPageChange }) => { 
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTeachers = teachers.filter(teacher =>
      teacher.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.description && teacher.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <>
      {!currentUser && <HeroSection onPageChange={onPageChange} />} 
      <div className="browse-container">
        {currentUser && <h2>Welcome, {currentUser.displayName || currentUser.email}! Start learning locally.</h2>}
        <div className="browse-search-bar"><input type="text" placeholder="Search skills or teachers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        <h3 id="featured-skills" className="featured-skills-title">{searchTerm ? `Results for "${searchTerm}"` : "Featured Skills Nearby"}</h3>
        {currentUser?.role === 'teacher' && (<button onClick={onCreateListing} className="teach-skill-button">+ Create Skill Listing</button>)}
        <div className="skill-list">
          {filteredTeachers.length > 0 ? (
              filteredTeachers.map(teacher => (
                <div key={teacher.id} className="skill-card" onClick={() => onSelectTeacher(teacher)}>
                  <div className="skill-card-top" style={{ backgroundColor: teacher.color }}>{teacher.skill}</div>
                  <div className="skill-card-content">
                    <h3>{teacher.name}</h3>
                    <div className="skill-card-details">
                      <p>⭐ {teacher.rating} &bull; {teacher.years} yrs</p>
                      <p>📍 {teacher.location}</p>
                      <p>💰 {teacher.price}</p>
                    </div>
                  </div>
                </div>
              ))
          ) : (<p className="no-results-message">No skills found matching your search.</p>)}
        </div>
      </div>
    </>
);
};

/**
 * Profile Component
 */
const Profile = ({ teacher, onBack, onMessage }) => {
  if (!teacher) return <div className="profile-view"><p>Teacher not found.</p><button className="back-button" onClick={onBack}>&larr; Back</button></div>;
  return (
    <div className="profile-view">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>{teacher.name}</h2><h3>Teaching: {teacher.skill}</h3>
      <p className="profile-description">{teacher.description}</p>
      <p><b>Compensation:</b> {teacher.compensation || teacher.price}</p>
      <p><b>Neighborhood:</b> {teacher.location}</p>
      <button onClick={() => onMessage(teacher)}>Message {teacher.name}</button>
    </div>
  );
};

/**
 * CreateListing Component
 */
const CreateListing = ({ onBack, onPublish, currentUser, showNotification }) => {
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [compensation, setCompensation] = useState('');
  const handlePublish = () => {
    if (!skill || !description || !compensation) { showNotification("Please fill all fields. ⚠️"); return; }
    const teacherName = currentUser.displayName || currentUser.email || 'Teacher';
    const newSkill = { id: Date.now(), uid: currentUser.uid, skill, name: teacherName, rating: 4.0 + Math.random(), years: Math.floor(Math.random()*15), location: currentUser.neighborhood || 'Local', price: compensation, description, color: ['#5cb85c', '#a054a0', '#e48a3e', '#8e44ad', '#3498db', '#e67e22'][Math.floor(Math.random()*6)] };
    onPublish(newSkill);
  };
  return (
    <div className="form-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>Create Skill Listing</h2>
      <label htmlFor="s-teach">Skill:</label><input id="s-teach" value={skill} onChange={e=>setSkill(e.target.value)} />
      <label htmlFor="s-desc">Description:</label><textarea id="s-desc" value={description} onChange={e=>setDescription(e.target.value)} />
      <label htmlFor="s-comp">Compensation:</label><input id="s-comp" value={compensation} onChange={e=>setCompensation(e.target.value)} />
      <button onClick={handlePublish}>Publish</button>
    </div>
  );
};

/**
 * Messaging Component
 */
const Messaging = ({ teacher, onBack }) => {
  if (!teacher) return <div className="messaging-container"><p>Chat unavailable.</p><button onClick={onBack}>&larr; Back</button></div>;
  return (
    <div className="messaging-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h3>Chat with {teacher.name}</h3>
      <div className="chat-window">
        <div className="message other"><p>Hi! Interested in {teacher.skill} lessons.</p></div>
        <div className="message self"><p>Hello! When are you free?</p></div>
      </div>
      <div className="message-input"><input placeholder="Type..." /><button>Send</button></div>
    </div>
  );
};

/**
 * SettingsMenu Component
 */
const SettingsMenu = ({ onPageChange, onLogout }) => (
    <div className="form-container settings-menu">
      <h2>Settings</h2>
      <button className="settings-option-button" onClick={() => onPageChange('profileSettings')}>My Profile</button>
      <button className="settings-option-button" onClick={() => onPageChange('history')}>My History</button>
      <button className="settings-option-button" onClick={() => onPageChange('paymentsComingSoon')}>Payments <span className="coming-soon">(Soon)</span></button>
      <div className="settings-divider"></div>
      <button className="settings-option-button logout-button" onClick={onLogout}>Logout</button>
    </div>
);

/**
 * History Component
 */
const History = ({ onBack }) => (
    <div className="dashboard-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>History</h2>
      <div className="history-list">
        <div className="history-item"><h3>Guitar</h3><p>Completed</p></div>
        <div className="history-item"><h3>Yoga</h3><p>Ongoing</p></div>
      </div>
    </div>
);

/**
 * PaymentsComingSoon Component
 */
const PaymentsComingSoon = ({ onBack }) => (
    <div className="form-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>Payments</h2><p className="text-center">Coming soon!</p>
      <div className="text-center" style={{marginTop:'20px'}}><span role="img" aria-label="wip" style={{fontSize:'3em'}}>🚧</span></div>
    </div>
);

/**
 * HowItWorks Component
 */
const HowItWorks = ({ onBack }) => (
    <div className="how-it-works-page">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2 className="how-it-works-title">How It Works</h2>
      <p className="how-it-works-subtitle">Simple steps.</p>
      <div className="how-it-works-cards">
        <div className="how-it-works-card"><div className="card-number">1</div><h3>Find</h3><p>Browse skills.</p></div>
        <div className="how-it-works-card"><div className="card-number">2</div><h3>Connect</h3><p>Message teacher.</p></div>
        <div className="how-it-works-card"><div className="card-number">3</div><h3>Learn</h3><p>Meet locally.</p></div>
      </div>
    </div>
);


// --- 4. MAIN APP COMPONENT ---
function App() {
  const [page, setPage] = useState('login');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [teachers, setTeachers] = useState(initialTeachersData);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrollToFeatured, setScrollToFeatured] = useState(false);


  const showNotification = (message) => { setNotification(message); };
  const closeNotification = () => { setNotification(null); };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Assign a default 'learner' role based on simple logic
        // In a real app, fetch role from Firestore based on user.uid
        const assumedRole = user.email?.includes('@teacher.com') ? 'teacher' : 'learner'; // Example: email determines role
        const userWithRole = {
             uid: user.uid,
             email: user.email,
             displayName: user.displayName || user.email?.split('@')[0] || 'User',
             role: assumedRole, // Use assumed role
             name: user.displayName || user.email?.split('@')[0] || 'User',
             // Placeholders - fetch these from Firestore profile
             neighborhood: 'Koramangala',
             bio: 'Welcome!'
         };
        setCurrentUser(userWithRole);
        // Redirect to dashboard only if coming from auth pages or initial load
        // Ensure authLoading check happens correctly
        if (page === 'login' || page === 'signup' || authLoading) {
             setPage('dashboard');
        }
      } else {
        setCurrentUser(null);
        if (!['login', 'signup', 'signup-teacher', 'home', 'howItWorks'].includes(page)) {
             setPage('login');
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  useEffect(() => {
      if (scrollToFeatured && page === 'home') {
          const featuredElement = document.getElementById('featured-skills');
          if (featuredElement) {
              featuredElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setScrollToFeatured(false);
      }
  }, [scrollToFeatured, page]);


  const handleLogout = async () => { try { await signOut(auth); showNotification("Logged out."); setPage('login'); /* Explicitly go to login */ } catch (e) { showNotification(`Logout Failed: ${e.message}`); } };
  const handleSelectTeacher = (t) => { setSelectedTeacher(t); setPage('profile'); };
  const handleMessage = (t) => { setSelectedTeacher(t); setPage('messaging'); };
  const handleProfileSave = (updatedUser) => {
      // In real app: Update Firestore AND potentially Auth profile
      setCurrentUser(updatedUser); setPage('settings'); showNotification("Profile updated! ✅");
      if(auth.currentUser && auth.currentUser.displayName !== updatedUser.displayName) {
          updateProfile(auth.currentUser, { displayName: updatedUser.displayName }).catch(e => console.error("Error updating profile name:", e));
      }
      setTeachers(prev => prev.map(t => t.uid === currentUser.uid ? { ...t, name: updatedUser.displayName } : t ));
  };
  const handlePublishListing = (newListing) => { setTeachers(prev => [newListing, ...prev]); setPage('dashboard'); showNotification("Skill published! 🎉"); };
  const handleConfirmDelete = (id, skillName) => { setItemToDelete({ id, name: skillName }); setShowConfirmModal(true); };
  const handleDeleteListing = () => { if (itemToDelete) { setTeachers(prev => prev.filter(t => t.id !== itemToDelete.id)); showNotification(`"${itemToDelete.name}" deleted.`); setItemToDelete(null); } setShowConfirmModal(false); };
  const handleCancelDelete = () => { setItemToDelete(null); setShowConfirmModal(false); };

  const handleBrowseClick = () => {
      if (page === 'home') {
          const featuredElement = document.getElementById('featured-skills');
          if (featuredElement) {
              featuredElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      } else {
          setPage('home');
          setScrollToFeatured(true);
      }
  };


  const commonProps = { currentUser, onBrowse: handleBrowseClick, onCreateListing: () => setPage('createListing'), teachers, confirmDelete: handleConfirmDelete };

  const renderPage = () => {
    if (authLoading) return <div className="loading-container">Loading...</div>;

    // Public Routes
    if (page === 'howItWorks') return <HowItWorks onBack={() => setPage(currentUser ? 'dashboard' : 'home')} />;
     // Show Public home only if NOT logged in
    if (page === 'home' && !currentUser) return <Home onPageChange={setPage} teachers={teachers} onSelectTeacher={handleSelectTeacher} currentUser={currentUser} onCreateListing={() => setPage('createListing')} />;

    // Auth Routes
    if (!currentUser) {
      switch(page) {
        case 'login': return <Login onPageChange={setPage} showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
        case 'signup': return <SignUp onPageChange={setPage} showLogin={() => setPage('login')} showNotification={showNotification}/>;
        case 'signup-teacher': return <TeacherApplicationForm onPageChange={setPage} showLogin={() => setPage('login')} showNotification={showNotification} />;
        default: return <Login onPageChange={setPage} showSignUp={() => setPage('signup')} showNotification={showNotification}/>; // Default to login
      }
    }
    // Logged In Routes
    switch (page) {
      case 'dashboard': return <Dashboard {...commonProps} />;
      case 'settings': return <SettingsMenu onPageChange={setPage} onLogout={handleLogout} />;
      case 'profileSettings': return <ProfileSettings currentUser={currentUser} onSave={handleProfileSave} onBack={() => setPage('settings')} />;
      case 'history': return <History onBack={() => setPage('settings')} />;
      case 'paymentsComingSoon': return <PaymentsComingSoon onBack={() => setPage('settings')} />;
      case 'profile': const teacherDetails = teachers.find(t => t.id === selectedTeacher?.id); return <Profile teacher={teacherDetails} onBack={() => setPage('home')} onMessage={handleMessage} />;
      case 'createListing': return <CreateListing onBack={() => setPage('dashboard')} onPublish={handlePublishListing} currentUser={currentUser} showNotification={showNotification} />;
      case 'messaging': const msgTeacher = teachers.find(t => t.id === selectedTeacher?.id); return <Messaging teacher={msgTeacher} onBack={() => setPage('profile')} />;
      case 'home': // Logged-in home
        return <Home onPageChange={setPage} teachers={teachers} onSelectTeacher={handleSelectTeacher} currentUser={currentUser} onCreateListing={() => setPage('createListing')} />;
      default: return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="App">
      <Notification message={notification} onClose={closeNotification} />
      {showConfirmModal && itemToDelete && (<ConfirmationModal message={`Delete "${itemToDelete.name}"?`} onConfirm={handleDeleteListing} onCancel={handleCancelDelete} />)}
      <NavBar
          currentUser={currentUser}
          onLogout={handleLogout}
          onHome={handleBrowseClick} // Use scroll handler for Home/Logo click too
          onDashboard={() => setPage('dashboard')}
          onSettings={() => setPage('settings')}
          onPageChange={setPage}
          currentPage={page}
          handleBrowseClick={handleBrowseClick} // Pass scroll handler
      />
      {/* --- ADDED a wrapper div for reCAPTCHA elements --- */}
      <div id="recaptcha-wrapper">
          <div id="recaptcha-container"></div>
          <div id="recaptcha-container-signup"></div>
      </div>
      <main className={['login', 'signup', 'signup-teacher'].includes(page) ? 'auth-content' : 'content'}>
        {renderPage()}
      </main>
    </div>
  );
}

// Ensure the export is at the very end and top level
export default App;

