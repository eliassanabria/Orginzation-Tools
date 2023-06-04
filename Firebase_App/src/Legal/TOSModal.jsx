import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';

import TermsOfService from './TermsOfService'; // Ensure the correct path to the component

Modal.setAppElement('#root'); // Replace '#root' with your app root element id

const TermsModal = ({ isOpen, onAgree, onDisagree, onClose }) => {
  const [agreeEnabled, setAgreeEnabled] = useState(false);
  const termsRef = useRef(null);

  const checkScrollPosition = () => {
    const { scrollHeight, clientHeight, scrollTop } = termsRef.current;
    const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
    setAgreeEnabled(isBottom);
  };

  useEffect(() => {
    setAgreeEnabled(false);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} contentLabel="Terms of Service">
      <div ref={termsRef} onScroll={checkScrollPosition} style={{ height: '80vh', overflow: 'scroll' }}>
        <TermsOfService />
      </div>
      {onDisagree &&(<button className="btn btn-secondary" style={{marginRight:'10px'}} onClick={onDisagree}>Disagree</button>)}
      {onClose &&(<button className="btn btn-info" onClick={onClose}>Close</button>)}
      {onAgree && (<button className="btn btn-primary"  style={{marginLeft:'10px'}} onClick={onAgree} disabled={!agreeEnabled}>Agree</button>)}
      
    </Modal>
  );
};

export default TermsModal;
