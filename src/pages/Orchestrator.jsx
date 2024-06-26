import * as React from 'react';
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Backdrop,
    CircularProgress,
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    FormControl,
    List,
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
import ReactFlowPanel from "../components/ReactFlowPanel";
import axios from "axios";
import {
    BLOCK_MODEL,
    CREATE_PIPELINE, DELETE_FILES,
    DELETE_PIPELINE, GET_TEMPLATES,
    PIPELINES,
    READ_PIPELINE
} from "../components/utils/apiEndpoints";
import {CAPS} from "../components/utils/utliFunctions";
import Cookies from "js-cookie";
import ListItemText from "@mui/material/ListItemText";
import Transition from '../components/utils/transition';

const drawerWidth = 350;
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
const Orchestrator = () => {
    const [expanded, setExpanded] = React.useState(true);
    const [outsideExpanded, setOutsideExpanded] = React.useState(false);
    const [batchLoaderExpanded, setBatchLoaderExpanded] = React.useState(false);
    const [batchTransformerExpanded, setBatchTransformerExpanded] = React.useState(false);
    const [batchExporterExpanded, setBatchExporterExpanded] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [tabs, setTabs] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);
    const [tabName, setTabName] = React.useState("");
    const [batchName, setBatchName] = React.useState("");
    const [pipelines, setPipelines] = React.useState({});
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [toastOpen, setToastOpen] = React.useState(false);
    const [tabsName, setTabsName] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [streamingOpen, setStreamingOpen] = React.useState(false);
    const [batchOpen, setBatchOpen] = React.useState(false);
    const [pipelinesBlocksNames, setPipelinesBlocksNames] = React.useState([]);
    const [batchTemplates, setBatchTemplates] = React.useState([]);
    const [batchBlockName, setBatchBlockName] = React.useState("");
    const [batchBlockType, setBatchBlockType] = React.useState("");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const [loadingMessage, setLoadingMessage] = React.useState("");
    const isRun = React.useRef(false);
    const isDrawerRun = React.useRef(false);
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
        if (tabs.length > 9) {
            handleToast("A maximum of 10 tabs can be opened at a time!", "warning");
            return;
        }

        const checking = /^[a-z_]+$/.test(tabName);
        if (checking && tabName.length <= 10) {
            const name = `${tabName}_${Cookies.get("userID").split("-").join("_")}`
            const type = "python"
            axios({
                method: "POST",
                url: CREATE_PIPELINE(name, type)
            }).then((_) => {
                setPipelines((prevState) => {
                    return {
                        ...prevState,
                        [tabName]: {
                            ...prevState[tabName],
                            batch: {
                                loader: "",
                                transformers: [],
                                exporter: "",
                                edges: [],
                                created: false,
                                blockPosition: 0
                            },
                        }
                    };
                });
                localStorage.setItem(`changed-pipelines-${Cookies.get("userID").split("-").join("_")}`, JSON.stringify(true));
                setPipelinesBlocksNames(prevState => [...prevState, []]);
                setTabsName(prevState => [...prevState, tabName]);
                setTabs(prevComponents => [...prevComponents, <Tab key={tabs.length} label={tabName} icon={<ClearIcon onClick={() => handleTabClose(tabName, [...tabsName, tabName])} />} iconPosition="end" {...a11yProps(tabs.length)}/>]);
                setValue(tabsName.length);
                setOpen(false);
            }).catch((_) => {
                handleToast("Error creating pipeline!", "error")
                setOpen(false);
            })
        } else {
            if (!checking) {
                handleToast("Only lowercase letters and underscores are allowed!", "error");
            } else {
                handleToast("Name must be 10 characters maximum!", "error");
            }
        }
    }
    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    const handleTabClose = React.useCallback(async (tabName, localTabs) => {
        const name = tabName + "_" + Cookies.get("userID").split("-").join("_");

        let condition = false;
        setLoading(true);
        setLoadingMessage(`Deleting pipeline ${tabName}...`);

        try {
            await axios({
                method: "DELETE",
                url: DELETE_PIPELINE(name),
                timeout: 10000
            });
        } catch (_) {
            condition = true;
        }

        if (condition) {
            setLoading(false);
            setLoadingMessage("");
            handleToast("Could not delete the pipeline!", "error");
            return;
        }

        try {
            await axios({
                method: "DELETE",
                url: DELETE_FILES(Cookies.get("userID").split("-").join("_") + "/" + tabName,  "true"),
                headers: {
                    "Authorization": `Bearer ${Cookies.get("token")}`
                },
                timeout: 10000
            });
        } catch (_) {
            condition = true;
        }

        if (condition) {
            setLoading(false);
            setLoadingMessage("");
            handleToast("Could not delete files associated with the pipeline!", "error");
            return;
        }

        let index;
        for (let i = 0; i < localTabs.length; i++) {
            if (tabName === localTabs[i]) {
                index = i;
                break;
            }
        }

        const newLocalTabs = localTabs.filter((_, i) => i !== index);

        setTabs(prevComponents => {
            const updatedComponents = prevComponents.filter((_, i) => i !== index);
            return updatedComponents.map((component, i) => {
               return <Tab
                   key={component.key}
                   label={component.props.label}
                   icon={<ClearIcon onClick={() => handleTabClose(component.props.label, newLocalTabs)} />}
                   iconPosition="end"
                   {...a11yProps(component.key)}
               />;
            });
        })

        setPipelines((prevState) => {
            const updatedPipelines = {...prevState};
            delete updatedPipelines[tabName];
            return updatedPipelines;
        })

        setTabsName(prevState => {
            const updatedComponents = [...prevState];
            updatedComponents.splice(index, 1);
            return updatedComponents;
        })

        setPipelinesBlocksNames(prevState => {
            const updatedComponents = [...prevState];
            updatedComponents.splice(index, 1);
            return updatedComponents;
        })

        setValue(0);

        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).includes(tabName)) {
                localStorage.removeItem(localStorage.key(i));
            }
        }

        localStorage.setItem(`changed-pipelines-${Cookies.get("userID").split("-").join("_")}`, JSON.stringify(true));
        setLoading(false);
        setLoadingMessage("");
    }, [])

    const handleMainChange = ()=> {
            setExpanded(!expanded);
    };

    const handleLoaderChange = (panel) => (event, isExpanded) => {
        setOutsideExpanded(isExpanded ? panel : false);
    }

    const handleTransformersChange = (panel) => (event, isExpanded) => {
        setOutsideExpanded(isExpanded ? panel : false);
    }

    const handleExporterChange = (panel) => (event, isExpanded) => {
        setOutsideExpanded(isExpanded ? panel : false);
    }

    const handleBatchLoaderChange = (panel) => (event, isExpanded) => {
        setBatchLoaderExpanded(isExpanded ? panel : false);
    }

    const handleBatchTransformerChange = (panel) => (event, isExpanded) => {
        setBatchTransformerExpanded(isExpanded ? panel : false);
    }

    const handleBatchExporterChange = (panel) => (event, isExpanded) => {
        setBatchExporterExpanded(isExpanded ? panel : false);
    }

    const handleClose = () => {
        if (open) setOpen(false);
        if (streamingOpen) setStreamingOpen(false);
        if (batchOpen) setBatchOpen(false);
        if (disclaimerOpen) setDisclaimerOpen(false);
    }

    const handleBatchAdder = (type, name) => {
        if (tabs.length > 0) {
                if ("batch" in pipelines[tabsName[value]]) {
                    if (tabsName[value] in pipelines && !pipelines[tabsName[value]].batch.created) {
                        const checking = /^[a-z_]+$/.test(batchName);
                        const label = type === "data_loader" ? " Loader" : type === "data_exporter" ? " Exporter" : " Transformer";
                        const insideType = type === "data_loader" ? "loader" : type === "data_exporter" ? "exporter" : "transformer";
                        const color = type === "data_loader" ? "#4877ff" : type === "data_exporter" ? "#ffcc19" : "#7d55ec";
                        if (checking && batchName.length < 10) {
                                if (((insideType === "loader" || insideType === "exporter") && pipelines[tabsName[value]]["batch"][insideType] === "") || insideType === "transformer") {
                                    if (!checkIfBlockNameExists(batchName)) {
                                        setBatchOpen(false);
                                        setLoading(true);
                                        setLoadingMessage("Loading Block!");
                                        axios({
                                            method: "GET",
                                            url: BLOCK_MODEL(name),
                                            headers: {
                                                "Authorization": "Bearer " + Cookies.get("token")
                                            }
                                        }).then((response) => {
                                            const newNode = {
                                                id: tabsName[value] + "_" + batchName,
                                                type: 'textUpdater',
                                                position: {x: pipelines[tabsName[value]].batch.blockPosition, y: 0},
                                                data: {
                                                    params: response.data.variables,
                                                    type: insideType,
                                                    name: batchName,
                                                    pipeline_name: tabsName[value],
                                                    label: CAPS(batchName + label),
                                                    language: "python",
                                                    background: color,
                                                    content: response.data.content,
                                                    editable: true,
                                                    created: false
                                                },
                                            };

                                            const prevPos = pipelines[tabsName[value]].batch.blockPosition + 300;

                                            setPipelines((prevPipelines) => ({
                                                ...prevPipelines,
                                                [tabsName[value]]: {
                                                    ...prevPipelines[tabsName[value]],
                                                    batch: {
                                                        ...prevPipelines[tabsName[value]].batch,
                                                        loader: insideType === "loader" ? newNode : prevPipelines[tabsName[value]].batch.loader,
                                                        transformers: insideType === "transformer" ? [...prevPipelines[tabsName[value]].batch.transformers, newNode] : prevPipelines[tabsName[value]].batch.transformers,
                                                        edges: prevPipelines[tabsName[value]].batch.edges,
                                                        created: prevPipelines[tabsName[value]].batch.created,
                                                        exporter: insideType === "exporter" ? newNode : prevPipelines[tabsName[value]].batch.exporter,
                                                        blockPosition: prevPos
                                                    },
                                                },
                                            }));
                                            setLoading(false);
                                            setLoadingMessage("");
                                        }).catch((_) => {
                                            setLoading(false);
                                            setLoadingMessage("");
                                            handleToast("Error loading block model!", "error");
                                        })
                                    } else {
                                        handleToast("There is already a block with that name!", "error");
                                    }
                                } else {
                                    handleToast(`Only one ${insideType.charAt(0).toUpperCase() + insideType.slice(1)} per pipeline`, "warning");
                                }

                        } else {
                            if (!checking) {
                                handleToast("Only lowercase letters and underscores are allowed!", "error");
                            } else {
                                handleToast("Name must be 10 characters maximum!", "error");
                            }
                        }
                    } else {
                        if (pipelines[tabsName[value]].batch.created) {
                            handleToast("Pipeline already created!", "error");
                        } else {
                            handleToast("There is non pipeline with that name!", "error");
                        }
                        setBatchOpen(false);
                    }
                }  else {
                    handleToast("Only stream blocks can be added to a stream pipeline!", "error");
                }
        } else {
            setBatchOpen(false);
            handleToast("There are no currently opened tabs!", "error");
        }
    }

    const checkIfBlockNameExists = (name) => {
        if ("stream" in pipelines[tabsName[value]]) {
            for (let block of pipelines[tabsName[value]].stream.transformers) {
                if (name === block.data.name) {
                    return true;
                }
            }

            if (pipelines[tabsName[value]].stream.loader === "" && pipelines[tabsName[value]].stream.exporter === "") {
                return false;
            } else if (pipelines[tabsName[value]].stream.loader === "" && pipelines[tabsName[value]].stream.exporter !== "") {
                return name === pipelines[tabsName[value]].stream.exporter.data.name;
            } else if (pipelines[tabsName[value]].stream.loader !== "" && pipelines[tabsName[value]].stream.exporter === "") {
                return name === pipelines[tabsName[value]].stream.loader.data.name;
            }
        } else {
            for (let block of pipelines[tabsName[value]].batch.transformers) {
                if (name === block.data.name) {
                    return true;
                }
            }

            if (pipelines[tabsName[value]].batch.loader === "" && pipelines[tabsName[value]].batch.exporter === "") {
                return false;
            } else if (pipelines[tabsName[value]].batch.loader === "" && pipelines[tabsName[value]].batch.exporter !== "") {
                return name === pipelines[tabsName[value]].batch.exporter.data.name;
            } else if (pipelines[tabsName[value]].batch.loader !== "" && pipelines[tabsName[value]].batch.exporter === "") {
                return name === pipelines[tabsName[value]].batch.loader.data.name;
            }
        }
    }

    React.useEffect(() => {
        if (isDrawerRun.current) return;

        isDrawerRun.current = true;

        axios({
            method: "GET",
            url: GET_TEMPLATES("batch")
        }).then((response) => {
            const batchTemp = {
                "loaders": [],
                "transformers": [],
                "exporters": []
            };

            for (let i of response.data) {
                switch (i.type) {
                    case "data_loader":
                        batchTemp.loaders.push(i);
                        break;
                    case "transformer":
                        batchTemp.transformers.push(i);
                        break;
                    case "data_exporter":
                        batchTemp.exporters.push(i);
                        break;
                    default:
                        break;
                }
            }

            setBatchTemplates(batchTemp);
        }).catch((_) => {
            handleToast("Could not get batch templates!", "error");
        })
    })

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        setDisclaimerOpen(true);
        setLoadingMessage("Loading Pipelines");
        let changed = localStorage.getItem(`changed-pipelines-${Cookies.get("userID").split("-").join("_")}`);
        if ([undefined, null, "", false].includes(changed)) {
            changed = false
        } else {
            changed = JSON.parse(changed);
        }
        axios({
            method: "GET",
            url: PIPELINES(Cookies.get("userID").split("-").join("_"), changed)
        }).then((response) => {
            const names = [];
            for (let i of response.data) {
                const name = i.name.replace("_" + Cookies.get("userID").split("-").join("_"), "");
                const type = i.type === "streaming" ? "stream" : "batch";
                const nodesInStorage = localStorage.getItem(`pipeline-${Cookies.get("userID").split("-").join("_")}-${name}`);
                if (i.blocks.length > 0) {
                    const loaders = [];
                    const transformers = [];
                    const exporters = [];
                    const orderedBlocks = [];
                    const positions = [];
                    let firstNode;

                    const setPosition = (nodes, currentNode, x, y) => {
                        orderedBlocks.push(currentNode);
                        if (currentNode.upstream_blocks.length === 0) {
                            positions[currentNode.name] = [0, 0];
                        } else {
                            positions[currentNode.name] = [x, y];
                        }

                        currentNode.downstream_blocks.forEach((downStreamNode, index) => {
                            if (index % 2 === 0) {
                                if (index > 1) {
                                    setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y + (index - 1) * 300);
                                } else {
                                    setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y + index * 300);
                                }
                            } else {
                                if (index > 1) {
                                    setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y - (index - 1) * 300);
                                } else {
                                    setPosition(nodes, nodes.find(node => node.name === downStreamNode), x + 300, y - index * 300);
                                }
                            }
                        })
                    }

                    for (let block of i.blocks) {
                        if (block.upstream_blocks.length === 0) {
                            firstNode = block;
                            break;
                        }
                    }

                    setPosition(i.blocks, firstNode, 0, 0);

                    const nodesNames = [];

                    for (let block of orderedBlocks) {
                        nodesNames.push(block.name);
                        if (block.type === "data_loader") {
                            loaders.push({
                                id: block.name,
                                type: 'textUpdater',
                                position: { x: positions[block.name][0], y: positions[block.name][1] },
                                data: {
                                    params: {},
                                    type: "loader",
                                    name: block.name,
                                    pipeline_name: name,
                                    label: CAPS(block.name + " Loader"),
                                    language: block.language,
                                    background: "#4877ff",
                                    content: block.content,
                                    editable: false,
                                    created: true
                                },
                            })
                        } else if (block.type === "transformer") {
                            transformers.push({
                                id: block.name,
                                type: 'textUpdater',
                                position: { x: positions[block.name][0], y: positions[block.name][1] },
                                data: {
                                    params: {},
                                    type: "transformer",
                                    name: block.name,
                                    pipeline_name: name,
                                    label: CAPS(block.name + " Transformer"),
                                    language: block.language,
                                    background: "#7d55ec",
                                    content: block.content,
                                    editable: false,
                                    created: true
                                },
                            })
                        } else {
                            exporters.push({
                                id: block.name,
                                type: 'textUpdater',
                                position: { x: positions[block.name][0], y: positions[block.name][1] },
                                draggable: false,
                                data: {
                                    params: {},
                                    type: "exporter",
                                    name: block.name,
                                    pipeline_name: name,
                                    label: CAPS(block.name + " Exporter"),
                                    language: block.language,
                                    background: "#ffcc19",
                                    content: block.content,
                                    editable: false,
                                    created: true
                                },
                            })
                        }
                    }

                    const edges = [];

                    const Edges = (nodes, currentNode) => {
                        currentNode.downstream_blocks.forEach((downStreamBlock, index) => {
                            edges.push({
                                id: `${currentNode.name}-${downStreamBlock}`,
                                source: currentNode.name,
                                target: downStreamBlock,
                                style: { stroke: 'black' },
                                deletable: false,
                                focusable: false,
                                updatable: false,
                                selected: false,
                            })

                            Edges(nodes, nodes.find(node => node.name === downStreamBlock))
                        })
                    }

                    Edges(i.blocks, firstNode);

                    setPipelines((prevState) => ({
                        ...prevState,
                        [name]: {
                            [type] : {
                                loader: loaders.length > 0 ? loaders[0] : "",
                                transformers: transformers,
                                exporter: exporters.length > 0 ? exporters[0] : "",
                                edges: edges,
                                created: true,
                                blockPosition: positions[orderedBlocks[orderedBlocks.length - 1].name][0]
                            },
                        }
                    }))
                    setPipelinesBlocksNames(prevState => [...prevState, nodesNames]);
                } else {
                    setPipelinesBlocksNames(prevState => [...prevState, []]);
                    if (!nodesInStorage) {
                        setPipelines((prevState) => ({
                            ...prevState,
                            [name]: {
                                [type] : {
                                    loader: "",
                                    transformers: [],
                                    exporter: "",
                                    edges: [],
                                    created: false,
                                    blockPosition: 0
                                },
                            }
                        }))
                    } else {
                        setPipelines((prevState) => ({
                            ...prevState,
                            [name]: {
                                ...JSON.parse(nodesInStorage)
                            }
                        }))


                    }
                }
                console.log(name);
                names.push(name);
                setTabsName(prevState => [...prevState, name]);
                setTabs(prevComponents => [...prevComponents, <Tab key={tabs.length} label={name} icon={<ClearIcon onClick={() => handleTabClose(name, names)} />} iconPosition="end" {...a11yProps(tabs.length)}/>]);
            }
            localStorage.setItem(`changed-pipelines-${Cookies.get("userID").split("-").join("_")}`, JSON.stringify(false));
            setLoading(false);
            setLoadingMessage("");
        }).catch((_) => {
            localStorage.setItem(`changed-pipelines-${Cookies.get("userID").split("-").join("_")}`, JSON.stringify(false));
            handleToast("Error getting the pipelines!", "error");
            setLoading(false);
            setLoadingMessage("");
        })
    }, [handleTabClose, tabs, tabsName, pipelines])

    React.useEffect(() => {
        const creation = pipelines[tabsName[value]] ? "stream" in pipelines[tabsName[value]] ? pipelines[tabsName[value]].stream.created : pipelines[tabsName[value]].batch.created : null;
        if (
            Object.keys(pipelines).length > 0 &&
            (creation !== null) &&
            tabs.length > 0
        ) {
            if (!creation) {
                const edges = localStorage.getItem(`${Cookies.get("userID").split("-").join("_")}-${tabsName[value]}-edges`)
                let aux_pipeline = pipelines[tabsName[value]];
                let pipeline_type = "stream" in pipelines[tabsName[value]] ? "stream" : "batch";
                if (edges) {
                    aux_pipeline[pipeline_type]["edges"] = JSON.parse(edges);
                }
                localStorage.setItem(`pipeline-${Cookies.get("userID").split("-").join("_")}-${tabsName[value]}`, JSON.stringify(aux_pipeline));
            }
        }
    }, [tabs.length, value, tabsName, pipelines]);

    React.useEffect(() => {
        if (Object.keys(pipelines).length > 0 && pipelines[tabsName[value]]) {

        const creation = pipelines[tabsName] !== undefined ? "stream" in pipelines[tabsName[value]] ? pipelines[tabsName[value]].stream.created : pipelines[tabsName[value]].batch.created : null;
       if (creation && pipelinesBlocksNames.length === 0) {
           const name = tabsName[value] + "_" + Cookies.get("userID").split("-").join("_");

           axios({
               method: "GET",
               url: READ_PIPELINE(name)
           }).then((response) => {
               const nodesName = [];
               const setOrderedNames = (nodes, currentNode) => {
                   nodesName.push(currentNode.name);

                   currentNode.downstream_blocks.forEach((downStreamNode) => {
                       setOrderedNames(nodes, nodes.find(node => node.name === downStreamNode));
                   })
               }

               let firstBlock;

               for (let block of response.data.blocks) {
                   if (block.upstream_blocks.length === 0) {
                       firstBlock = block;
                       break;
                   }
               }
               setOrderedNames(response.data.blocks, firstBlock);

               setPipelinesBlocksNames(nodesName);
           }).catch((_) => {

           })
       }
        }
    }, [pipelines, pipelinesBlocksNames, tabsName, value]);

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: tabs.length > 0 ? "center" : "", justifyContent: tabs.length > 0 ? "space-between" : "", backgroundColor: "white", width: "100%", height: "100%", marginTop: 82 }}>
            <Snackbar
                open={toastOpen}
                autoHideDuration={5000}
                anchorOrigin={{ vertical, horizontal }}
                onClose={handleToastClose}
            >
                <Alert severity={toastSeverity} onClose={() => {}}> {toastMessage} </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: 'black', zIndex: (theme) => theme.zIndex.drawer + 1, display: "flex", flexDirection: "column" }}
                open={loading}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h4" sx={{ color: "white" }}>{loadingMessage}</Typography>
            </Backdrop>
            <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} keepMounted>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: tabs.length > 0 ? "space-evenly" : "", padding: 5 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    PIPELINE DETAILS
                </DialogTitle>
                    <FormControl>
                        <TextField required variant="outlined" onChange={(event) => setTabName(event.target.value)} label="Pipeline Name"/>
                        <Button variant="filled" sx={{ marginTop: 2, backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleTabAdd}>
                            Add Tab
                        </Button>
                    </FormControl>
                </Box>
            </Dialog>
            <Dialog open={batchOpen} onClose={handleClose} TransitionComponent={Transition} keepMounted>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 400, width: 400 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setBatchName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => {handleBatchAdder(batchBlockType, batchBlockName)}}>
                        Add Block
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={disclaimerOpen} onClose={handleClose} TransitionComponent={Transition} keepMounted>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: tabs.length > 0 ? "space-evenly" : "", padding: 5 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        DISCLAIMERS
                    </DialogTitle>
                    <DialogContent sx={{ fontSize: "1.25rem" }}>
                        You can upload a CSV of maximum 1 GB.
                    </DialogContent>
                    <DialogActions>
                        <Button variant="filled" sx={{ marginTop: 2, backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => setDisclaimerOpen(false)}>
                            close
                        </Button>
                    </DialogActions>
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
                    <Accordion expanded={expanded}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon onClick={handleMainChange} />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                {"Blocks".toUpperCase()}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Accordion sx={{ backgroundColor: "#36454F", color: "white" }} expanded={outsideExpanded.toString() === `loader_panel`} onChange={handleLoaderChange(`loader_panel`)} >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                        onClick={handleLoaderChange}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"loaders".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.loaders && (
                                            batchTemplates.loaders.map((value, index) => {
                                                return (
                                                    <List key={index}>
                                                        <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchLoaderExpanded.toString() === `batch_panel${index}`} onChange={handleBatchLoaderChange(`batch_panel${index}`)}>
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                            >
                                                                <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                    {value.name.split("_").join(" ").toUpperCase()}
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                                <ListItemText primary={value.description} />
                                                                <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                    Add
                                                                </Button>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </List>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "#36454F", color: "white" }} expanded={outsideExpanded.toString() === "transformer_panel"} onChange={handleTransformersChange("transformer_panel")} >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                        onClick={handleTransformersChange}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"transformers".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.transformers && (
                                            batchTemplates.transformers.map((value, index) => {
                                                return (
                                                    <List key={index}>
                                                        <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchTransformerExpanded.toString() === `batch_panel${index}`} onChange={handleBatchTransformerChange(`batch_panel${index}`)}>
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                            >
                                                                <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                    {value.name.split("_").join(" ").toUpperCase()}
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                                <ListItemText primary={value.description} />
                                                                <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                    Add
                                                                </Button>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </List>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion sx={{ backgroundColor: "#36454F", color: "white" }} expanded={outsideExpanded.toString() === "exporter_panel"} onChange={handleExporterChange("exporter_panel")}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                        onClick={handleExporterChange}
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"exporters".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.exporters && (
                                            batchTemplates.exporters.map((value, index) => {
                                                return (
                                                    <List key={index}>
                                                        <Accordion sx={{ backgroundColor: "black", color: "white" }} expanded={batchExporterExpanded.toString() === `batch_panel${index}`} onChange={handleBatchExporterChange(`batch_panel${index}`)}>
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                            >
                                                                <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                    {value.name.split("_").join(" ").toUpperCase()}
                                                                </Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                                <ListItemText primary={value.description} />
                                                                <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                    Add
                                                                </Button>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </List>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
            <Box>
                <Box sx={{ width: "100vw", borderBottom: 2, borderColor: 'black', display: 'flex', flexDirection: 'row' }}>
                    <Tabs value={value} onChange={handleChange}>
                        {tabs.map((entry, index) => (
                            React.cloneElement(entry, { key: index })
                        ))}
                    </Tabs>
                    <Button variant="filled" sx={{ backgroundColor: "white", color: "black" }} onClick={() => setOpen(true)}>
                        <AddBoxIcon />
                    </Button>
                </Box>
                {tabs ? (tabs.map((val, index) => {
                        return (
                            <ReactFlowPanel
                                key={`${val}-${index}`}
                                index={index}
                                value={value}
                                {...{
                                    componentNodes: pipelines[tabsName[value]] !== undefined ? (Object.keys(pipelines[tabsName[value]]).length > 0 && "batch" in pipelines[tabsName[value]])
                                        ? pipelines[tabsName[value]]["batch"] : [] : [],
                                    componentEdges: pipelines[tabsName[value]] !== undefined ? (Object.keys(pipelines[tabsName[value]]).length > 0 && "batch" in pipelines[tabsName[value]])
                                        ? pipelines[tabsName[value]]["batch"]["edges"] : [] : [],
                                    drawerWidth: drawerWidth,
                                    created: pipelines[tabsName[value]] !== undefined ? pipelines[tabsName[value]].batch.created : null,
                                    setPipes: setPipelines,
                                    pipeline_name: value !== undefined ? tabsName[value] !== undefined ? tabsName[value] : "" : "",
                                    type: value !== undefined ? tabsName[value] !== undefined ? Object.keys(pipelines[tabsName[value]])[0] : "" : "",
                                    orderBlockNames: value !== undefined ? pipelinesBlocksNames[value] !== undefined ? pipelinesBlocksNames[value] : "" : ""
                                }}
                            />
                        )
                    }

                )) : undefined}
            </Box>
        </div>
    );
}

export default Orchestrator;