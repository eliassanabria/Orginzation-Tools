import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const CustomToast = ({ id, title, body, groupName, handleClose }) => {
  const handleToastClose = () => {
    handleClose(id);
  };

  return (
      <Toast onClose={handleToastClose} className="text-light" >
        <Toast.Header closeButton={true} style={{backgroundColor:'#0a2a52', color:'white'}}>
          <strong className="me-auto">{title}</strong>
          <small style={{color:'white'}}>{groupName}</small>
        </Toast.Header>
        <Toast.Body style={{color:'#0a2a52'}}>{body}</Toast.Body>
      </Toast>
  );
};

export default CustomToast;
