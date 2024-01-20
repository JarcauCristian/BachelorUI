import * as React from 'react';
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";


const Notebook = () => {
    const { notebookID, port } = useParams();
    return (
        <div style={{ width: "100vw", height: "100vh", marginTop: 82 }}>
            <iframe
                src={`https://service-${Cookies.get("userID").split("-").join("_")}:${port}/${notebookID}/notebooks/ModelCreation.ipynb`}
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