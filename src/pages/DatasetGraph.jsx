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

const initialNodes = [
    { id: 'node-1', type: "neo4j", position: { x: 0, y: 0 }, data: { type: "leaf", handleCount: 0, name: "First" } },
    { id: 'node-2', type: "neo4j", position: { x: 0, y: 0 }, data: { type: "base", handleCount: 5, name: "Second" } },
    { id: 'node-3', type: "neo4j", position: { x: 0, y: 0 }, data: { type: "normal", handleCount: 3, name: "Third" } }
];

const initialEdges = [
    { id: 'edge-1', source: 'node-2', target: 'node-1' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' },
];


const DatasetGraph = () => {

    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges] = useEdgesState(initialEdges);

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
        </div>
    );
}

export default DatasetGraph;