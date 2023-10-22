import * as React from 'react';
import { Handle, Position } from 'reactflow';


function TextUpdaterNode({ data, isConnectable }) {
    const [selects, setSelects] = React.useState(Array(data.params.length > 0 ? data.params.length : 1).fill({name: "", value: ""}));
    const isRun = React.useRef(false);

    React.useEffect(() => {
        if (isRun.current || data.params.length === 0) return;
        isRun.current = true;

        let arr = []
        for (let param of data.params) {
            arr.push(param)
        }
        setSelects(arr);
    }, [data])

    const handleChange = (value, index) => {
        selects[index] = value;
    }

    return (
        <div className="text-updater-node" style={{background: data.background}}>
            <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

            <div>
                <div className="custom-node__header">
                    <strong>{data.label}</strong>
                </div>
                <div className="custom-node__body" style={{ display: data.params.length > 0 ? 'block' : 'none'}}>
                    {data.params.map((param, index) => (
                        <div key={index}>
                            <label>{param.includes("_") ? param.split("_").map((par) => {return par.charAt(0).toUpperCase() + par.slice(1)}).join(" ") : param.charAt(0).toUpperCase() + param.slice(1)}</label>
                            <select style={{width: "100%"}} className="nodrag" onChange={(e) => handleChange(e.target.value, index)} value={selects[index].value}>
                                <option>
                                    1
                                </option>
                                <option>
                                    2
                                </option>
                            </select>
                        </div>
                    ))}
                </div>
            </div>
            <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
        </div>
    );
}

export default TextUpdaterNode;
