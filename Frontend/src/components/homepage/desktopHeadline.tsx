import { FunctionComponent } from 'react';
import styles from './desktopHeadline.module.css';

const ImageAndPhrase: FunctionComponent = () => {
    return (
        <div className={styles.imageAndPhrase}>
            <div className={styles.headline}>
                FORGE YOUR DREAMS WITH THE RIGHT TOOLS
            </div>
        </div>
    );
};

export default ImageAndPhrase;
