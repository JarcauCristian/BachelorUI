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
import appBarHeight from "../components/utils/appBarHeight";
import useAppBarHeight from "../components/utils/appBarHeight";

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
            navigate("/data_uploader");
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
            client_id: REACT_APP_CLIENT_ID,
            username: REACT_APP_ADMIN_USERNAME,
            password: REACT_APP_ADMIN_PASSWORD,
            grant_type: "password"
        }


        axios({
            method: 'post',
            url: REACT_APP_TOKEN_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify(data),
        }).then(response => {
            const token = response.data.access_token;
            console.log(roles[find_index].id);
            axios(
                {
                    method: 'post',
                    url: "https://62.72.21.79:8442/auth/admin/realms/react-keycloak/users/" + userID + "/role-mappings/realm",
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': "Bearer " + token
                    },
                    data: [
                        {id: roles[find_index].id, name: roles[find_index].name}
                    ]
                }
            ).then((response) => {
                handleToast("Role Added Successfully!", "success");
                setHasRole(true);
                window.location.reload();
            }).catch((error) => {
                handleToast("Error Adding Role!", "error");
            })
        })
            .catch(error => {
                console.error('Error:', error);
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

        const data = {
            client_id: REACT_APP_CLIENT_ID,
            username: REACT_APP_ADMIN_USERNAME,
            password: REACT_APP_ADMIN_PASSWORD,
            grant_type: "password"
        }


        axios({
            method: 'post',
            url: REACT_APP_TOKEN_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: qs.stringify(data),
        }).then(response => {
                const token = response.data.access_token;
                axios(
                    {
                        method: 'get',
                        url: "https://62.72.21.79:8442/auth/admin/realms/react-keycloak/roles",
                        headers: {
                            'Content-Type': "application/json",
                            'Authorization': "Bearer " + token
                        }
                    }
                ).then((response) => {
                    let aux_array = [];
                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i]["name"].includes("data")) {
                            aux_array.push({
                                "id": response.data[i]["id"],
                                "name": response.data[i]["name"]
                            })
                        }
                    }
                    setRoles(aux_array);
                }).catch((error) => {
                    console.error('Error:', error);
                })
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }, [role])

    return (
        <div style={{backgroundColor: "#D9D9D9", height: "100vh", marginTop: 82 }}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Dialog open={!hasRole}>
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
                                <ListItemText primary={rl.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
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
                            onClick={handleStartedClick}
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