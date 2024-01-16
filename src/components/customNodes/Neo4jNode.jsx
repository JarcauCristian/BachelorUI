import * as React from 'react';
import { Handle, Position } from 'reactflow';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function Neo4jNode({ data, isConnectable }) {

    const handleClick = () => {
        alert(`Type: ${data.type}`);
    }

    return (
        <div className="neo4j-node" style={{
            border: '2px solid #2b4b6f',
            borderRadius: '8px',
            padding: '10px',
            background: data.type === "base" ? '#4877ff' : data.type === "category" ? '#7d55ec' : '#ffcc19',
            color: 'white',
            width: '100px',
        }}>
            {data.type !== "base" && (<Handle type="target" position={Position.Top} style={{ backgroundColor: "black" }} isConnectable={isConnectable} />)}
            {data.hasInformation ?
                <Button onClick={handleClick} sx={{ fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#36454F", color: "white", '&:hover': { backgroundColor: "#36454F", color: "white" } }}>
                    {data.name.toUpperCase()}
                </Button>
                :
                <Typography sx={{ fontWeight: "bold", padding: 0 }}>
                    {data.name.toUpperCase()}
                </Typography>
            }
            {data.type !== "dataset" && (<Handle type="source" position={Position.Bottom} style={{ backgroundColor: "#FCCB06" }} isConnectable={isConnectable} />)}
        </div>
    );
}

export default Neo4jNode;
