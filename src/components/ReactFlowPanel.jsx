import * as React from 'react';
import PropTypes from "prop-types";
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
    updateEdge, useEdgesState, useNodesState
} from "reactflow";
import {nodeTypes} from "./utils/nodeTypes";
import Box from "@mui/material/Box";
import {
    Alert,
    Dialog,
    DialogTitle,
    FormControl,
    InputLabel, Select,
    Snackbar,
} from "@mui/material";
import axios from "axios";
import {
    CREATE_BLOCK,
    CREATE_PIPELINE_TRIGGER,
    MODIFY_DESCRIPTION,
    PIPELINE_SECRET,
    PIPELINE_VARIABLES
} from "./utils/apiEndpoints";
import Cookies from "js-cookie";
import PipelineSteps from "./PipelineSteps";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DateTimePicker} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import Transition from './utils/transition';
import RunHistory from './RunHistory';


const ReactFlowPanel = (props) => {
    const edgeUpdateSuccessful = React.useRef(true);
    const { children, value, index, ...other } = props;

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [open, setOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [toastDuration, setToastDuration] = React.useState(2000);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [loading, setLoading] = React.useState(false);
    const [streamDialogOpen, setStreamDialogOpen] = React.useState(false);
    const [runInterval, setRunInterval] = React.useState("hourly");
    const [dateTime, setDateTime] = React.useState(new Date());
    const [localUpdate, setLocalUpdate] = React.useState(false);
    const [secrets, setSecrets] = React.useState([]);
    const [hasSecrets, setHasSecrets] = React.useState(false);
    const isRun = React.useRef(false);

    const handleToast = (message, severity, duration = 2000) => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastDuration(duration);
        setOpen(true);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const onConnect = React.useCallback((params) => setEdges((eds) => addEdge({...params, selectable: false, deletable: true, style: {stroke: "black"}}, eds)), [setEdges]);

    const onNodesChange = React.useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = React.useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, {...eds, deletable: true, selectable: false, style: {stroke: "black"}})),
        [setEdges]
    );

    const onEdgeUpdateStart = React.useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = React.useCallback((oldEdge, newConnection) => {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    }, [setEdges]);

    const onEdgeUpdateEnd = React.useCallback((_, edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, [setEdges]);
    const isValidConnection = (connection) => {
        const { source, target } = connection;

        return source !== target;
    };

    const handleDialogClose = () => {
        setStreamDialogOpen(false);
    }

    const handleDateTimeChange = (newValue) => {
        setDateTime(newValue);
    }

    React.useEffect(() => {
        if (!localUpdate) {
            const new_nodes = [];
            if (other.componentNodes) {
                Object.entries(other.componentNodes).forEach(([key, value]) => {
                    if (key === "transformers") {
                        for (let i of value) {
                            new_nodes.push(i);
                        }
                    } else {
                        if (value !== "" && (key === "loader" || key === "exporter")) {
                            new_nodes.push(value);
                        }
                    }
                })

                setNodes(new_nodes);
            }
        }
        setLocalUpdate(false);
    }, [localUpdate, other.componentNodes, setNodes]);

    const deleteNode = (nodeId) => {
        const nodeToDelete = nodes.find((n) => n.id === nodeId);
        if (!nodeToDelete) return;

        localStorage.removeItem(`${Cookies.get("userID").split("-").join("_")}-${other.pipeline_name}-${nodeToDelete.id}-block-content`);

        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

        let localStoragePipeline = localStorage.getItem(`pipeline-${Cookies.get("userID").split("-").join("_")}-${other.pipeline_name}`);
        const toSave = {[other.type]: {}}
        if (localStoragePipeline) {
            localStoragePipeline = JSON.parse(localStoragePipeline);

            for (let [k, v] of Object.entries(localStoragePipeline[other.type])) {
                if (k === "loader" && nodeToDelete.data.type === "loader") {
                    toSave[other.type][k] = "";
                } else if (k === "exporter" && nodeToDelete.data.type === "exporter") {
                    toSave[other.type][k] = "";
                } else if (k === "transformers" && nodeToDelete.data.type === "transformers") {
                    toSave[other.type][k] = v.filter((n) => n.nodeId !== nodeId);
                } else {
                    toSave[other.type][k] = v;
                }
            }
        }

        localStorage.setItem(`pipeline-${Cookies.get("userID").split("-").join("_")}-${other.pipeline_name}`, JSON.stringify(toSave));

        setLocalUpdate(true);
        other.setPipes((prevState) => {
            const newState = prevState;
            if (nodeToDelete.data.type === 'transformer') {
                newState[other.pipeline_name][other.type].transformers = newState[other.pipeline_name][other.type].transformers.filter(t => t.id !== nodeId);
            } else if(nodeToDelete.data.type === 'loader' || nodeToDelete.data.type === 'exporter') {
                newState[other.pipeline_name][other.type][nodeToDelete.data.type] = "";
            }

            let index = 0;
            for (let i = 0; i < nodes.length; i++) {
                if  (nodes[i].id === nodeToDelete.id) {
                    index = i;
                    break;
                }
            }

            newState[other.pipeline_name][other.type]["blockPosition"] = index * 300;

            return newState;
        });
    };



    const createPipeline = async () => {
        let creationFailed = false;

        const timeoutID = setTimeout(() => {
            setLoading(true);
        }, 500);

        if (nodes.length === 0) {
            setLoading(false);
            clearTimeout(timeoutID);
            handleToast("Pipeline is empty!", "error");
            return;
        }
        if (edges.length === 0) {
            setLoading(false);
            clearTimeout(timeoutID);
            handleToast("Can't create pipeline without edges!", "error");
            return;
        }
        if (edges.length !== nodes.length - 1) {
            setLoading(false);
            clearTimeout(timeoutID);
            handleToast("Please connect all the nodes together!", "error");
            return;
        }

        let hasLoader = false;
        let hasExporter = false;

        for (let node of nodes) {
            if (node.data.type === "loader") {
                hasLoader = true;
            } else if (node.data.type === "exporter") {
                hasExporter = true;
            }
        }

        if (!hasLoader || !hasExporter) {
            setLoading(false);
            clearTimeout(timeoutID);
            handleToast("Pipeline should have a loader and an exporter!", "error");
            return;
        }

        let variables = {};
        let counter = 0;
        if (other.type === "batch") {
            for (let node of nodes) {
                if (Object.keys(node.data.params).length > 0) {
                    const blockVariable = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-${other.pipeline_name}-${node.id}-variables`);
                    if (blockVariable) {
                        for (let [key, value] of Object.entries(JSON.parse(blockVariable))) {
                            variables[key] = value;
                        }
                    } else {
                        counter++;
                    }
                }
            }
        }

        variables["PIPELINE_NAME"] = other.pipeline_name;

        // Verify if all the blocks have all the variables set.
        if (counter > 0) {
            handleToast("Please add all the variables for all the blocks!", "error");
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }

        // Verify if some blocks has secrets and if it has them completed.
        if (hasSecrets && secrets.length === 0) {
            handleToast("Please add all the secrets for all the blocks!", "error");
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }

        // If the secrets length is greater than zero apply the secrets to the pipeline.
        if (secrets.length > 0) {
            try {
                for (let i = 0; i < secrets.length; i++) {
                    const secret = secrets[i];
                    secret["name"] = secret["name"] + "-" + other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_");
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    await axios({
                        method: "POST",
                        url: PIPELINE_SECRET,
                        data: secret
                    });
                }
                handleToast("Created Secrets!", "success", 1000);
            } catch (_) {
                handleToast("Could not create all the secrets secrets!", "error");
                creationFailed = true;
            }
        }

        try {
            await axios({
                method: "POST",
                url: PIPELINE_VARIABLES,
                data: {
                    name: other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
                    variables: variables
                }
            });
        } catch (_) {
            handleToast("Variables for the pipeline could not be added, please try again!", "error");
            creationFailed = true;
        }

        if (creationFailed) {
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }

        handleToast("Created Pipeline Variables!", "success", 1000);

        for (let node of nodes) {
            if (creationFailed) {
                break;
            }

            const downStreamBlocks = [];
            const upStreamBlocks = [];

            for (let edge of edges) {
                if (edge.source === node.id) {
                    downStreamBlocks.push(edge.target);
                } else if (edge.target === node.id) {
                    upStreamBlocks.push(edge.source);
                }
            }

            const blob = node.data.language === "yaml" ? new Blob([node.data.content], { type: "text/yaml"}) :
                new Blob([node.data.content], { type: "application/octet-stream"});

            const file = new File([blob], "random");
            const formData = new FormData();
            formData.append("file", file);
            formData.append("block_name", node.id);
            formData.append("block_type", node.data.type === "loader" || node.data.type === "exporter" ? "data_" + node.data.type : node.data.type);
            formData.append("pipeline_name", node.data.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"));
            formData.append("downstream_blocks", downStreamBlocks.length === 0 ? [] : downStreamBlocks);
            formData.append("upstream_blocks", upStreamBlocks.length === 0 ? [] : upStreamBlocks);
            formData.append("language", node.data.language);
            try {
                await axios({
                    method: "POST",
                    url: CREATE_BLOCK,
                    data: formData,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                handleToast(`Created block ${node.data.name}!`, "success", 1000);
            } catch (e) {
                console.error(e);
                handleToast(`Block ${node.data.name} Could Not Be Created!`, "error");
                creationFailed = true;
            }
        }

        if (creationFailed) {
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }


        setNodes(prevNodes => prevNodes.map(node => ({
            ...node,
            draggable: false,
        })));
        setEdges(prevNodes => prevNodes.map(edge => ({
            ...edge,
            focusable: false,
            updatable: false,
        })));

        try {
            await axios({
                method: "PUT",
                url: MODIFY_DESCRIPTION,
                data: {
                    "name": other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
                    "description": "created"
                }
            })
        } catch (_) {
            handleToast("Could not update the description of the pipeline!", "error");
            creationFailed = true;
        }

        handleToast("Updated Description!", "success", 1000);

        if (creationFailed) {
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }

        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if(key.includes(other.pipeline_name)) {
                localStorage.removeItem(key);
            }
        });

        setNodes(nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                editable: false
            }
        })));

        const payload = other.type === "batch" ? {
            "name": other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
            "trigger_type": "api",
        } : {
            "name": other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
            "trigger_type": "time",
            "interval": runInterval,
            "start_time": dateTime.toISOString()
        }

        try {
            await axios({
                method: "POST",
                url: CREATE_PIPELINE_TRIGGER,
                data: payload
            });
        } catch (_) {
            creationFailed = true;
        }

        if (creationFailed) {
            clearTimeout(timeoutID);
            setLoading(false);
            return;
        }

        handleToast("Pipeline Created Successfully!", "success");

        setLoading(false);

        other.setPipes((prevState) => ({
            ...prevState,
            [other.pipeline_name]: {
                [other.type]: {
                    ...prevState[other.pipeline_name][other.type],
                    loader: prevState[other.pipeline_name][other.type].loader,
                    transformers:  prevState[other.pipeline_name][other.type].transformers,
                    exporter:  prevState[other.pipeline_name][other.type].exporter,
                    edges: prevState[other.pipeline_name][other.type].edges,
                    created: true,
                    blockPosition: prevState[other.pipeline_name][other.type].blockPosition
                },
            }
        }))

        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).includes(other.pipeline_name)) {
                localStorage.removeItem(localStorage.key(i));
            }
        }

        window.location.reload();
    }

    const handleChange = (event) => {
        setRunInterval(event.target.value);
    };

    React.useEffect(() => {
        if (!other.created) {
            if (isRun.current) return;

            isRun.current = true;

            setEdges(other.componentEdges);
        }
    }, [setEdges, other.componentEdges, other.created]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (!other.created) {
                localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-${other.pipeline_name}-edges`, JSON.stringify(edges));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [setEdges, other, edges]);

    const handleOpenDialog = () => {
        setStreamDialogOpen(true);
    }

    const handleSubmit = () => {
        if (!runInterval || !dateTime) {
            handleToast("Both fields are required", "error");
        } else {
            const now = new Date();
            if (dateTime >= now) {
                setStreamDialogOpen(false);
                createPipeline();
            } else {
                handleToast("Please select a datetime that is in the future!", "error");
            }
        }
    }

    return (
        <div
            key={index}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ width: "88vw", height: "93vh" }}>
            <Snackbar
                open={open}
                autoHideDuration={toastDuration}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Dialog open={streamDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth TransitionComponent={Transition} keepMounted>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        p: 4,
                    }}
                >
                    <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
                        {"Pipeline Schedule".toUpperCase()}
                    </DialogTitle>
                    <FormControl
                        fullWidth
                        sx={{
                            '& .MuiFormControl-root': {
                                mb: 2,
                            },
                        }}
                    >
                        <InputLabel>Trigger Interval</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={runInterval}
                            onChange={handleChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            sx={{ mb: 2 }} // Margin bottom
                        >
                            <MenuItem value={"hourly"}>Hourly</MenuItem>
                            <MenuItem value={"daily"}>Daily</MenuItem>
                            <MenuItem value={"monthly"}>Monthly</MenuItem>
                        </Select>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                slotProps={{ textField: { variant: 'outlined' } }}
                                label="Start Time For Trigger"
                                value={dateTime}
                                onChange={handleDateTimeChange}
                                sx={{ mb: 2 }}
                            />
                        </LocalizationProvider>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "black",
                                color: "white",
                                '&:hover': { backgroundColor: "gray", color: "black" },
                                mt: 2,
                            }}
                            onClick={handleSubmit}
                        >
                            Create Pipeline
                        </Button>
                    </FormControl>
                </Box>
            </Dialog>
            {value === index && (
                <PipelineSteps createPipeline={createPipeline} pipelineType={other.type} toast={handleToast} openDialog={handleOpenDialog} pipelineCreated={other.created} loading={loading} nodesName={other.orderBlockNames} pipelineName={other.pipeline_name}/>
            )}
            {value === index && (
                <RunHistory pipelineCreated={other.created} pipelineName={other.pipeline_name}/>
            )}
            {value === index && (
                <ReactFlow key={index}
                           nodes={nodes ? nodes.map((node) => ({
                               ...node,
                               data: {...node.data, nodeID: node.id, onDelete: deleteNode, toast: handleToast, addSecret: setSecrets, hasSecret: setHasSecrets}
                           })) : undefined}
                           edges={other.created ? other.componentEdges : edges}
                           onNodesChange={onNodesChange}
                           onEdgesChange={onEdgesChange}
                           snapToGrid
                           onEdgeUpdate={onEdgeUpdate}
                           onEdgeUpdateStart={onEdgeUpdateStart}
                           onEdgeUpdateEnd={onEdgeUpdateEnd}
                           onConnect={onConnect}
                           nodeTypes={nodeTypes}
                           isValidConnection={isValidConnection}
                           fitView>
                    <Controls />
                    <MiniMap style={{height: 120}} zoomable pannable/>
                    <Background style={{background: "#FFFFFF"}} color="#000000" variant="dots" gap={12} size={1} /></ReactFlow>
            )}
        </div>
    );
}

ReactFlowPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};


export default ReactFlowPanel
