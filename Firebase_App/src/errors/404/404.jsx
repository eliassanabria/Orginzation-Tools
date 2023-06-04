import React from "react";
import './404.css';
import { Container, Row, Col, Button } from 'react-bootstrap';


export function NotFound(){
  return (
<div>
<Container className="text-center mt-5">

   <h1>404</h1>
          <h3>Page Not Found</h3>
          <p>Oops! It seems like the page you are looking for does not exist.</p>
          <img
            src="https://media.tenor.com/OyUVgQi-l-QAAAAC/404.gif"
            alt="Funny 404 GIF"
            className="img-fluid"
          />
          <p>Don't worry, just hit the button below to go back to safety.</p>
          <Button variant="primary" href="/groups"style={{zIndex:0}}>
            Go Home
          </Button>
          </Container>
</div>
         
  );
};
