import * as React from 'react';
import {useParams} from "react-router-dom";

const Notebook = () => {
    const { notebookID } = useParams();
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <iframe
                src={`https://controller.sedimark.work/${notebookID}`}
                title="Notebook Frame"
                width="100%"
                height="100%"
                allowFullScreen>
            </iframe>
        </div>
    );
}

export default Notebook;