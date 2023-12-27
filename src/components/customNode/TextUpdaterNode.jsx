import * as React from 'react';
import { Handle, Position } from 'reactflow';
import LockIcon from '@mui/icons-material/Lock';
import {Alert, Backdrop, CircularProgress, Dialog, Snackbar} from "@mui/material";
import Button from "@mui/material/Button";
import Editor from "@monaco-editor/react";


function TextUpdaterNode({ data, isConnectable }) {
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [blockContent, setBlockContent] = React.useState(data.content);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleBackdropClose = () => {
        setLoading(false);
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    const handleDialogOpen = () => {
        setDialogOpen(true);
    }

    const handleEditorChange = (value, event) => {
        setBlockContent(value);
    }

    React.useEffect(() => {
        if (!data.created) {
            localStorage.setItem(`${data.pipeline_name}-${data.name}-block-content`, blockContent);
        }
    }, [blockContent, data.pipeline_name, data.name]);

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const isBlockContent = localStorage.getItem(`${data.pipeline_name}-${data.name}-block-content`);

        if (isBlockContent) {
            setBlockContent(isBlockContent);
        }
    })

    return (
        <div className="text-updater-node" style={{background: data.background}}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xl">
                <Editor height="100vh" width="50vw" theme="vs-dark" defaultLanguage={data.language} defaultValue={blockContent} onChange={handleEditorChange}/>
            </Dialog>
            {data.type !== "loader" && (<Handle type="target" position={Position.Left} isConnectable={isConnectable} />)}
            <div>
                <div className="custom-node__header">
                    <strong>{data.label}</strong>
                </div>
                <div className="custom-node__body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {data.editable ?
                        <Button variant="filled" sx={{ backgroundColor: "#f0f0f0", '&:hover': { bgcolor: "darkgray", color: "black" }}} onClick={handleDialogOpen}>
                            Edit Block
                        </Button>
                        :
                        <LockIcon sx={{ fontSize: 50 }}/>
                    }
                </div>
            </div>
            {data.type !== "exporter" && (<Handle type="source" position={Position.Right} isConnectable={isConnectable}  />)}
        </div>
    );
}

export default TextUpdaterNode;
