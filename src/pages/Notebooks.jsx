import * as React from 'react';
import axios from 'axios';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper,
    Snackbar,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import background from "../images/background_image.jpg"
import {
    DELETE_NOTEBOOK,
    NOTEBOOK_STATUS,
    UPDATE_ACCESS,
    USER_NOTEBOOKS_DETAILS
} from "../components/utils/apiEndpoints";
import Transition from "../components/utils/transition";
import InfoIcon from '@mui/icons-material/Info';
import CustomTooltip from "../components/CustomTooltip";


const Notebooks = () => {
    const isRun = React.useRef(false);
    const [notebooks, setNotebooks] = React.useState([]);
    const [filterNotebooks, setFilterNotebooks] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [notebookIDFilter, setNotebookIDFilter] = React.useState('');
    const [creationDate, setCreationDate] = React.useState(null);
    const [expirationDate, setExpirationDate] = React.useState(null);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [open, setOpen] = React.useState(false);
    const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
    const navigate = useNavigate();
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFilterApplication = () => {
        if (notebookIDFilter !== '' || creationDate !== '' || expirationDate !== '') {
            const filteredNotebooks = notebooks.filter((notebook) => {
                const matchesID = notebookIDFilter ? notebook["notebook_id"] === notebookIDFilter : true;
                const matchesCreationDate = creationDate ? new Date(notebook["creation_time"]) <= new Date(creationDate) : true;
                const matchesExpirationDate = expirationDate ? new Date(notebook["expiration_time"]) >= new Date(expirationDate) : true;

                return matchesID && matchesCreationDate && matchesExpirationDate;
            });

            setFilterNotebooks(filteredNotebooks);
        } else if (notebookIDFilter === '' && creationDate === '' && expirationDate === '') {
            handleToast("Please use at least one of the filters!", "error");
        }
    }
    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setOpen(true);
    }

    const handleClose = (_, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const clearFilters = () => {
        setFilterNotebooks(notebooks);
        setCreationDate("");
        setExpirationDate("");
        setNotebookIDFilter("");
    };

    const handleEnter = async (notebook_id, notebook_type) => {
        let condition = false;

        try {
            const response = await axios({
                method: "GET",
                url: NOTEBOOK_STATUS(notebook_id),
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': "Bearer " + Cookies.get("token")
                }
            })

            if (response.data !== "Notebook is running.") {
                condition = true;
            }

            handleToast(response.data, "info");
        } catch (_) {
            handleToast("Could not get notebook status.", "error");
            condition = true;
        }

        if (condition) return;

        try {
            await axios({
                method: 'PUT',
                url: UPDATE_ACCESS(notebook_id),
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': "Bearer " + Cookies.get("token")
                }
            })
            navigate(`/notebooks/${notebook_id}_${notebook_type}`);
        } catch (_) {
            handleToast("Error updating access!", "error");
        }
    }

    const handleDelete = (notebook_id) => {
        axios({
            method: 'delete',
            url: DELETE_NOTEBOOK(notebook_id),
            headers: {
                'Content-Type': "application/json",
                'Authorization': 'Bearer ' + Cookies.get("token")
            }
        }).then(() => {
            handleToast("Notebook Deleted Successfully", "success");

            const aux = notebooks.filter((obj) => obj["notebook_id"] !== notebook_id);

            localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-notebooks-changed`, JSON.stringify(true));

            setNotebooks(aux);
            setFilterNotebooks(aux);
        }).catch(() => {
            handleToast("Error Deleting Notebook", "error");
        })
    }


    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const changed = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-notebooks-changed`);

        const user_id = Cookies.get("userID").split("-").join("_");
        setLoading(true);
        setDisclaimerOpen(true);
        axios({
            method: 'GET',
            url: USER_NOTEBOOKS_DETAILS(user_id, changed ? JSON.parse(changed) : false),
            timeout: 1000*10,
            headers: {
                'Content-Type': "application/json",
                'Authorization': "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            const sortedData = [...response.data].sort((a, b) => new Date(a["creation_time"]) - new Date(b["creation_time"]));
            setNotebooks(sortedData);
            setFilterNotebooks(sortedData);
            setLoading(false);
            localStorage.setItem(`${Cookies.get("userID").split("-").join("_")}-notebooks-changed`, JSON.stringify(false));
        }).catch((_) => {
            handleToast("Error getting Notebooks!", "error");
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        })
    },[])

    return (
      <div style={{backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundImage: `url(${background})`, height: "100vh", width: "100vw", marginTop: 82 }}>
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
              <Typography variant="h4" sx={{ color: "white" }}>Loading Notebooks</Typography>
          </Backdrop>
          <Dialog maxWidth="xl" open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} TransitionComponent={Transition} keepMounted>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", padding: 5 }}>
                  <DialogTitle sx={{ fontWeight: "bold" }}>
                      DISCLAIMERS
                  </DialogTitle>
                  <DialogContent sx={{ fontSize: "1.25rem" }}>
                      Notebooks that are unused for 10 days, and all notebooks older then 20 days  will be automatically deleted.
                  </DialogContent>
                  <DialogActions>
                      <Button variant="filled" sx={{ marginTop: 2, backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => setDisclaimerOpen(false)}>
                          close
                      </Button>
                  </DialogActions>
              </Box>
          </Dialog>
          <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} fullWidth TransitionComponent={Transition} keepMounted maxWidth="sm" sx={{ '& .MuiDialog-paper': { backgroundColor: 'black', color: 'white' } }}>
              <DialogTitle sx={{ color: 'white' }}>Filter Options</DialogTitle>
              <DialogContent>
                  <TextField
                      label="Notebook ID"
                      variant="outlined"
                      value={notebookIDFilter}
                      onChange={(e) => setNotebookIDFilter(e.target.value)}
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DatePicker']} sx={{ marginTop: 2}}>
                          <DatePicker label="Expired On or After"
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
                                      value={expirationDate}
                                      onChange={(e) => setExpirationDate(e)}
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
              </DialogContent>
          </Dialog>
          <Grid container spacing={2}>
              <Grid item xs={6} md={10}>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                        <Card variant="outlined" sx={{ overflow: "auto", height: "10%", width: "90%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                            <CardContent>
                                <Stack spacing={10} direction="row">
                                    <CustomTooltip title="The ID of the notebook as it is stored in the database.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  ID</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The description of the notebook.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Description</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="Creation Date of the notebook.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Creation</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The date at which the notebook will expire and will be deleted.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Expiration</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="When the notebook was last accessed.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Last Accessed</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="The type of the notebook.">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/>  Type</Typography>
                                    </CustomTooltip>
                                </Stack>
                            </CardContent>
                            <Divider orientation="vertical" flexItem sx={{ backgroundColor: "white", width: 3 }}/>
                            <CardActions>
                                <Stack spacing={4} direction="row">
                                    <CustomTooltip title="Access Notebook">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/> Access</Typography>
                                    </CustomTooltip>
                                    <CustomTooltip title="Delete Notebook">
                                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", cursor: "pointer"}}><InfoIcon sx={{ marginRight: 1 }}/> Delete</Typography>
                                    </CustomTooltip>
                                    <Button
                                        variant="contained"
                                        onClick={() => setFilterDialogOpen(true)}
                                        sx={{ mt: 2, py: 1.5, backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'grey' } }}
                                        fullWidth
                                    >
                                        Filter Notebooks
                                    </Button>
                                </Stack>
                            </CardActions>
                        </Card>
                        {filterNotebooks.length !== 0 ?
                            <TableContainer component={Paper} sx={{ overflow: "auto", width: "90%", height: "auto", backgroundColor: "black", color: "white", mt: 2, mb: 2 }}>
                                <Table sx={{ minWidth: 650, overflow: "auto" }} aria-label="model table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>ID</TableCell>
                                            <TableCell sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Description</TableCell>
                                            <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Creation Date</TableCell>
                                            <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Expiration Date</TableCell>
                                            <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Last Accessed</TableCell>
                                            <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Type</TableCell>
                                            <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.10rem", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filterNotebooks.map((notebook) => (
                                            <TableRow
                                                key={notebook["notebook_id"]}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" sx={{ color: "white", fontWeight: "bold" }}>
                                                    <Tooltip title={notebook["notebook_id"].length}>
                                                        <span style={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem" }}>{notebook["notebook_id"].length.length > 15 ? notebook["notebook_id"].slice(0, 15) + "..." : notebook["notebook_id"]}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                                    <Tooltip title={notebook["description"]}>
                                                        <span style={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem" }}>{notebook["description"].length > 15 ? notebook["description"].slice(0, 15) + "..." : notebook["description"]}</span>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{notebook["creation_time"]}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{notebook["expiration_time"]}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{notebook["last_accessed"]}</TableCell>
                                                <TableCell align="right" sx={{ fontSize: width < 1500 ? "0.75rem" : "1.1rem", color: "white", fontWeight: "bold" }}>{notebook["notebook_type"]}</TableCell>
                                                <TableCell align="right" >
                                                    <Button
                                                        variant="outlined"
                                                        sx={{ mr: 2, fontSize: width < 1500 ? "0.6rem" : ".9rem", backgroundColor: "white", color: "black", borderColor: "gray", '&:hover': { backgroundColor: 'grey', borderColor: "white", color: "white" }}}
                                                        onClick={() => handleEnter(notebook["notebook_id"], notebook["notebook_type"])}
                                                    >
                                                        Enter
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{ mr: 2, fontSize: width < 1500 ? "0.6rem" : ".9rem", backgroundColor: "white", color: "black", borderColor: "gray", '&:hover': { backgroundColor: 'grey', borderColor: "white", color: "white" }}}
                                                        onClick={() => handleDelete(notebook["notebook_id"])}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                             :
                            <Typography variant="h3" sx={{ fontSize: width < 1000 ? "1.5rem" : "3rem", color: "black"}}>
                                No active notebooks were found!
                            </Typography>
                        }
                    </div>
              </Grid>
          </Grid>
      </div>
    );
}

export default Notebooks;