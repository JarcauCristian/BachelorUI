import * as React from 'react';
import Editor from "@monaco-editor/react"

const PythonEditor = () => {
    return (
        <div>
            <Editor height="100vh" width="100vw" defaultLanguage="python" defaultValue="// some comment" />
        </div>
    );
}

export default PythonEditor;