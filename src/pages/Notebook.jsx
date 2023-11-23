import * as React from 'react';
import axios from 'axios';
import {
    Alert,
    Backdrop,
    CardActions,
    CircularProgress,
    List,
    responsiveFontSizes,
    Snackbar,
    Stack
} from "@mui/material";
import ListItem from "@mui/material/ListItem";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Notebook = ({user_id}) => {
    const isRun = React.useRef(false);
    const [notebooks, setNotebooks] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [open, setOpen] = React.useState(false);
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


    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;
        setLoading(true);
        axios({
            method: 'get',
            url: 'https://controller.sedimark.work/main_api/get_notebook_details?user_id=' + user_id,
            headers: {
                'Content-Type': "application/json"
            }
        }).then((response) => {
            console.log(response.data);
            setNotebooks(response.data);
            setLoading(false);
        }).catch((error) => {
            handleToast("Error getting Notebooks!", "error");
            setLoading(false);
        })

    },[])

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
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", width: "100vw", height: "100vh"}}>
                <Card variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                    <CardContent>
                        <Stack spacing={4} direction="row">
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Notebook ID</Typography>
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Description</Typography>
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Creation Time</Typography>
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Expiration Time</Typography>
                        <Typography variant="p" sx={{ fontSize: 20, fontWeight: "bold"}}>Last Accessed</Typography>
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Button>
                            Enter
                        </Button>
                    </CardActions>
                </Card>
                <Card variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>

                </Card>
                <Card variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>

                </Card>
                <Card variant="outlined" sx={{ height: "10%", width: "80%", borderRadius: 5, backgroundColor: "black", color: "white", display: "flex", alignItems: "center", justifyContent: "space-evenly"}}>

                </Card>
            </div>
              <div>
                  Here
              </div>
          </div>
      </div>
    );
}

export default Notebook;