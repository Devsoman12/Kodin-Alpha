import { FunctionComponent } from "react";
import styles from "./ErrorNotification.module.css";
import CloseIcon from "../../assets/close.svg";

interface ErrorNotificationProps {
    message: string;
    onClose: () => void;
}

const ErrorNotification: FunctionComponent<ErrorNotificationProps> = ({ message, onClose }) => {
    return (
        <div className={styles.errorNotification}>
            <span>{message}</span>
            <button className={styles.closeButton} onClick={onClose}>
                <img src={CloseIcon} alt="Close" />
            </button>
        </div>
    );
};

export default ErrorNotification;
