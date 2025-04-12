import React, { FunctionComponent, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  menuItems: { label: string; path: string }[];
}

const HamburgerMenu: FunctionComponent<HamburgerMenuProps> = ({ onClose, triggerRef, menuItems }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, triggerRef]);

  return (
      <div className={styles.menuOverlay} onClick={onClose}>
        <div ref={menuRef} className={styles.menuContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.menuItems}>
            {menuItems.map((item) => (
                <Link key={item.path} to={item.path} className={styles.menuLink}>
                  <div className={styles.menuItem}>
                    <div className={styles.menuBackground} />
                    <div className={styles.menuText}>{item.label}</div>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
  );
};

export default HamburgerMenu;
