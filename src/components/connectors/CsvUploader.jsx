import React from 'react'
import {Divider, FormControl, FormGroup, FormLabel, Input, Snackbar, Alert, TextField, Paper} from "@mui/material";
import Button from "@mui/material/Button";
import DataTable from "../DataTable";
import Papa from "papaparse";
const CsvUploader = ({token, display, windowWidth}) => {
    const [fileToUpload, setFileToUpload] = React.useState(null);
    const [severity, setSeverity] = React.useState(null);
    const [datasetName, setDatasetName] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState(null);
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

    const handleTextFieldChange = (event) => {
        setDatasetName(event.target.value)
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const uploadFiles = async () => {
        if (datasetName !== null && fileToUpload !== null)
        {
            if (/^([a-z]?[A-Z]?[0-9]?_?])$/.test(datasetName))
            {
                setMessage("Dataset Name should only contain letters, numbers and underscores");
                setOpen(true);
            } else {
                let formData = new FormData()
                formData.append("file", fileToUpload)
                const options = {
                    method: "PUT",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }

                await fetch('http://localhost:8000/upload', options).then(
                    (response) =>  response.json()
                ).then((data) => {
                    const location = data.message.location
                    const reader = new FileReader();
                    reader.onload = async ({ target }) => {
                        const csv = Papa.parse(target.result, { header: true });
                        const parsedData = csv?.data;
                        setData(parsedData);
                    };
                    reader.readAsText(fileToUpload)
                }).catch(
                    (err) => {
                        setMessage(err.message);
                        setOpen(true);
                    }
                )
            }
        } else {
            setMessage("Please fill in all the fields");
            setSeverity("error")
            setOpen(true);
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
                    <TextField id="outlined-basic" variant="outlined" onChange={handleTextFieldChange}/>
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