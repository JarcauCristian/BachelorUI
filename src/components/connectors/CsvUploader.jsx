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
    CircularProgress
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
    const [statisctics, setStatistics] = React.useState(null);
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

    const handleToast = (message, severity)  => {
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

    const getStatistics = (data) => {
        const columnStatistics = {}
        Object.keys(data[0]).forEach((column) => {
            console.log(typeof column);
        });
        console.log(columnStatistics);

        setStatistics(columnStatistics);
    }

    const uploadFiles = async () => {
        if (datasetName !== null && fileToUpload !== null && datasetDescription !== null)
        {
            const regex = /^([a-z]?[0-9]?-?_?)+$/;
            console.log(regex.test(datasetName))

            if (!regex.test(datasetName))
            {
                handleToast("Dataset Name should only contain letters, numbers and underscores.", "error")
            } else {
                let formData = new FormData()
                formData.append("file", fileToUpload)
                formData.append("name", datasetName)
                formData.append("tags", JSON.stringify({
                    "Description": datasetDescription
                }))
                const options = {
                    method: "PUT",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
                setIsLoading(true);
                await fetch('https://go.sedimark.work/upload', options).then(
                    (response) =>  {
                        if (response.status !== 201) {
                            handleToast(`An error occurred when uploading the dataset! Status Code: ${response.status}`, "error")
                            setIsLoading(false);
                        }
                    }
                ).then((data) => {
                    setIsLoading(false);
                    window.sessionStorage.setItem("location", data.message.location)
                    const reader = new FileReader();
                    reader.onload = async ({ target }) => {
                        const csv = Papa.parse(target.result, { header: true });
                        const parsedData = csv?.data;
                        getStatistics(parsedData);
                        console.log(parsedData);
                        setData(parsedData);
                    };
                    reader.readAsText(fileToUpload)
                    setIsLoading(true);
                }).catch(
                    (err) => {
                        handleToast(err.message, "error");
                        setIsLoading(false);
                    }
                )
            }
        } else {
            handleToast("Please fill in all the fields", "error");
        }
    }
    return (
        <div>
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
                <CircularProgress sx={{
                    color: "black",
                    display: !isLoading ? "none" : "block"
                }}/>
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
            </Paper>
            <Paper elevation={24} sx={{
                backgroundColor: "#F5F5F5",
                margin: 10,
                padding: 10,
                display: data === null ? "none" : "block",
                flexDirection: "column",
                maxWidth: windowWidth - 100,
                alignItems: "center",
                justifyContent: "space-around",
                gap: 5
            }}>
            {data !== null ? <DataTable data={data} name={datasetName} /> : ""}
            </Paper>
        </div>
    );
}

export default CsvUploader