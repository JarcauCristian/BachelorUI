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
    TextField,
    Box, Switch, Tooltip, alpha, FormGroup
} from "@mui/material";
import Button from "@mui/material/Button";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { parse } from 'papaparse';
import {UPLOAD_TEMP_FILE} from "../utils/apiEndpoints";
import Cookies from "js-cookie";
import Transition from "../utils/transition";
import MenuItem from "@mui/material/MenuItem";
import yaml from "js-yaml";
import FormControlLabel from "@mui/material/FormControlLabel";
import {styled} from "@mui/material/styles";
import {common} from "@mui/material/colors";

const BlackSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: common["black"],
        '&:hover': {
            backgroundColor: alpha(common["black"], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: common["black"],
    },
}));


function TextUpdaterNode({ data, isConnectable }) {
    const isRun = React.useRef(false);
    const isVariablesRun = React.useRef(false);
    const [blockContent, setBlockContent] = React.useState(data.content);
    const [content, setContent] = React.useState(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [variableDialogOpen, setVariableDialogOpen] = React.useState(false);
    const [values, setValues] = React.useState(Object.keys(data.params).reduce((acc, curr) => {
        acc[curr] = data.params[curr] === "file" ? null : data.params[curr] === "bool" ? true : '';
        return acc;
    }, {}));
    const [newCategory, setNewCategory] = React.useState(false);
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

    const handleEditorChange = (value, _) => {
        setBlockContent(value);
    }

    const handleInputChange = (e) => {
        const { name, checked, value, files } = e.target;
    
        let newValue;

        if (files) {
            newValue = files[0];
        } else if (value === 'on' && typeof values[name] === "boolean") {
            newValue = checked;
        } else {
            newValue = value;
        }
    
        if (files && newValue.type === "text/csv") {
            const auxFile = newValue;
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const result = parse(content, { preview: 1 });
                if (result.data.length > 0) {
                    const columnNames = result.data[0];
                    const columnDescriptions = {};
                    for (let entry of columnNames) {
                        columnDescriptions[entry] = "(Column Description)";
                    }

                    const yamlData = yaml.dump(columnDescriptions, {});

                    setContent(yamlData);
                    setValues({
                        ...values,
                        [name]: auxFile,
                        "columnNames": columnNames,
                        "column_descriptions": columnDescriptions
                    });
                }
            };
            reader.readAsText(newValue);
        } else {
            setValues({ ...values, [name]: newValue });
        }
    };
    

    const handleEditor = (value) => {
        setContent(value);

        try {
            const yamlContent = yaml.load(value, undefined);
            setValues({
                ...values,
                "column_descriptions": yamlContent
            });
        } catch {
            data.toast("YAML Format Incorrect!", "error");
        }
    }

    const renderInputField = (key, type) => {
        if (type === 'file') {
            return (
                <Box key={key} name={key} fullWidth sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", overflow: "auto", maxHeight: "1000px" }}>
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
                    />
                    {"columnNames" in values && (
                        <FormControl key={key} fullWidth sx={{ mb: 2, mt: 2 }}>
                            <Tooltip title="This column will be used, if you share the dataset, as the target column for the ML models">
                                <InputLabel>Target Column (Hover to see details!)</InputLabel>
                            </Tooltip>
                            <Select
                                name="target_column"
                                value={values["target_column"]}
                                onChange={handleInputChange}
                            >
                                { values["columnNames"].map((item, index) => (
                                    <MenuItem key={index} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {"columnNames" in values && (
                        <Editor height="100vh" width="50vw" theme="vs-dark" defaultLanguage="yaml" defaultValue={content} onChange={handleEditor}/>
                    )}
                </Box>
            );
        } else if (type === 'int' || type === 'str') {
            if (key === "new_category") {
                return (
                    <Box key={key} sx={{ mb: 2, mt: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <TextField
                            name={key}
                            fullWidth
                            label={key.split("_").join(" ").toUpperCase()}
                            type={type === 'int' ? 'number' : 'text'}
                            value={values[key]}
                            onChange={handleInputChange}
                            sx={{ mb: 2, display: newCategory ? "block" : "none" }}
                        />
                        <Button fullWidth variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={() => setNewCategory(!newCategory)}>{newCategory ? "Remove New Category" : "Add New Category"}</Button>
                    </Box>
                );
            } else if (key === "target_column") {
                return (
                    <Tooltip title="This column will be used, if you opt for sharing this dataset, as the target column for the ML models, please specify it exactly how is it in the table.">
                        <TextField
                            key={key}
                            name={key}
                            fullWidth
                            label={key.split("_").join(" ").toUpperCase()}
                            type={type === 'int' ? 'number' : 'text'}
                            value={values[key]}
                            onChange={handleInputChange}
                            sx={{ mb: 2, mt: 2 }}
                        />
                    </Tooltip>
                );
            } else {
                return (
                    <TextField
                        key={key}
                        name={key}
                        fullWidth
                        label={key.split("_").join(" ").toUpperCase()}
                        type={type === 'int' ? 'number' : 'text'}
                        value={values[key]}
                        onChange={handleInputChange}
                        sx={{ mb: 2, mt: 2 }}
                    />
                );
            }
        } else if (type === "secret") {
            return (
                <TextField
                    key={key}
                    name={key}
                    fullWidth
                    label={key.split("_").join(" ").toUpperCase()}
                    type={'password'}
                    value={values[key]}
                    onChange={handleInputChange}
                    sx={{ mb: 2, mt: 2 }}
                />
            );
        } else if (type === "bool") {
            return (
                <FormGroup key={key} sx={{ mb: 2, mt: 2 }}>
                    <Tooltip title="Check if you want to share your data with data scientists!">
                        <FormControlLabel control={<BlackSwitch inputProps={{ 'aria-label': 'controlled' }} name={key} label={key} onChange={handleInputChange} checked={values[key]} />} label="Share Your Data" />
                    </Tooltip>
                </FormGroup >
            );
        } else if (Array.isArray(type) && type.every(item => typeof item === 'string')) {
            return (
                <FormControl key={key} fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel>{key.split("_").join(" ").toUpperCase()}</InputLabel>
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
            localStorage.setItem(`${data.pipeline_name}-${data.nodeID}-block-content`, JSON.stringify(blockContent));
        }
    }, [data.nodeID, data.created, blockContent, data.pipeline_name]);

    React.useEffect(() => {
        if (isRun.current || data.created) return;

        isRun.current = true;

        const isBlockContent = localStorage.getItem(`${data.pipeline_name}-${data.nodeID}-block-content`);

        if (isBlockContent) {
            setBlockContent(JSON.parse(isBlockContent));
        }
    }, [data.nodeID, data.created, data.pipeline_name]);

    const allFieldsFilled = () => {
        let condition = true;

        for (let [key, value] of Object.entries(values)) {
            if (key === "columnNames") {
                continue;
            }
            if (key === "column_descriptions") {
                for (let [, v] of Object.entries(values["column_descriptions"])) {
                    if (v === '' || v === null || v === "(Column Description)") {
                        condition = false;
                        break;
                    }
                }
                if (!condition) {
                    break;
                }
            }
            if ((key !== "new_category" && key !== "category") && (value === '' || value === null)) {
                condition = false;
                break;
            }
        }

        if (Object.keys(values).includes("category")) {
            if (condition) {
                if ((values["new_category"] && !values["category"]) || (!values["new_category"] && values["category"])) {
                    condition = true;
                } 
            }
        }

        return condition;
    };

    React.useEffect(() => {
        if (isVariablesRun.current) return;

        isVariablesRun.current = true;

        const inter = JSON.parse(localStorage.getItem(`${data.pipeline_name}-${data.nodeID}-variables`));
        const aux = {}

        if (inter) {
            Object.entries(inter).forEach(([key, value]) => {
                if (key === "name" || key === "initial_name") {
                    aux[key] = value.split("/").pop();
                } else {
                    aux[key] = value;
                }
            });
            setValues(aux);
        }
    }, [data.nodeID, data.pipeline_name])

    const handleSubmit = () => {
        const textEntries = {};

        let fileInput = null;

        for (const [key, value] of Object.entries(values)) {
            if (data.params[key] === 'file') {
                fileInput = value;
            } else {
                if (key === 'columnNames') {
                    continue;
                }
                if (key === 'name') {
                    textEntries[key] = Cookies.get("userID").split("-").join("_") + "/" + value;
                }else if (key === 'initial_name') {
                    textEntries[key] = Cookies.get("userID").split("-").join("_") + "/" + data.pipeline_name + "/" + value;
                } else if (key === 'password') {
                    data.hasSecret(true);
                    data.addSecret(prevState => {
                        if (prevState.some(item => item.name === key)) {
                            return prevState;
                        } else {
                            return [
                                ...prevState,
                                {
                                    name: key,
                                    value: value
                                }
                            ];
                        }
                    })
                } else if (key === 'column_descriptions') {
	                textEntries[key] = JSON.stringify(value);
                } else {
                    textEntries[key] = value;
                }
            }
        }

        if (!allFieldsFilled()) {
            data.toast("Please enter values for all the fields in the dialog!", "error");
            return;
        }

        localStorage.setItem(`${data.pipeline_name}-${data.nodeID}-variables`, JSON.stringify(textEntries));

        if (fileInput) {
            data.toast("Uploading File!", "success");
            const formData = new FormData();

            formData.append("file", fileInput);
            formData.append("tags", JSON.stringify({}));
            formData.append("name", textEntries["initial_name"]);
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
        } else {
            data.toast("Variables set successfully!", "success");
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
            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="xl" TransitionComponent={Transition} keepMounted>
                <Editor height="100vh" width="50vw" theme="vs-dark" defaultLanguage={data.language} defaultValue={blockContent} onChange={handleEditorChange}/>
            </Dialog>
            <Dialog TransitionComponent={Transition} maxWidth={"columnNames" in values ? "xll" : "l"} keepMounted open={variableDialogOpen} onClose={handleVariableDialogClose} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxHeight: "1000px" }}>
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
                        <HighlightOffIcon sx={{ cursor: "pointer" }} onClick={() => data.onDelete(data.nodeID)}/>
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
