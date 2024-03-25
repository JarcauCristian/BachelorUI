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
    Tooltip, Divider
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
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

const Models = ({user_id}) => {
    const [models, setModels] = React.useState([]);
    const [downloading, setDownloading] = React.useState(false);
    const [filterModels, setFilterModels] = React.useState([]);
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogContent, setDialogContent] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [loading, setLoading] = React.useState(false);
    const [modelIDFilter, setModelIDFilter] = React.useState("");
    const [creationDate, setCreationDate] = React.useState("");
    const [checked, setChecked] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const url = user_id ? GET_MODELS_USER(user_id) : GET_MODELS;

        setLoading(true);
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
            setModels(response.data);
            setFilterModels(response.data);
        }).catch((error) => {
            setModels([]);
            setLoading(false);
            if (error.response) {
                if (error.response.status === 404) {
                    handleToast("No models found!", "warning");
                } else {
                    handleToast("Failed to load models!", "error");
                }
              }
        })
    }, [user_id]);

    const handleFilterApplication = () => {
        if (user_id) {
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

    const handleBackdropClose = () => {
        setLoading(false);
    }

    const clearFilters = () => {
        setCreationDate("");
        setModelIDFilter("");
        setFilterModels(models);
    };

    const handleEnter = (model_id) => {
        navigate(`/models/${model_id}`);
    }

    const handleDownload = async (model_id, notebook_type) => {
        try {
            setDownloading(true);
            const response = await axios({
                method: "GET",
                url: DOWNLOAD_MODEL(model_id),
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token")
                }
            })
            const model_bytes = response.data;
            const finalFilename = notebook_type === "sklearn" || notebook_type === "pytorch" ? `model-${notebook_type}.pkl` : `model-${notebook_type}.zip`
            const url = window.URL.createObjectURL(new Blob([model_bytes]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', finalFilename);
            document.body.appendChild(link);
            link.click();
            setDownloading(false);
          } catch (error) {
            handleToast("Error Downloading the model!", "error");
            setDownloading(false);
          }
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    const handleDialogOpen = (content) => {
        setDialogContent(JSON.parse(content));
        setDialogOpen(true);
    }

    return (
        <div style={{backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: "100vh", width: "100vw", marginTop: 82 }}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: 'gray', zIndex: (theme) => theme.zIndex.drawer + 1, display: "flex", flexDirection: "column" }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h4" sx={{ color: "white" }}>Loading Models</Typography>
            </Backdrop>
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xll" TransitionComponent={Transition} keepMounted>
                <DialogTitle>CSV Data Information</DialogTitle>
                <DialogContent sx={{ width: 1700 }}>
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
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "90vw", height: "100vh"}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                    <Card variant="outlined" sx={{ height: "10%", width: "80%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                        <CardContent>
                            <Stack spacing={4} direction="row">
                                {user_id &&
                                    <Tooltip title="Model ID">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>ID</Typography>
                                    </Tooltip>}
                                {!user_id &&
                                    <Tooltip title="User ID">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>ID</Typography>
                                    </Tooltip>}
                                <Tooltip title="Model Name">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Name</Typography>
                                </Tooltip>
                                <Tooltip title="Description">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                                </Tooltip>
                                <Tooltip title="Creation Date">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Creation</Typography>
                                </Tooltip>
                                <Tooltip title="Model Type">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Type</Typography>
                                </Tooltip>
                                <Tooltip title="Overall score of the model.">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Score</Typography>
                                </Tooltip>
                            </Stack>
                        </CardContent>
                        <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                        <CardActions>
                            <Stack spacing={4} direction="row">
                                <Tooltip title="Access Model">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access</Typography>
                                </Tooltip>
                                <Tooltip title="Download Model">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Download</Typography>
                                </Tooltip>
                            </Stack>
                        </CardActions>
                    </Card>
                    {filterModels.length !== 0 ?
                        filterModels.map((model) => (
                            <Card key={model["model_id"]} variant="outlined" sx={{ overflowX: "auto", height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around", mt: 2, mb: 2}}>
                                <CardContent sx={{ width: 500 }}>
                                    <Stack spacing={4} direction="row">
                                        {user_id &&
                                            <Tooltip title={model["model_id"]}>
                                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["model_id"].length > 10 ? model["model_id"].slice(0, 10) + "..." : model["model_id"]}</Typography>
                                            </Tooltip>
                                        }
                                        {!user_id &&
                                            <Tooltip title={model["user_id"]}>
                                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["user_id"].length > 10 ? model["user_id"].slice(0, 10) + "..." : model["user_id"]}</Typography>
                                            </Tooltip>
                                        }
                                        <Tooltip title={model["model_name"]}>
                                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["model_name"].length > 10 ? model["model_name"].slice(0, 10) + "..." : model["model_name"]}</Typography>
                                        </Tooltip>
                                        <Button
                                            variant="outlined"
                                            sx={{ color: "White", borderColor: "white", '&:hover': { backgroundColor: 'grey', borderColor: "white" }}}
                                            onClick={() => handleDialogOpen(model.description)}
                                        >
                                            Check Dataset
                                        </Button>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{format(new Date(model["created_at"]), "yyyy-dd-MM")}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["notebook_type"].toUpperCase()}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["score"]}</Typography>
                                    </Stack>
                                </CardContent>
                                <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                                <CardActions>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { backgroundColor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleEnter(model["model_id"])}
                                    >
                                        Check Model
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { backgroundColor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleDownload(model["model_id"], model["notebook_type"])}
                                        disabled={downloading}
                                    >
                                        {downloading ? "Downloading..." : "Download Model"}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))
                        :
                        <Typography variant="h3" sx={{ color: "black"}}>
                            No models were found!
                        </Typography>
                    }
                </div>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 500,
                        minWidth: 200,
                        overflowX: "hidden",
                        backgroundColor: 'black',
                        borderRadius: 2,
                        color: 'white',
                        alignItems: "center",
                        p: 2,
                        borderLeft: '1px solid #e1e4e8',
                        overflowY: 'auto'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                        Filter Options
                    </Typography>
                    <TextField
                        label="Model ID"
                        variant="outlined"
                        value={modelIDFilter}
                        onChange={(e) => setModelIDFilter(e.target.value)}
                        sx={{ mb: 2,
                            "& .MuiInputLabel-root": { color: "white" },
                            "& .MuiCalendarMonthIcon": {color: "white"},
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "white",
                                },
                                "&:hover fieldset": {
                                    borderColor: "white",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "white",
                                },
                                "& input": { color: "white",
                                },

                            },
                        }}
                        InputLabelProps={{
                            style: { color: 'white' },
                        }}
                        InputProps={{
                            style: { color: 'white' }
                        }}
                        fullWidth
                    />
                    {!user_id && (
                        <FormControlLabel control={<Checkbox sx={{ color: "white" }} checked={checked} onChange={(e) => setChecked(e.target.checked)} inputProps={{ 'aria-label': 'controlled' }} />} label="Models Based on My Datasets" />
                    )}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker label="Created On or Before"
                                        sx={{ mb: 2,
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
                                        onChange={(e) => setCreationDate(e)}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                        onClick={handleFilterApplication}
                        fullWidth
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                        onClick={clearFilters}
                        fullWidth
                    >
                        Clear Filters
                    </Button>
                </Box>
            </div>
        </div>
    );
}

export default Models;