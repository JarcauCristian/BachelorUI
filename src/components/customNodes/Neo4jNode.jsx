import * as React from 'react';
import { Handle, Position } from 'reactflow';
import CircleIcon from '@mui/icons-material/Circle';
import Typography from "@mui/material/Typography";

function Neo4jNode({ data, isConnectable }) {
    const handleCount = data.handleCount || 4;
    const radius = 50;
    const center = { x: 50, y: 50 };

    const handles = Array.from({ length: handleCount }, (_, index) => {
        const angle = (index / handleCount) * 2 * Math.PI;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);

        return (
            <Handle
                key={index}
                type="source"
                position="right"
                id={`outputHandle${index + 1}`}
                style={{
                    background: '#C0C0C0',
                    borderRadius: '50%',
                    position: 'absolute',
                    marginLeft: '-3px',
                    top: `${y}%`,
                    left: `${x}%`,
                }}
            />
        );
    });

    const handleClick = () => {
        alert(`Type: ${data.type}`);
    }

    return (
        <div className="neo4j-node" style={{ position: "relative", borderRadius: "50%", width: "100%", height: "100%", backgroundColor: "#36454F" }}>
            {data.type !== "base" && (<Handle type="target" position={Position.Bottom} style={{ backgroundColor: "black" }} isConnectable={isConnectable} />)}
            <div>
                <div style={{ padding: 10 }}>
                    <Typography variant="p" sx={{ fontSize: 10, fontWeight: "bold", color: "white" }}>{data.name.toUpperCase()}</Typography>
                </div>
            </div>
            {data.type !== "leaf" && (handles)}
        </div>
    );
}

export default Neo4jNode;
