import React, { useState, useEffect } from 'react'; 
// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "firebase/auth"; 
// --- CSS Import ---
import './App.css'; 

// --- 1. FIREBASE CONFIGURATION (From your image) ---
const firebaseConfig = {
  apiKey: "AIzaSyB_iCtl8qTCJAkUxKdyk_vd2DP-bF0vzoM", // Replace with your actual key if needed
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
  // ... (Keep the dummy teacher data as before) ...
  { 
    id: 1, 
    skill: 'Biology', 
    name: 'Pooja Gupta', 
    rating: 4.1,
    years: 12,
    location: 'Electronic City', 
    price: '₹1100/hr', 
    description: 'Experienced Biology tutor for high school and college students. Specializing in genetics and ecology.' ,
    color: '#5cb85c' // Green
  },
  { 
    id: 2, 
    skill: 'Android Development', 
    name: 'Ria Mahajan', 
    rating: 3.6,
    years: 14,
    location: 'Indiranagar', 
    price: '₹4350/hr', 
    description: 'Professional Android developer offering advanced courses in Kotlin and app architecture.' ,
    color: '#a054a0' // Medium Purple
  },
  { 
    id: 3, 
    skill: 'Machine Learning', 
    name: 'Kunal Batra', 
    rating: 4.3,
    years: 2,
    location: 'Ulsoor', 
    price: '₹3500/hr', 
    description: 'Data Scientist specializing in Machine Learning. Practical sessions on Python, TensorFlow, and scikit-learn.' ,
    color: '#e48a3e' // Orange
  },
  { 
    id: 33, 
    skill: 'Digital Marketing Basics', 
    name: 'Priya Singh', 
    rating: 4.5,
    years: 3,
    location: 'Koramangala', 
    price: '₹1500/hr', 
    description: 'Learn the fundamentals of SEO, SEM, and social media strategy from a professional with 3+ years in the industry.',
    color: '#3498db' 
  },
  { 
    id: 4, 
    skill: 'Cricket Coaching', 
    name: 'Nisha Iyer', 
    rating: 4.9,
    years: 14,
    location: 'Basavanagudi', 
    price: '₹1500/hr', 
    description: 'Former state-level cricketer offering coaching for all age groups. Focus on batting, bowling, and fielding techniques.' ,
    color: '#8e44ad' 
  },
  { 
    id: 5, 
    skill: 'Photography', 
    name: 'Aditya Singh', 
    rating: 4.5,
    years: 8,
    location: 'Jayanagar', 
    price: '₹1800/hr', 
    description: 'Professional photographer teaching basics to advanced techniques in digital photography and editing.',
    color: '#3498db' 
  },
  { 
    id: 6, 
    skill: 'Baking', 
    name: 'Meena Sharma', 
    rating: 4.8,
    years: 10,
    location: 'Koramangala', 
    price: '₹900/hr or trade for gardening help', 
    description: 'Home baker offering classes in cakes, cookies, and pastries. All skill levels welcome.' ,
    color: '#e67e22' 
  },
];

// --- 3. COMPONENTS ---

/**
 * Notification Component
 */
const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); 
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="notification-container error"> {/* Add 'error' class for styling */}
      <p>{message}</p>
      <button className="notification-close-button" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

/**
 * Confirmation Modal
 */
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
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
};


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
            {/* --- Logout Button Moved Here for Logged-In Users --- */}
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
const HeroSection = () => {
  // ... (Keep HeroSection code as before) ...
    return (
    <div className="hero-container">
      <h2>Learn anything,<br />from anyone next door.</h2>
      <p>
        From cooking to coding, connect with local experts for face-to-face
        lessons. Learn a new skill, meet your neighbors.
      </p>
      <div className="hero-search-bar">
        <input type="text" placeholder="What do you want to learn" />
        <input type="text" placeholder="Enter your location" />
        <button>Search</button>
      </div>
    </div>
  );
};


/**
 * ProfileSettings Component
 */
