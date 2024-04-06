import * as React from 'react';
import axios from "axios";
import { format } from 'date-fns';
import background from "../images/background_image.jpg";
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress,
    Dialog, DialogContent, DialogActions, DialogTitle, Paper,
    Snackbar,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Tooltip, Divider, Grid
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {GET_MODELS, GET_MODELS_USER, DOWNLOAD_MODEL} from "../components/utils/apiEndpoints";
import Transition from '../components/utils/transition';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CustomTooltip from "../components/CustomTooltip";
import InfoIcon from "@mui/icons-material/Info";

const Models = ({user}) => {
    const [models, setModels] = React.useState([]);
    const [filterModels, setFilterModels] = React.useState([]);
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogContent, setDialogContent] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [loading, setLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState("");
    const [modelIDFilter, setModelIDFilter] = React.useState("");
    const [creationDate, setCreationDate] = React.useState(null);
    const [checked, setChecked] = React.useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
    const navigate = useNavigate();
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const changed = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-models-changed`);

        const url = user ? GET_MODELS_USER(Cookies.get("userID").split("-").join("_"), changed ? JSON.parse(changed) : false) : GET_MODELS(changed ? JSON.parse(changed) : false);

        setLoading(true);
        setLoadingMessage("Loading Models...");
        axios({
            method: "GET",
            url: url,
            timeout: 1000*10,
            headers: {
                'Content-Type': "application/json",
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            setLoading(false);
            setLoadingMessage("");
            setModels(response.data);
            setFilterModels(response.data);
            localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-models-changed`, JSON.stringify(false));
        }).catch((error) => {
            setModels([]);
            setLoading(false);
            setLoadingMessage("");
            if (error.response) {
                if (error.response.status === 404) {
                    handleToast("No models found!", "warning");
                } else {
                    handleToast("Failed to load models!", "error");
                }
              }
        })
    }, [user]);

    const handleFilterApplication = () => {
        if (user) {
            if (modelIDFilter !== '' || creationDate !== '') {
                const filteredModels = models.filter((model) => {
                    const matchesID = modelIDFilter ? model.model_id === modelIDFilter : true;
                    const matchesCreationDate = creationDate ? new Date(model.created_at) <= new Date(creationDate) : true;
    
                    return matchesID && matchesCreationDate;
                });
    
                setFilterModels(filteredModels);
            } else if (modelIDFilter === '' && creationDate === '') {
                handleToast("Please use at least one of the filters!", "error");
            }
        } else {
            if (modelIDFilter !== '' || creationDate !== '' || checked) {
                const filteredModels = models.filter((model) => {
                    const matchesID = modelIDFilter ? model.model_id === modelIDFilter : true;
                    const matchesCreationDate = creationDate ? new Date(model.created_at) <= new Date(creationDate) : true;
                    const matchesUserID = checked ? model.dataset_user === Cookies.get("userID").split("-").join("_") : true;
    
                    return matchesID && matchesCreationDate && matchesUserID;
                });
    
                setFilterModels(filteredModels);
            } else if (modelIDFilter === '' && creationDate === '' && !checked) {
                handleToast("Please use at least one of the filters!", "error");
            }
        }
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

    const handleDialogClose = () => {
        if (dialogOpen) setDialogOpen(false);
        if (filterDialogOpen)  setFilterDialogOpen(false);
    }

    const clearFilters = () => {
        setCreationDate(null);
        setModelIDFilter("");
        setFilterModels(models);
    };

    const handleEnter = (model_id) => {
        navigate(`/models/${model_id}`);
    }

    const handleDownload = async (model_id, model_name) => {
        setLoading(true);
        setLoadingMessage("Donwloading Model...");
        try {
            const response = await axios({
                method: "GET",
                url: DOWNLOAD_MODEL(model_id),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                },
                responseType: 'blob'
            })
            setLoading(false);
            setLoadingMessage("");

            const contentDisposition = response.headers['content-disposition'];
            let filename = model_name + ".onnx"; // Default filename if not specified in header
            if (contentDisposition) {
                const matches = contentDisposition.match(/filename="?(.+)"?/);
                if (matches.length === 2) {
                    filename = matches[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            link.remove();
          } catch (error) {
            setLoading(false);
            setLoadingMessage("");
            handleToast("Error Downloading the model!", "error");
          }
    }

    const handleDialogOpen = (content) => {
        setDialogContent(JSON.parse(content));
        setDialogOpen(true);
    }

    return (
        <div style={{backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: "100%", width: "100%", marginTop: 82 }}>
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
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xll" TransitionComponent={Transition} keepMounted>
                <DialogTitle>CSV Data Information</DialogTitle>
                <DialogContent sx={{ width: "auto" }}>
                    <TableContainer sx={{ mb: 2, mt: 2 }} component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Column Name</TableCell>
                                    <TableCell>Data Type</TableCell>
                                    <TableCell>Range</TableCell>
                                    <TableCell>Categories</TableCell>
                                    <TableCell>Unique Values</TableCell>
                                </TableRow>
                            </TableHead>
                            {dialogContent &&
                                <TableBody>
                                    {Object.keys(dialogContent["column_dtypes"]).map((column) => (
                                        <TableRow key={column}>
                                            <TableCell>{column}</TableCell>
                                            <TableCell>{dialogContent["column_dtypes"][column]}</TableCell>
                                            <TableCell>{Array.isArray(dialogContent["column_ranges"][column]) ? `${dialogContent["column_ranges"][column][0]} - ${dialogContent["column_ranges"][column][1]}` : '-'}</TableCell>
                                            <TableCell>{Array.isArray(dialogContent["column_categories"][column]) ? dialogContent["column_categories"][column].join(', ') : '-'}</TableCell>
                                            <TableCell>{dialogContent["column_unique_values"][column] || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            }
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={filterDialogOpen} onClose={handleDialogClose} fullWidth TransitionComponent={Transition} keepMounted maxWidth="sm" sx={{ '& .MuiDialog-paper': { backgroundColor: 'black', color: 'white' } }}>
                <DialogTitle sx={{ color: 'white' }}>Filter Options</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Model ID"
                        variant="outlined"
                        value={modelIDFilter}
                        onChange={(e) => setModelIDFilter(e.target.value)}
                        sx={{ mb: 2, "& .MuiInputLabel-root": { color: "white" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "white" }, "&:hover fieldset": { borderColor: "white" }, "&.Mui-focused fieldset": { borderColor: "white" }, "& input": { color: "white" } } }}
                        InputLabelProps={{ style: { color: 'white' } }}
                        InputProps={{ style: { color: 'white' } }}
                        fullWidth
                    />
                    {!user && (
                        <FormControlLabel
                            control={<Checkbox sx={{ color: "white" }} checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
                            label="Models Based on My Datasets"
                        />
                    )}
                    <LocalizationProvider fullWidth dateAdapter={AdapterDayjs}>
                        <DemoContainer fullWidth components={['DatePicker']}>
                            <DatePicker fullWidth label="Created On or Before"
                                        sx={{ mb: 2,
                                            width: "100%",
                                            "& .MuiInputLabel-root": { color: "white" }, // label color
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: "white", // border color when the TextField is idle
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "white", // border color when hovered
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "white", // border color when the TextField is focused
                                                },
                                                "& input": { color: "white" }, // text color
                                            },
                                        }}
                                        value={creationDate}
                                        onChange={(e) => setCreationDate(e)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <Button
                        variant="contained"
                        onClick={handleFilterApplication}
                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                        fullWidth
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="contained"
                        onClick={clearFilters}
                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                        fullWidth
                    >
                        Clear Filters
                    </Button>
                </DialogContent>
            </Dialog>
            <Grid container spacing={2}>
                <Grid item xs={6} md={10}>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                        <Card variant="outlined" sx={{ overflow: "auto", height: "10%", width: "90%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                            <CardContent>
                                <Stack spacing={4} direction="row">
                                    {user &&
                                        <CustomTooltip title="The ID of the model.">
                                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  ID</Typography>
                                        </CustomTooltip>}
                                    {!user &&
                                        <CustomTooltip title="The ID of the user who created the model.">
                                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/> ID</Typography>
                                        </CustomTooltip>}
                                    <CustomTooltip title="The name of the model.">
                                        <Typography variant="p" sx={{ fontSize:  20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Model Name</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The description of the model.">
                                        <Typography variant="p" sx={{ fontSize:  20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Description</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The date when the model was created.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Creation</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The type of the model can be classification, regression or clustering.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Type</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="Overall score of the model.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Score</Typography>
                                    </CustomTooltip>
                                </Stack>
                            </CardContent>
                            <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                            <CardActions>
                                <Stack spacing={4} direction="row">
                                    <CustomTooltip title="Access Model">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/> Access</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="Download Model In ONNX Format.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/> Download</Typography>
                                    </CustomTooltip>
                                    <Button
                                        variant="contained"
                                        onClick={() => setFilterDialogOpen(true)}
                                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                                        fullWidth
                                    >
                                        Filter Models
                                    </Button>
                                </Stack>
                            </CardActions>
                        </Card>
                        {filterModels.length !== 0 ?
                                <TableContainer component={Paper} sx={{ overflow: "auto", width: "90%", height: "auto", backgroundColor: "black", color: "white", mt: 2, mb: 2 }}>
                                    <Table sx={{ minWidth: 650, overflow: "auto" }} aria-label="model table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>ID</TableCell>
                                                <TableCell sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Model Name</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Dataset</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Created At</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Notebook Type</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Score</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filterModels.map((model) => (
                                                <TableRow
                                                    key={model["model_id"]}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row" sx={{ color: "white", fontWeight: "bold" }}>
                                                        <Tooltip title={model["model_id"]}>
                                                            <span style={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem" }}>{model["model_id"].length > 50 ? model["model_id"].slice(0, 50) + "..." : model["model_id"]}</span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                                        <Tooltip title={model["model_name"]}>
                                                            <span style={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem" }}>{model["model_name"].length > 50 ? model["model_name"].slice(0, 50) + "..." : model["model_name"]}</span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Button
                                                            variant="outlined"
                                                            sx={{ fontSize: width < 1500 ? "0.6rem" : ".9rem", backgroundColor: "white", color: "black", borderColor: "gray", '&:hover': { backgroundColor: 'grey', borderColor: "white", color: "white"  }}}
                                                            onClick={() => handleDialogOpen(model.description)}
                                                        >
                                                            Check Dataset
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{format(new Date(model["created_at"]), "yyyy-dd-MM")}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{model["notebook_type"]}</TableCell>
                                                    <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{model["score"]}</TableCell>
                                                    <TableCell align="right" >
                                                        <Button
                                                            variant="outlined"
                                                            sx={{ mr: 2, fontSize: width < 1500 ? "0.6rem" : ".9rem", backgroundColor: "white", color: "black", borderColor: "gray", '&:hover': { backgroundColor: 'grey', borderColor: "white", color: "white" }}}
                                                            onClick={() => handleEnter(model["model_id"])}
                                                        >
                                                            Check Model
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            sx={{ mr: 2, fontSize: width < 1500 ? "0.6rem" : ".9rem", backgroundColor: "white", color: "black", borderColor: "gray", '&:hover': { backgroundColor: 'grey', borderColor: "white", color: "white" }}}
                                                            onClick={() => handleDownload(model["model_id"], model["model_name"])}
                                                        >
                                                            Download Model
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            :
                            <Typography variant="h3" sx={{ fontSize: width < 1000 ? "1.5rem" : "3rem", color: "black"}}>
                                No models were found!
                            </Typography>
                        }
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default Models;