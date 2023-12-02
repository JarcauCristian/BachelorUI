import * as React from 'react';
import {useParams} from "react-router-dom";


const Notebook = () => {
    const { notebookID } = useParams();
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <iframe
                src={`https://equipped-woodcock-needlessly.ngrok-free.app/${notebookID}/notebooks/ModelCreation.ipynb`}
                title="Notebook Frame"
                width="100%"
                height="100%"
                sandbox="allow-scripts allow-same-origin allow-forms"
                allowFullScreen>
            </iframe>
        </div>
    );
}

export default Notebook;