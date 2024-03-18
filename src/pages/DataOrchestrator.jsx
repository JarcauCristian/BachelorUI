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
import {Backdrop, CircularProgress, List} from "@mui/material";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import Button from "@mui/material/Button";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TextUpdaterNode from '../components/customNodes/TextUpdaterNode';
import '../styles/custom_node.css';

const initialNodes = [
    {
        id: 'djasihdau',
        type: 'textUpdater',
        position: { x: 100, y: 100 },
        data: {params: [], label: 'My Custom Node',  name: "My Custom Node", pipeline_name: "pipeline_name", language: "python", background: "lightgreen", type: "transformer"},
    },
];

const drawerWidth = 240;

const nodeTypes = { textUpdater: TextUpdaterNode };

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
    const [normalization, setNormalization] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const isSet = React.useRef(false);
    const [nodes, setNodes] = React.useState(initialNodes);
    const [edges, setEdges] = React.useState([]);
    const [hoverStates, setHoverStates] = React.useState(Array(3).fill(false));

    const handleHover = (index, isHovered) => {
        const updatedHoverStates = [...hoverStates];
        updatedHoverStates[index] = isHovered;
        setHoverStates(updatedHoverStates);
    };

    const onConnect = React.useCallback((params) => setEdges((eds) => addEdge({...params, style: {stroke: "black"}}, eds)), [setEdges]);
    const Caps = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    const handleListClick = (blocks, pipeline_name) => {
        let nodes = [];
        let edges = [];
        let positions = [];
        setEdges(edges);
        setNodes(nodes);
        const setPosition = (nodes, currentNode, x, y) => {
            if (currentNode.upstream_blocks.length === 0) {
                positions[currentNode.name] = [0, 0];
            } else {
                positions[currentNode.name] = [x, y];
            }

            currentNode.downstream_blocks.forEach((downStreamNode, index) => {
                if (index % 2 === 0) {
                    if (index > 1) {
                        setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y + (index - 1) * 500);
                    } else {
                        setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y + index * 500);
                    }
                } else {
                    if (index > 1) {
                        setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y - (index - 1) * 500);
                    } else {
                        setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y - index * 500);
                    }
                }
            })
        }

        let firstBlock = 0;
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].upstream_blocks.length === 0) {
                firstBlock = i;
                break;
            }
        }

        setPosition(blocks, blocks[firstBlock], 0, 0);

        for (let block of blocks) {
            const block_name = block.name.includes("_") ? block.name.split("_").map((data) => {
                return Caps(data);
            }).join(" ") : Caps(block.name);

            nodes.push({
                id: `${block.name}`,
                type: 'textUpdater',
                position: { x: positions[block.name][0], y: positions[block.name][1] },
                data: { params: block.variables, type: block.type, name: block.name, pipeline_name: pipeline_name, label: block_name, language: block.language, background: block.type === 'data_loader' ? "#4877ff": block.type === 'transformer' ? "#7d55ec" : "#ffcc19"},
            })
        }

        const Edges = (nodes, currentNode) => {
            currentNode.downstream_blocks.forEach((downStreamBlock, index) => {
                edges.push({
                    id: `e${currentNode.name}-${downStreamBlock}`,
                    source: currentNode.name,
                    target: downStreamBlock,
                    style: { stroke: 'black' },
                })

                Edges(nodes, nodes.find(node => node.name === downStreamBlock))
            })
        }

        Edges(blocks, blocks[firstBlock])

        setNodes(nodes);
        setEdges(edges);
    }

    const handleBackdropClose = () => {
        setLoading(false);
    }

    const onNodesChange = React.useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = React.useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, {...eds, style: {stroke: "black"}})),
        [setEdges]
    );

    const getNormalization = async () => {
        setLoading(true);
        axios.get(`http://localhost:7000/pipelines`,{ params: { pipeline_type: "normalization" }, timeout: 20000 })
            .then(response => {
                setNormalization(response.data);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                console.log(error);
            });
    }

    const clearBoard = () => {
        setNodes([]);
        setEdges([]);
    }

    useEffect(() => {
        if (isSet.current) return;

        isSet.current = true;
        getNormalization();

       setAppBarHeight(JSON.parse(window.sessionStorage.getItem("appBarHeight")));
    }, [appBarHeight]);

    return (
        <div style={{width: '100vw', height: '100vh', display: "flex", flexDirection: "row" }}>
        <Box sx={{ display: 'flex', background: "#000", color: "#fff" }}>
            <Backdrop
                sx={{ color: 'gray', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: '#000080',
                        marginTop: appBarHeight / 8
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Button
                    style={{
                        fontFamily: 'Roboto',
                        fontWeight: 'bolder',
                        fontSize: hoverStates[0] ? 25 : 20,
                        textAlign: 'center',
                        color: "#fff",
                        background: "#000080",
                        transition: 'background-color 0.3s ease',
                        border: '2px solid black'
                    }}
                    onClick={clearBoard}
                    onMouseEnter={() => handleHover(0, true)}
                    onMouseLeave={() => handleHover(0, false)}>
                    Clear Board
                </Button>
                <Accordion sx={{background: "#C0C0C0", color: "#000"}} expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography style={{fontWeight: "bold", fontFamily: "Roboto"}}>Data Normalization</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List>
                            {normalization.map((data, index) => (
                                <ListItem key={index} disablePadding>
                                    <Accordion sx={{ width: "100%" }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            {data.name.length > 0 && (<Typography>Here</Typography>)}
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                            {data.description}
                                            <Button
                                                key={index}
                                                style={{
                                                    backgroundColor: hoverStates[index+1] ? 'black' : 'white',
                                                    color: hoverStates[index+1] ? 'white' : 'black',
                                                    transition: 'background-color 0.3s ease',
                                                    border: '2px solid black'
                                                }}
                                                onClick={() => handleListClick(data.blocks, data.name)}
                                                onMouseEnter={() => handleHover(index+1, true)}
                                                onMouseLeave={() => handleHover(index+1, false)}
                                            >
                                                Add
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
                <Accordion sx={{background: "#C0C0C0", color: "#000"}}  expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
                        <Typography style={{fontWeight: "bold", fontFamily: "Roboto"}}>Data Enrichment</Typography>
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
            <ReactFlow style={{paddingRight: drawerWidth + 10}}
                       nodes={nodes}
                       edges={edges}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       onConnect={onConnect}
                       nodeTypes={nodeTypes}
                       fitView>
                <Controls />
                <MiniMap style={{height: 120}} zoomable pannable/>
                <Background style={{background: "#87CEEB"}} color="#000" variant="dots" gap={12} size={1} /></ReactFlow>
        </div>
    );
}

export default DataOrchestrator;