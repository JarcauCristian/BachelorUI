import * as React from 'react';
import { Handle, Position } from 'reactflow';
import axios from "axios";
import {Alert, Backdrop, CircularProgress, Dialog, DialogTitle, List, Snackbar, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import {stringify} from "qs";
import Editor from "@monaco-editor/react";


function TextUpdaterNode({ data, isConnectable }) {
    const [selects, setSelects] = React.useState(Array(data.params.length > 0 ? data.params.length : 1).fill({name: "", value: ""}));
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [blockContent, setBlockContent] = React.useState("");
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [blockData, setBlockData] = React.useState({});

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

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleTextFieldChange = (event, key) => {
        blockData[key] = event.target.value;
        console.log(blockData);
    }

    React.useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;
        let arr = [];
        for (let param of data.params) {
            arr.push(param)
        }
        setSelects(arr);

        setLoading(true);
        if (data.language === "yaml") {
            axios({
                method: "GET",
                url: "http://localhost:7000/block/read?block_name=" + data.name + "&pipeline_name=" + data.pipeline_name,
                responseType: "blob"
            }).then((response) => {
                const reader = new FileReader();

                reader.onload = (event) => {
                    const content = event.target.result;
                    try {
                        const parsedData = JSON.parse(content);
                        setBlockContent(parsedData);
                        let aux = {};
                        Object.entries(parsedData).map(([key, value]) => {
                            aux[key] = value;
                        })
                        setBlockData(aux);
                        console.log(aux);
                        setLoading(false);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                        setLoading(false);
                    }
                };

                reader.readAsText(response.data);

            }).catch((error) => {
                setLoading(false);
                handleToast("Error getting block content", "error");
            })
        } else {
            setLoading(false);
        }
    }, [data.params, data.language])

    const handleChange = (value, index) => {
        selects[index] = value;
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
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <Editor height="100vh" width="100vw" defaultLanguage="python" defaultValue={data.content} />
            </Dialog>
            {data.type !== "loader" && (<Handle type="target" position={Position.Left} isConnectable={isConnectable} />)}
            <div>
                <div className="custom-node__header">
                    <strong>{data.label}</strong>
                </div>
                {data.language === "yaml" ? (
                    <div className="custom-node__body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Dialog onClose={handleDialogClose} open={dialogOpen}>
                            <DialogTitle sx={{ fontWeight: "bold" }}> RABBITMQ CONFIGURATION</DialogTitle>
                            <List>
                                {Object.entries(blockContent).map(([key, value]) => (
                                    <ListItem key={key} style={{ display: "flex", flexDirection: "column", alignItems: "space-around", justifyContent: "flex-start" }}>
                                            <Typography variant="p" sx={{ color: "black", fontWeight: "bold" }}>
                                                {key.includes("_") ? key.split("_").slice(0, -1).join(" ").toUpperCase() : key.toUpperCase()}
                                            </Typography>
                                        {key.includes("optional") ? <Typography variant="p" sx={{ color: "black", fontWeight: "bold"}}>{value}</Typography> :
                                            <TextField fullWidth  size="small" label={key} placeholder={value} variant="outlined" onChange={(event) => handleTextFieldChange(event, key)} />
                                        }
                                    </ListItem>
                                ))}
                            </List>
                        </Dialog>
                        <Button
                            variant="outlined"
                            sx={{ color: "white", borderColor: "white", marginRight: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}}
                            onClick={handleDialogOpen}
                        >
                            Set Configuration
                        </Button>
                    </div>
                ) : (
                    <div className="custom-node__body" style={{ display: data.params.length > 0 ? 'block' : 'none'}}>
                        {data.params.map((param, index) => (
                            <div key={index}>
                                <label>{param.includes("_") ? param.split("_").map((par) => {return par.charAt(0).toUpperCase() + par.slice(1)}).join(" ") : param.charAt(0).toUpperCase() + param.slice(1)}</label>
                                <select style={{width: "100%"}} className="nodrag" onChange={(e) => handleChange(e.target.value, index)} value={selects[index].value}>
                                    <option>
                                        1
                                    </option>
                                    <option>
                                        2
                                    </option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {data.type !== "exporter" && (<Handle type="source" position={Position.Right} isConnectable={isConnectable}  />)}
        </div>
    );
}

export default TextUpdaterNode;
