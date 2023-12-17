import * as React from 'react';
import Editor from "@monaco-editor/react"
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Alert,
    Dialog,
    DialogTitle,
    Snackbar,
    Tab,
    Tabs,
    TextField
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ClearIcon from '@mui/icons-material/Clear';
import ReactFlow, {addEdge, applyEdgeChanges, applyNodeChanges, Background, Controls, MiniMap} from "reactflow";
import TextUpdaterNode from "../components/customNode/TextUpdaterNode";
import ReactFlowPanel from "../components/ReactFlowPanel";
import axios from "axios";
import {BLOCK_MODEL} from "../components/utils/apiEndpoints";
import {nodeTypes} from "../components/utils/nodeTypes";
import {useEffect} from "react";

const drawerWidth = 240;
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const PythonEditor = () => {
    const [expanded, setExpanded] = React.useState(false);
    const [batchExpanded, setBatchExpanded] = React.useState(false);
    const [streamExpanded, setStreamExpanded] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [tabs, setTabs] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [tabName, setTabName] = React.useState("");
    const [counter, setCounter] = React.useState(0);
    const [pipelines, setPipelines] = React.useState({});
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [toastOpen, setToastOpen] = React.useState(false);
    const [tabsName, setTabsName] = React.useState([]);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    }

    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setToastOpen(false);
    };


    const handleTabAdd = () => {
        if (counter > 9) {
            handleToast("A maximum of 10 tabs can be opened at a time!", "warning");
            return;
        }
        const checking = /^[a-z_]+$/.test(tabName);
        if (checking) {
            setPipelines((prevState) => ({
                ...prevState,
                [tabName]: {
                    blocks: {
                        loader: "",
                        transformers: [],
                        exporter: ""
                    }
                }
            }))
            setTabsName(prevState => [...prevState, tabName]);
            setTabs(prevComponents => [...prevComponents, <Tab key={counter} label={tabName} icon={<ClearIcon onClick={() => handleTabClose(counter)} />} iconPosition="end" {...a11yProps(counter)}/>]);
            setCounter(counter + 1);
        }
        setOpen(false);
    }
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleTabClose = (index) => {
        setCounter(counter - 1);
        setTabs(prevComponents => {
            const updatedComponents = [...prevComponents];
            updatedComponents.splice(index, 1);
            return updatedComponents;
        })
        setTabsName(prevState => {
            const updatedComponents = [...prevState];
            updatedComponents.splice(index, 1);
            return updatedComponents;
        })
    }
    const handleMainChange = (panel) => (event, isExpanded) => {
            setExpanded(isExpanded ? panel : false);
    };

    const handleBatchChange = (panel) => (event, isExpanded) => {
        setBatchExpanded(isExpanded ? panel : false);
    }

    const handleStreamChange = (panel) => (event, isExpanded) => {
        setStreamExpanded(isExpanded ? panel : false);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleTextFieldChange = (event) => {
        setTabName(event.target.value);
    }

    const handleStreamingLoader = () => {
        axios({
            method: "GET",
            url: BLOCK_MODEL("stream", "loader")
        }).then((response) => {
            if (tabsName[value] in pipelines) {
                const newNode = {
                    id: "dsadad",
                    type: 'textUpdater',
                    position: { x: 0, y: 0 },
                    data: {
                        params: {},
                        type: "loader",
                        name: "dsadad",
                        pipeline_name: counter,
                        label: "dsadad",
                        language: "yaml",
                        background: "#4877ff",
                        content: response.data,
                    },
                };
                setPipelines((prevPipelines) => ({
                    ...prevPipelines,
                    [tabName]: {
                        ...prevPipelines[tabName],
                        blocks: {
                            ...prevPipelines[tabName].blocks,
                            loader: newNode,
                        },
                    },
                }));
            } else {
                handleToast("There is non pipeline with that name!", "error");
            }
        }).catch((error) => {
            handleToast("Error loading block model!", "error");
        })
    }

    const handleStreamingTransformer = () => {

    }

    const handleStreamingExporter = () => {

    }

    useEffect(() => {
        console.log(pipelines);
    }, [pipelines]);

    return (
        <div style={{ backgroundColor: "white", width: "100vw", height: "100vh", marginTop: 82 }}>
            <Snackbar
                open={toastOpen}
                autoHideDuration={2000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleToastClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Dialog open={open} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    PIPELINE NAME
                </DialogTitle>
                <TextField variant="outlined" onChange={handleTextFieldChange} label="Pipeline Name"/>
                <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleTabAdd}>
                    Add Tab
                </Button>
                </Box>
            </Dialog>
            <Drawer
                variant="permanent"
                sx={{
                    marginTop: 82,
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { marginTop: 2.5, width: drawerWidth, boxSizing: 'border-box', backgroundColor: "#36454F" },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: "auto" }}>
                    <Accordion expanded={expanded === 'panel1'} onChange={handleMainChange('panel1')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                {"Batch Blocks".toUpperCase()}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchExpanded === 'batch_panel1'} onChange={handleBatchChange('batch_panel1')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Data Loader".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchExpanded === 'batch_panel2'} onChange={handleBatchChange('batch_panel2')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Transformers".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchExpanded === 'batch_panel3'} onChange={handleBatchChange('batch_panel3')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Data Exporter".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel2'} onChange={handleMainChange('panel2')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                {"Streaming Blocks".toUpperCase()}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={streamExpanded === 'stream_panel1'} onChange={handleStreamChange('stream_panel1')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Data Loader".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={handleStreamingLoader}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={streamExpanded === 'stream_panel2'} onChange={handleStreamChange('stream_panel2')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Transformers".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => handleStreamingTransformer(value)}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={streamExpanded === 'stream_panel3'} onChange={handleStreamChange('stream_panel3')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"Data Exporter".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => handleStreamingExporter(value)}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
            <Box sx={{ marginLeft: 30 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: -82.2 }}>
                    <Tabs value={value} onChange={handleChange}>
                        {tabs.map((entry) => (
                            entry
                        ))}
                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black" }} onClick={() => setOpen(true)}>
                            <AddBoxIcon />
                        </Button>
                    </Tabs>
                </Box>
                {tabs.map((entry, index) => (
                    <ReactFlowPanel key={index} index={index} value={value} {...{componentNodes: pipelines[tabsName[value]]["blocks"], componentEdges: [], drawerWidth: drawerWidth}} />
                ))}
            </Box>
        </div>
    );
}

export default PythonEditor;