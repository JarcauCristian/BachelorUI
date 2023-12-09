import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, TextField} from "@mui/material";
import {useEffect} from "react";
import CsvUploader from "../components/connectors/CsvUploader";
import Typography from "@mui/material/Typography";

function getWindowDimensions() {
    const { innerWidth: width } = window;
    return width;
}
const uploadOptions = ["Rabbit MQ", "CSV File"]
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
        <>
        <Box className="mydiv"
            sx={{
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: "center"
            }}
        >
            <Typography variant="h3">SELECT DATASOURCE (CSV OR RABBIT MQ)</Typography>
            <Autocomplete sx={{ color: 'white', backgroundColor: "black", width: "90vw", borderRadius: 2 }} renderInput={(params) => <TextField {...params} sx={{color: "white", backgroundColor: "white"}} label="Data Source" />}
                          options={uploadOptions}
                          value={value}
                          onChange={(event, newValue) => {
                              setValue(newValue);
                          }}
            />
            <CsvUploader token={token} display={value} windowWidth={windowWidth}/>
        </Box>
            </>
    );
}

export default DataUploader