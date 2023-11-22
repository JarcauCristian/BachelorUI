import * as React from 'react';
import {CardActions, Paper} from "@mui/material";
import bk from "../images/background.png"
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DatasetIcon from '@mui/icons-material/Dataset';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';

const LandingPage = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const handleMouseEnter = () => {
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    return (
        <div style={{backgroundColor: "#D9D9D9", height: "100vh"}}>
            <Paper elevation={10} sx={{backgroundColor: "#FFFFFF", width: "100vw", height: "50vh", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>
                <Card sx={{ minWidth: 500, height: "80%", borderRadius: 5, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                    <CardContent>
                        <Typography variant="h3" sx={{color: "white"}}>
                            Streamline Your AI Workflows
                        </Typography>
                        <Typography variant="p" sx={{color: "white"}}>
                            This site provides many needs to start training AI models in one place based on someone needs. <br/>
                            Starting from choosing the datasets for solving a new problem with Machine Learning. <br/>
                            To writing done the models in one single environment, without the need of using your one resources. <br/>
                            Making this place an all one in the field of Artificial Intelligence.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            size="large"
                            sx={{
                                backgroundColor: isHovered ? "red" : "white",
                                color: isHovered ? "white" : "black",
                                border: isHovered ? "2px solid white" : "",
                                fontWeight: "bold",
                                marginRight: 2
                            }}
                            onMouseEnter={() => handleMouseEnter()}
                            onMouseLeave={() => handleMouseLeave()}
                        >Lets Get Started!</Button>
                    </CardActions>
                </Card>
                <img src={bk} alt="Background!" width="40%" height="100%"/>
            </Paper>
            <Paper elevation={10} sx={{backgroundColor: "black", width: "100vw", height: "50vh", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>
                <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
                    <CardContent>
                        <DatasetIcon sx={{fontSize: 100, color: "black", marginLeft: "25%"}} />
                        <Typography variant="h3" sx={{marginTop: 10}}>
                            Datasets
                        </Typography>
                        <Typography variant="p" sx={{maxWidth: 150, fontWeight: "bold", fontSize: 10}}>
                            Upload Your Own Dataset. <br/>
                            Or Streams of Data.
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
                    <CardContent>
                        <EventNoteIcon sx={{fontSize: 100, color: "black", marginLeft: "25%"}} />
                        <Typography variant="h3" sx={{marginTop: 10}}>
                            Notebooks
                        </Typography>
                        <Typography variant="p" sx={{maxWidth: 150, fontWeight: "bold", fontSize: 10}}>
                            Choose a Maximum of 2 Datasets and Start Training. <br/>
                            A maximum of 10 Notebooks can exist at one time.
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
                    <CardContent>
                        <ModelTrainingIcon sx={{fontSize: 100, color: "black", marginLeft: "25%"}} />
                        <Typography variant="h3" sx={{marginTop: 10}}>
                            Models
                        </Typography>
                        <Typography variant="p" sx={{maxWidth: 150, fontWeight: "bold", fontSize: 10}}>
                            See What Other Models There Are Already. <br/>
                            Select One and Get Predictions On Your Data.
                        </Typography>
                    </CardContent>
                </Card>
            </Paper>
        </div>
    );
}

export default LandingPage