const ProfileSettings = ({ currentUser, onSave, onBack }) => {
  // ... (Keep ProfileSettings code as before) ...
    const [name, setName] = useState(currentUser.name);
  const [neighborhood, setNeighborhood] = useState(currentUser.neighborhood || 'Koramangala');
  const [bio, setBio] = useState(currentUser.bio || '');

  const handleSave = () => {
    // In a real app, you'd save this to Firestore user profile
    onSave({
      ...currentUser, // Use existing user data (like UID)
      name: name,      
      neighborhood: neighborhood,
      bio: bio,
    });
  };

  return (
    <div className="form-container profile-settings-form">
      <button className="back-button" onClick={onBack}>&larr; Back to Settings</button>
      <h2>My Profile Settings</h2>
      
      <label>Full Name:</label>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <label>My Neighborhood:</label>
      <input 
        type="text" 
        value={neighborhood}
        onChange={(e) => setNeighborhood(e.target.value)}
      />

      <label>About Me (Bio):</label>
      <textarea 
        rows="5" 
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell people a little about yourself..."
      ></textarea>
      
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};


/**
 * Dashboard Component (The personal page with messages)
 */
const Dashboard = ({ currentUser, onBrowse, onCreateListing, teachers, confirmDelete }) => {
  // ... (Keep Dashboard code as before, ensuring currentUser check) ...
    // Filter to show only the current teacher's listings
  // Ensure currentUser and currentUser.name exist before filtering
  const myTeachersListings = (currentUser && currentUser.name) 
    ? teachers.filter(teacher => teacher.name === currentUser.name) 
    : [];

  // Conditional rendering if currentUser is null (should be handled by App, but good failsafe)
  if (!currentUser) {
      return <div>Loading...</div>; // Or redirect to login
  }

  return (
    <div className="dashboard-container">
      {/* Display user's email if name isn't set yet */}
      <h2>Welcome, {currentUser.displayName || currentUser.email}!</h2> 
      <p>This is your personal dashboard. Manage your skills and messages here.</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>My Messages</h3>
          {/* Mockup */}
          <div className="message-preview">
            <p><strong>Rohan Mehta</strong> (Yoga & Meditation)</p>
            <p>Great, is 5 PM on Tuesday good for the yoga...</p>
          </div>
          <div className="message-preview">
            <p><strong>Aisha Khan</strong> (Guitar Lessons)</p>
            <p>Yes, I can teach you the G chord...</p>
          </div>
          <button>View All Messages</button>
        </div>

        <div className="dashboard-card">
          {/* Determine role based on Firebase user data if available, or keep mock */}
          {/* For now, assume teachers have a specific email or use mock */}
          {currentUser.role === 'teacher' || currentUser.email?.includes('teacher') ? ( 
            <>
              <h3>My Skill Listings</h3>
              {myTeachersListings.length > 0 ? (
                <ul className="my-listings-list">
                  {myTeachersListings.map(listing => (
                    <li key={listing.id}>
                      <span>{listing.skill}</span>
                      <button 
                        className="delete-listing-button" 
                        onClick={() => confirmDelete(listing.id, listing.skill)} 
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>You haven't created any skill listings yet.</p>
              )}
              <button onClick={onCreateListing} style={{ marginTop: '1rem' }}>+ Create New Skill</button> 
            </>
          ) : (
            <>
              <h3>My Learning</h3>
              {/* Mockup */}
              <p>You are currently learning: <strong>Guitar Lessons</strong></p>
              <button onClick={onBrowse}>Browse More Skills</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * Login Component
 * --- UPDATED --- Added state for inputs and Firebase login handler.
 */
const Login = ({ showSignUp, showNotification }) => { // Removed onLogin, added showNotification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFirebaseLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // No need to call onLogin, onAuthStateChanged handles redirect
      showNotification(`Welcome back! 👋`); 
    } catch (error) {
      console.error("Firebase Login Error:", error);
      showNotification(`Login Failed: ${error.message} 😞`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container login-page"> 
      <div className="auth-left-panel purple-gradient"> 
          <div className="auth-left-content">
              <h1 className="auth-main-title">Welcome to Hyperlocal</h1>
              <p className="auth-description">Connect with local experts for face-to-face lessons. Learn a new skill, meet your neighbors, and enrich your community.</p>
              <h2 className="auth-sub-title">Welcome back!</h2> 
              <p>You can sign in to access your existing account.</p> 
          </div>
      </div>
      <div className="auth-right-panel light-bg"> 
          <form className="auth-form-container" onSubmit={handleFirebaseLogin}> {/* Use form element */}
              <h2>Sign In</h2> 
              
              <div className="auth-input-group icon-left"> 
                  <span className="auth-input-icon">👤</span> 
                  <input 
                      type="email" 
                      placeholder="Username or email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required // Add basic validation
                  />
              </div>
              
              <div className="auth-input-group icon-left"> 
                  <span className="auth-input-icon">🔒</span>
                  <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                  />
              </div>

              <div className="auth-options">
                  <label className="auth-checkbox-label">
                      <input type="checkbox" /> Remember me
                  </label>
                  <button type="button" className="auth-link-button small-text">Forgot password?</button>
              </div>

              <button type="submit" className="auth-submit-button large" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
              </button>
              {/* Removed mock login buttons */}
              
              <p className="auth-switch-prompt small-text">
                  New here? <button type="button" className="auth-link-button small-text" onClick={showSignUp}>Create an Account</button>
              </p>
          </form>
      </div>
    </div>
  );
};

/**
 * SignUp Component (Simple form for Learners)
 * --- UPDATED --- Added state for inputs and Firebase signup handler.
 */
const SignUp = ({ showLogin, showNotification }) => { // Removed onSignUp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [fullName, setFullName] = useState(''); // Could add name field
  const [loading, setLoading] = useState(false);

  const handleFirebaseSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user and redirecting
      showNotification("Account created successfully! Welcome! 🎉");
      // Optionally update profile here with displayName if name field was added
      // await updateProfile(auth.currentUser, { displayName: fullName });
    } catch (error) {
      console.error("Firebase Sign Up Error:", error);
      showNotification(`Sign Up Failed: ${error.message} 😞`);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="auth-page-container signup-page"> 
      <div className="auth-left-panel purple-gradient">
          <div className="auth-left-content">
              <h1 className="auth-main-title">Join Hyperlocal</h1>
              <p className="auth-description">Start your learning journey today. Connect with talented neighbors and discover new passions right in your community.</p>
          </div>
      </div>
      <div className="auth-right-panel light-bg">
          <form className="auth-form-container" onSubmit={handleFirebaseSignUp}> {/* Use form */}
              <h2>Create Learner Account</h2>
              
              {/* Optional Full Name Field
              <div className="auth-input-group icon-left">
                  <span className="auth-input-icon">👤</span> 
                  <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                  />
              </div> 
              */}
              
              <div className="auth-input-group icon-left">
                  <span className="auth-input-icon">✉️</span> 
                  <input 
                      type="email" 
                      placeholder="Email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
              </div>
              
              <div className="auth-input-group icon-left">
                  <span className="auth-input-icon">🔒</span>
                  <input 
                      type="password" 
                      placeholder="Password (min. 6 characters)" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength="6" // Basic password validation
                  />
              </div>

              <button type="submit" className="auth-submit-button large" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <p className="auth-switch-prompt small-text">
                  Already have an account? <button type="button" className="auth-link-button small-text" onClick={showLogin}>Sign In</button>
              </p>
          </form>
      </div>
    </div>
  );
};

/**
 * TeacherApplicationForm
 */
const TeacherApplicationForm = ({ showLogin, showNotification }) => { // Removed onSignUp
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(''); // Add state for email/pass if needed for signup
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // In a real app:
    // 1. Create user with createUserWithEmailAndPassword(auth, email, password)
    // 2. If successful, save the rest of the form data (skills, details etc.) 
    //    to a Firestore document associated with the new user's UID.
    // 3. Potentially set a custom claim 'teacher=true' for role management.
    try {
        // --- MOCK SUBMISSION (replace with actual Firebase signup if needed) ---
        // For now, just show notification and redirect (handled by App state change)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
        showNotification("Application submitted! Welcome teacher! ✨"); 
        // We don't call onSignUp directly anymore. If you want signup here:
        // await createUserWithEmailAndPassword(auth, email, password); 
        // Then save other details to Firestore based on auth.currentUser.uid
        
        // **Important**: For this example, we still rely on the mock user switching 
        // in App.js's handleLogin/handleSignUp triggered elsewhere.
        // A full implementation would create the user HERE.
        
        // Go back to login/home after submission for this mockup
        // showLogin(); // Or navigate to a 'pending approval' page
    } catch (error) {
        console.error("Teacher Signup/Application Error:", error);
        showNotification(`Submission Failed: ${error.message} 😞`);
    } finally {
        setLoading(false);
    }
  };

  const skills = [ /* ... skills list ... */ 
    'Music (Guitar, Piano, Vocals, etc.)', 'Technology (Coding, Web Design, etc.)', 'Cooking & Baking', 'Arts & Crafts (Painting, Pottery, etc.)', 'Fitness (Yoga, Dance, etc.)', 'Languages (English, Kannada, French, etc.)', 'Gardening', 'Academic Tutoring (Math, Science, etc.)', 'Sports (Cricket, Football, Tennis, etc.)'];

  return (
    <div className="teacher-form-container">
      <div className="teacher-form-content">
        {/* Progress Bar */}
        <div className="progress-bar">
          {[1,2,3,4].map(num => (
            <React.Fragment key={num}>
              <div className={`progress-step ${step >= num ? 'active' : ''}`}><span>{num}</span><p>{['Personal','Skills','Details','Review'][num-1]}</p></div>
              {num < 4 && <div className={`progress-line ${step >= num + 1 ? 'active' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* --- Steps --- */}
        {step === 1 && (
          <div className="form-step-content">
            <h2 className="form-title">Personal Information</h2>
            {/* Add Email/Password here if signing up during application */}
            <div className="input-group"><input type="text" id="name" placeholder=" " required /><label htmlFor="name">Name</label></div>
            <div className="input-group"><input type="email" id="email" placeholder=" " value={email} onChange={e=>setEmail(e.target.value)} required /><label htmlFor="email">Email</label></div>
             <div className="input-group"><input type="password" id="password" placeholder=" " value={password} onChange={e=>setPassword(e.target.value)} required minLength="6"/><label htmlFor="password">Password (min. 6)</label></div>
            <div className="input-group"><input type="tel" id="phone" placeholder=" " required /><label htmlFor="phone">Phone Number</label></div>
            <div className="input-group"><input type="text" id="neighborhood" placeholder=" " required /><label htmlFor="neighborhood">Neighborhood</label></div>
            <div className="form-navigation"><button className="nav-button-primary" onClick={() => setStep(2)}>Next Step</button></div>
          </div>
        )}
        {step === 2 && ( /* Skills Step - No changes needed */
             <div className="form-step-content">
            <h2 className="form-title">Your Skills & Expertise</h2>
            <p className="form-subtitle">What can you teach? Select all that apply.</p>
            <div className="skill-options-grid">
              {skills.map((skill, index) => (<div className="skill-option" key={index}><input type="checkbox" id={`skill-${index}`} /><label htmlFor={`skill-${index}`}>{skill}</label></div>))}
            </div>
            <div className="input-group other-skill-input"><input type="text" id="other-skill" placeholder=" " /><label htmlFor="other-skill">Other Skill</label></div>
            <div className="form-navigation"><button className="nav-button-secondary" onClick={() => setStep(1)}>Back</button><button className="nav-button-primary" onClick={() => setStep(3)}>Next</button></div>
          </div>
        )}
        {step === 3 && ( /* Details Step - No changes needed */
            <div className="form-step-content">
            <h2 className="form-title">Teaching Details</h2>
             <div className="input-group text-area-group"><textarea id="qualifications" rows="4" placeholder=" "></textarea><label htmlFor="qualifications">Qualifications/Experience</label></div>
             <div className="upload-section"><p>Upload supporting file (Optional)</p><button className="upload-button">Add File</button></div>
             <div className="radio-group"><p className="input-group-label">Compensation?</p><div className="radio-option"><input type="radio" id="monetary" name="compensation" /><label htmlFor="monetary">Monetary</label></div><div className="radio-option"><input type="radio" id="skill-exchange" name="compensation" /><label htmlFor="skill-exchange">Skill Exchange</label></div><div className="radio-option"><input type="radio" id="both" name="compensation" /><label htmlFor="both">Both</label></div></div>
             <div className="radio-group"><p className="input-group-label">Availability?</p><div className="radio-option"><input type="radio" name="availability" id="wd-morn" /><label htmlFor="wd-morn">Weekday Mornings</label></div><div className="radio-option"><input type="radio" name="availability" id="wd-aft" /><label htmlFor="wd-aft">Weekday Afternoons</label></div><div className="radio-option"><input type="radio" name="availability" id="wd-eve" /><label htmlFor="wd-eve">Weekday Evenings</label></div><div className="radio-option"><input type="radio" name="availability" id="we-morn" /><label htmlFor="we-morn">Weekend Mornings</label></div><div className="radio-option"><input type="radio" name="availability" id="we-aft" /><label htmlFor="we-aft">Weekend Afternoons</label></div></div>
             <div className="form-navigation"><button className="nav-button-secondary" onClick={() => setStep(2)}>Back</button><button className="nav-button-primary" onClick={() => setStep(4)}>Next</button></div>
          </div>
        )}
        {step === 4 && ( /* Final Step - Updated button text */
          <div className="form-step-content text-center">
            <h2 className="form-title">Review Application</h2>
            <p><em>(Review section)</em></p>
            <div className="final-submit-icon">✨</div>
            <div className="form-navigation">
              <button className="nav-button-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="submit-button" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
        
        <p className="form-login-prompt">
          Already have an account? <button className="link-button" onClick={showLogin}>Login</button>
        </p>

      </div>
    </div>
  );
};


/**
 * Home Component (The main browse page)
 */
const Home = ({ teachers, onSelectTeacher, onCreateListing, currentUser }) => {
 // ... (Keep Home code as before) ...
    return (
    <>
      {!currentUser && <HeroSection />}
      <div className="browse-container">
        {currentUser && <h2>Welcome, {currentUser.displayName || currentUser.email}! Start learning locally.</h2>} 
        <h3 className="featured-skills-title">Featured Skills Nearby</h3> 
        {currentUser?.role === 'teacher' && (<button onClick={onCreateListing} className="teach-skill-button">+ Create Your Skill Listing</button>)}
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
};

/**
 * Profile Component
 */
const Profile = ({ teacher, onBack, onMessage }) => {
 // ... (Keep Profile code as before) ...
   if (!teacher) { return (<div className="profile-view"><p>Teacher details not found.</p><button className="back-button" onClick={onBack}>&larr; Back to Browse</button></div>); }
  return (
    <div className="profile-view">
      <button className="back-button" onClick={onBack}>&larr; Back to Browse</button>
      <h2>{teacher.name}</h2>
      <h3>Teaching: {teacher.skill}</h3>
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
 // ... (Keep CreateListing code as before) ...
   const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [compensation, setCompensation] = useState('');

  const handlePublish = () => {
    if (!skill || !description || !compensation) { showNotification("Please fill in all fields. ⚠️"); return; }
    // Use currentUser.displayName or email if name isn't set
    const teacherName = currentUser.displayName || currentUser.email || 'Teacher'; 
    const newSkillListing = { id: Date.now(), skill: skill, name: teacherName, rating: Math.round((Math.random() * 2 + 3) * 10) / 10, years: Math.floor(Math.random() * 10) + 1, location: currentUser.neighborhood || 'Koramangala', price: compensation, description: description, color: ['#5cb85c', '#a054a0', '#e48a3e', '#8e44ad', '#3498db', '#e67e22'][Math.floor(Math.random()*6)] };
    onPublish(newSkillListing); 
  };

  return (
    <div className="form-container">
      <button className="back-button" onClick={onBack}>&larr; Back</button>
      <h2>Create New Skill Listing</h2>
      <label htmlFor="skill-teach">Skill:</label><input id="skill-teach" type="text" placeholder="e.g., Python" value={skill} onChange={(e) => setSkill(e.target.value)} />
      <label htmlFor="skill-desc">Description:</label><textarea id="skill-desc" rows="5" placeholder="Describe..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
      <label htmlFor="skill-comp">Compensation:</label><input id="skill-comp" type="text" placeholder="e.g., ₹800/hr" value={compensation} onChange={(e) => setCompensation(e.target.value)} />
      <button onClick={handlePublish}>Publish Listing</button>
    </div>
  );
};

/**
 * Messaging Component
 */
const Messaging = ({ teacher, onBack }) => {
 // ... (Keep Messaging code as before) ...
  if (!teacher) { return (<div className="messaging-container"><p>Cannot load chat.</p><button className="back-button" onClick={onBack}>&larr; Back</button></div>); }
  return (
    <div className="messaging-container">
      <button className="back-button" onClick={onBack}>&larr; Back to Profile</button>
      <h3>Chat with {teacher.name}</h3>
      <div className="chat-window">
        <div className="message other"><p>Hi! Interested in {teacher.skill} lessons.</p></div>
        <div className="message self"><p>Hello! When are you available?</p></div>
      </div>
      <div className="message-input"><input type="text" placeholder="Type..." /><button>Send</button></div>
    </div>
  );
};

/**
 * SettingsMenu Component
 */
const SettingsMenu = ({ onPageChange, onLogout }) => {
 // ... (Keep SettingsMenu code as before, but pass real onLogout) ...
  return (
    <div className="form-container settings-menu">
      <h2>Settings</h2>
      <button className="settings-option-button" onClick={() => onPageChange('profileSettings')}>My Profile</button>
      <button className="settings-option-button" onClick={() => onPageChange('history')}>My History</button>
      <button className="settings-option-button" onClick={() => onPageChange('paymentsComingSoon')}>Payments <span className="coming-soon">(Soon)</span></button>
      <div className="settings-divider"></div>
      <button className="settings-option-button logout-button" onClick={onLogout}>Logout</button>
    </div>
  );
};

/**
 * History Component
 */
const History = ({ onBack }) => {
 // ... (Keep History code as before) ...
   return (
    <div className="dashboard-container"> 
      <button className="back-button" onClick={onBack}>&larr; Back to Settings</button>
      <h2>My Learning History</h2>
      <div className="history-list">
        <div className="history-item"><h3>Guitar Lessons</h3><p>Completed: 10 sessions</p><p>Status: <span style={{color: '#5cb85c'}}>Finished</span></p></div>
        <div className="history-item"><h3>Yoga</h3><p>Ongoing: 4 sessions</p><p>Status: <span style={{color: '#f0ad4e'}}>In Progress</span></p></div>
      </div>
    </div>
  );
};

/**
 * PaymentsComingSoon Component
 */
const PaymentsComingSoon = ({ onBack }) => {
 // ... (Keep PaymentsComingSoon code as before) ...
   return (
    <div className="form-container">
      <button className="back-button" onClick={onBack}>&larr; Back to Settings</button>
      <h2>Payments</h2><p className="text-center">Coming soon!</p>
      <div style={{textAlign: 'center', marginTop: '20px'}}><span role="img" aria-label="construction" style={{fontSize: '3em'}}>🚧</span></div>
    </div>
  );
};

/**
 * HowItWorks Component
 */
const HowItWorks = ({ onBack }) => {
 // ... (Keep HowItWorks code as before) ...
    return (
    <div className="how-it-works-page"> 
      <button className="back-button" onClick={onBack}>&larr; Back Home</button>
      <h2 className="how-it-works-title">How Hyperlocal Works</h2>
      <p className="how-it-works-subtitle">Simple steps to connect.</p>
      <div className="how-it-works-cards">
        <div className="how-it-works-card"><div className="card-number">1</div><h3>Find Skill</h3><p>Browse local skills.</p></div>
        <div className="how-it-works-card"><div className="card-number">2</div><h3>Get in Touch</h3><p>View profile, message teacher.</p></div>
        <div className="how-it-works-card"><div className="card-number">3</div><h3>Learn & Grow</h3><p>Meet for lessons.</p></div>
      </div>
    </div>
  );
};


// --- 4. MAIN APP COMPONENT ---
function App() {
  const [page, setPage] = useState('login'); 
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Firebase user object or null
  const [notification, setNotification] = useState(null); 
  const [teachers, setTeachers] = useState(initialTeachersData);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true); // Track initial auth check

  // --- Notification Handlers ---
  const showNotification = (message) => { setNotification(message); };
  const closeNotification = () => { setNotification(null); };

  // --- Firebase Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        // You might fetch additional user profile data from Firestore here
        // For now, just use the basic Firebase user object
        // Add a mock role for display purposes if needed
        const userWithRole = { 
            ...user, 
            role: user.email?.includes('teacher') ? 'teacher' : 'learner', // Simple role check
            // Use displayName from Firebase if set, otherwise keep basic info
            name: user.displayName || user.email?.split('@')[0] || 'User' 
        };
        setCurrentUser(userWithRole);
        setPage('dashboard'); // Redirect to dashboard after auth state confirmed
      } else {
        // User is signed out
        setCurrentUser(null);
        setPage('login'); // Redirect to login if signed out
      }
      setAuthLoading(false); // Auth check finished
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount


  // --- Event Handlers ---
  // Login and SignUp are now handled by Firebase components and onAuthStateChanged
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will set currentUser to null and change page to 'login'
      showNotification("You have been logged out."); 
    } catch (error) {
       console.error("Logout Error:", error);
       showNotification(`Logout Failed: ${error.message} 😞`);
    }
  };

  const handleSelectTeacher = (teacher) => { setSelectedTeacher(teacher); setPage('profile'); };
  const handleMessage = (teacher) => { setSelectedTeacher(teacher); setPage('messaging'); };
  
  const handleProfileSave = (updatedUser) => {
    // In a real app, update Firestore user profile here
    // For now, just update local state
    setCurrentUser(updatedUser); 
    setPage('settings');
    showNotification("Profile updated! ✅"); 
    // Update teacher name in listings if changed
    setTeachers(prevTeachers => prevTeachers.map(t => 
      // Match by UID if available, otherwise fallback (less reliable)
      (t.uid === currentUser.uid) ? { ...t, name: updatedUser.name } : t 
    ));
  };

  const handlePublishListing = (newListing) => {
    // Add UID to listing if user is logged in
    const listingWithOwner = currentUser ? { ...newListing, uid: currentUser.uid, name: currentUser.displayName || currentUser.email } : newListing;
    setTeachers(prevTeachers => [listingWithOwner, ...prevTeachers]); 
    setPage('dashboard'); 
    showNotification("Skill published! 🎉");
  };
  
  const handleConfirmDelete = (id, skillName) => { setItemToDelete({ id, name: skillName }); setShowConfirmModal(true); };
  
  const handleDeleteListing = () => {
    if (itemToDelete) {
      setTeachers(prevTeachers => prevTeachers.filter(t => t.id !== itemToDelete.id));
      showNotification(`"${itemToDelete.name}" deleted. 🗑️`);
      setItemToDelete(null); 
    }
    setShowConfirmModal(false); 
  };

  const handleCancelDelete = () => { setItemToDelete(null); setShowConfirmModal(false); };


  // --- Page Rendering Logic ---
  const renderPage = () => {
    // Show loading state while Firebase checks auth status
    if (authLoading) {
      return <div className="loading-container">Loading...</div>; // Simple loading indicator
    }

    switch (page) {
      case 'login':
        // Show Login only if not logged in
        return !currentUser ? <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/> : <Dashboard {...commonProps} />;
      case 'signup': 
        // Show SignUp only if not logged in
        return !currentUser ? <SignUp showLogin={() => setPage('login')} showNotification={showNotification}/> : <Dashboard {...commonProps} />;
      case 'signup-teacher': 
        // Show Teacher Signup only if not logged in
        return !currentUser ? <TeacherApplicationForm showLogin={() => setPage('login')} showNotification={showNotification} /> : <Dashboard {...commonProps} />;
      
      // Public Pages
      case 'howItWorks':
        return <HowItWorks onBack={() => setPage(currentUser ? 'dashboard' : 'home')} />; // Go back to dashboard if logged in, else home
      case 'home': 
         // Public home page (Hero + Browse) - Render regardless of login status for now
         // A more complex app might redirect logged-in users from here to dashboard
         return <Home teachers={teachers} onSelectTeacher={handleSelectTeacher} onCreateListing={() => setPage('createListing')} currentUser={currentUser} />;

      // Protected Routes (Require Login)
      case 'dashboard':
        return currentUser ? <Dashboard {...commonProps} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'settings':
        return currentUser ? <SettingsMenu onPageChange={setPage} onLogout={handleLogout} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'profileSettings':
        return currentUser ? <ProfileSettings currentUser={currentUser} onSave={handleProfileSave} onBack={() => setPage('settings')} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'history':
        return currentUser ? <History onBack={() => setPage('settings')} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'paymentsComingSoon':
        return currentUser ? <PaymentsComingSoon onBack={() => setPage('settings')} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'profile': 
        const teacherDetails = teachers.find(t => t.id === selectedTeacher?.id);
        return currentUser ? <Profile teacher={teacherDetails} onBack={() => setPage('home')} onMessage={handleMessage} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'createListing':
        return currentUser ? <CreateListing onBack={() => setPage('dashboard')} onPublish={handlePublishListing} currentUser={currentUser} showNotification={showNotification} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      case 'messaging':
        const messageTeacherDetails = teachers.find(t => t.id === selectedTeacher?.id);
        return currentUser ? <Messaging teacher={messageTeacherDetails} onBack={() => setPage('profile')} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
      
      default: // Default to dashboard if logged in, else login
        return currentUser ? <Dashboard {...commonProps} /> : <Login showSignUp={() => setPage('signup')} showNotification={showNotification}/>;
    }
  };

  // Props common to dashboard rendering
  const commonProps = {
    currentUser: currentUser,
    onBrowse: () => setPage('home'),
    onCreateListing: () => setPage('createListing'),
    teachers: teachers,
    confirmDelete: handleConfirmDelete
  };

  return (
    <div className="App">
      <Notification message={notification} onClose={closeNotification} />
      {showConfirmModal && itemToDelete && (<ConfirmationModal message={`Delete "${itemToDelete.name}"?`} onConfirm={handleDeleteListing} onCancel={handleCancelDelete} />)}
      <NavBar currentUser={currentUser} onLogout={handleLogout} onHome={() => setPage('home')} onDashboard={() => setPage('dashboard')} onSettings={() => setPage('settings')} onPageChange={setPage} currentPage={page} />
      <main className={page === 'login' || page === 'signup' || page === 'signup-teacher' ? 'auth-content' : 'content'}> 
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

