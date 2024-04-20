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
    Box, Switch, alpha, FormGroup
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
import CustomTooltip from "../CustomTooltip";

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
        if ("columnNames" in values) {
            const newValues = values;
            delete newValues["columnNames"];
            delete newValues["column_descriptions"];
            setValues(newValues);
            setContent("");
        }
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

    const clearFile = () => {
        const newValues = values;
        let foundKey;
        for (let key of Object.keys(newValues)) {
            if (key.includes("file")) {
                foundKey = key;
                break;
            }
        }
        newValues[foundKey] = null;
        delete newValues["columnNames"];
        delete newValues["column_descriptions"];
        setValues(newValues);
        setContent("");
    }

    const handleInputChange = (e) => {
        const { name, checked, value, files } = e.target;
    
        let newValue;

        if (files) {
            if (files[0].size > 1024 * 1024 * 1024) {
                data.toast("CSV file needs to be lower then 1GB.", "info");
                return;
            }
            newValue = files[0];
            const newValues = values;
            delete newValues["columnNames"];
            delete newValues["column_descriptions"];
            setValues(newValues);
            setContent("");
        } else if (value === 'on' && typeof values[name] === "boolean") {
            newValue = checked;
        } else {
            newValue = value;
        }

        if (files && newValue.type === "text/csv" && newValue.size < 1024 * 1024 * 1024) {
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

    const renderInputField = (key, value) => {
        if (value["type"] === 'file') {
            return (
                <Box key={key} name={key} fullWidth sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", overflow: "auto", maxHeight: "1000px" }}>
                    <CustomTooltip title={value["description"]}>
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
                    </CustomTooltip>
                    {"columnNames" in values && (
                        <CustomTooltip title="This column will be used, if you share the dataset, as the target column for the ML models (Don't use if dataset type is clustering)">
                            <FormControl key={key} fullWidth sx={{ mb: 2, mt: 2 }}>
                                <InputLabel>Target Column (Hover to see details!)</InputLabel>
                                <Select
                                    fullWidth
                                    name="target_column"
                                    value={"target_column" in values ? values["target_column"] : ""}
                                    onChange={handleInputChange}
                                >
                                    { values["columnNames"].map((item, index) => (
                                        <MenuItem key={index} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CustomTooltip>
                    )}
                    {"columnNames" in values && (
                        <Editor height="100vh" width="50vw" theme="vs-dark" defaultLanguage="yaml" defaultValue={content} onChange={handleEditor}/>
                    )}
                </Box>
            );
        } else if (value["type"] === 'int' || value["type"] === 'str') {
            if (key === "new_category") {
                return (
                    <Box key={key} sx={{ width: 500, mb: 2, mt: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <CustomTooltip title={value["description"]}>
                                <TextField
                                    name={key}
                                    fullWidth
                                    label={key.split("_").join(" ").toUpperCase()}
                                    type={value["type"] === 'int' ? 'number' : 'text'}
                                    value={values[key]}
                                    onChange={handleInputChange}
                                    sx={{ mb: 2, display: newCategory ? "block" : "none" }}
                                />
                            </CustomTooltip>
                        <Button fullWidth variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={() => setNewCategory(!newCategory)}>{newCategory ? "Remove New Category" : "Add New Category"}</Button>
                    </Box>
                );
            } else if (key === "target_column") {
                return (
                    <CustomTooltip title={value["description"]}>
                        <TextField
                            key={key}
                            name={key}
                            fullWidth
                            label={key.split("_").join(" ").toUpperCase() + " (Don't use if dataset type is clustering)"}
                            type={value["type"] === 'int' ? 'number' : 'text'}
                            value={values[key]}
                            onChange={handleInputChange}
                            sx={{ mb: 2, mt: 2 }}
                        />
                    </CustomTooltip>
                );
            } else {
                return (
                    <CustomTooltip title={value["description"]}>
                        <TextField
                            key={key}
                            name={key}
                            fullWidth
                            label={key.split("_").join(" ").toUpperCase()}
                            type={value["type"] === 'int' ? 'number' : 'text'}
                            value={values[key]}
                            onChange={handleInputChange}
                            sx={{ mb: 2, mt: 2 }}
                        />
                    </CustomTooltip>
                );
            }
        } else if (value["type"] === "secret") {
            return (
                <CustomTooltip title={value["description"]}>
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
                </CustomTooltip>
            );
        } else if (value["type"] === "bool") {
            return (
                <FormGroup key={key} sx={{ mb: 2, mt: 2 }}>
                    <CustomTooltip title={value["description"]}>
                        <FormControlLabel control={<BlackSwitch inputProps={{ 'aria-label': 'controlled' }} name={key} label={key} onChange={handleInputChange} checked={values[key]} />} label="Share Your Data" />
                    </CustomTooltip>
                </FormGroup >
            );
        } else if (value["type"] === "drop_down") {
            return (
                <CustomTooltip title={value["description"]}>
                    <FormControl key={key} fullWidth sx={{ mb: 2, mt: 2 }}>
                        <InputLabel>{key.split("_").join(" ").toUpperCase()}</InputLabel>
                        <Select
                            name={key}
                            value={values[key]}
                            onChange={handleInputChange}
                        >
                            {value["values"].map((item, index) => (
                                <MenuItem key={index} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CustomTooltip>
            );
        }

        return null;
    };

    React.useEffect(() => {
        if (!data.created) {
            localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-${data.pipeline_name}-${data.nodeID}-block-content`, JSON.stringify(blockContent));
        }
    }, [data.nodeID, data.created, blockContent, data.pipeline_name]);

    React.useEffect(() => {
        if (isRun.current || data.created) return;

        isRun.current = true;

        const isBlockContent = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-${data.pipeline_name}-${data.nodeID}-block-content`);

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

        const inter = JSON.parse(localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-${data.pipeline_name}-${data.nodeID}-variables`));
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

    const checkRangesAndRegex = () => {
        let condition = true;

        for (let [key, value] of Object.entries(values)) {
            if (data.params[key]["type"] === "str") {
                const regexPattern = new RegExp(data.params[key]["regex"]);
                if (!regexPattern.test(value)) {
                    if (data.params[key]["regex"] === "^[a-z0-9_]+$") {
                        data.toast(`Variable ${key} can only contain lowercase letters, numbers and underscores.`, "warning");
                    } else if (data.params[key]["regex"] === "^[a-z_]+$") {
                        data.toast(`Variable ${key} can only contain lowercase letters  and underscores.`, "warning");
                    } else {
                        data.toast(`Variable ${key} can only contain valid IPv4 address.`, "warning");
                    }
                    condition = false;
                    break;
                }
            } else if (data.params[key]["type"] === "int") {
                if (value < data.params[key]["range"][0] || value > data.params[key]["range"][1]) {
                    data.toast(`Variable ${key} can only be inside the following range: [${data.params[key]["range"][0]}, ${data.params[key]["range"][1]}]!`, "warning");
                    condition = false;
                    break;
                }
            }
        }

        return condition;
    }

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

        if (!checkRangesAndRegex()) return;

        localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-${data.pipeline_name}-${data.nodeID}-variables`, JSON.stringify(textEntries));

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
            <Dialog TransitionComponent={Transition} maxWidth={"columnNames" in values ? "xll" : "xl"} keepMounted open={variableDialogOpen} onClose={handleVariableDialogClose} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxHeight: "1000px" }}>
                <DialogTitle>ENTER VARIABLES</DialogTitle>
                <DialogContent sx={{ width: "columnNames" in values ? 1000 : 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    {data.params &&
                        Object.entries(data.params).map(([key, value]) => {
                            return (
                                renderInputField(key, value)
                            )
                        })
                    }
                </DialogContent>
                <DialogActions>
                    {"columnNames" in values && (
                        <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={clearFile}>Clear File</Button>
                    )}
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={handleSubmit}>Submit</Button>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" }, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} onClick={handleVariableDialogClose}>Close</Button>
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
