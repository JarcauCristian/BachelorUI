import * as React from 'react'
import axios from 'axios'
import {useParams} from "react-router-dom";
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Alert,
    Backdrop,
    CircularProgress, createTheme, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, FormGroup, FormLabel, Input,
    List,
    Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ThemeProvider
} from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Cookies from "js-cookie";
import {
    GET_MODEL,
    GET_MODEL_DETAILS,
    UPDATE_MODEL_SCORE,
    PREDICTION,
    GET_MODEL_IMAGES, GET_MODEL_SCORE
} from "../components/utils/apiEndpoints";
import {format} from "date-fns";
import Transition from '../components/utils/transition';
import Box from "@mui/material/Box";
import CustomTooltip from "../components/CustomTooltip";
import Paper from "@mui/material/Paper";

const theme = createTheme({
    components: {
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: 'white',
                    fontSize: '1.10rem',
                },
                secondary: {
                    color: 'lightgray',
                    fontSize: '1rem',
                },
            },
        },
    },
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
    const [loadingMessage, setLoadingMessage] = React.useState("");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);
    const [file, setFile] = React.useState(null);
    const [expanded, setExpanded] = React.useState('panel1');
    const [predictions, setPredictions] = React.useState("");
    const [score, setScore] = React.useState("");
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
    const [images, setImages] = React.useState({});
    const fileInputRef = React.useRef(null);
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDialogClose = () => {
        if (dialogOpen) setDialogOpen(false);
        if (imageDialogOpen) setImageDialogOpen(false);
    };


    const handleChange =
        (panel) => (_, newExpanded) => {
            setExpanded(newExpanded ? panel : false);
    };

    const handleScoreChange = (event) => {
        setScore(event.target.value);
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
        setLoading(true);
        setLoadingMessage("Getting prediction...");
        axios({
            method: "POST",
            url: PREDICTION(modelID),
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            setPredictions(response.data);
            setDialogOpen(true);
            setLoading(false);
            setLoadingMessage("");
        }).catch((error) => {
            setLoading(false);
            setLoadingMessage("");
            if (error.response) {
                handleToast(error.response.data, "error");
            } else {
                handleToast("Encounter an error when loading predictions!", "error");
            }
        })
    }

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleScore = () => {
        if (score < 0 || score > 10) {
            handleToast("Score should be between 0 and 10!", "error");
        } else {
            axios({
                method: "POST",
                url: UPDATE_MODEL_SCORE,
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                },
                data: {
                    model_id: modelID,
                    score: score
                }
            }).then((_) => {
                localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-models-changed`, JSON.stringify(true));
                handleToast("Score Updated Successfully", "success");
                localStorage.setItem(`${modelID}-updated-score`, JSON.stringify(true));
            }).catch((error) => {
                if (error.response) {
                    handleToast(error.response.data, "error");
                } else {
                    handleToast("Problem Updating Score", "error");
                }
            })
        }
    }

    React.useEffect(() => {
        const updated = localStorage.getItem(`${modelID}-updated-score`);

        if (updated) {
            axios({
                method: "GET",
                url: GET_MODEL_SCORE(modelID),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                }
            }).then((response) => {
                const newModelDetails = modelDetails;

                newModelDetails["score"] = response.data;

                setModelDetails(newModelDetails);
            })
            localStorage.removeItem(`${modelID}-updated-score`);
        }
    })

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const getImages = async () => {
        setLoadingMessage("Getting Images");
        setLoading(true);

        const localStorageImages = localStorage.getItem(`${modelID}-images`);

        if (localStorageImages) {
            setImages(JSON.parse(localStorageImages));
            setImageDialogOpen(true);
            setLoadingMessage("");
            setLoading(false);
            return;
        }

        try {
            const response = await axios({
                method: "GET",
                url: GET_MODEL_IMAGES(modelID),
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": "Bearer " + Cookies.get("token")
                },
                timeout: 10000
            })

            if (response.status === 200) handleToast("Images loaded successfully!");

            const newImages = {};

            for (let [k, v] of Object.entries(response.data)) {
                const newKey = k.split("_").join(" ").toUpperCase();
                newImages[newKey] = v;
            }

            localStorage.setItem(`${modelID}-images`, JSON.stringify(images));

            setLoading(false);
            setImages(newImages);
            setImageDialogOpen(true);
            setLoadingMessage("");
        } catch (_) {
            setLoading(false);
            handleToast("Could not load model images!", "error");
        }
    }

    const SectionTitle = ({ children }) => (
        <Typography sx={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            mt: 2,
            width: '100%',
            textAlign: 'left',
            pl: 2,
        }}>
            {children}
        </Typography>
    );

    const clearFile = () => {
        setFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const convertToCSV = (data) => {
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        data.forEach(row => {
            const values = headers.map(header => {
                const escaped = (''+row[header]).replace(/"/g, '\\"'); // escape double quotes
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    };

    const downloadPredictions = () => {
        const newPredictions = [];

        for (let [k, v] of Object.entries(predictions)) {
            const prediction = {}
            prediction["row_index"] = k;
            if (modelDetails["target_column"] !== "") {
                prediction["prediction"] = modelDescription["column_categories"][modelDetails["target_column"]][v];
            } else {
                prediction["prediction"] = v;
            }

            newPredictions.push(prediction);
        }

        if (newPredictions.length > 0) {
            const csvData = convertToCSV(newPredictions);

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `predictions-${modelID}.csv`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } else {
            handleToast("Please get the predictions first!", "warning");
        }
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const changed = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-models-changed`);

        setLoadingMessage("Getting Model Details");
        setLoading(true);
        axios({
            method: 'GET',
            url: GET_MODEL_DETAILS(modelID, changed ? JSON.parse(changed) : false),
            headers: {
                'Content-Type': "application/json",
                "Authorization": "Bearer " + Cookies.get("token")
            },
            timeout: 30000
        }).then((response) => {
            setModelData(response.data);
            axios({
                method: 'GET',
                url: GET_MODEL(modelID, changed ? JSON.parse(changed) : false),
                headers: {
                    'Content-Type': "application/json",
                    "Authorization": "Bearer " + Cookies.get("token")
                },
                timeout: 30000
            }).then((response) => {
                setLoading(false);
                setModelDetails(response.data);
                setModelDescription(JSON.parse(response.data.description));
                localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-models-changed`, JSON.stringify(false));
            }).catch((_) => {
                handleToast("Failed to load model Details!", "error");
                setLoading(false);
            })
        }).catch((_) => {
            handleToast("Failed to load model Data!", "error");
            setLoading(false);
        })

    }, [modelID])

    return (
        <div style={{ overflow: "auto", backgroundColor: "white", width: "100vw", height: "100vh" }}>
            <Snackbar
                open={open}
                autoHideDuration={5000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: 'gray', zIndex: (theme) => theme.zIndex.drawer + 1, display: "flex", flexDirection: "column" }}
                open={loading}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h4" sx={{ color: "white" }}>{loadingMessage}</Typography>
            </Backdrop>
            <Dialog
                open={dialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleDialogClose}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="xl"
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: 20 }}>Model Predictions</DialogTitle>
                <DialogContent>
                    {predictions && (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="customized table">
                                <TableHead>
                                    <TableRow>
                                       <TableCell align="center">
                                           <Typography variant="subtitle1">Row Index</Typography>
                                       </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="subtitle1">Prediction</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(predictions).map(([key, value]) => (
                                        <TableRow key={key}>
                                            <TableCell align="center">
                                                {key}
                                            </TableCell>
                                            <TableCell align="center">
                                                {modelDetails["target_column"] === "" ? value : modelDescription["column_categories"][modelDetails["target_column"]][value]}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={downloadPredictions}>Download Predictions</Button>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={imageDialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleDialogClose}
                maxWidth="xl"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: 20 }}>Model Images</DialogTitle>
                <DialogContent>
                    {images && (
                        <List>
                            {Object.entries(images).map(([key, value]) => (
                                <ListItem key={key} alignItems="flex-start">
                                    <Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 16, marginBottom: 1 }}>
                                            Image Name: {key.split(".")[0]}
                                        </Typography>
                                        <img src={value} alt={key} style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }} />
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <div style={{ marginTop: 100, width: "100vw", height: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
                <Card sx={{ overflow: "auto", height: 550, width: "85vw", backgroundColor: "black", borderRadius: 5, display: "flex", flexDirection: width < 1200 ? "column" : "row", alignItems: "center", justifyContent: "space-evenly" }}>
                    {modelDetails && (
                        <div style={{ marginTop: width < 1200 ? 10 : 0, display: "flex", flexDirection: "column" }}>
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL ID</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <CustomTooltip title={modelDetails.model_id.toUpperCase()}>
                                        <Typography>
                                            {modelDetails.model_id.length > 28 ? modelDetails.model_id.toUpperCase().slice(0, 28) + "..." : modelDetails.model_id.toUpperCase()}
                                        </Typography>
                                    </CustomTooltip>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL NAME</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <CustomTooltip title={modelDetails["model_name"].toUpperCase()}>
                                        <Typography>
                                            {modelDetails["model_name"].length > 28 ? modelDetails["model_name"].toUpperCase().slice(0, 28) + "..." : modelDetails["model_name"].toUpperCase()}
                                        </Typography>
                                    </CustomTooltip>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>DESCRIPTION</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <CustomTooltip title={modelData["description"]}>
                                        <Typography>
                                            {modelData["description"].length > 70 ? modelData["description"].slice(0, 70) + "..." : modelData["description"]}
                                        </Typography>
                                    </CustomTooltip>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
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
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel5a-content"
                                    id="panel5a-header"
                                >
                                    <Typography sx={{ fontWeight: "bold" }}>MODEL IMAGES</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Button variant="contained" fullWidth sx={{backgroundColor: "black", color: "white", marginTop: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={getImages}>Show images</Button>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion sx={{ width: width < 1200 ? "40vw" : "23vw" }} expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
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
                            <Input type="number" label="Score" placeholder="Enter the score for the model" sx={{ color: "black", backgroundColor: "white", marginTop: 2, width: width < 1200 ? "40vw" : "23vw" }} onChange={handleScoreChange} />
                            <Button variant="contained" sx={{backgroundColor: "white", color: "black", marginTop: 2, width: width < 1200 ? "40vw" : "23vw", '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={handleScore}>Give Score</Button>
                        </div>
                    )}
                    {modelDetails && (
                        <FormGroup sx={{ mt: width < 1200 ? 5 : 0, mb: width < 1200 ? 2 : 0, width: 500, color: "#FFFFFF", display: modelDetails.notebook_type === "transformers" ? "none" : "flex", flexDirection:  "column"}}>
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
                                <TextField
                                    type="file"
                                    fullWidth
                                    sx={{ backgroundColor: "white", mt: 2 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        accept: ".csv",
                                        ref: fileInputRef,
                                    }}
                                    onChange={handleFilesChange}
                                />
                            </FormControl>
                            <Stack direction="row" spacing={2} sx={{ marginTop: 3 }}>
                                <Button fullWidth variant="contained" sx={{ height: 40, fontWeight: "bold", backgroundColor: "white", color: "black", '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={handlePrediction}>Get Prediction</Button>
                                <Button fullWidth variant="contained" sx={{ height: 40, fontWeight: "bold", backgroundColor: "white", color: "black", '&:hover': { bgcolor: 'grey', borderColor: "white" }}} onClick={clearFile}>Clear File</Button>
                            </Stack>
                        </FormGroup>
                    )}
                    {!modelDetails && (
                        <Typography variant="h5" sx={{ color: "white" }}>Model Data Could Not Be Loaded</Typography>
                    )}
                </Card>
                <div style={{ width: "100vw", height: "auto", display: "flex", flexDirection: width < 1200 ? "column" : "row", alignItems: "center", justifyContent: "space-evenly"}}>
                    <Card sx={{
                        width: 300,
                        mt: 2,
                        mb: 2,
                        height: "50vh",
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        borderRadius: 5,
                        backgroundColor: "#36454f",
                        color: "white",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.7)",
                        padding: '20px',
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '4px'
                        }
                    }} variant="outlined">
                        <Typography variant="h6" component="div" sx={{
                            fontWeight: "bold",
                            fontSize: "1.25rem",
                            marginBottom: 2,
                        }}>
                            MODEL PARAMETERS
                        </Typography>
                        <Divider flexItem sx={{ backgroundColor: "white", height: 2, width: '100%' }}/>
                        {modelData.params && (
                            <List sx={{
                                width: '100%',
                                marginTop: 2,
                            }}>
                                {Object.entries(modelData.params).map(([key, value]) => (
                                    <ListItem key={key} sx={{
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        padding: '8px 0',
                                    }}>
                                        <ThemeProvider theme={theme}>
                                            <ListItemText
                                                primary={key.replace(/_/g, " ").toUpperCase()}
                                                secondary={value}
                                                primaryTypographyProps={{variant: 'subtitle1'}}
                                                secondaryTypographyProps={{variant: 'body1'}}
                                            />
                                        </ThemeProvider>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                    <Card sx={{
                        width: 300,
                        mt: 2,
                        mb: 2,
                        height: "50vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        borderRadius: 5,
                        backgroundColor: "#36454f",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
                        padding: '20px',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '4px'
                        }
                    }} variant="outlined">
                        <Typography variant="h6" component="div" sx={{
                            fontWeight: "bold",
                            fontSize: '1.25rem',
                            marginBottom: 2,
                        }}>
                            MODEL METRICS
                        </Typography>
                        <Divider flexItem sx={{ backgroundColor: "white", height: 2, width: '100%' }}/>
                        {modelData["metrics"] && (
                            <List sx={{
                                width: '100%',
                                marginTop: 2,
                            }}>
                                {Object.entries(modelData["metrics"]).map(([key, value]) => (
                                    <ListItem key={key} sx={{
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        padding: '8px 0', // spacing between items
                                    }}>
                                        <ThemeProvider theme={theme}>
                                            <ListItemText
                                                primary={key.replace(/_/g, " ").toUpperCase()}
                                                secondary={value}
                                                primaryTypographyProps={{variant: 'subtitle1'}}
                                                secondaryTypographyProps={{variant: 'body2'}}
                                            />
                                        </ThemeProvider>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Card>
                    <Card sx={{
                        width: 300,
                        mt: 2,
                        mb: 2,
                        height: "50vh",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        borderRadius: 5,
                        backgroundColor: "#36454f",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
                        padding: '20px',
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '4px'
                        }
                    }} variant="outlined">
                        <Typography variant="h6" component="div" sx={{
                            fontWeight: "bold",
                            fontSize: '1.25rem',
                            width: '100%',
                            textAlign: 'center',
                            marginBottom: 2,
                        }}>
                            TRAIN DATASET DETAILS
                        </Typography>
                        <Divider flexItem sx={{ backgroundColor: "white", height: 2, width: '100%' }}/>
                        {modelDescription["column_dtypes"] && (
                            <>
                                <SectionTitle>Column Types:</SectionTitle>
                                <List sx={{ width: '100%', pl: 2 }}>
                                    {Object.entries(modelDescription["column_dtypes"]).map(([key, value]) => (
                                        <ListItem key={key} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                                            <ThemeProvider theme={theme}>
                                                <ListItemText primary={key.toUpperCase() + ":"} secondary={value !== null ? value : "-"} />
                                            </ThemeProvider>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {modelDescription["column_ranges"] && (
                            <>
                                <SectionTitle>Column Ranges:</SectionTitle>
                                <List sx={{ width: '100%', pl: 2 }}>
                                    {Object.entries(modelDescription["column_ranges"]).map(([key, value]) => (
                                        <ListItem key={key} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                                            <ThemeProvider theme={theme}>
                                                <ListItemText primary={key.toUpperCase() + ":"} secondary={value !== null ? value[0] + " - " + value[1] : "-"} />
                                            </ThemeProvider>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {modelDescription["column_categories"] && (
                            <>
                                <SectionTitle>Column Categories:</SectionTitle>
                                <List sx={{ width: '100%', pl: 2 }}>
                                    {Object.entries(modelDescription["column_categories"]).map(([key, value]) => (
                                        <ListItem key={key} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                                            <ThemeProvider theme={theme}>
                                                <ListItemText primary={key.toUpperCase() + ":"} secondary={
                                                    value !== null ? value.join(", ") : "-"
                                                } />
                                            </ThemeProvider>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                        {modelDescription["column_unique_values"] && (
                            <>
                                <SectionTitle>Column Unique Values:</SectionTitle>
                                <List sx={{ width: '100%', pl: 2 }}>
                                    {Object.entries(modelDescription["column_unique_values"]).map(([key, value]) => (
                                        <ListItem key={key} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                                            <ThemeProvider theme={theme}>
                                                <ListItemText primary={key.toUpperCase() + ":"} secondary={value !== null ? value : "-"} />
                                            </ThemeProvider>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Model;
