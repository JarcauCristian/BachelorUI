import * as React from 'react';
import { Handle, Position } from 'reactflow';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {Tooltip} from "@mui/material";

function Neo4jNode({ data, isConnectable }) {

    const handleClick = () => {
        alert(`Type: ${data.type}`);
    }

    return (
        <div className="neo4j-node" style={{
            border: '2px solid #2b4b6f',
            borderRadius: '8px',
            padding: '10px',
            background: data.type === "base" ? '#404040' : data.type === "category" ? '#666666' : '#000000',
            color: 'white',
            width: '100px',
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {data.type !== "base" && (<Handle type="target" position={Position.Top} style={{ backgroundColor: "black" }} isConnectable={isConnectable} />)}
            {data.hasInformation ?
                <Tooltip title={data.name.toUpperCase()}>
                    <Button onClick={handleClick} sx={{ fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#000000", color: "white", '&:hover': { backgroundColor: "white", color: "black" } }}>
                        {data.name.toUpperCase()}
                    </Button>
                </Tooltip>
                :
                <Tooltip title={data.name.toUpperCase()}>
                    <Typography
                        sx={{ fontWeight: "bold", padding: 0 }}
                    >
                        {data.name.length >= 10 ? data.name.toUpperCase().slice(0, 8) + "..." :  data.name.toUpperCase()}
                    </Typography>
                </Tooltip>
            }
            {data.type !== "dataset" && (<Handle type="source" position={Position.Bottom} style={{ backgroundColor: "#36454F" }} isConnectable={isConnectable} />)}
        </div>
    );
}

export default Neo4jNode;
