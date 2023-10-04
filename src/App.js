import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Visualizer from "./pages/Visualizer";
import React, {useEffect} from "react";
import useAuth from "./hooks/useAuth";
import DataUploader from "./pages/DataUploader";
import DataOrchestrator from "./pages/DataOrchestrator";

function App() {

    const { isLogin, token, userRole, keycloakInstance } = useAuth();

  return (
      <BrowserRouter>
          <Routes>
            {isLogin ?
              <Route path="/" element={<Layout logout={keycloakInstance} role={userRole} />}>
                  <Route index element={<DataUploader token={token} />} />
                  <Route path="data_orchestration" element={<DataOrchestrator token={token} />} />
              </Route>
              : <Route path='/home' element={<Home token={token}/>} /> }
          </Routes>
      </BrowserRouter>
  );
}

export default App;
