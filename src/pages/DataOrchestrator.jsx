import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import axios from "axios";
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from "@mui/material/Typography";
import {useEffect} from "react";
import {Alert, List, Snackbar} from "@mui/material";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

const drawerWidth = 240;

const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const DataOrchestrator = () => {
    const [expanded, setExpanded] = React.useState('panel1');
    const [appBarHeight, setAppBarHeight] = React.useState(null);
    const [transformers, setTransformers] = React.useState(null);
    const isSet = React.useRef(false);
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [open, setOpen] = React.useState(false);
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

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    const getTransformers = async () => {
        axios.get(`http://localhost:8000/get_transformers_params`)
            .then(response => {
                console.log(response.data)
                setTransformers(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
        if (isSet.current) return;

        isSet.current = true;
        getTransformers();

       setAppBarHeight(JSON.parse(window.sessionStorage.getItem("appBarHeight")));
    }, [appBarHeight]);

    return (
        <Box sx={{ display: 'flex'}}>
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
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Accordion sx={{ paddingTop: appBarHeight / 8 }} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Transformers</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <InboxIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Inbox" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <DraftsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Drafts" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                        <Typography>Exporters</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <InboxIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Inbox" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <DraftsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Drafts" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Drawer>
        </Box>
    );
}

export default DataOrchestrator;