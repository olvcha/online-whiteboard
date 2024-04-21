import React, {useRef,useLayoutEffect} from 'react';
import Menu from "./Menu";
import rough from 'roughjs/bundled/rough.esm';

const Whiteboard = () => {
    const canvasRef = useRef(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current
       const rc= rough.canvas(canvas);
        rc.rectangle(10,10,200,200);

    },[]);
    return(
        <>
            <Menu />
            <canvas ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}/>
        </>
    );


};
export default Whiteboard;