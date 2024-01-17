import * as React from 'react';
import axios from "axios";
import { format } from 'date-fns';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress,
    Dialog, DialogContent, DialogTitle, Paper,
    Snackbar,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Tooltip
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
import {GET_MODELS, GET_MODELS_USER} from "../components/utils/apiEndpoints";

const Models = ({user_id}) => {
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
    const [modelIDFilter, setModelIDFilter] = React.useState("");
    const [creationDate, setCreationDate] = React.useState("");
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
            }
        }).then((response) => {
            setLoading(false);
            setModels(response.data);
            setFilterModels(response.data);
        }).catch((_) => {
            setModels([]);
            setLoading(false);
            handleToast("Failed to load models!", "error");
        })
    }, []);

    const handleFilterApplication = () => {
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

    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    const handleDialogOpen = (content) => {
        setDialogContent(JSON.parse(content));
        setDialogOpen(true);
    }

    return (
        <div style={{backgroundColor: "#FFFFFF", height: "100vh", width: "100vw", marginTop: 82 }}>
            <Snackbar
                open={open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="md">
                <DialogTitle>CSV Data Information</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
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
            </Dialog>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "90vw", height: "100vh"}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                    <Card variant="outlined" sx={{ height: "10%", width: "80%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                        <CardContent>
                            <Stack spacing={4} direction="row">
                                {user_id && <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Model ID</Typography>}
                                {!user_id && <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>User ID</Typography>}
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Model Name</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Creation Time</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Score</Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access Model</Typography>
                        </CardActions>
                    </Card>
                    {filterModels.length !== 0 ?
                        filterModels.map((model) => (
                            <Card key={model["model_id"]} variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                                <CardContent>
                                    <Stack spacing={4} direction="row">
                                        {user_id && <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["model_id"]}</Typography>}
                                        {!user_id &&
                                            <Tooltip title={model["user_id"]}>
                                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["user_id"].length > 15 ? model["user_id"].slice(0, 15) + "..." : model["user_id"]}</Typography>
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
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model["score"]}</Typography>
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { backgroundColor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleEnter(model["model_id"])}
                                    >
                                        Check Model
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