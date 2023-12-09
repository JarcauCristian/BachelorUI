import * as React from 'react';
import axios from "axios";
import Cookies from "js-cookie";
import {Alert, Backdrop, CardActions, CircularProgress, Divider, Snackbar, Stack, TextField} from "@mui/material";
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

const Models = () => {
    const [models, setModels] = React.useState([]);
    const [filterModels, setFilterModels] = React.useState([]);
    const isRun = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [loading, setLoading] = React.useState(false);
    const [modelIDFilter, setModelIDFilter] = React.useState("");
    const [creationDate, setCreationDate] = React.useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        axios({
            method: 'get',
            url: 'http://localhost:8000/models',
            timeout: 1000*10,
            headers: {
                'Content-Type': "application/json",
            }
        }).then((response) => {
            setLoading(false);
            setModels(response.data);
            setFilterModels(response.data);
            console.log(response.data);
        }).catch((error) => {
            setModels([]);
            setLoading(false);
            handleToast("Failed to load models!", "error");
        })
    });

    const handleFilterApplication = () => {
        if (modelIDFilter !== '' || creationDate !== '') {
            const filteredNotebooks = models.filter((model) => {
                const matchesID = modelIDFilter ? model.model_id === modelIDFilter : true;
                const matchesCreationDate = creationDate ? new Date(model.created_at) <= new Date(creationDate) : true;

                return matchesID && matchesCreationDate;
            });

            setFilterModels(filteredNotebooks);
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
        setFilterModels(models);
    };

    const handleEnter = (model_id) => {
        navigate(`/models/${model_id}`);
    }

    return (
        <div style={{backgroundColor: "#FFFFFF", height: "100vh", width: "100vw"}}>
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
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "90vw", height: "100vh"}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                    <Card variant="outlined" sx={{ height: "10%", width: "80%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                        <CardContent>
                            <Stack spacing={4} direction="row">
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Model ID</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Creation Time</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Last Accessed</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Score</Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access Model</Typography>
                        </CardActions>
                    </Card>
                    {filterModels.length !== 0 ?
                        filterModels.map((model) => (
                            <Card key={model.model_id} variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                                <CardContent>
                                    <Stack spacing={4} direction="row">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model.model_id}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model.model_name}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model.description}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model.created_at}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{model.score}</Typography>
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleEnter(model.model_id)}
                                    >
                                        Check Model
                                    </Button>
                                </CardActions>
                            </Card>
                        ))
                        :
                        <Typography variant="h3" sx={{ color: "black"}}>
                            No active notebooks were found!
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
                        sx={{ mt: 2, py: 1.5, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'grey' } }}
                        onClick={handleFilterApplication}
                        fullWidth
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, py: 1.5, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'grey' } }}
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