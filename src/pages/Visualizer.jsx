import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {useEffect, useRef, useState} from "react";
import {CircularProgress} from "@mui/material";
const Visualizer = ({token}) => {

    const isRun = useRef(false);

    const [patientsData, setPatientsData] = useState([]);

    useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const get = async () => {
            const response = await fetch("http://localhost:8000/get_all_objects?extension=jsonld", {
                    method: 'GET',
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                }
            );
            if (response.ok) {
                const body = await response.json();
                console.log(body);
                setPatientsData(body)
            } else {
                console.log(response.json());
            }
        }

        get().then(() => {}).catch((error) => console.log(error));
    }, [token]);

    return (
        <div style={{ width: "70%", marginLeft: "150px", marginTop: "50px"}}>
        {patientsData.length > 0 ? patientsData.map((item)=>
                    <Card sx={{width: "100%", height: "100px", marginBottom: "25px"}}>
                        <Box sx={{display: 'flex', flexDirection: 'column', border: "2px solid black"}}>
                            <CardContent sx={{flex: '1 0 auto'}}>
                                <Typography component="div" variant="h5">
                                    {Object.keys(item)[0].split("#")[1]}
                                </Typography>
                                <Typography component="div" variant="p">
                                    Tags:
                                </Typography>
                                {
                                    Object.entries(item[Object.keys(item)[0]]).map(([key, value]) => (
                                        <Typography key={key} variant="subtitle1" color="text.secondary" component="div">
                                            {key} : {value.toString()}
                                        </Typography>
                                    ))
                                }
                            </CardContent>
                        </Box>
                    </Card>
            ) : <CircularProgress style={{ position: 'absolute', left: '50%', top: '50%', width: "70px", height: "70px", color: "black"}} />}
        </div>
    );
}

export default Visualizer