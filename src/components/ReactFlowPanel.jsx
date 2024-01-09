import * as React from 'react';
import PropTypes from "prop-types";
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls, getConnectedEdges, getIncomers, getOutgoers,
    MiniMap,
    updateEdge, useEdgesState, useNodesState
} from "reactflow";
import {useEffect} from "react";
import {nodeTypes} from "./utils/nodeTypes";
import Box from "@mui/material/Box";
import {
    Alert,
    Dialog,
    DialogTitle,
    FormControl,
    InputLabel, Select,
    Snackbar,
    TextField
} from "@mui/material";
import axios from "axios";
import {CREATE_BLOCK, CREATE_PIPELINE_TRIGGER, MODIFY_DESCRIPTION, PIPELINE_VARIABLES} from "./utils/apiEndpoints";
import Cookies from "js-cookie";
import PipelineSteps from "./PipelineSteps";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DateTimePicker} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";


const ReactFlowPanel = (props) => {
    const edgeUpdateSuccessful = React.useRef(true);
    const { children, value, index, ...other } = props;

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState(other.componentEdges);
    const [open, setOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [creationFailed, setCreationFailed] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [streamDialogOpen, setStreamDialogOpen] = React.useState(false);
    const [runInterval, setRunInterval] = React.useState("hourly");
    const [dateTime, setDateTime] = React.useState(new Date());
    const [localUpdate, setLocalUpdate] = React.useState(false);
    const isRun = React.useRef(0);

    const handleToast = (message, severity) => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const onConnect = React.useCallback((params) => setEdges((eds) => addEdge({...params, selectable: false, deletable: true, style: {stroke: "black"}}, eds)), []);

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
    }, []);

    const onEdgeUpdateEnd = React.useCallback((_, edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, []);
    const isValidConnection = (connection) => {
        const { source, target } = connection;

        if (source === target) {
            return false;
        }

        return true;
    };

    const handleDialogClose = () => {
        setStreamDialogOpen(false);
    }

    const handleDateTimeChange = (newValue) => {
        setDateTime(newValue);
    }

    useEffect(() => {
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
    }, [other.componentNodes, setNodes]);

    const deleteNode = (nodeId) => {
        const nodeToDelete = nodes.find((n) => n.id === nodeId);
        if (!nodeToDelete) return;

        localStorage.removeItem(`${other.pipeline_name}-${nodeToDelete.id}-block-content`);

        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

        setLocalUpdate(true);
        other.setPipes((prevState) => {
            const newState = JSON.parse(JSON.stringify(prevState));
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



    const createPipeline = () => {

        const timeoutID = setTimeout(() => {
            setLoading(true);
        }, 500);

        let variables = {};
        let counter = 0;
        if (other.type === "batch") {
            for (let node of nodes) {
                if (Object.keys(node.data.params).length > 0) {
                    const blockVariable = localStorage.getItem(`${other.pipeline_name}-${node.id}-variables`);

                    if (blockVariable) {
                        for (let [key, value] of Object.entries(JSON.parse(blockVariable))) {
                            if (key === "initial_name"){
                                variables[key] = Cookies.get("userID").split("-").join("_") + "/" + value;
                            } else {
                                variables[key] = value;
                            }
                        }
                    } else {
                        counter++;
                    }
                }
            }
        }

        if (counter > 0) {
            handleToast("Please add all the variables for all the blocks!", "error");
            clearTimeout(timeoutID);
            const newTimeoutID = setTimeout(() => {
                setLoading(false);
            }, 100);

            clearTimeout(newTimeoutID);
            return;
        }

        axios({
            method: "POST",
            url: PIPELINE_VARIABLES,
            data: {
                name: other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
                variables: variables
            }
        }).catch((_) => {
            handleToast("Variables for the pipeline could not be added, please try again!", "error");
        })

        if (nodes.length === 0) {
            handleToast("Pipeline is empty!", "error");
            return;
        }
        if (edges.length === 0) {
            handleToast("Can't create pipeline without edges!", "error");
            return;
        }
        if (edges.length !== nodes.length - 1) {
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
            handleToast("Pipeline should have a loader and an exporter!", "error");
            return;
        }

        for (let node of nodes) {
            const downStreamBlocks: string = [];
            const upStreamBlocks: string = [];

            for (let edge of edges) {
                if (edge.source === node.id) {
                    downStreamBlocks.push(edge.target);
                } else if (edge.target === node.id) {
                    upStreamBlocks.push(edge.source);
                }
            }
            const isInStorage = localStorage.getItem(`${other.pipeline_name}-${node.id}-block-content`);
            const blob = node.data.language === "yaml" ?
                isInStorage ? new Blob([isInStorage], { type: "text/yaml"}) : new Blob([node.data.content], { type: "text/yaml"}) :
                isInStorage ? new Blob([isInStorage], { type: "application/octet-stream"}) : new Blob([node.data.content], { type: "application/octet-stream"})
            const file = new File([blob], "random");
            const formData = new FormData();
            formData.append("file", file);
            formData.append("block_name", node.id);
            formData.append("block_type", node.data.type === "loader" || node.data.type === "exporter" ? "data_" + node.data.type : node.data.type);
            formData.append("pipeline_name", node.data.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"));
            formData.append("downstream_blocks", downStreamBlocks.length === 0 ? [] : downStreamBlocks);
            formData.append("upstream_blocks", upStreamBlocks.length === 0 ? [] : upStreamBlocks);
            formData.append("language", node.data.language);
            axios({
                method: "POST",
                url: CREATE_BLOCK,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).catch((error) => {
                console.log(error);
                handleToast("Block Could Not Be Created!", "error");
                setCreationFailed(true);
            })
        }

        if (!creationFailed) {
            setNodes(prevNodes => prevNodes.map(node => ({
                ...node,
                draggable: false,
            })));
            setEdges(prevNodes => prevNodes.map(edge => ({
                ...edge,
                focusable: false,
                updatable: false,
            })));
            setLoading(false);
            axios({
                method: "PUT",
                url: MODIFY_DESCRIPTION,
                data: {
                    "name": other.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"),
                    "description": "created"
                }
            }).then((_) => {
                handleToast("Pipeline Created Successfully!", "success");
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
                axios({
                    method: "POST",
                    url: CREATE_PIPELINE_TRIGGER,
                    data: payload
                }).then((_) => {
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
                    window.location.reload();
                })
            }).catch((_) => {
                handleToast("Failed to create Pipeline!", "error");
                setLoading(false);
            })
        }
    }

    const handleChange = (event) => {
        setRunInterval(event.target.value);
    };

    React.useEffect(() => {
        if (!other.created) {
            if (isRun.current === 2) return;

            isRun.current++;

            setEdges(other.componentEdges);
        }
    }, [setEdges, other.componentEdges, other.created]);

    React.useEffect(() => {
            if (!other.created && edges !== other.componentEdges) {
                if (other.type === "stream") {
                    other.setPipes((prevState) => ({
                        ...prevState,
                        [other.pipeline_name]: {
                            [other.type]: {
                                ...prevState[other.pipeline_name].stream,
                                loader: prevState[other.pipeline_name].stream.loader,
                                transformers: prevState[other.pipeline_name].stream.transformers,
                                exporter: prevState[other.pipeline_name].stream.exporter,
                                edges: edges,
                                created: prevState[other.pipeline_name].stream.created,
                                blockPosition: prevState[other.pipeline_name].stream.blockPosition
                            },
                        }
                    }))
                } else {
                    other.setPipes((prevState) => ({
                        ...prevState,
                        [other.pipeline_name]: {
                            [other.type]: {
                                ...prevState[other.pipeline_name].batch,
                                loader: prevState[other.pipeline_name].batch.loader,
                                transformers: prevState[other.pipeline_name].batch.transformers,
                                exporter: prevState[other.pipeline_name].batch.exporter,
                                edges: edges,
                                created: prevState[other.pipeline_name].batch.created,
                                blockPosition: prevState[other.pipeline_name].batch.blockPosition
                            },
                        }
                    }))
                }
            }
    }, [edges]);

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
            style={{ width: "88vw", height: "93vh", paddingRight: other.drawerWidth + 10 }}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Dialog open={streamDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
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
                                renderInput={(props) => <TextField {...props} />}
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
                <PipelineSteps createPipeline={createPipeline} pipelineType={other.type} handleToast={handleToast} openDialog={handleOpenDialog} pipelineCreated={other.created} loading={loading} nodesName={other.orderBlockNames} pipelineName={other.pipeline_name}/>
            )}
            {value === index && (
                <ReactFlow key={index}
                           nodes={nodes.map((node) => ({
                               ...node,
                               data: {...node.data, onDelete: deleteNode, toast: handleToast}
                           }))}
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
