import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, TextField} from "@mui/material";
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
        <>
        <Box className="mydiv"
            sx={{
                backgroundColor: '#001F3F',
                display: 'flex',
                flexDirection: 'column',
                alignItems: "center"
            }}
        >
            <Autocomplete sx={{ color: 'white', backgroundColor: "white", width: "90vw", borderRadius: 2 }} renderInput={(params) => <TextField {...params} sx={{color: "white"}} label="Data Source" />}
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