import * as React from 'react';
import {useParams, useNavigate} from "react-router-dom";


const Notebook = () => {
    const { notebookID } = useParams();
    const navigate = useNavigate();

    const handleIframeError = () => {
        navigate('/notebooks');
    };

    return (
        <div style={{ width: "100vw", height: "100vh", marginTop: 82 }}>
            <iframe
                src={`https://ingress.sedimark.work/${notebookID.split("_")[0]}/notebooks/${notebookID.split("_")[1]}.ipynb`}
                title="Notebook Frame"
                width="100%"
                height="100%"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onError={handleIframeError}
                allowFullScreen>
            </iframe>
        </div>
    );
}

export default Notebook;