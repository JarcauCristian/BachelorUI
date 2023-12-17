import * as React from 'react';
import PropTypes from "prop-types";
import ReactFlow, {addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap} from "reactflow";
import {useEffect, useMemo} from "react";
import TextUpdaterNode from "./customNode/TextUpdaterNode";
import {nodeTypes} from "./utils/nodeTypes";

const ReactFlowPanel = (props) => {
    const { children, value, index, ...other } = props;

    const [nodes, setNodes] = React.useState([]);
    const [edges, setEdges] = React.useState(other.componentEdges);

    const onConnect = React.useCallback((params) => setEdges((eds) => addEdge({...params, style: {stroke: "black"}}, eds)), [setEdges]);

    const onNodesChange = React.useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = React.useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, {...eds, style: {stroke: "black"}})),
        [setEdges]
    );

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
                           onConnect={onConnect}
                           nodeTypes={nodeTypes}
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
