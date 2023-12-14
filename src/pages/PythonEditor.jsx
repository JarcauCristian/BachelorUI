import * as React from 'react';
import Editor from "@monaco-editor/react"
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {Accordion, AccordionDetails, AccordionSummary, Dialog, DialogTitle, Tab, Tabs, TextField} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ClearIcon from '@mui/icons-material/Clear';

const drawerWidth = 240;
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const CustomTab = ({ tabName, index, onClose, isSelected, onSelect }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }} >
            <Tab label={tabName} {...a11yProps(index)} aria-selected={isSelected}/>
            <Button variant="contained" sx={{ backgroundColor: 'black', color: 'white', marginLeft: 2 }} onClick={onClose}>
                <ClearIcon />
            </Button>
        </div>
    );
};

const PythonEditor = () => {
    const [expanded, setExpanded] = React.useState(false);
    const [batchExpanded, setBatchExpanded] = React.useState(false);
    const [streamExpanded, setStreamExpanded] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [tabs, setTabs] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [tabName, setTabName] = React.useState("");
    const [counter, setCounter] = React.useState(0);

    const handleTabAdd = () => {
        console.log(tabName)
        const checking = /^[a-z_]+$/.test(tabName);
        if (checking) {
            setTabs(prevComponents => [...prevComponents, <Tab label={tabName} {...a11yProps(counter)}/>]);
            setCounter(counter + 1);
        }
        setOpen(false);
    }
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };



    const handleTabClose = (index) => {
        setTabs(prevComponents => {
            const updatedComponents = [...prevComponents];
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

    return (
        <div style={{ backgroundColor: "white", width: "100vw", height: "100vh", marginTop: 82 }}>
            <Dialog open={open} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    SET TAB NAME
                </DialogTitle>
                <TextField variant="outlined" onChange={handleTextFieldChange} label="Tab Name"/>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }}>
                                            Add
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft: 30, marginTop: -82.5 }}>
                <Tabs value={value} onChange={handleChange}>
                    {tabs.map((entry, index) => (
                        <div style={{ display: 'flex', alignItems: 'center' }} >
                            entry
                            <Button variant="contained" sx={{ backgroundColor: 'black', color: 'white', marginLeft: 2 }} onClick={() => handleTabClose(index)}>
                                <ClearIcon />
                            </Button>
                        </div>
                    ))}
                    <Button variant="filled" sx={{ backgroundColor: "white", color: "black" }} onClick={() => setOpen(true)}>
                        <AddBoxIcon />
                    </Button>
                </Tabs>
            </Box>
            {/*<Editor height="100vh" width="100vw" defaultLanguage="python" defaultValue="// some comment" />*/}
        </div>
    );
}

export default PythonEditor;