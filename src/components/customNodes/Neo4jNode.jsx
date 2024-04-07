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
    const [description, setDescription] = React.useState(null);
    const [modelName, setModelName] = React.useState(null);
    const [password, setPassword] = React.useState("");
    const [isHovered, setIsHovered] = React.useState(false);
    const dummyPassword = "*********";
    const navigate = useNavigate();
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        const lastClearedTime = localStorage.getItem(`lastClearedTime-${data.name}_${data.user}`);
        const currentTime = new Date().getTime();

        if (!lastClearedTime) {
            localStorage.removeItem(`${data.name}-${data.user}-dataset-info`);
            localStorage.setItem(`lastClearedTime-${data.name}_${data.user}`, JSON.stringify(currentTime));
        } else  {
            const compare = JSON.parse(lastClearedTime);
            if (currentTime - compare >= 86400000){
                localStorage.removeItem(`${data.name}-${data.user}-dataset-info`);
                localStorage.setItem(`lastClearedTime-${data.name}_${data.user}`, JSON.stringify(currentTime));
            }
        }
    }, [data.user, data.name])

    const handleClick = async () => {
        data.load(true);

        let condition = false;

        try {
            await axios({
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
            })
        } catch (_) {
            condition = true;
        }

        if (condition) {
            data.load(false);
            data.toast("Could not update the dataset information!.", "error");
            return;
        }

        const getFromStorage = JSON.parse(localStorage.getItem(`${data.name}-${data.user}-dataset-info`));
        if (getFromStorage) {
            setDatasetInformation(getFromStorage.datasetInfo);
            setColumnsDescriptions(getFromStorage.columnsDescriptions);
            setCsvData(JSON.parse(getFromStorage["csvData"]));
            data.load(false);
            setOpen(true);
            return;
        }

        const descriptions = {}
        const datasetInfo = {}
        try {
            const response = await axios({
                method: "GET",
                url: GET_DATASET_NEO(data.name, data.user),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                }
            })

            if (response.status === 200) {
                for (let [key, value] of Object.entries(response.data)) {
                    if (!["name", "description", "user", "url", "last_accessed", "dataset_type", "share_data", "target_column"].includes(key)) {
                        descriptions[key] = value;
                    } else {
                        datasetInfo[key] = value;
                    }
                }
                setDatasetInformation(datasetInfo);
                setColumnsDescriptions(descriptions);
            }
        } catch (_) {
            condition = true;
        }

        if (condition) {
            data.load(false);
            data.toast("Could not get the dataset information.", "error");
            return;
        }

        let cData;
        try {
            const response = await axios({
                method: "GET",
                url: GET_DATASET(datasetInfo.url),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                }
            })

            if (response.status === 200) {
                const parseCsvString = (csvString) => {
                    const [headers, ...rows] = csvString.replace("\r", "").split('\n').map((line) => line.split(','));
                    return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
                };
                cData = parseCsvString(response.data);
                setCsvData(cData);
                setOpen(true);
            }
        } catch (_) {
            condition = true;
        }

        if (condition) {
            data.load(false);
            data.toast("Could not get the dataset.", "error");
            return;
        }

        localStorage.setItem(`${data.name}-${data.user}-dataset-info`, JSON.stringify({
            "datasetInfo": datasetInfo,
            "columnsDescriptions": descriptions,
            "csvData": JSON.stringify(cData)
        }));

        data.load(false);
    }

    const handleClose = () => {
        if (open) setOpen(false);
        if (passwordOpen) setPasswordOpen(false);
    }

    const handlePasswordClick = () => {
        setPasswordOpen(false);
        data.load(false);
        navigate("/notebooks");
    }


    const createNotebook = () => {
        if ([undefined, "", null].includes(description)) {
            data.toast("Please enter a description for the notebook!", "info");
            return;
        }

        const regexExpDesc = /^[a-z0-9A-Z _.,?"';:]+$/

        if (!regexExpDesc.test(description)) {
            data.toast("Notebook description can only contain lowercase and uppercase letters, numbers, spaces, underscores and punctuations!", "info");
            return;
        }

        if ([undefined, "", null].includes(modelName)) {
            data.toast("Please enter a name for the model that will result from the notebook!", "info");
            return;
        }

        const regexExp = /^[a-z_]+$/

        if (!regexExp.test(modelName)) {
            data.toast("Model Name can contain only lowercase letters and underscores!", "info");
            return;
        }

        data.load(true);
        setOpen(false);
        axios({
            method: "POST",
            url: CREATE_NOTEBOOK,
            data: {
                "user_id": Cookies.get("userID").split("-").join("_"),
                "description": description,
                "dataset_url": datasetInformation.url,
                "notebook_type": datasetInformation["dataset_type"],
                "dataset_name": data.name,
                "dataset_user": data.user,
                "target_column": datasetInformation["target_column"],
                "model_name": modelName
            },
            headers: {
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            data.load(false);
            setPassword(response.data.password);
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
            fullWidth maxWidth={width < 1200 ? "xl" : width < 1000 ? "x" : "xll"}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <DialogTitle>
                    DATASET INFORMATION
                </DialogTitle>
                {datasetInformation && (
                    <DialogContent sx={{ width: "auto" }}>
                            <Typography variant="p" sx={{ fontWeight: "bold" }}>
                                {datasetInformation.name.toUpperCase() + " BY " + datasetInformation.user}
                            </Typography>
                            <br />
                            <Tooltip title={datasetInformation.description}>
                                <Typography variant="p" sx={{ fontWeight: "bold" }}>
                                    Description: {datasetInformation.description.length > 20 ? datasetInformation.description.slice(0, 20) : datasetInformation.description}
                                </Typography>
                            </Tooltip>
                            {(csvData && columnsDescriptions) && (
                                <DataTable sx={{ mt: 2, mb: 2 }} data={csvData} descriptions={columnsDescriptions} />
                            )}
                            <FormControl sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }} >
                                <FormLabel>
                                    Notebook Description
                                </FormLabel>
                                <TextField fullWidth required label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </FormControl>
                            <FormControl sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }} >
                                <Tooltip title="The name of the model that will be stored inside the platform!">
                                    <FormLabel>
                                        Notebook Model Name
                                    </FormLabel>
                                </Tooltip>
                                <TextField fullWidth required label="Model Name" value={modelName} onChange={(e) => setModelName(e.target.value)} />
                            </FormControl>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={createNotebook} sx={{ fontWeight: "bold", padding: 0, cursor: "pointer", backgroundColor: "#000000", color: "white", '&:hover': { backgroundColor: "white", color: "black" } }}>
                        start notebook
                    </Button>
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
