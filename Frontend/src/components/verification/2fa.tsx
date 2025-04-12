import { FunctionComponent, useCallback, useState, useEffect } from 'react';
import styles from './2fa.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';

const Content: FunctionComponent = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [expirationTime, setExpirationTime] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const { verifyEmail, sendVerificationEmail, error, user, checkAuth} = useAuthStore();

  const onConfirmButtonContainerClick = useCallback(async () => {
    try {
      await verifyEmail(code);
      navigate('/registerConfirmation');
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    }
  }, [code, navigate]);

  const handleSendVerificationEmail = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (timer > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await sendVerificationEmail();
      await checkAuth();
      const newExpirationTime = Math.floor(Date.now() / 1000) + 120;
      setExpirationTime(newExpirationTime);
      startTimer(newExpirationTime);
    } catch (error) {
      setErrorMessage('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }

    //window.alert("Please check your email for the verification code.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    // Allow only single digit numbers (0-9) and handle backspace or delete
    if (/^[0-9]$/.test(value) || value === '') {
      setCode((prevCode) => {
        // If the value is an empty string (i.e., backspace), we handle it properly
        return prevCode.substr(0, index) + value + prevCode.substr(index + 1);
      });
    }
  };


  const startTimer = (expirationTimestamp: number) => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remainingTime = expirationTimestamp - now;

      if (remainingTime > 0) {
        setTimer(remainingTime);
      } else {
        setTimer(0);
        clearInterval(interval);
      }
    }, 1000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  useEffect(() => {
    if (expirationTime > 0) {
      startTimer(expirationTime);
    }
  }, [expirationTime]);

  return (
    <div className={styles.content}>
      <div className={styles.contentInner}>
        <div className={styles.pleaseCheckYourEmailParent}>
          <b className={styles.pleaseCheckYour}>Please check your email</b>
          <div className={styles.weveSentAContainer}>
            <span>{`We’ve sent a code to `}</span>
            <span className={styles.helloworldgmailcom}>{user?.email}</span>
          </div>
          <div className={styles.rectangleParent}>
            {Array(4).fill(0).map((_, index) => (
              <input
                key={index}
                className={styles.frameChild}
                type="number"
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleInputChange(e, index)}
              />
            ))}
          </div>

          <div className={styles.buttonPrimary} onClick={onConfirmButtonContainerClick}>
            <div className={styles.button}>Verify</div>
          </div>
          
          <div className={styles.sendCodeAgainParent}>
            <div 
              className={styles.sendCodeAgain} 
              onClick={handleSendVerificationEmail}
              style={{ 
                cursor: timer > 0 ? 'not-allowed' : 'pointer',
                opacity: timer > 0 ? 0.5 : 1,
              }}  
            >
              Send code again
            </div>
            <div className={styles.div}>{timer > 0 ? formatTime(timer) : '00:00'}</div>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
