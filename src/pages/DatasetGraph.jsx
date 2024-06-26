import * as React from 'react'
import {nodeTypes} from "../components/utils/nodeTypes";
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Controls,
    MiniMap,
    useEdgesState,
    useNodesState
} from "reactflow";
import Typography from "@mui/material/Typography";
import {Alert, Backdrop, CircularProgress, Snackbar} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import {GET_ALL_NODES} from "../components/utils/apiEndpoints";


const DatasetGraph = () => {

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [loading, setLoading] = React.useState(false);
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);

        axios({
            method: "GET",
            url: GET_ALL_NODES,
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            let initialNodes = [];
            let initialEdges = [];
            let positions = {}

            let first_node;
            let offset = 0;
            const yOffset = 150;
            const categoryNodes = [];

            for (let node of response.data) {
                if (node["label"] === "base") {
                    positions[node["name"]] = [0, 0];
                    first_node = node;
                } else if (node["label"] === "category") {
                    categoryNodes.push(node);
                }
            }

            let newYOffset = 150;

            for (let i = 0; i < categoryNodes.length; i++) {
                if (i % 2 === 1 && i > 0) {
                    offset += 300;
                }
                positions[categoryNodes[i]["name"]] = [i === 0 ? offset : (i % 2 === 0 ? offset : -offset), yOffset];
                newYOffset = 150;
                for (let j = 0; j < categoryNodes[i]["under_nodes"].length; j+=2) {
                    newYOffset += yOffset;
                    if (categoryNodes[i]["under_nodes"].length === 1) {
                        positions[categoryNodes[i]["under_nodes"][j]] = [positions[categoryNodes[i]["name"]][0], newYOffset];
                    } else if (categoryNodes[i]["under_nodes"].length === 2 || categoryNodes[i]["under_nodes"].length - i === 2) {
                        positions[categoryNodes[i]["under_nodes"][j]] = [positions[categoryNodes[i]["name"]][0], newYOffset];
                        positions[categoryNodes[i]["under_nodes"][j + 1]] = [positions[categoryNodes[i]["name"]][0] + 150, newYOffset];
                    } else if (categoryNodes[i]["under_nodes"].length - i === 1) {
                        positions[categoryNodes[i]["under_nodes"][j]] = [positions[categoryNodes[i]["name"]][0] , newYOffset];
                    } else {
                        positions[categoryNodes[i]["under_nodes"][j]] = [positions[categoryNodes[i]["name"]][0] , newYOffset];
                        positions[categoryNodes[i]["under_nodes"][j + 1]] = [positions[categoryNodes[i]["name"]][0]  + 150, newYOffset];
                        positions[categoryNodes[i]["under_nodes"][j + 2]] = [positions[categoryNodes[i]["name"]][0]  - 150, newYOffset];
                    }
                }
            }

            for (let node of response.data) {
                const type = node["label"];
                initialNodes.push({
                    id: node.name,
                    type: 'neo4j',
                    position: {x: positions[node.name][0], y: positions[node.name][1]},
                    data: {
                        type: type,
                        name: node.name,
                        user: node.user,
                        hasInformation: node["hasInformation"],
                        toast: handleToast,
                        load: setLoading,
                    },
                    draggable: false
                })
            }

            const Edges = (nodes, currentNode) => {
                currentNode["under_nodes"].forEach((downBlock, index) => {
                    initialEdges.push({
                        id: `${currentNode.name}-${downBlock}`,
                        source: currentNode.name,
                        target: downBlock,
                        style: { stroke: 'black' },
                        deletable: false,
                        focusable: false,
                        updatable: false,
                        selected: false,
                    })

                    Edges(nodes, nodes.find(node => node.name === downBlock))
                })
            }

            Edges(response.data, first_node);

            setNodes(initialNodes);
            setEdges(initialEdges);
            setLoading(false);
        }).catch((_) => {
            setLoading(false);
            handleToast("Could not get datasets!", "error");
            setNodes([]);
        })
    }, [setEdges, setNodes]);

    const handleToast = (message, severity) => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    }

    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setToastOpen(false);
    };

    const onNodesChange = React.useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange = React.useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, {...eds, deletable: false, selectable: false, style: {stroke: "black"}})),
        [setEdges]
    );

    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <Snackbar
                open={toastOpen}
                autoHideDuration={5000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleToastClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: 'gray', zIndex: (theme) => theme.zIndex.drawer + 1, display: "flex", flexDirection: "column" }}
                open={loading}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h4" sx={{ color: "white" }}>Loading Datasets</Typography>
            </Backdrop>
            {nodes.length > 0 ?
                <ReactFlow nodes={nodes}
                           edges={edges}
                           onNodesChange={onNodesChange}
                           onEdgesChange={onEdgesChange}
                           snapToGrid
                           nodeTypes={nodeTypes}
                           fitView>
                    <Controls />
                    <MiniMap style={{height: 120}} zoomable pannable/>
                </ReactFlow>
                :
                <Typography variant="h2" sx={{ fontSize: width < 1000 ? "1rem" : "3rem", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>NO DATASETS TO DISPLAY</Typography>
            }
        </div>
    );
}

export default DatasetGraph;