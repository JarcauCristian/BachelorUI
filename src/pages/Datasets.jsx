import * as React from 'react';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress,
    Dialog, DialogTitle,
    Divider,
    Snackbar,
    Stack,
    TextField
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import axios from "axios";
import {GET_ALL_DATASETS, GET_DATASET} from "../components/utils/apiEndpoints";
import Cookies from "js-cookie";
import DataTable from "../components/DataTable";

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

    const handleEnter = (dataset) => {
        axios({
            method: "GET",
            url: GET_DATASET(dataset.url)
        }).then((response) => {
            const parseCsvString = (csvString) => {
                const [headers, ...rows] = csvString.split('\n').map((line) => line.split(','));
                return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
            };

            setCsvData(parseCsvString(response.data));

            const descriptions = {}

            for (let [key, value] of Object.entries(dataset)) {
                if (!["name", "description", "user", "url"].includes(key)) {
                    descriptions[key] = value;
                }
            }

            setColumnsDescriptions(descriptions);
            setName(dataset.name);
            setDialogOpen(true);
        }).catch((_) => {})
    }

    const handleDownload = (dataset) => {
        setLoading(true);
        axios({
            method: "GET",
            url: GET_DATASET(dataset.url)
        }).then((response) => {
            setLoading(false);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = dataset.name + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch((_) => {
            setLoading(false);
            handleToast("Error downloading dataset!", "error")
        })
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        axios({
            method: "GET",
            url: GET_ALL_DATASETS(Cookies.get("userID").split("-").join("_"))
        }).then((response) => {
            setDatasets(response.data);
            setFilterDatasets(response.data);
            setLoading(false);
        }).catch((_) => {
            setLoading(false);
            handleToast("Error loading datasets!", "error");
        })
    }, [])

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
            <Dialog style={{ padding: '10px' }} open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {name.toUpperCase()}
                </DialogTitle>
                <DataTable data={csvData}/>
            </Dialog>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "90vw", height: "100vh"}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                    <Card variant="outlined" sx={{ height: "10%", width: "80%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                        <CardContent>
                            <Stack spacing={4} direction="row">
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Dataset Name</Typography>
                                <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                            </Stack>
                        </CardContent>
                        <CardActions>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access Dataset</Typography>
                            <Divider sx={{ color: "white", width: 5 }} orientation="vertical" />
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Download Dataset</Typography>
                        </CardActions>
                    </Card>
                    {filterDatasets.length !== 0 ?
                        filterDatasets.map((dataset) => (
                            <Card key={dataset.name} variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                                <CardContent>
                                    <Stack spacing={4} direction="row">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{dataset.name.charAt(0).toUpperCase() + dataset.name.slice(1)}</Typography>
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{dataset.description}</Typography>
                                    </Stack>
                                </CardContent>
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