import * as React from 'react';
import {Alert, Avatar, CardActions, Dialog, DialogTitle, List, ListItemAvatar, Paper, Snackbar} from "@mui/material";
import bk from "../images/background.png"
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DatasetIcon from '@mui/icons-material/Dataset';
import EventNoteIcon from '@mui/icons-material/EventNote';
import axios from "axios";
import qs from "qs";
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from '@mui/icons-material/Person';
import {useNavigate} from "react-router-dom";
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import Transition from '../components/utils/transition';
import {ADD_ROLE, GET_ROLES} from "../components/utils/apiEndpoints";
import Cookies from "js-cookie";

const LandingPage = ({role, userID}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [hasRole, setHasRole] = React.useState(false);
    const [roles, setRoles] = React.useState([]);
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [open, setOpen] = React.useState(false);
    const {REACT_APP_ADMIN_USERNAME, REACT_APP_ADMIN_PASSWORD, REACT_APP_TOKEN_URL, REACT_APP_CLIENT_ID} = process.env
    const navigate = useNavigate();
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleStartedClick = () => {
        if (role === "data-scientist") {
            navigate("/notebooks");
        } else if (role === "data-producer") {
            navigate("/orchestration");
        }
    }

    const handleListItemClick = (role_name) => {
        let find_index = 0;
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === role_name) {
                find_index = i;
                break;
            }
        }

        const data = {
            user_id: Cookies.get("userID"),
            role_name: roles[find_index].name,
            role_id: roles[find_index].id
        }


        axios({
            method: 'POST',
            url: ADD_ROLE,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get("token")}`
            },
            data: data,
        }).then((_) => {
            handleToast("Role Added Successfully!", "success");
            setHasRole(true);
            window.location.reload();
        }).catch((_) => {
            handleToast("Role could not be added!", "error");
        });
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        if (role === null) {
            setHasRole(false);
        } else {
            setHasRole(true);
        }

        axios({
            method: 'GET',
            url: GET_ROLES,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get("token")}`
            }
        }).then((response) => {
            setRoles(response.data);
        }).catch((_) => {
            handleToast("Could not fetch the roles of the platform!", "error");
        });

    }, [role])

    return (
        <div style={{backgroundColor: "#D9D9D9", height: "100%", marginTop: 82 }}>
            <Snackbar
                open={open}
                autoHideDuration={5000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Dialog open={!hasRole} TransitionComponent={Transition} keepMounted>
                <DialogTitle>Choose Your Role!</DialogTitle>
                <List sx={{ pt: 0 }}>
                    {roles.map((rl) => (
                        <ListItem key={rl.name}>
                            <ListItemButton onClick={() => handleListItemClick(rl.name)}>
                                <ListItemAvatar>
                                    <Avatar sx={{ backgroundColor: "black", color: "white" }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={rl.name} sx={{ color: "black" }}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
            <Paper elevation={10} sx={{backgroundColor: "#FFFFFF", width: "100vw", height: width < 1200 ? "auto" : 500, display: "flex", flexDirection: width < 1200 ? "column" : "row", alignItems: "center", justifyContent: "space-evenly"}}>
                <Card sx={{ mt: width < 1200 ? 2 : 0, mb: width < 1200 ? 2 : 0, height: width < 1200 ? "40%" : "80%", borderRadius: 5, backgroundColor: "black", display: "flex", flexDirection: width < 1200 ? "column" : "row", alignItems: "center", justifyContent: "space-evenly"}}>
                    <CardContent>
                        <Typography variant={width < 1200 ? "h5" : "h3"} sx={{color: "white"}}>
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
                            onClick={handleStartedClick}
                        >Lets Get Started!</Button>
                    </CardActions>
                </Card>
                <img src={bk} alt="Background!" width="40%" height="100%" style={{ display: width < 1200 ? "none" : "block" }}/>
            </Paper>
            <Paper elevation={10} sx={{ backgroundColor: "black", width: "100vw", height: 500, display: "flex", flexDirection: width < 1200 ? "column" : "row", alignItems: "center", justifyContent: "space-evenly"}}>
                <Card sx={{ mt: 2, mb: 2, width: width < 1200 ? 300 : 250, height: width < 1200 ? 400 : 350, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
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
                <Card sx={{ mt: 2, mb: 2, width: width < 1200 ? 300 : 250, height: width < 1200 ? 400 : 350, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
                    <CardContent>
                        <EventNoteIcon sx={{fontSize: 100, color: "black", marginLeft: "25%"}} />
                        <Typography variant="h3" sx={{marginTop: 10}}>
                            Notebooks
                        </Typography>
                        <Typography variant="p" sx={{maxWidth: 150, fontWeight: "bold", fontSize: 10}}>
                            Choose a Dataset and Start Training. <br/>
                            A maximum of 10 Notebooks can exist at one time.
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ mt: 2, mb: 2, width: width < 1200 ? 300 : 250, height: width < 1200 ? 400 : 350, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
                    <CardContent>
                        <AutoAwesomeMotionIcon sx={{fontSize: 100, color: "black", marginLeft: "25%"}} />
                        <Typography variant="h3" sx={{marginTop: 10}}>
                            Pipelines
                        </Typography>
                        <Typography variant="p" sx={{maxWidth: 150, fontWeight: "bold", fontSize: 10}}>
                            Upload the data and start making your ETL pipelines. <br/>
                            A maximum of 10 pipelines can be opened at a time.
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ mt: 2, mb: 2, width: width < 1200 ? 300 : 250, height: width < 1200 ? 400 : 350, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5}} variant="outlined">
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