import { FunctionComponent } from 'react';
import styles from './footer.module.css';
import logoImage from '../../assets/logo_gray.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Footer:FunctionComponent = () => {
	const navigate = useNavigate();
	const handleDocsClick = () => navigate(`/docsPage`);

	return (
		<div className={styles.footer}>
			<div className={styles.logoslogan}>
				<img className={styles.logoNoName} alt="" src={logoImage}/>
				<div className={styles.allYourDreamsContainer}>
          					<span className={styles.allYourDreamsContainer1}>
            						<p className={styles.allYourDreams}>{`ALL YOUR DREAMS `}</p>
            						<p className={styles.allYourDreams}>{`ARE AT THE TIPS `}</p>
            						<p className={styles.allYourDreams}>OF YOUR FINGERPRINTS</p>
          					</span>
				</div>
			</div>
			<div className={styles.footerSection2}>
				<div className={styles.copyright}>
					<div className={styles.blasenblichSR}>© 2025 BLASENBLICH s. r. o. all rights reserved</div>
				</div>
			{/*	<div className={styles.footerSection}>*/}
			{/*		<div className={styles.text}>About Us</div>*/}
			{/*	</div>*/}
			{/*	<div className={styles.footerSection1}>*/}
			{/*		<div className={styles.textDocs} onClick={handleDocsClick}*/}
			{/*		>Docs*/}
			{/*		</div>*/}
			{/*	</div>*/}
			{/*	<div className={styles.footerSection1}>*/}
			{/*		<div className={styles.text}>Contact</div>*/}
			{/*	</div>*/}
			</div>
			<div className={styles.topLanguages}>
				<div className={styles.topLanguages1}>Top languages</div>
				<div className={styles.pythonParent}>
					<a href="https://www.w3schools.com/c/" target="_blank" rel="noopener noreferrer"
					   className={styles.python}>
						<div className={styles.language}>#C</div>
					</a>
					<a href="https://www.w3schools.com/java/" target="_blank" rel="noopener noreferrer"
					   className={styles.python1}>
						<div className={styles.language}>#Java</div>
					</a>
					<a href="https://www.w3schools.com/python/" target="_blank" rel="noopener noreferrer"
					   className={styles.python1}>
						<div className={styles.language}>#Python</div>
					</a>
				</div>
			</div>

		</div>);
};

export default Footer;
