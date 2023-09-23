import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, TextField} from "@mui/material";
import { FormGroup, FormLabel } from "@mui/material";
import {useEffect} from "react";

function getWindowDimensions() {
    const { innerWidth: width } = window;
    return width;
}
const DataUploader = () => {
    const [windowWidth, setWindowWidth] = React.useState(getWindowDimensions());

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
            <Autocomplete sx={{ color: '#FFFFFF', backgroundColor: "white" }} renderInput={(params) => <TextField {...params} label="Data Source" />}
                          options={["First Option", "Second Option"]}
            />

            <FormGroup sx={{width: 200, color: "#FFFFFF"}}>
                <FormLabel>My Input</FormLabel>
                <TextField id="outlined-basic" label="Outlined" variant="outlined" />
            </FormGroup>
        </Box>
    );
}

export default DataUploader