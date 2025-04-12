import { FunctionComponent, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './loginForm.module.css';
import CheckImage from '../../assets/check.svg';
import { useAuthStore } from '../../context/AuthContext';

const Content: FunctionComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login, isAuthenticated, error } = useAuthStore();
  const navigate = useNavigate();
  const [errorVisible, setError] = useState<string | null>(null);

  // Handle SSO login (redirect to the backend which redirects to the SSO provider)
  const handleSSOLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/sso/login"; // Redirect to the server for SSO login
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields before proceeding.');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'An unknown error occurred');
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin(e); // Trigger the login function
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const onRegisterButtonClick = () => {
    navigate('/register');
  };

  return (
    <div className={styles.content}>
      <div className={styles.wholeWrapper}>
        <div className={styles.registerButtonWrapper}>
          <button
            className={styles.registerButton}
            onClick={onRegisterButtonClick}
          >
            Register
          </button>
        </div>
        <div className={styles.whole}>
          <div className={styles.emailParent}>
            <div className={styles.email}>
              <div className={styles.text}>Email</div>
              <div className={styles.text1}>
                <input
                  type="email"
                  className={styles.inputBox}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.email}>
              <div className={styles.text}>Password</div>
              <div className={styles.text3}>
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  className={styles.inputBox}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <div
                  className={styles.show}
                  onClick={togglePasswordVisibility}
                  style={{ cursor: 'pointer' }}
                >
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.dividerWrapper}>
            <hr className={styles.dividerLine} />
            <div className={styles.ssoButtonWrapper}>
              <button
                className={styles.ssoButton}
                onClick={handleSSOLogin} // Handle the SSO login logic
              >
                Connect with SSO
              </button>
            </div>
          </div>

          {errorVisible && <div className={styles.error}>{errorVisible}</div>}
          <div
            className={styles.confirmButton}
            onClick={handleLogin}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.checkWrapper}>
              <img className={styles.checkIcon} alt="" src={CheckImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;
