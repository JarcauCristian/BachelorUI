import React from "react";
import { useState, useEffect, useRef } from "react";

const number = 1;

const Home = ({token}) => {
  return (
    <div>
      <iframe
        title="Streamlit App"
        src="http://localhost:8443"
        width="100%"
        height="500px"
        frameBorder="0"
        referrerPolicy="no-referrer"
        onLoad={() => {
          async function getSrc() {
            const res = await fetch("http://localhost:8443", {
              method: 'GET',
              headers: {
                "Authorization": "Bearer " + token
              }
            });
            const blob = await res.blob();
            const urlObject = URL.createObjectURL(blob);
            document.querySelector('iframe[title="Streamlit App"]').setAttribute("src", urlObject)
          }
          getSrc();
        }}
      />
    </div>
  );
};

export default Home;
