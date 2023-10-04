import React from 'react'
import {
    Divider,
    FormControl,
    FormGroup,
    FormLabel,
    Input,
    Snackbar,
    Alert,
    TextField,
    Paper,
    CircularProgress, drawerClasses
} from "@mui/material";
import Button from "@mui/material/Button";
import DataTable from "../DataTable";
import Papa from "papaparse";
const CsvUploader = ({token, display, windowWidth}) => {
    const [fileToUpload, setFileToUpload] = React.useState(null);
    const [severity, setSeverity] = React.useState(null);
    const [datasetName, setDatasetName] = React.useState(null);
    const [datasetDescription, setDatasetDescription] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"}

    const handleFilesChange = (files) => {
        if (files.target.files[0].type !== "text/csv")
        {
            setMessage("File is not of type CSV");
            setSeverity("error");
            setOpen(true);
            files.target.value = null;
        }
        else {
            setFileToUpload(files.target.files[0])
        }
    };

    const tostify = (message, severity) => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    }

    const handleDatasetNameChange = (event) => {
        setDatasetName(event.target.value)
    };

    const handleDatasetDescriptionChange = (event) => {
        setDatasetDescription(event.target.value)
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const running_pipeline = async (location) => {
        const options = {
            method: "POST",
            body: {
                "pipeline_id": 4,
                "trigger_id": "e966058741f542ddbfa82046e9edce4a",
                "variables": {
                    "location": location
                }
            },
            headers: {
                "Content-Type": "application/json"
            }
        }
        await fetch("http://localhost:7000/run_pipeline", options).then((res) => {
            if (!res.ok) {
                setIsLoading(false);
                tostify("Data not uploaded successfully!", "error");
            }
        }).catch((err) => {
            tostify(err.message, "error");
        })

        await fetch("http://localhost:7000/pipeline_status?pipeline_id=4").then((res) => {
            if (!res.ok) {
                setIsLoading(false);
                tostify("Data not uploaded successfully!", "error");
            } else {
                setIsLoading(false);
                tostify("Data uploaded successfully!", "success");
            }
        })
    }

    const uploadFiles = async () => {
        if (datasetName !== null && fileToUpload !== null && datasetDescription !== null)
        {
            if (/^([a-z]?[A-Z]?[0-9]?_?])$/.test(datasetName) && /^([a-z]?[A-Z]?[0-9]?_?])$/.test(datasetDescription))
            {
                setMessage("Dataset Name should only contain letters, numbers and underscores");
                setOpen(true);
            } else {
                let formData = new FormData()
                formData.append("file", fileToUpload)
                formData.append("tags", `{"DatasetName": ${datasetName}, "DatasetDescription": ${datasetDescription}}`)
                const options = {
                    method: "PUT",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
                setIsLoading(true);
                await fetch('http://localhost:8000/upload', options).then(
                    (response) =>  {
                        if (response.ok) {
                            setIsLoading(false);
                        } else {
                            setIsLoading(false);
                        }
                    }
                ).then((data) => {
                    setIsLoading(false);
                    const reader = new FileReader();
                    reader.onload = async ({ target }) => {
                        const csv = Papa.parse(target.result, { header: true });
                        const parsedData = csv?.data;
                        setData(parsedData);
                    };
                    reader.readAsText(fileToUpload)
                    const location = data.message.location
                    setIsLoading(true);
                    running_pipeline(location);
                }).catch(
                    (err) => {
                        setIsLoading(false);
                        tostify(err.message, "error");
                    }
                )
            }
        } else {
            tostify("Please fill in all the fields", "error");
        }
    }
    return (
        <Paper elevation={24} sx={{
            backgroundColor: "#F5F5F5",
            margin: 10,
            padding: 10,
            display: display === null ? "none" : "flex",
            flexDirection: "column",
            maxWidth: windowWidth - 100,
            alignItems: "center",
            justifyContent: "space-around",
            gap: 5
        }}>
            <CircularProgress sx={{color: "black", display: isLoading ? "block" : "none"}}/>
            <FormGroup sx={{width: 500, color: "#FFFFFF"}}>
                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={handleClose}
                    anchorOrigin={{vertical, horizontal}}
                >
                    <Alert onClose={handleClose} severity={severity}>
                        {message}
                    </Alert>
                </Snackbar>
                <FormLabel sx={{fontWeight: "bold", color: "black"}}>Upload a CSV File</FormLabel>
                <Divider sx={{fontSize: 2, backgroundColor: "black"}}/>
                <FormControl sx={{marginTop: 5}}>
                    <FormLabel sx={{fontWeight: "bold", color: "black"}}>Dataset Name</FormLabel>
                    <TextField id="outlined-basic" variant="outlined" onChange={handleDatasetNameChange}/>
                </FormControl>
                <FormControl sx={{marginTop: 5}}>
                    <FormLabel sx={{fontWeight: "bold", color: "black"}}>Dataset Description</FormLabel>
                    <TextField id="outlined-basic" variant="outlined" onChange={handleDatasetDescriptionChange}/>
                </FormControl>
                <FormControl>
                    <Input sx={{marginTop: 5}} type="file" onChange={handleFilesChange}/>
                </FormControl>
                <Button variant="contained" sx={{backgroundColor: "#001f3f", marginTop: 10}} onClick={uploadFiles}>Upload</Button>
            </FormGroup>
            {data !== null ? <DataTable data={data} /> : ""}
        </Paper>
    );
}

export default CsvUploader