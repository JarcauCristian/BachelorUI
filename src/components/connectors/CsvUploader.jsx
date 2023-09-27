import React from 'react'
import {Divider, FormControl, FormGroup, FormLabel, Input, Snackbar, Alert, TextField} from "@mui/material";
import Button from "@mui/material/Button";
const CsvUploader = ({token}) => {
    const [fileToUpload, setFileToUpload] = React.useState(null);
    const [severity, setSeverity] = React.useState(null);
    const [datasetName, setDatasetName] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [open, setOpen] = React.useState(false);
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
                    const mage_options = {
                        method: "POST",
                        body: {
                            "pipeline_run": {
                                "variables": {
                                    "location": location
                                }
                            }
                        },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                    fetch("https://mage.sedimark.work/api/pipeline_schedules/4/pipeline_runs/e966058741f542ddbfa82046e9edce4a",
                        mage_options).then(() => {
                            setSeverity("success");
                            setMessage("Dataset Uploaded successfully!");
                            setOpen(true);
                        }).catch((err) => {
                            setMessage(err.message);
                            setSeverity("error");
                            setOpen(true);
                        })
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
    );
}

export default CsvUploader