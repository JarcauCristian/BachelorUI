import * as React from 'react';
import '../styles/data_uploader.css';
import Box from "@mui/material/Box";
import {Autocomplete, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";

const uploadOptions = ["Rabbit MQ", "CSV File"]
const DataUploader = ({token}) => {
    const [value, setValue] = React.useState(null);

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
        </Box>
            </>
    );
}

export default DataUploader