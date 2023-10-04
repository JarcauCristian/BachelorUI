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
<<<<<<< HEAD
    CircularProgress, drawerClasses
=======
    CircularProgress
>>>>>>> 499f5031c6e2e37bcdcd125eea17590a706a1959
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
        console.log("Hello");
        Object.keys(data[0]).forEach((column) => {
            const values = data.map((row) => row[column]);
            if (values.every((value) => typeof value === 'number')) {
                const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
                const stdDev = Math.sqrt(
                    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length
                );
                columnStatistics[column] = { Mean: mean, 'Standard Deviation': stdDev };
            }
        });
        console.log(columnStatistics);

        setStatistics(columnStatistics);
    }

    const uploadFiles = async () => {
        if (datasetName !== null && fileToUpload !== null && datasetDescription !== null)
        {
            if (/^([a-z]?[0-9]?_?])$/.test(datasetName))
            {
                setMessage("Dataset Name should only contain letters, numbers and underscores.");
                setOpen(true);
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

                await fetch('http://localhost:8000/upload', options).then(
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
                        console.log("Something");
                        getStatistics(parsedData);
                        setData(parsedData);
                    };
                    reader.readAsText(fileToUpload)
                    const location = data.message.location
                    setIsLoading(true);
                    running_pipeline(location);
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