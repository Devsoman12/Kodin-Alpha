import { FunctionComponent, useState, useCallback } from 'react';
import styles from './registrationForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';

const RegistrationForm: FunctionComponent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);


  const { signup } = useAuthStore();

    // Handle SSO login (redirect to the backend which redirects to the SSO provider)
  const handleSSOSIgnUp = () => {
      window.location.href = "http://localhost:5000/api/auth/sso/login"; // Redirect to the server for SSO login
  };

  const handleSignUp = async (e: { preventDefault: () => void; }) => {
		e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
          //window.alert(email);
          setError("Please fill in all fields before proceeding.");
          return; // Zastaví funkciu, ak sú polia prázdne
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
          setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.");
          return;
        }

		try {
			await signup(email, password, name);
			navigate("/register2fa");
		} catch (error: any) {
            //setError("Please fill in all fields before proceeding.");
            //setError(error);
            setError(error.response?.data?.message || "An error occurred during registration.");
			console.log(error);
		}
	};

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevState) => !prevState);
  }, []);

  const navigate = useNavigate();


  const onConfirmSignInClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className={styles.content}>
      <div className={styles.contentInner}>
        <div className={styles.frameWrapper}>
          <div className={styles.frameParent}>
            <div className={styles.createAnAccountParent}>
              <div className={styles.createAnAccount}>Create an account</div>
              <div className={styles.letsGetStarted}>
                Let’s get started with your 30 days free trial
              </div>
            </div>
            <div className={styles.frameContainer}>
              <div className={styles.frameGroup}>
                <div className={styles.frameDiv}>
                  <div className={styles.nameParent}>
                    <div className={styles.name}>Name</div>
                    <input
                      type="text"
                      className={styles.text}
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.nameParent}>
                    <div className={styles.name}>Email</div>
                    <input
                      type="email"
                      className={styles.text}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className={styles.nameParent}>
                    <div className={styles.name}>Password</div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={styles.text}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className={styles.show} onClick={togglePasswordVisibility}>
                      {showPassword ? 'Hide' : 'Show'}
                    </div>
                  </div>
                </div>
                <div className={styles.frameWrapper1}>

                  <div className={styles.dividerWrapper}>
                    <hr className={styles.dividerLine}/>
                    <div className={styles.ssoButtonWrapper}>
                      <button
                          className={styles.ssoButton}
                          onClick={handleSSOSIgnUp}
                      >
                        Connect with SSO
                      </button>
                    </div>
                  </div>

                  <div className={styles.createAccountWrapper} onClick={handleSignUp}>
                    <div className={styles.createAccount}>Create Account</div>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.alreadyHaveAnContainer} onClick={onConfirmSignInClick}>
              <span>
                <span>{`Already have an account? `}</span>
                <span className={styles.span}>
                  <span className={styles.span1}>{`  `}</span>
                </span>
              </span>
              <span className={styles.span}>
                <span className={styles.signIn1}>Sign in</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
