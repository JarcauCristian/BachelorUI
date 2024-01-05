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
import {GET_ALL_NODES} from "../components/utils/apiEndpoints";
import {CAPS} from "../components/utils/utliFunctions";


const DatasetGraph = () => {

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [loading, setLoading] = React.useState(false);
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);

        axios({
            method: "GET",
            url: GET_ALL_NODES
        }).then((response) => {
            let initialNodes = [];
            let initialEdges = [];
            let positions = {}
            let offset = 0;

            const setPosition = (nodes, currentNode, x, y) => {
                positions[currentNode.name] = [x, y];

                currentNode["under_nodes"].forEach((downNode, index) => {
                    const newX = index === 0 ? x : x + (index % 2 === 0 ? offset : -offset);
                    const newY = y + 300;
                    offset += index % 2 === 0 ? 300 : 0;
                    setPosition(nodes, nodes.find(node => node.name === downNode), newX, newY);
                });
            }

            let first_node;
            for (let node of response.data) {
                if (node["upper_node"] === null) {
                    first_node = node;
                }
            }

            setPosition(response.data, first_node, 0, 0);

            for (let node of response.data) {
                const type = node["upper_node"] === null ? "base" : node["under_nodes"].length === 0 ? "leaf" : "middle";
                initialNodes.push({
                    id: node.name,
                    type: 'neo4j',
                    position: {x: positions[node.name][0], y: positions[node.name][1]},
                    data: {
                        type: type,
                        name: node.name,
                        handleCount: node["under_nodes"].length,
                        hasInformation: node["hasInformation"]
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
    }, []);

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

    const handleBackdropClose = () => {
        setLoading(false);
    }


    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <Snackbar
                open={toastOpen}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleToastClose}
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
                <Typography variant="h2" sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>NO DATASETS TO DISPLAY</Typography>
            }
        </div>
    );
}

export default DatasetGraph;