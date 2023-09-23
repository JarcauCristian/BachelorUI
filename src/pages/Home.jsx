import React from "react";

const Home = ({token}) => {

  return (
    <div>
      <iframe
        title="Streamlit App"
        src={`http://localhost:8443?authorization=${token}`}
        width="100%"
        height="500px"
        frameBorder="0"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Home;
