import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import React, {useEffect} from "react";
import useAuth from "./hooks/useAuth";
import DataUploader from "./pages/DataUploader";

function App() {

    const { isLogin, token, userRole, keycloakInstance } = useAuth();

  return (
      <BrowserRouter>
          <Routes>
            {isLogin ?
              <Route path="/" element={<Layout logout={keycloakInstance} role={userRole} />}>
                  <Route index element={<Home token={token} />} />
                  <Route path="visualizer" element={<Visualizer token={token} />} />
              </Route>
              : <Route path='/home' element={<Home token={token}/>} /> }
          </Routes>
      </BrowserRouter>
  );
}

export default App;
