import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, Paper, TextField} from "@mui/material";
import {useEffect} from "react";
import CsvUploader from "../components/connectors/CsvUploader";

function getWindowDimensions() {
    const { innerWidth: width } = window;
    return width;
}
const uploadOptions = ["JSON File", "CSV File"]
const DataUploader = ({token}) => {
    const [windowWidth, setWindowWidth] = React.useState(getWindowDimensions());
    const [value, setValue] = React.useState(null);

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
                <CsvUploader token={token} />
            </Paper>
        </Box>
    );
}

export default DataUploader