import React, { useEffect, useRef } from 'react';

const Home = ({token}) => {
    const isRun = useRef(false)

    useEffect( () => {
        if (isRun.current) return;

        isRun.current = true;

        const iframe = document.getElementById('myIframe');

        const srcUrl = `http://localhost:8050?token=${token}`;
        iframe.src = srcUrl;
    }, [token])


    return (
        <div>
          <iframe
            id="myIframe"
            width="1900"
            height="1080"
            title="Embedded Streamlit App"
          ></iframe>
        </div>
      );
};

export default Home;
