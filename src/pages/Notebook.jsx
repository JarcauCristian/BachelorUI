import * as React from 'react';
import {useParams} from "react-router-dom";


const Notebook = () => {
    const { notebookID } = useParams();
    return (
        <div style={{ width: "100vw", height: "100vh", marginTop: 82 }}>
            <iframe
                src={`https://ingress.sedimark.work/${notebookID.split("_")[0]}/notebooks/${notebookID.split("_")[1]}.ipynb`}
                title="Notebook Frame"
                width="100%"
                height="100%"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allowFullScreen>
            </iframe>
        </div>
    );
}

export default Notebook;