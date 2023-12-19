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
import {useEffect, useMemo} from "react";
import {nodeTypes} from "./utils/nodeTypes";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AddIcon from '@mui/icons-material/Add';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import {Alert, Backdrop, CircularProgress, Snackbar} from "@mui/material";
import axios from "axios";
import {CREATE_BLOCK} from "./utils/apiEndpoints";
import Cookies from "js-cookie";


const ReactFlowPanel = (props) => {
    const edgeUpdateSuccessful = React.useRef(true);
    const { children, value, index, ...other } = props;

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [open, setOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [creationFailed, setCreationFailed] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [isPipelineCreated, setIsPipelineCreated] = React.useState(false);

    const handleToast = (message, severity) => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleBackdropClose = () => {
        setLoading(false);
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

    useEffect(() => {
        const new_nodes = [];
        Object.entries(other.componentNodes).forEach(([key, value]) => {
            if (key === "transformers") {
                for (let i of value) {
                    new_nodes.push(i);
                }
            } else {
                if (value !== "") {
                    new_nodes.push(value);
                }
            }
        })

        setNodes(new_nodes);
    }, [other.componentNodes, setNodes]);

    const createPipeline = () => {
        if (nodes.length === 0) {
            handleToast("Pipeline is empty!", "error");
        } else {
            setLoading(true);
            for (let node of nodes) {
                const downStreamBlocks = [];
                const upStreamBlocks = [];
                for (let edge of edges) {
                    if (edge.source === node.id) {
                        downStreamBlocks.push(edge.target);
                    } else {
                        upStreamBlocks.push(edge.source);
                    }
                }

                const blob = node.data.language === "yaml" ? new Blob([node.data.content], { type: "text/yaml"}) : new Blob([node.data.content], { type: "application/octet-stream"})
                const file = new File([blob], "random");

                const formData = new FormData();
                formData.append("file", file);
                formData.append("block_name", node.id);
                formData.append("block_type", node.data.type === "loader" || node.data.type === "exporter" ? "data_" + node.data.type : node.data.type);
                formData.append("pipeline_name", node.data.pipeline_name + "_" + Cookies.get("userID").split("-").join("_"));
                formData.append("downstream_blocks", downStreamBlocks);
                formData.append("upstream_blocks", upStreamBlocks);
                formData.append("language", node.data.language);

                axios({
                    method: "POST",
                    url: CREATE_BLOCK,
                    data: formData,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((response) => {

                }).catch((error) => {
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
                setIsPipelineCreated(true);
                handleToast("Pipeline Created Successfully!", "success");
            }
        }
    }

    const onEdgeClick = React.useCallback((oldEdge, newConnection) => {

    }, []);

    return (
        <div
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
            <Backdrop
                sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {value === index && (
                    isPipelineCreated ?
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            width: 400,
                            height: 70,
                            borderRadius: 2,
                            backgroundColor: "#36454f",
                            position: "absolute",
                            zIndex: 2,
                            marginLeft: "35vw",
                            marginTop: "2vh"
                        }}>
                            <PlayCircleIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}}/>
                            <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Run
                                Pipeline</Typography>
                        </Box> :
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            width: 400,
                            height: 70,
                            borderRadius: 2,
                            backgroundColor: "#36454f",
                            position: "absolute",
                            zIndex: 2,
                            marginLeft: "35vw",
                            marginTop: "2vh"
                        }}>
                            <AddIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={createPipeline}/>
                            <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Create
                                Pipeline</Typography>
                        </Box>
            )}
            {value === index && (
                <ReactFlow key={index}
                           nodes={nodes}
                           edges={edges}
                           onNodesChange={onNodesChange}
                           onEdgesChange={onEdgesChange}
                           snapToGrid
                           onEdgeClick={onEdgeClick}
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
