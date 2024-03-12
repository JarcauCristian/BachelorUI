import * as React from 'react';
import axios from 'axios';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress, Divider,
    Snackbar,
    Stack, TextField
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
import {DELETE_NOTEBOOK, UPDATE_ACCESS, USER_NOTEBOOKS_DETAILS} from "../components/utils/apiEndpoints";


const Notebooks = () => {
    const isRun = React.useRef(false);
    const [notebooks, setNotebooks] = React.useState([]);
    const [filterNotebooks, setFilterNotebooks] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [notebookIDFilter, setNotebookIDFilter] = React.useState('');
    const [creationDate, setCreationDate] = React.useState('');
    const [expirationDate, setExpirationDate] = React.useState('');
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

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

    const handleBackdropClose = () => {
        setLoading(false);
    }

    const clearFilters = () => {
        setFilterNotebooks(notebooks);
        setCreationDate("");
        setExpirationDate("");
        setNotebookIDFilter("");
    };

    const handleEnter = (notebook_id, notebook_type) => {
        axios({
            method: 'PUT',
            url: UPDATE_ACCESS(notebook_id),
            headers: {
                'Content-Type': "application/json",
                'Authorization': "Bearer " + Cookies.get("token")
            }
        }).then(() => {
            navigate(`/notebooks/${notebook_id}_${notebook_type}`);
        }).catch(() => {
            handleToast("Error updating access!", "error");
        })
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

            setNotebooks(aux);
            setFilterNotebooks(aux);
        }).catch(() => {
            handleToast("Error Deleting Notebook", "error");
        })
    }


    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;
        const user_id = Cookies.get("userID").split("-").join("_");
        setLoading(true);
        axios({
            method: 'GET',
            url: USER_NOTEBOOKS_DETAILS(user_id),
            timeout: 1000*10,
            headers: {
                'Content-Type': "application/json",
                'Authorization': "Bearer " + Cookies.get("token")
            }
        }).then((response) => {
            setNotebooks(response.data);
            setFilterNotebooks(response.data);
            setLoading(false);
        }).catch((_) => {
            handleToast("Error getting Notebooks!", "error");
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        })
    },[])

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
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "90vw", height: "100vh"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", marginTop: 30, width: "100vw", height: "100vh"}}>
                <Card variant="outlined" sx={{ height: "10%", width: "80%", marginBottom: 10, borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>
                    <CardContent>
                        <Stack spacing={4} direction="row">
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Notebook ID</Typography>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Creation Time</Typography>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Expiration Time</Typography>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Last Accessed</Typography>
                            <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Type</Typography>
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Access Notebook</Typography>
                        <Divider orientation="vertical" flexItem sx={{ marginLeft: 2 , marginRight: 1, borderWidth: 2, backgroundColor: "white"}} />
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Delete Notebook</Typography>
                    </CardActions>
                </Card>
                {filterNotebooks.length !== 0 ?
                    filterNotebooks.map((notebook) => (
                        <Card key={notebook["notebook_id"]} variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                            <CardContent>
                                <Stack spacing={4} direction="row">
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook["notebook_id"]}</Typography>
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook.description}</Typography>
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook["creation_time"]}</Typography>
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook["expiration_time"]}</Typography>
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook["last_accessed"]}</Typography>
                                    <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>{notebook["notebook_type"]}</Typography>
                                </Stack>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="outlined"
                                    sx={{ color: "White", borderColor: "white", marginRight: 2, '&:hover': { bgcolor: 'grey', borderColor: "white" }}}
                                    onClick={() => handleEnter(notebook["notebook_id"], notebook["notebook_type"])}
                                >
                                    Enter
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{ color: "White", borderColor: "white", '&:hover': { bgcolor: 'grey', borderColor: "white"  }}}
                                    onClick={() => handleDelete(notebook["notebook_id"])}
                                >
                                    Delete
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
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DatePicker']} sx={{ marginTop: 2}}>
                          <DatePicker label="Expired On or After"
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
              </Box>
          </div>
      </div>
    );
}

export default Notebooks;