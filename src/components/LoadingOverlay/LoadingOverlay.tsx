import React from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  seconds: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ seconds }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
      <div className={styles.text}>Загрузка... {seconds} сек.</div>
    </div>
  );
};
