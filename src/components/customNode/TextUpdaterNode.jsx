// import * as React from 'react';
// import { Handle, Position } from 'reactflow';
// import LockIcon from '@mui/icons-material/Lock';
// import {Alert, Backdrop, CircularProgress, Dialog, Snackbar} from "@mui/material";
// import Button from "@mui/material/Button";
// import Editor from "@monaco-editor/react";
//
//
// function TextUpdaterNode({ data, isConnectable }) {
//     const isRun = React.useRef(false);
//     const [toastMessage, setToastMessage] = React.useState("");
//     const [toastSeverity, setToastSeverity] = React.useState("error");
//     const [open, setOpen] = React.useState(false);
//     const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
//     const [blockContent, setBlockContent] = React.useState(data.content);
//     const [dialogOpen, setDialogOpen] = React.useState(false);
//     const [loading, setLoading] = React.useState(false);
//
//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return;
//         }
//
//         setOpen(false);
//     };
//
//     const handleBackdropClose = () => {
//         setLoading(false);
//     }
//
//     const handleDialogClose = () => {
//         setDialogOpen(false);
//     }
//
//     const handleDialogOpen = () => {
//         setDialogOpen(true);
//     }
//
//     const handleEditorChange = (value, event) => {
//         setBlockContent(value);
//     }
//
//     React.useEffect(() => {
//         if (!data.created) {
//             localStorage.setItem(`${data.pipeline_name}-${data.name}-block-content`, blockContent);
//         }
//     }, [blockContent, data.pipeline_name, data.name]);
//
//     React.useEffect(() => {
//         if (isRun.current) return;
//
//         isRun.current = true;
//
//         const isBlockContent = localStorage.getItem(`${data.pipeline_name}-${data.name}-block-content`);
//
//         if (isBlockContent) {
//             setBlockContent(isBlockContent);
//         }
//     })
//
//     return (
//         <div className="text-updater-node" style={{background: data.background}}>
//             <Snackbar
//                 open={open}
//                 autoHideDuration={2000}
//                 anchorOrigin={{ vertical, horizontal }}
//                 onClose={handleClose}
//             >
//                 <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
//             </Snackbar>
//             <Backdrop
//                 sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
//                 open={loading}
//                 onClick={handleBackdropClose}
//             >
//                 <CircularProgress color="inherit" />
//             </Backdrop>
//             <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xl">
//                 <Editor height="100vh" width="50vw" theme="vs-dark" defaultLanguage={data.language} defaultValue={blockContent} onChange={handleEditorChange}/>
//             </Dialog>
//             {data.type !== "loader" && (<Handle type="target" position={Position.Left} isConnectable={isConnectable} />)}
//             <div>
//                 <div className="custom-node__header">
//                     <strong>{data.label}</strong>
//                 </div>
//                 <div className="custom-node__body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     {data.editable ?
//                         <Button variant="filled" sx={{ backgroundColor: "#f0f0f0", '&:hover': { bgcolor: "darkgray", color: "black" }}} onClick={handleDialogOpen}>
//                             Edit Block
//                         </Button>
//                         :
//                         <LockIcon sx={{ fontSize: 50 }}/>
//                     }
//                 </div>
//             </div>
//             {data.type !== "exporter" && (<Handle type="source" position={Position.Right} isConnectable={isConnectable}  />)}
//         </div>
//     );
// }
//
// export default TextUpdaterNode;

import * as React from 'react';
import { Handle, Position } from 'reactflow';
import LockIcon from '@mui/icons-material/Lock';
import {
    Alert,
    Backdrop,
    CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {UPLOAD_TEMP_FILE} from "../utils/apiEndpoints";
import Cookies from "js-cookie";


function TextUpdaterNode({ data, isConnectable }) {
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [blockContent, setBlockContent] = React.useState(data.content);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [variableDialogOpen, setVariableDialogOpen] = React.useState(false);
    const [values, setValues] = React.useState(Object.keys(data.params).reduce((acc, curr) => {
        acc[curr] = data.params[curr] === "file" ? null : '';
        return acc;
    }, {}));
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

    const handleVariableDialogClose = () => {
        setVariableDialogOpen(false);
    }

    const handleDialogOpen = () => {
        if (Object.keys(data.params).length > 0) {
            setVariableDialogOpen(true);
        } else {
            setDialogOpen(true);
        }
    }

    const handleEditorChange = (value, event) => {
        setBlockContent(value);
    }

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        const newValue = files ? files[0] : value;
        setValues({ ...values, [name]: newValue });
    };

    const renderInputField = (key, type) => {
        if (type === 'file') {
            return (
                <TextField
                    key={key}
                    name={key}
                    type="file"
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                    inputProps={{
                        accept: ".csv",
                    }}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                />
            );
        } else {
            return (
                <TextField
                    key={key}
                    name={key}
                    fullWidth
                    label={key}
                    type={type === 'int' ? 'number' : 'text'}
                    value={values[key]}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                />
            );
        }
    };

    React.useEffect(() => {
        if (!data.created) {
            localStorage.setItem(`${data.pipeline_name}-${data.name}-block-content`, blockContent);
        }
    }, [blockContent, data.pipeline_name, data.name]);

    React.useEffect(() => {
        if (isRun.current || data.created) return;

        isRun.current = true;

        const isBlockContent = localStorage.getItem(`${data.pipeline_name}-${data.name}-block-content`);

        if (isBlockContent) {
            setBlockContent(isBlockContent);
        }
    }, [])

    const handleSubmit = () => {
        const textEntries = {};

        let fileInput = null;

        for (const [key, value] of Object.entries(values)) {
            if (data.params[key] === 'file') {
                fileInput = value;
            } else {
                textEntries[key] = value;
            }
        }
        localStorage.setItem(`${data.pipeline_name}-${data.name}-variables`, JSON.stringify(textEntries));

        if (fileInput) {
            const formData = new FormData();

            formData.append("file", fileInput);
            formData.append("tags", JSON.stringify({}));
            formData.append("name", textEntries["initial_name"]);

            axios({
                method: "PUT",
                url: UPLOAD_TEMP_FILE,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${Cookies.get("token")}`,
                    'Content-Type': 'multipart/form-data',
                }
            }).catch((error) => {
                console.error(error);
            })
        }
        handleVariableDialogClose();
    }

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
            <Dialog open={variableDialogOpen} onClose={handleVariableDialogClose} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <DialogTitle>ENTER VARIABLES</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {data.params &&
                        Object.entries(data.params).map(([key, type]) => {
                            return (
                                renderInputField(key, type)
                            )
                        })
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={handleSubmit}>Submit</Button>
                </DialogActions>
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
