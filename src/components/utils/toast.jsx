import {Alert, Snackbar} from "@mui/material";
import * as React from "react";

const Toast = ({message, severity}) => {
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};

    React.useEffect(() => {
        if (message !== null && severity !== null) {
            setToastMessage(message);
            setToastSeverity(severity);
            setOpen(true);
        } else {
            setToastMessage("");
            setToastSeverity("success");
            setOpen(false);
        }
    }, [])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <div>
        <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={handleClose}
            anchorOrigin={{vertical, horizontal}}
        >
            <Alert onClose={handleClose} severity={toastSeverity}>
                {toastMessage}
            </Alert>
        </Snackbar>
        </div>
    );
}

export default Toast;