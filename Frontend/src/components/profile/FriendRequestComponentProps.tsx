import { FunctionComponent, useState } from 'react';
import styles from '../header/HamburgerMenu.module.css';
import DoneFillImage from '../../assets/Done_fill.svg';
import Component180Image from '../../assets/add_mark.svg';

interface Component180SetProps {
  onClick?: () => void;
}

const FriendRequestComponentProps: FunctionComponent<Component180SetProps> = ({ onClick }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleClick = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className={styles.component180Container} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.stepContent}>
        {currentStep === 1 && (
          <img className={styles.icon} alt="Add Friend" src={Component180Image} />
        )}
        {currentStep === 2 && (
          <>
            <img className={styles.icon} alt="Confirm Request" src={DoneFillImage} />
            <span className={styles.text}>Are you sure you want to send a friend request?</span>
          </>
        )}
        {currentStep === 3 && (
          <>
            <img className={styles.icon} alt="Success" src={DoneFillImage} />
            <span className={styles.text}>You have successfully sent a friend request!</span>
          </>
        )}
      </div>
    </div>
  );
};

export default FriendRequestComponentProps;
