import React, { useState, useEffect } from 'react';
// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile // Import updateProfile if you want to set displayName on signup
} from "firebase/auth";
// --- CSS Import ---
import './App.css';

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyB_iCtl8qTCJAkUxKdyk_vd2DP-bF0vzoM", // <-- Key from your image
  authDomain: "hyperlocal-f6f64.firebaseapp.com",
  projectId: "hyperlocal-f6f64",
  storageBucket: "hyperlocal-f6f64.appspot.com",
  messagingSenderId: "819123093717",
  appId: "1:819123093717:web:48e1eb5519c9664155e25c",
  measurementId: "G-FLK587VYSW" // Optional
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the Auth service instance


// --- 2. DUMMY DATA (Initial State - Kept for skill listings) ---
const initialTeachersData = [
    { id: 1, skill: 'Biology', name: 'Pooja Gupta', rating: 4.1, years: 12, location: 'Electronic City', price: '₹1100/hr', description: 'Experienced Biology tutor...', color: '#5cb85c' },
    { id: 2, skill: 'Android Development', name: 'Ria Mahajan', rating: 3.6, years: 14, location: 'Indiranagar', price: '₹4350/hr', description: 'Professional Android developer...', color: '#a054a0' },
    { id: 3, skill: 'Machine Learning', name: 'Kunal Batra', rating: 4.3, years: 2, location: 'Ulsoor', price: '₹3500/hr', description: 'Data Scientist specializing...', color: '#e48a3e' },
    { id: 33, skill: 'Digital Marketing Basics', name: 'Priya Singh', rating: 4.5, years: 3, location: 'Koramangala', price: '₹1500/hr', description: 'Learn the fundamentals...', color: '#3498db' },
    { id: 4, skill: 'Cricket Coaching', name: 'Nisha Iyer', rating: 4.9, years: 14, location: 'Basavanagudi', price: '₹1500/hr', description: 'Former state-level cricketer...', color: '#8e44ad' },
    { id: 5, skill: 'Photography', name: 'Aditya Singh', rating: 4.5, years: 8, location: 'Jayanagar', price: '₹1800/hr', description: 'Professional photographer...', color: '#3498db' },
    { id: 6, skill: 'Baking', name: 'Meena Sharma', rating: 4.8, years: 10, location: 'Koramangala', price: '₹900/hr or trade', description: 'Home baker offering classes...', color: '#e67e22' },
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
const NavBar = ({ currentUser, onLogout, onHome, onDashboard, onSettings, onPageChange, currentPage }) => {
  if (!currentUser && (currentPage === 'login' || currentPage === 'signup' || currentPage === 'signup-teacher')) {
    return null;
  }
  return (
    <nav className="navbar">
      <h1 onClick={onHome}>hyperlocal.</h1>
      <div className="nav-links">
        {currentUser ? (
          <>
            <button className="link-button" onClick={onHome}>Browse</button>
            <button className="link-button" onClick={onDashboard}>Dashboard</button>
            <button className="nav-settings-button" onClick={onSettings}>Settings</button>
            <button className="nav-logout-button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="link-button" onClick={onHome}>Browse</button>
            <button className="link-button" onClick={() => onPageChange('howItWorks')}>How It Works</button>
            <button className="nav-button-primary" onClick={() => onPageChange('signup-teacher')}>Become a Teacher</button>
            {(currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'signup-teacher') && (
              <button className="nav-login-button" onClick={() => onPageChange('login')}>Login</button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

/**
 * Hero Section
 */
const HeroSection = () => (
    <div className="hero-container">
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
const Login = ({ showSignUp, showNotification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFirebaseLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change handles redirect
    } catch (error) {
      console.error("Login Error:", error.code, error.message);
      let msg = "Login Failed. Check email/password.";
      if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) msg = "Incorrect email or password."; // Added invalid-credential
      else if (error.code === 'auth/invalid-email') msg = "Please enter a valid email.";
      else if (error.code === 'auth/api-key-not-valid') msg = "Configuration error. Please contact support."; // More specific error
      showNotification(msg + " 😞");
    } finally { setLoading(false); }
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
          <form className="auth-form-container" onSubmit={handleFirebaseLogin}>
              <h2>Sign In</h2>
              <div className="auth-input-group icon-left"><span>👤</span><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="auth-input-group icon-left"><span>🔒</span><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <div className="auth-options"><label className="auth-checkbox-label"><input type="checkbox" /> Remember me</label><button type="button" className="auth-link-button small-text">Forgot?</button></div>
              <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
              <p className="auth-switch-prompt small-text">New here? <button type="button" className="auth-link-button small-text" onClick={showSignUp}>Create Account</button></p>
          </form>
      </div>
    </div>
  );
};

/**
 * SignUp Component
 */
const SignUp = ({ showLogin, showNotification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Added Full Name
  const [loading, setLoading] = useState(false);
  const handleFirebaseSignUp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name immediately after signup
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      showNotification("Account created! Welcome! 🎉");
      // Auth state change handles redirect
    } catch (error) {
      console.error("Sign Up Error:", error.code, error.message);
      let msg = `Sign Up Failed: ${error.message} 😞`;
      if (error.code === 'auth/email-already-in-use') msg = "Email already registered. Please login.";
      else if (error.code === 'auth/invalid-email') msg = "Please enter a valid email.";
      else if (error.code === 'auth/weak-password') msg = "Password needs 6+ characters.";
      showNotification(msg);
    } finally { setLoading(false); }
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
          <form className="auth-form-container" onSubmit={handleFirebaseSignUp}>
              <h2>Create Learner Account</h2>
              <div className="auth-input-group icon-left"><span>👤</span><input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
              <div className="auth-input-group icon-left"><span>✉️</span><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="auth-input-group icon-left"><span>🔒</span><input type="password" placeholder="Password (min. 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6"/></div>
              <button type="submit" className="auth-submit-button large" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              <p className="auth-switch-prompt small-text">Have an account? <button type="button" className="auth-link-button small-text" onClick={showLogin}>Sign In</button></p>
          </form>
      </div>
    </div>
  );
};

/**
 * TeacherApplicationForm
 */
const TeacherApplicationForm = ({ showLogin, showNotification }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Add state for other fields...

  const handleSubmit = async () => {
    setLoading(true);
    try {
        // Real App: Create user, THEN save form data to Firestore
        // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // const user = userCredential.user;
        // await setDoc(doc(db, "users", user.uid), { /* form data, role: 'teacher' */ });
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification("Application submitted! Reviewing soon. ✨");
        showLogin(); // Go to login after applying
    } catch (error) { console.error("Teacher App Error:", error); showNotification(`Submit Failed: ${error.message} 😞`); }
    finally { setLoading(false); }
  };
  const skills = [ 'Music', 'Tech', 'Cooking', 'Arts', 'Fitness', 'Languages', 'Gardening', 'Academic', 'Sports']; // Abbreviated
  return (
    <div className="teacher-form-container">
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
const Home = ({ teachers, onSelectTeacher, onCreateListing, currentUser }) => (
    <>
      {!currentUser && <HeroSection />}
      <div className="browse-container">
        {currentUser && <h2>Welcome, {currentUser.displayName || currentUser.email}! Start learning locally.</h2>}
        <h3 className="featured-skills-title">Featured Skills Nearby</h3>
        {currentUser?.role === 'teacher' && (<button onClick={onCreateListing} className="teach-skill-button">+ Create Skill Listing</button>)}
        <div className="skill-list">
          {teachers && teachers.map(teacher => (
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
          ))}
        </div>
      </div>
    </>
);

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

  const showNotification = (message) => { setNotification(message); };
  const closeNotification = () => { setNotification(null); };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Assign a default 'learner' role if no specific logic exists yet
        const userWithRole = { 
            uid: user.uid, 
            email: user.email, 
            displayName: user.displayName || user.email?.split('@')[0] || 'User', 
            role: 'learner', // Default role
            name: user.displayName || user.email?.split('@')[0] || 'User', 
            neighborhood: 'Koramangala', // Placeholder
            bio: 'Welcome!' // Placeholder
        };
        // TODO: Add logic here to fetch role/profile from Firestore based on user.uid
        // Example: check if user.uid exists in a 'teachers' collection

        setCurrentUser(userWithRole);
        // Redirect to dashboard only if the state change is from logged-out to logged-in
        if (!currentUser) { // Check previous state
             setPage('dashboard');
        }
      } else {
        setCurrentUser(null);
        // Only redirect if not already on a public/auth page
        if (!['login', 'signup', 'signup-teacher', 'home', 'howItWorks'].includes(page)) {
             setPage('login');
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once


  const handleLogout = async () => { try { await signOut(auth); showNotification("Logged out."); } catch (e) { showNotification(`Logout Failed: ${e.message}`); } };
  const handleSelectTeacher = (t) => { setSelectedTeacher(t); setPage('profile'); };
  const handleMessage = (t) => { setSelectedTeacher(t); setPage('messaging'); };
  const handleProfileSave = (updatedUser) => {
      setCurrentUser(updatedUser); setPage('settings'); showNotification("Profile updated! ✅");
      if(auth.currentUser && auth.currentUser.displayName !== updatedUser.displayName) {
          updateProfile(auth.currentUser, { displayName: updatedUser.displayName }).catch(e => console.error("Error updating profile name:", e));
      }
      // Update name in local teacher list if they are a teacher
      setTeachers(prev => prev.map(t => t.uid === currentUser.uid ? { ...t, name: updatedUser.displayName } : t ));
  };
  const handlePublishListing = (newListing) => { setTeachers(prev => [newListing, ...prev]); setPage('dashboard'); showNotification("Skill published! 🎉"); };
  const handleConfirmDelete = (id, skillName) => { setItemToDelete({ id, name: skillName }); setShowConfirmModal(true); };
  const handleDeleteListing = () => { if (itemToDelete) { setTeachers(prev => prev.filter(t => t.id !== itemToDelete.id)); showNotification(`"${itemToDelete.name}" deleted.`); setItemToDelete(null); } setShowConfirmModal(false); };
  const handleCancelDelete = () => { setItemToDelete(null); setShowConfirmModal(false); };

  const commonProps = { currentUser, onBrowse: () => setPage('home'), onCreateListing: () => setPage('createListing'), teachers, confirmDelete: handleConfirmDelete };

  const renderPage = () => {
    if (authLoading) return <div className="loading-container">Loading...</div>;

    // Public Routes (Accessible always)
    if (page === 'howItWorks') return <HowItWorks onBack={() => setPage(currentUser ? 'dashboard' : 'home')} />;
    if (page === 'home' && !currentUser) return <Home teachers={teachers} onSelectTeacher={handleSelectTeacher} currentUser={currentUser} onCreateListing={() => setPage('createListing')} />;

    // Auth Routes (Show only if logged out)
    if (!currentUser) {
      switch(page) {
        case 'login': return <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
        case 'signup': return <SignUp showLogin={() => setPage('login')} showNotification={showNotification}/>;
        case 'signup-teacher': return <TeacherApplicationForm showLogin={() => setPage('login')} showNotification={showNotification} />;
        default: return <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>; // Default to login
      }
    }
    // Logged In Routes
    switch (page) {
      case 'dashboard': return <Dashboard {...commonProps} />;
      case 'settings': return <SettingsMenu onPageChange={setPage} onLogout={handleLogout} />;
      case 'profileSettings': return <ProfileSettings currentUser={currentUser} onSave={handleProfileSave} onBack={() => setPage('settings')} />;
      case 'history': return <History onBack={() => setPage('settings')} />;
      case 'paymentsComingSoon': return <PaymentsComingSoon onBack={() => setPage('settings')} />;
      case 'profile': const teacherDetails = teachers.find(t => t.id === selectedTeacher?.id); return <Profile teacher={teacherDetails} onBack={() => setPage(currentUser ? 'home' : 'login')} onMessage={handleMessage} />; // Go back home if logged in
      case 'createListing': return <CreateListing onBack={() => setPage('dashboard')} onPublish={handlePublishListing} currentUser={currentUser} showNotification={showNotification} />;
      case 'messaging': const msgTeacher = teachers.find(t => t.id === selectedTeacher?.id); return <Messaging teacher={msgTeacher} onBack={() => setPage('profile')} />;
      case 'home': // Logged-in home shows browse page
        return <Home teachers={teachers} onSelectTeacher={handleSelectTeacher} currentUser={currentUser} onCreateListing={() => setPage('createListing')} />;
      default: return <Dashboard {...commonProps} />; // Default to dashboard if logged in
    }
  };

  return (
    <div className="App">
      <Notification message={notification} onClose={closeNotification} />
      {showConfirmModal && itemToDelete && (<ConfirmationModal message={`Delete "${itemToDelete.name}"?`} onConfirm={handleDeleteListing} onCancel={handleCancelDelete} />)}
      <NavBar currentUser={currentUser} onLogout={handleLogout} onHome={() => setPage('home')} onDashboard={() => setPage('dashboard')} onSettings={() => setPage('settings')} onPageChange={setPage} currentPage={page} />
      <main className={['login', 'signup', 'signup-teacher'].includes(page) ? 'auth-content' : 'content'}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

