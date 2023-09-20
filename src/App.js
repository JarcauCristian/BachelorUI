import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import React from "react";
import Public from "./components/Public";
import useAuth from "./hooks/useAuth";

function App() {

    const { isLogin, token, userInfo, keycloakInstance } = useAuth()
    console.log(token);


  return ( isLogin ?
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Layout logout={keycloakInstance}/>}>
                  <Route index element={<Home token={token} />} />
                  <Route path="visualizer" element={<Visualizer token={token} />} />
              </Route>
          </Routes>
      </BrowserRouter>
          : <Public />
  );
}

export default App;
