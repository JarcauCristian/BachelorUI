import './App.css';
import Layout from "./components/layout/Layout";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import * as React from "react";
import useAuth from "./hooks/useAuth";
import DataUploader from "./pages/DataUploader";
import DataOrchestrator from "./pages/DataOrchestrator";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Notebooks from "./pages/Notebooks";
import Notebook from "./pages/Notebook";
import Models from "./pages/Models";
import Model from "./pages/Model";
import Orchestrator from "./pages/Orchestrator";
import DatasetGraph from "./pages/DatasetGraph";
import Datasets from "./pages/Datasets";

function App() {

    const { isLogin, token, userRole, userID, username, keycloakInstance } = useAuth();
  return (
      <BrowserRouter>
          <Routes>
            {isLogin && userRole === null ?
                    <Route path="/" element={<Layout logout={keycloakInstance} role={userRole} username={username}/>}>
                        <Route index element={<LandingPage role={userRole} userID={userID} />}/>
                        <Route path="about" element={<About />}/>
                    </Route>
              : isLogin && userRole === "data-producer" ?
                    <Route path="/" element={<Layout logout={keycloakInstance} role={userRole} username={username}/>}>
                        <Route index element={<LandingPage role={userRole}/>}/>
                        <Route path="orchestration" element={<Orchestrator/>}/>
                        <Route path="my_datasets" element={<Datasets/>}/>
                        <Route path="models" element={<Orchestrator/>}/>
                    </Route>
                    : isLogin && userRole === "data-scientist" ?
                        <Route path="/" element={<Layout logout={keycloakInstance} role={userRole} username={username}/>}>
                            <Route index element={<LandingPage role={userRole} />}/>
                            <Route path="datasets" element={<DatasetGraph token={token}/>}/>
                            <Route path="notebooks" element={<Notebooks token={token}/>}/>
                            <Route path="/notebooks/:notebookID" element={<Notebook />} />
                            <Route path="models" element={<Models token={token}/>}/>
                            <Route path="/models/:modelID" element={<Model />} />
                        </Route> :
                ""}
          </Routes>
      </BrowserRouter>
  );
}

export default App;
