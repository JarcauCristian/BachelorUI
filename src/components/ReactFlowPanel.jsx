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

const ReactFlowPanel = (props) => {
    const edgeUpdateSuccessful = React.useRef(true);
    const { children, value, index, ...other } = props;

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

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
    }, [other.componentNodes]);

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ width: "88vw", height: "93vh", paddingRight: other.drawerWidth + 10 }}>
            {value === index && (
                <ReactFlow key={index}
                           nodes={nodes}
                           edges={edges}
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
                    <Background style={{background: "#87CEEB"}} color="#000" variant="dots" gap={12} size={1} /></ReactFlow>
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
