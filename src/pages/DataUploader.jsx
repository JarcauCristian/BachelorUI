import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, Divider, FormLabel, Input, Paper, TextField} from "@mui/material";
import { FormGroup } from "@mui/material";
import {useEffect} from "react";
import {FormControl} from "@mui/material";
import Button from "@mui/material/Button";

function getWindowDimensions() {
    const { innerWidth: width } = window;
    return width;
}
const uploadOptions = ["JSON File", "CSV File"]
const DataUploader = () => {
    const [windowWidth, setWindowWidth] = React.useState(getWindowDimensions());
    const [value, setValue] = React.useState(null);
    const [filesToUpload, setFilesToUpload] = React.useState([])

    const handleFilesChange = (files) => {
        // Update chosen files
        setFilesToUpload([ ...files ])
    };

    const uploadFiles = () => {
        // Create a form and post it to server
        let formData = new FormData()
        filesToUpload.forEach((file) => formData.append("files", file))

        fetch("/file/upload", {
            method: "POST",
            body: formData
        })
    }
    console.log(value)

    useEffect(() => {
        function handleResize() {
            setWindowWidth(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <Box className="mydiv"
            sx={{
                backgroundColor: '#001F3F',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Autocomplete sx={{ color: 'white', backgroundColor: "white" }} renderInput={(params) => <TextField {...params} sx={{color: "white"}} label="Data Source" />}
                          options={uploadOptions}
                          value={value}
                          onChange={(event, newValue) => {
                              setValue(newValue);
                          }}
            />
            <Paper elevation={24} sx={{backgroundColor: "#F5F5F5", margin: 10, padding: 10, display: value === null ? "none" : "flex", maxWidth: windowWidth - 100, alignItem: "center", justifyContent: "space-evenly"}}>
                <FormGroup sx={{width: 500, color: "#FFFFFF", display: value === null ? "none" : "flex"}}>
                    <FormControl>
                        <FormLabel sx={{fontWeight: "bold", color: "black", marginLeft: 23}}>Upload {value}</FormLabel>
                        <Divider sx={{backgroundColor: "black"}}/>
                        <Input sx={{marginTop: 5}} type="file"/>
                    </FormControl>
                    <Button variant="contained" sx={{backgroundColor: "#001f3f", marginTop: 10}} onClick={uploadFiles}>Upload</Button>
                </FormGroup>
            </Paper>
        </Box>
    );
}

export default DataUploader