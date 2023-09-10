import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import React from "react";
import Public from "./components/Public";
import useAuth from "./hooks/useAuth";


function App() {
    const [isLogin, token] = useAuth();

  return (isLogin ?
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="visualizer" element={<Visualizer token={token}/>} />
                  <Route path="ai_service" element={<Home />} />
              </Route>
          </Routes>
      </BrowserRouter>
          : <Public />
  );
}

export default App;
