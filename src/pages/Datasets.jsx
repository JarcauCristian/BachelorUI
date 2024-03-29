import * as React from 'react';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress,
    Dialog, DialogContent, DialogTitle, DialogActions,
    Divider,
    Snackbar,
    Stack,
    TextField, Tooltip, Switch, alpha, FormGroup
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios from "axios";
import {GET_ALL_DATASETS, GET_DATASET, UPDATE_DATASET, UPDATE_SHARE_VALUE} from "../components/utils/apiEndpoints";
import Cookies from "js-cookie";
import DataTable from "../components/DataTable";
import Transition from '../components/utils/transition';
import {styled} from "@mui/material/styles";
import {common} from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel";
import background from "../images/background_image.jpg";

const WhiteSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: common["white"],
        '&:hover': {
            backgroundColor: alpha(common["white"], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: common["white"],
    },
}));


const Datasets = () => {
    const isRun = React.useRef(false);
    const [open, setOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [csvData, setCsvData] = React.useState(null);
    const [name, setName] = React.useState(null);
    const [columnsDescriptions, setColumnsDescriptions] = React.useState(null);
    const [datasetName, setDatasetName] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [datasets, setDatasets] = React.useState([]);
    const [filterDatasets, setFilterDatasets] = React.useState([]);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [shareStatus, setShareStatus] = React.useState({});
    const [loadingMessage, setLoadingMessage] = React.useState("Loading Datasets");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleBackdropClose = () => {
        setLoading(false);
    }

    const clearFilters = () => {
        setDatasetName("");
        setFilterDatasets(datasets);
    };

    const handleFilterApplication = () => {
        if (datasetName !== '') {
            const filteredDatasets = datasets.filter((dataset) => {
                return dataset.name.toLowerCase().includes(datasetName.toLowerCase());
            });

            setFilterDatasets(filteredDatasets);
        } else {
            handleToast("Please enter the dataset name filter!", "error");
        }
    }

    const handleEnter = async (dataset) => {
        setLoading(true);
        setLoadingMessage("Getting Dataset Information");

        let condition = false;

        try {
            axios({
                method: "PUT",
                url: UPDATE_DATASET,
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    "Content-Type": "application/json"
                },
                data: {
                    "name": dataset.name,
                    "user": Cookies.get("userID").split("-").join("_")
                }
            })
        } catch (_) {
            condition = true;
            setLoading(false);
            handleToast("Error getting dataset!", "error");
        }

        if (condition) return;

        try {
            const response = await axios({
                method: "GET",
                url: GET_DATASET(dataset.url)
            })

            setLoading(false);
            const parseCsvString = (csvString) => {
                const [headers, ...rows] = csvString.replace("\r", "").split('\n').map((line) => line.split(','));
                return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
            };

            setCsvData(parseCsvString(response.data));

            const descriptions = {}

            for (let [key, value] of Object.entries(dataset)) {
                if (!["name", "description", "user", "url", "last_accessed"].includes(key)) {
                    descriptions[key] = value;
                }
            }

            setColumnsDescriptions(descriptions);
            setName(dataset.name);
            setDialogOpen(true);
        } catch (_) {
            setLoading(false);
            handleToast("Error getting dataset!", "error");
        }
    }

    const handleDownload = async (dataset) => {
        setLoading(true);
        setLoadingMessage("Downloading Dataset");

        let condition = false;

        try {
            await axios({
                method: "PUT",
                url: UPDATE_DATASET,
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    "Content-Type": "application/json"
                },
                data: {
                    "name": dataset.name,
                    "user": Cookies.get("userID").split("-").join("_")
                }
            })
        } catch (_) {
            condition = true;
            setLoading(false);
            handleToast("Error downloading dataset!", "error");
        }

        if (condition) return;

        try {
            const response = await axios({
                method: "GET",
                url: GET_DATASET(dataset.url)
            })

            setLoading(false);

            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = dataset.name + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (_) {
            setLoading(false);
            handleToast("Error downloading dataset!", "error");
        }
    }

    const handleStatusChange = async (e) => {
        const {name, checked} = e.target;

        setShareStatus((prevState) => ({
            ...prevState,
            [name]: checked
        }))

        let datasetName;
        let datasetUser;

        if (name.split(":").length > 2) {
            datasetName = name.split(":").slice(0, name.split(":").length - 1).join(":");
            datasetUser = name.split(":")[name.split(":").length];
        } else {
            datasetName = name.split(":")[0];
            datasetUser = name.split(":")[1];
        }

        try {
            const result = await axios({
                method: "PUT",
                url: UPDATE_SHARE_VALUE,
                headers: {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    "Content-Type": "application/json"
                },
                data: {
                    "name": datasetName,
                    "user": datasetUser,
                    "share_value": checked
                }
            })

            if (result.status === 200) {
                handleToast("Share status updated successfully.", "success");
            }
        } catch (_) {
            handleToast("Could not update the status of the dataset", "error");
        }
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        setLoadingMessage("Loading Datasets");
        axios({
            method: "GET",
            url: GET_ALL_DATASETS(Cookies.get("userID").split("-").join("_")),
            headers: {
                'Content-Type': "application/json",
                "Authorization": "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            setDatasets(response.data);
            setFilterDatasets(response.data);
            const shareStatues = {};

            for (let entry of response.data) {
                shareStatues[`${entry["name"]}:${entry["user"]}`] = entry["share_data"];
            }

            setShareStatus(shareStatues);

            setLoading(false);
        }).catch((_) => {
            setLoading(false);
            handleToast("Error loading datasets!", "error");
        })
    }, [])

    return (
        <div style={{backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundImage: `url(${background})`, height: "100vh", width: "100vw", marginTop: 82 }}>
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
                <Typography variant="h4" sx={{ color: "white" }}>{loadingMessage}</Typography>
            </Backdrop>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth TransitionComponent={Transition} keepMounted
                    maxWidth="xll" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {name && (
                    <DialogTitle>
                        {name.toUpperCase()}
                    </DialogTitle>
                )}
                <DialogContent sx={{ width: 1700 }}>
                    {csvData && columnsDescriptions && (
                        <DataTable sx={{ mt: 2, mb: 2 }} data={csvData} descriptions={columnsDescriptions} />
                    )}
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
                                <Tooltip title="Name of the dataset.">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Name</Typography>
                                </Tooltip>
                                <Tooltip title="Description of the dataset.">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                                </Tooltip>
                            </Stack>
                        </CardContent>
                        <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                        <CardActions>
                            <Stack spacing={4} direction="row">
                                <Tooltip title="Access Dataset">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access Dataset</Typography>
                                </Tooltip>
                                <Tooltip title="Download Dataset">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Download Dataset</Typography>
                                </Tooltip>
                                <Tooltip title="Share Dataset">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Share Dataset</Typography>
                                </Tooltip>
                            </Stack>
                        </CardActions>
                    </Card>
                    {filterDatasets.length !== 0 ?
                        filterDatasets.map((dataset) => (
                            <Card key={dataset.name} variant="outlined" sx={{ overflowX: "auto", mt: 2, mb: 2, height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                <CardContent sx={{ width: 500 }}>
                                    <Stack spacing={4} direction="row">
                                        <Tooltip title={dataset.name}>
                                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{dataset.name.length > 30 ? dataset.name.slice(0, 30) : dataset.name}</Typography>
                                        </Tooltip>
                                        <Tooltip title={dataset.description}>
                                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{dataset["description"].length > 30 ? dataset["description"].slice(0, 30) + "..." : dataset["description"]}</Typography>
                                        </Tooltip>
                                    </Stack>
                                </CardContent>
                                <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                                <CardActions>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleEnter(dataset)}
                                    >
                                        Check
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}}
                                        onClick={() => handleDownload(dataset)}
                                    >
                                        Download
                                    </Button>
                                    <FormGroup sx={{ mb: 2, mt: 2 }}>
                                        <FormControlLabel name={`${dataset.name}:${dataset.user}`} control={<WhiteSwitch inputProps={{ 'aria-label': 'controlled' }} onChange={handleStatusChange} checked={shareStatus[`${dataset.name}:${dataset.user}`]} />} label="Share Dataset" />
                                    </FormGroup >
                                </CardActions>
                            </Card>
                        ))
                        :
                        <Typography variant="h3" sx={{ color: "black"}}>
                            No datasets were found!
                        </Typography>
                    }
                </div>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 1000,
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
                        label="Dataset Name"
                        variant="outlined"
                        value={datasetName}
                        onChange={(e) => setDatasetName(e.target.value)}
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

export default Datasets;