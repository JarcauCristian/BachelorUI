import * as React from 'react'
import axios from 'axios'
import {useParams} from "react-router-dom";
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Alert,
    Backdrop,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, FormControl, FormGroup, FormLabel, Input,
    List, Slide,
    Snackbar, Tooltip,
} from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import {GET_MODEL, GET_MODEL_DETAILS} from "../components/utils/apiEndpoints";
import {format} from "date-fns";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Model = () => {
    const {modelID} = useParams();
    const [modelData, setModelData] = React.useState("");
    const [modelDetails, setModelDetails] = React.useState("");
    const [modelDescription, setModelDescription] = React.useState("");
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);
    const [file, setFile] = React.useState(null);
    const [expanded, setExpanded] = React.useState('panel1');
    const [predictions, setPredictions] = React.useState("");
    const [score, setScore] = React.useState("");
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleDialogClose = () => {
        setDialogOpen(false);
    };


    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
    };

    const handleScoreChange = (event) => {
        setScore(event.target.value);
        console.log(event.target.value)
    }

    const handleFilesChange = (files) => {
        if (files.target.files[0].type !== "text/csv")
        {
            handleToast("File is not of type CSV", "error")
            files.target.value = null;
        }
        else {
            setFile(files.target.files[0])
        }
    };

    const handlePrediction = () => {
        let formData = new FormData()
        formData.append("file", file)
        axios({
            method: "POST",
            url: "http://localhost:8000/prediction?model_id=" + modelID,
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((response) => {
            setPredictions(response.data);
            setDialogOpen(true);
        }).catch((error) => {
            console.error(error);
            handleToast("Failed to get predictions!", "error");
        })
    }

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleScore = () => {
        if (score < 0 || score > 10) {
            handleToast("Score should be between 0 and 10", "error");
        } else {
            axios({
                method: "POST",
                url: `http://localhost:8000/update_score?model_id=${modelID}&score=${score}`
            }).then((response) => {
                handleToast("Score Updated Successfully", "success");
            }).catch((error) => {
                handleToast("Problem Updating Score", "error");
            })
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleBackdropClose = () => {
        setLoading(false);
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        axios({
            method: 'GET',
            url: GET_MODEL_DETAILS(modelID),
            headers: {
                'Content-Type': "application/json",
            }
        }).then((response) => {
            setModelData(response.data);
        }).catch((_) => {
            handleToast("Failed to load model Data!", "error");
            setLoading(false);
        })

        axios({
            method: 'GET',
            url: GET_MODEL(modelID),
            headers: {
                'Content-Type': "application/json",
            }
        }).then((response) => {
            setLoading(false);
            setModelDetails(response.data);
            setModelDescription(JSON.parse(response.data.description));
        }).catch((_) => {
            handleToast("Failed to load model Details!", "error");
            setLoading(false);
        })
    }, [])

    return (
        <div style={{ backgroundColor: "white", width: "100vw", height: "100vh", marginTop: 82 }}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Dialog
                open={dialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: 20 }}>Model Predictions</DialogTitle>
                <DialogContent>
                    {predictions && (
                        <List>
                            {Object.entries(predictions).map(([key, value]) => (
                                <ListItem key={key}>
                                    <Typography variant="p" sx={{ fontWeight: "bold", fontSize: 20 }}>
                                        Row: {key} - Prediction: {value}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
                <Card sx={{ width: "90vw", height: "45vh", backgroundColor: "black", borderRadius: 5, display: "flex", flexDirection: "row", "alignItems": "center", justifyContent: "space-evenly" }}>
                    {modelDetails && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Accordion sx={{ width: "23vw" }} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL ID</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Tooltip title={modelDetails.model_id.toUpperCase()}>
                                        <Typography>
                                            {modelDetails.model_id.length > 28 ? modelDetails.model_id.toUpperCase().slice(0, 28) + "..." : modelDetails.model_id.toUpperCase()}
                                        </Typography>
                                    </Tooltip>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: "23vw" }} expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL NAME</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Tooltip title={modelDetails.model_name.toUpperCase()}>
                                        <Typography>
                                            {modelDetails.model_name.length > 28 ? modelDetails.model_name.toUpperCase().slice(0, 28) + "..." : modelDetails.model_name.toUpperCase()}
                                        </Typography>
                                    </Tooltip>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: "23vw" }} expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3a-content"
                                    id="panel3a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL CREATION TIME</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        {format(new Date(modelDetails["created_at"]), "yyyy-dd-MM")}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: "23vw" }} expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel4a-content"
                                    id="panel4a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL SCORE</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        {modelDetails.score}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Input type="number" label="Score" placeholder="Enter the score for the model" sx={{ color: "black", backgroundColor: "white", marginTop: 2, width: "23vw" }} onChange={handleScoreChange} />
                            <Button variant="contained" sx={{backgroundColor: "white", color: "black", marginTop: 2, width: "23vw", '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={handleScore}>Give Score</Button>
                        </div>
                    )}
                    {modelDetails && (
                        <FormGroup sx={{width: 500, color: "#FFFFFF"}}>
                            <Snackbar
                                open={open}
                                autoHideDuration={3000}
                                onClose={handleClose}
                                anchorOrigin={{vertical, horizontal}}
                            >
                                <Alert onClose={handleClose} severity={toastSeverity}>
                                    {toastMessage}
                                </Alert>
                            </Snackbar>
                            <FormLabel sx={{fontWeight: "bold", color: "white"}}>Upload a CSV File</FormLabel>
                            <Divider sx={{fontSize: 2, backgroundColor: "white"}}/>
                            <FormControl>
                                <Input sx={{marginTop: 5, backgroundColor: 'white', borderRadius: 2}} type="file" onChange={handleFilesChange}/>
                            </FormControl>
                            <Button variant="contained" sx={{backgroundColor: "white", color: "black", marginTop: 10, '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={handlePrediction}>Get Prediction</Button>
                        </FormGroup>
                    )}
                    {!modelDetails && (
                        <Typography variant="h5" sx={{ color: "white" }}>Model Data Could Not Be Loaded</Typography>
                    )}
                </Card>
                <div style={{ width: "100vw", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly"}}>
                    <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5, backgroundColor: "#F5F5F5" }} variant="outlined">
                        <Typography variant="p" sx={{ fontWeight: "bold", fontSize: 20 }}>MODEL PARAMETERS</Typography>
                        <Divider flexItem sx={{ backgroundColor: "black", fontSize: 5 }}/>
                        {modelData.params && (
                            <List>
                                {Object.entries(modelData.params).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.replace(/_/g, " ").toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                    <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5, backgroundColor: "#F5F5F5" }} variant="outlined">
                        <Typography variant="p" sx={{ fontWeight: "bold", fontSize: 20 }}>MODEL METRICS</Typography>
                        <Divider flexItem sx={{ backgroundColor: "black", fontSize: 5 }}/>
                        {modelData.metrics && (
                            <List>
                                {Object.entries(modelData.metrics).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.replace(/_/g, " ").toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                    <Card sx={{minWidth: 250, minHeight: "40vh", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5, backgroundColor: "#F5F5F5" }} variant="outlined">
                        <Typography variant="p" sx={{ fontWeight: "bold", fontSize: 20 }}>MODEL TAGS</Typography>
                        <Divider flexItem sx={{ backgroundColor: "black", fontSize: 5 }}/>
                        {modelData.tags && (
                            <List>
                                {Object.entries(modelData.tags).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.replace(/_/g, " ").toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                    <Card sx={{minWidth: 280, minHeight: "40vh", overflowY: "scroll", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 5, backgroundColor: "#F5F5F5" }} variant="outlined">
                        <Typography variant="p" sx={{ fontWeight: "bold", fontSize: 20 }}>TRAIN DATASET DETAILS</Typography>
                        <Divider flexItem sx={{ backgroundColor: "black", fontSize: 5 }}/>
                        {modelDescription.column_dtypes && (
                            <Typography sx={{ fontWeight: "bold" }}>Column Types</Typography>
                        )}
                        {modelDescription.column_dtypes && (
                            <List>
                                {Object.entries(modelDescription.column_dtypes).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {modelDescription.column_ranges && (
                            <Typography sx={{ fontWeight: "bold" }}>Column Ranges</Typography>
                        )}
                        {modelDescription.column_ranges && (
                            <List>
                                {Object.entries(modelDescription.column_ranges).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {modelDescription.column_categories && (
                            <Typography sx={{ fontWeight: "bold" }}>Column Categories</Typography>
                        )}
                        {modelDescription.column_categories && (
                            <List>
                                {Object.entries(modelDescription.column_categories).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {modelDescription.column_unique_values && (
                            <Typography sx={{ fontWeight: "bold" }}>Column Unique Values</Typography>
                        )}
                        {modelDescription.column_unique_values && (
                            <List>
                                {Object.entries(modelDescription.column_unique_values).map(([key, value]) => (
                                    <ListItem key={key}>
                                        <ListItemText primary={key.toUpperCase()} secondary={value} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Model;
