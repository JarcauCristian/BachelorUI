import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import React from "react";
import useAuth from "./hooks/useAuth";

function App() {

    const { isLogin, token, keycloakInstance } = useAuth()


  return (
      <BrowserRouter>
          <Routes>
              {isLogin ?
              <Route path="/pages" element={<Layout logout={keycloakInstance}/>}>
                  <Route index element={<Home />} />
                  <Route path="visualizer" element={<Visualizer token={token} />} />
              </Route>
              : <Route path="landing" element={<Home />} />}
          </Routes>
      </BrowserRouter>
  );
}

export default App;
