import * as React from 'react';
import { Handle, Position } from 'reactflow';
import LockIcon from '@mui/icons-material/Lock';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
    Backdrop,
    CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, FormControl, InputLabel, Select,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {UPLOAD_TEMP_FILE} from "../utils/apiEndpoints";
import Cookies from "js-cookie";
import MenuItem from "@mui/material/MenuItem";


function TextUpdaterNode({ data, isConnectable }) {
    const isRun = React.useRef(false);
    const isVariablesRun = React.useRef(false);
    const [blockContent, setBlockContent] = React.useState(data.content);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [variableDialogOpen, setVariableDialogOpen] = React.useState(false);
    const [values, setValues] = React.useState(Object.keys(data.params).reduce((acc, curr) => {
        acc[curr] = data.params[curr] === "file" ? null : '';
        return acc;
    }, {}));
    const [loading, setLoading] = React.useState(false);

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
        } else if (type === 'int' || type === 'str') {
            if (key === "new category") {
                return (
                    <TextField
                        key={key}
                        name={key}
                        fullWidth
                        label={key + " Leave empty if you pick from the categories."}
                        type={type === 'int' ? 'number' : 'text'}
                        value={values[key]}
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
        } else if (type === "secret") {
            return (
                <TextField
                    key={key}
                    name={key}
                    fullWidth
                    label={key}
                    type={'password'}
                    value={values[key]}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                />
            );
        } else if (Array.isArray(type) && type.every(item => typeof item === 'string')) {
            return (
                <FormControl key={key} fullWidth sx={{ mb: 2 }}>
                    <InputLabel>{key}</InputLabel>
                    <Select
                        name={key}
                        value={values[key]}
                        onChange={handleInputChange}
                    >
                        {type.map((item, index) => (
                            <MenuItem key={index} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        return null;
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

    const allFieldsFilled = () => {
        let condition = true;
        for (let [key, value] of Object.entries(values)) {
            if (key !== "new category" && (value === '' || value === null)) {
                condition = false;
                break;
            }
        }

        return condition;
    };

    React.useEffect(() => {
        if (isVariablesRun.current) return;

        isVariablesRun.current = true;

        const inter = JSON.parse(localStorage.getItem(`${data.pipeline_name}-${data.name}-variables`));
        const aux = {}

        if (inter) {
            Object.entries(inter).forEach(([key, value]) => {
                if (key === "name") {
                    aux[key] = value.split("/").pop();
                } else {
                    aux[key] = value;
                }
            });
            setValues(aux);
        }
    }, [])


    const handleSubmit = () => {
        const textEntries = {};

        let fileInput = null;

        for (const [key, value] of Object.entries(values)) {
            if (data.params[key] === 'file') {
                fileInput = value;
            } else {
                if (key === 'name') {
                    textEntries[key] = Cookies.get("userID").split("-").join("_") + + "/" + value;
                } else if (key === 'password') {
                    data.hasSecret(true);
                    data.addSecret(prevState => [
                        ...prevState,
                        {
                            name: key,
                            value: value
                        }
                    ])
                } else if (key === 'new_category' && !value) {
                    continue;
                } else {
                    textEntries[key] = value;
                }
            }
        }
        if (!allFieldsFilled()) {
            data.toast("Please enter values for all the fields in the dialog!", "error");
            return;
        }

        localStorage.setItem(`${data.pipeline_name}-${data.name}-variables`, JSON.stringify(textEntries));

        if (fileInput) {
            const formData = new FormData();

            formData.append("file", fileInput);
            formData.append("tags", JSON.stringify({}));
            formData.append("name",  Cookies.get("userID").split("-").join("_") + "/" + data.pipeline_name + "/" + textEntries["initial_name"]);
            formData.append("temporary", true);

            axios({
                method: "PUT",
                url: UPLOAD_TEMP_FILE,
                data: formData,
                headers: {
                    'Authorization': `Bearer ${Cookies.get("token")}`,
                    'Content-Type': 'multipart/form-data',
                }
            }).then((_) => {
                data.toast("Variables set successfully!", "success");
            }).catch((_) => {
                data.toast("Error uploading file!", "error");
            })
        }

        handleVariableDialogClose();
    }

    return (
        <div className="text-updater-node" style={{background: data.background}}>
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
                <div className="custom-node__header" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                    <strong>{data.label}</strong>
                    {data.editable &&
                        <HighlightOffIcon onClick={() => data.onDelete(data.name)}/>
                    }
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
