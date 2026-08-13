'use client';

import { motion } from 'framer-motion';
import styles from './KineticTypography.module.css';

export default function KineticTypography() {
  const text = "Q_QUEST";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const letterVariants = {
    hidden: { y: 50, opacity: 0, rotateX: 90 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: { type: 'spring' as const, damping: 12, stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="visible"
      animate="visible"
    >
      {text.split('').map((char, index) => (
        <motion.span 
          key={index} 
          className={styles.letter}
          variants={letterVariants}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
}
