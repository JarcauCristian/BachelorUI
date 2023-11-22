import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import * as React from "react";
import useAuth from "./hooks/useAuth";
import DataUploader from "./pages/DataUploader";
import DataOrchestrator from "./pages/DataOrchestrator";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";

function App() {

    const { isLogin, token, userRole, keycloakInstance } = useAuth();
  return (
      <BrowserRouter>
          <Routes>
            {isLogin && userRole === null ?
                    <Route path="/" element={<Layout logout={keycloakInstance} role={userRole}/>}>
                        <Route index element={<LandingPage />}/>
                        <Route path="about" element={<About />}/>
                    </Route>
              : isLogin && userRole === "data-producer" ?
                    <Route path="/" element={<Layout logout={keycloakInstance} role={userRole}/>}>
                        <Route index element={<LandingPage />}/>
                        <Route path="data_uploader" element={<DataUploader token={token}/>}/>
                        <Route path="data_orchestration" element={<DataOrchestrator token={token}/>}/>
                        <Route path="datasets" element={<DataOrchestrator token={token}/>}/>
                        <Route path="models" element={<DataOrchestrator token={token}/>}/>
                    </Route>
                    : isLogin && userRole === "data-scientist" ?
                        <Route path="/" element={<Layout logout={keycloakInstance} role={userRole}/>}>
                            <Route index element={<LandingPage />}/>
                            <Route path="datasets" element={<DataUploader token={token}/>}/>
                            <Route path="notebooks" element={<DataOrchestrator token={token}/>}/>
                            <Route path="models" element={<DataOrchestrator token={token}/>}/>
                        </Route> :
                ""}
          </Routes>
      </BrowserRouter>
  );
}

export default App;
