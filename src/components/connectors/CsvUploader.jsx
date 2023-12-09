import React from 'react'
import axios from 'axios'
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
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
const CsvUploader = ({token, display, windowWidth}) => {
    const [fileToUpload, setFileToUpload] = React.useState(null);
    const [severity, setSeverity] = React.useState(null);
    const [datasetName, setDatasetName] = React.useState(null);
    const [datasetDescription, setDatasetDescription] = React.useState(null);
    const [datasetDomain, setDatasetDomain] = React.useState(null);
    const [message, setMessage] = React.useState(null);
    const [statistics, setStatistics] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const navigate = useNavigate();

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

    const handleDatasetDomainChange = (event) => {
        setDatasetDomain(event.target.value)
    };

    const handleRedirect = () => {
        navigate("/data_orchestration");
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const getStatistics = () => {
        const location = window.sessionStorage.getItem("location");

        const customHeaders = {
            'Authorization': `Bearer ${Cookies.get("token")}`,
        };

        const axiosInstance = axios.create({
            baseURL: `http://localhost:7000`,
            headers: customHeaders,
        });

        axiosInstance.get(`/get_statistics?dataset_path=${location}`)
            .then(response => {
                console.log(response.data)
                setStatistics(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                handleToast("Error getting the statistics!", "error");
                setIsLoading(false);
            });
    }

    const uploadFiles = async () => {
        if (datasetName !== null && fileToUpload !== null && datasetDescription !== null)
        {
            const regex = /^([a-z]?[0-9]?-?_?)+$/;

            if (!regex.test(datasetName))
            {
                handleToast("Dataset Name should only contain letters, numbers and underscores.", "error")
            } else {
                let formData = new FormData()
                formData.append("file", fileToUpload)
                formData.append("name", datasetName)
                formData.append("tags", JSON.stringify({
                    "Description": datasetDescription,
                    "Domain": datasetDomain
                }))
                const options = {
                    method: "PUT",
                    body: formData,
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("token")}`
                    }
                }
                setIsLoading(true);
                await fetch('http://localhost:9000/upload', options).then(
                    (response) =>  response.json()
                ).then((data) => {
                    setIsLoading(false);
                    window.sessionStorage.setItem("location", data.message.location)
                    const reader = new FileReader();
                    reader.onload = async ({ target }) => {
                        const csv = Papa.parse(target.result, { header: true });
                        const parsedData = csv?.data;
                        setData(parsedData);
                    };
                    reader.readAsText(fileToUpload)
                    setIsLoading(true);
                    getStatistics();
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
                backgroundColor: "#000000",
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
                    <FormLabel sx={{fontWeight: "bold", color: "white"}}>Upload a CSV File</FormLabel>
                    <Divider sx={{fontSize: 2, backgroundColor: "white"}}/>
                    <FormControl sx={{marginTop: 5}}>
                        <FormLabel sx={{fontWeight: "bold", color: "white"}}>Dataset Name</FormLabel>
                        <TextField id="outlined-basic" variant="outlined" placeholder="Enter Dataset Name" onChange={handleDatasetNameChange} sx={{ color: "white", backgroundColor: "white", borderRadius: 2 }}/>
                    </FormControl>
                    <FormControl sx={{marginTop: 5}}>
                        <FormLabel sx={{fontWeight: "bold", color: "white"}}>Dataset Description</FormLabel>
                        <TextField id="outlined-basic" variant="outlined" placeholder="Enter Dataset Description" onChange={handleDatasetDescriptionChange} sx={{ color: "white", backgroundColor: "white", borderRadius: 2}}/>
                    </FormControl>
                    <FormControl sx={{marginTop: 5}}>
                        <FormLabel sx={{fontWeight: "bold", color: "white"}}>Dataset Domain</FormLabel>
                        <TextField id="outlined-basic" variant="outlined" placeholder="Enter Dataset Domain" onChange={handleDatasetDomainChange} sx={{ color: "white", backgroundColor: "white", borderRadius: 2}}/>
                    </FormControl>
                    <FormControl>
                        <Input sx={{marginTop: 5, backgroundColor: 'white', borderRadius: 2}} type="file" onChange={handleFilesChange}/>
                    </FormControl>
                    <Button variant="contained" sx={{backgroundColor: "white", color: "black", marginTop: 10, '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={uploadFiles}>Upload</Button>
                </FormGroup>
            </Paper>
            <Paper elevation={24} sx={{
                backgroundColor: "#000000",
                margin: 10,
                padding: 10,
                display: data === null ? "none" : "block",
                flexDirection: "column",
                maxWidth: windowWidth - 100,
                alignItems: "center",
                justifyContent: "space-around",
                gap: 5
            }}>
            {data !== null ? <DataTable data={data} name={datasetName} ids={null}/> : ""}
            </Paper>
            { statistics !== null ?
            <Paper elevation={24} sx={{
                backgroundColor: "#000000",
                margin: 10,
                padding: 10,
                display: data === null ? "none" : "block",
                flexDirection: "row",
                maxWidth: windowWidth - 100,
                alignItems: "center",
                justifyContent: "space-around",
                gap: 5
            }}>
                <div style={{ flex: 2 }}>
                    {statistics !== null ? <DataTable data={statistics.df} name={"Statistics"} ids={statistics.columns_dataset} /> : ""}
                    <Button variant="contained" sx={{backgroundColor: "white", color: "black", marginTop: 10, '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={handleRedirect}>Go To Pipelines!</Button>
                </div>
            </Paper>
                : ""
            }
        </div>
    );
}

export default CsvUploader