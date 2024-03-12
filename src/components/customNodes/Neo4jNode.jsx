import * as React from 'react';
import axios from 'axios';
import { Handle, Position } from 'reactflow';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    TextField,
    Tooltip
} from "@mui/material";
import {CREATE_NOTEBOOK, GET_DATASET, GET_DATASET_NEO, UPDATE_DATASET} from "../utils/apiEndpoints";
import DataTable from "../DataTable";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import Transition from '../utils/transition';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function Neo4jNode({ data, isConnectable }) {
    const [datasetInformation, setDatasetInformation] = React.useState(null);
    const [csvData, setCsvData] = React.useState(null);
    const [columnsDescriptions, setColumnsDescriptions] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [passwordOpen, setPasswordOpen] = React.useState(false);
    const [isStartNotebook, setIsStartNotebook] = React.useState(false);
    const [description, setDescription] = React.useState(null);
    const [notebookID, setNotebookID] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isHovered, setIsHovered] = React.useState(false);
    const dummyPassword = "*********";
    const navigate = useNavigate();

    const handleClick = () => {
        data.load(true);

        axios({
            method: "PUT",
            url: UPDATE_DATASET,
            headers: {
                "Authorization": "Bearer " + Cookies.get("token"),
                "Content-Type": "application/json"
            },
            data: {
                "name": data.name,
                "user": data.user
            }
        }).then((_) => {
            axios({
                method: "GET",
                url: GET_DATASET_NEO(data.name),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                }
            }).then((response) => {
                const getFromStorage = JSON.parse(localStorage.getItem(`${response.data.name}-${response.data.user}-dataset-info`));
    
                if (getFromStorage) {
                    setDatasetInformation(getFromStorage.datasetInfo);
                    setColumnsDescriptions(getFromStorage.columnsDescriptions);
                    setCsvData(getFromStorage.csvData);
                    data.load(false);
                    setOpen(true);
                } else {
                    const descriptions = {}
                    const datasetInfo = {}
                    for (let [key, value] of Object.entries(response.data)) {
                        if (!["name", "description", "user", "url", "last_accessed", "share_data", "dataset_type"].includes(key)) {
                            descriptions[key] = value;
                        } else {
                            datasetInfo[key] = value;
                        }
                    }
                    setDatasetInformation(datasetInfo);
                    setColumnsDescriptions(descriptions);
                    data.load(false);
    
                    axios({
                        method: "GET",
                        url: GET_DATASET(response.data.url),
                        headers: {
                            "Authorization": "Bearer " + Cookies.get("token")
                        }
                    }).then((resp) => {
                        const parseCsvString = (csvString) => {
                            const [headers, ...rows] = csvString.replace("\r", "").split('\n').map((line) => line.split(','));
                            return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
                        };
                        setCsvData(parseCsvString(resp.data));
                        localStorage.setItem(`${response.data.name}-${response.data.user}-dataset-info`, JSON.stringify({
                            "datasetInfo": datasetInfo,
                            "columnsDescriptions": columnsDescriptions,
                            "csvData": parseCsvString(resp.data)
                        }));

                        console.log(parseCsvString(resp.data));
                        setOpen(true);
                    }).catch((_) => {
                        data.toast("Could not get the dataset.", "error");
                    })
                }
            }).catch((_) => {
                data.load(false);
                data.toast("Could not get the dataset information.", "error");
            })
        }).catch((_) => {
            data.toast("Could not update the dataset information!.", "error")
        })
    }

    const handleClose = () => {
        if (open) setOpen(false);
        if (passwordOpen) setPasswordOpen(false);
    }

    const handlePasswordClick = () => {
        setPasswordOpen(false);
        data.load(true);
        setTimeout(() => {
            data.load(false);
            navigate(`/notebooks/${notebookID}_${datasetInformation["dataset_type"].toLowerCase()}`);
        }, 15000)
    }

    const handleStart = () => {
        setIsStartNotebook(!isStartNotebook);
    }

    const createNotebook = () => {
        data.load(true);
        axios({
            method: "POST",
            url: CREATE_NOTEBOOK,
            data: {
                "user_id": Cookies.get("userID").split("-").join("_"),
                "description": description,
                "dataset_url": datasetInformation.url,
                "notebook_type": datasetInformation["dataset_type"],
                "dataset_name": data.name,
                "dataset_user": data.user
            },
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            data.load(false);
            setOpen(false);
            setPassword(response.data.password);
            setNotebookID(response.data["notebook_id"]);
            setPasswordOpen(true);
        }).catch((_) => {
            data.load(false);
            data.toast("Could not create the notebook!", "error");
        })
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
            <Dialog
            TransitionComponent={Transition}
            keepMounted
            open={open} 
            onClose={handleClose} 
            fullWidth maxWidth="xl" 
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <DialogTitle>
                    DATASET INFORMATION
                </DialogTitle>
                {datasetInformation && (
                    <DialogContent sx={{ maxWidth: 1000 }}>
                            <Typography variant="p" sx={{ fontWeight: "bold" }}>
                                {datasetInformation.name.toUpperCase() + " BY " + datasetInformation.user}
                            </Typography>
                            <br />
                            <Tooltip title={datasetInformation.description}>
                                <Typography variant="p" sx={{ fontWeight: "bold" }}>
                                    {datasetInformation.description.length > 20 ? datasetInformation.description.slice(0, 20) : datasetInformation.description}
                                </Typography>
                            </Tooltip>
                            {(csvData && columnsDescriptions) && (
                                <DataTable sx={{ mt: 2, mb: 2 }} data={csvData} descriptions={columnsDescriptions} />
                            )}
                            {!isStartNotebook && (
                                <Button onClick={handleStart} sx={{ mt: 2, mb: 2, fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#000000", color: "white", '&:hover': { backgroundColor: "white", color: "black" } }}>
                                    select dataset
                                </Button>
                            )}
                            {isStartNotebook && (
                                <FormControl sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }} >
                                    <FormLabel>
                                        Notebook Description
                                    </FormLabel>
                                    <TextField fullWidth required label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </FormControl>
                            )}
                    </DialogContent>
                )}
                <DialogActions>
                    {isStartNotebook && (
                        <Button onClick={createNotebook} sx={{ fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#000000", color: "white", '&:hover': { backgroundColor: "white", color: "black" } }}>
                            start notebook
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
            <Dialog 
            open={passwordOpen} 
            onClose={handleClose}
            TransitionComponent={Transition}
            keepMounted
            fullWidth maxWidth="xl" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <DialogTitle>
                    NOTEBOOK CREDENTIALS (Copy and store your password, after this dialog is closed the password will be lost forever!)
                </DialogTitle>
                <DialogContent sx={{ maxWidth: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="p" sx={{ fontWeight: "bold" }}>
                        USERNAME: ai1
                    </Typography>
                    <Typography variant="p" sx={{ fontWeight: "bold" }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                        PASSWORD: {isHovered ? password : dummyPassword}
                    </Typography>
                    <ContentCopyIcon sx={{ cursor: "pointer" }} onClick={() => {navigator.clipboard.writeText(password); data.toast("Password Copied to Clipboard!", "success")}} />
                </DialogContent>
                <DialogActions>
                    <Tooltip title="If the notebook is not spwaned when you arrive on the page, please go to the notebooks page and wait a little bit more until trying again">
                        <Button onClick={handlePasswordClick} sx={{ fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#000000", color: "white", '&:hover': { backgroundColor: "white", color: "black" } }}>
                            go to notebook
                        </Button>
                    </Tooltip>
                </DialogActions>
            </Dialog>
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
