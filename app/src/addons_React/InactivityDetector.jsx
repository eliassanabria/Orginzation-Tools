import React, { useEffect, useState, useCallback } from 'react';

const InactivityDetector = ({ onInactivity, onActivityResumed }) => {
  const [timer, setTimer] = useState(null);
  const [inactiveForFiveMinutes, setInactiveForFiveMinutes] = useState(false);

  const handleActivity = useCallback(() => {
    clearTimeout(timer);
    if (inactiveForFiveMinutes) {
      onActivityResumed();
      setInactiveForFiveMinutes(false);
    }
    setTimer(setTimeout(() => {
      onInactivity();
      setInactiveForFiveMinutes(true);
    }, 1 * 60 * 1000));
  }, [timer, onInactivity, onActivityResumed, inactiveForFiveMinutes]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      handleActivity(); // Start the timer when the window becomes inactive
    } else {
      clearTimeout(timer);
    }
  }, [timer, handleActivity]);

  useEffect(() => {
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleActivity, handleVisibilityChange]);

  return null;
};

export default InactivityDetector;
