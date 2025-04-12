import { FunctionComponent, useCallback } from 'react';
import styles from './RegistrationConfirm.module.css';
import { useNavigate } from 'react-router-dom';


const Content:FunctionComponent = () => {
	const navigate = useNavigate();

	const onConfirmButtonContainerClick = useCallback(() => {
		navigate('/login');
	}, [navigate]);
  	
  	return (
    		<div className={styles.content}>
      			<div className={styles.contentInner}>
        				<div className={styles.youSuccessfullyCreatedYourParent}>
          					<b className={styles.youSuccessfullyCreated}>You successfully created your acount</b>
          					<div className={styles.buttonPrimary} onClick={onConfirmButtonContainerClick}>
            						<div className={styles.button}>Return To Home</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default Content;
