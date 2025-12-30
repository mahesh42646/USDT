'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HelpModal from './HelpModal';
import styles from './HelpButton.module.css';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.button
        className={`btn btn-primary ${styles.helpButton}`}
        onClick={toggleModal}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <i className="bi bi-question-circle m-auto"></i>
        <span className={styles.helpText}>Need Help?</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && <HelpModal isOpen={isOpen} onClose={toggleModal} />}
      </AnimatePresence>
    </>
  );
}

