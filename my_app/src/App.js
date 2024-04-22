import React,{useEffect}  from 'react';
import { connectWithSocketServer } from "./socketConn/socketConn";
import Whiteboard from './Whiteboard/Whiteboard';


function App() {
  useEffect(() => {
    connectWithSocketServer();
  }, []);

  return (
    <div>
      <Whiteboard />
    </div>
  );
}

export default App;
