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
    Dialog,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
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
    BLOCK_MODEL, BLOCK_MODEL_TRANSFORMERS,
    CREATE_PIPELINE,
    DELETE_PIPELINE, GET_TEMPLATES,
    PIPELINES,
    READ_PIPELINE
} from "../components/utils/apiEndpoints";
import {CAPS} from "../components/utils/utliFunctions";
import Cookies from "js-cookie";

const drawerWidth = 240;
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Orchestrator = () => {
    const [expanded, setExpanded] = React.useState(false);
    const [batchExpanded, setBatchExpanded] = React.useState(false);
    const [batchLoaderExpanded, setBatchLoaderExpanded] = React.useState(false);
    const [batchTransformerExpanded, setBatchTransformerExpanded] = React.useState(false);
    const [batchExporterExpanded, setBatchExporterExpanded] = React.useState(false);
    const [streamExpanded, setStreamExpanded] = React.useState(false);
    const [streamLoaderExpanded, setStreamLoaderExpanded] = React.useState(false);
    const [streamTransformerExpanded, setStreamTransformerExpanded] = React.useState(false);
    const [streamExporterExpanded, setStreamExporterExpanded] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [tabs, setTabs] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [tabName, setTabName] = React.useState("");
    const [streamingName, setStreamingName] = React.useState("");
    const [batchName, setBatchName] = React.useState("");
    const [counter, setCounter] = React.useState(0);
    const [pipelines, setPipelines] = React.useState({});
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [toastOpen, setToastOpen] = React.useState(false);
    const [tabsName, setTabsName] = React.useState([]);
    const [pipelineType, setPipelineType] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [streamingOpen, setStreamingOpen] = React.useState(false);
    const [batchOpen, setBatchOpen] = React.useState(false);
    const [pipelinesBlocksNames, setPipelinesBlocksNames] = React.useState([]);
    const [batchTemplates, setBatchTemplates] = React.useState([]);
    const [streamTemplates, setStreamTemplates] = React.useState([]);
    const [batchBlockName, setBatchBlockName] = React.useState("");
    const [batchBlockType, setBatchBlockType] = React.useState("");
    const [streamBlockName, setStreamBlockName] = React.useState("");
    const [streamBlockType, setStreamBlockType] = React.useState("");
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);
    const isDrawerRun = React.useRef(false);

    const handleToast = (message, severity)  => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    }

    const handleBackdropClose = () => {
        setLoading(false);
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
        if (checking && tabName.length <= 10) {
            if (pipelineType === "stream") {
                const name = `${tabName}_${Cookies.get("userID").split("-").join("_")}`
                const type = "streaming"
                axios({
                    method: "POST",
                    url: CREATE_PIPELINE(name, type)
                }).then((_) => {
                    setPipelines((prevState) => {
                        return {
                            ...prevState,
                            [tabName]: {
                                ...prevState[tabName],
                                stream: {
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

                    setPipelinesBlocksNames(prevState => [...prevState, []]);
                    setTabsName(prevState => [...prevState, tabName]);
                    setTabs(prevComponents => [...prevComponents, <Tab key={counter} label={tabName} icon={<ClearIcon onClick={() => handleTabClose(counter, tabName)} />} iconPosition="end" {...a11yProps(counter)}/>]);
                    setCounter(counter + 1);
                    setOpen(false);
                }).catch((error) => {
                    handleToast("Error creating pipeline!", "error")
                    setOpen(false);
                })
            } else {
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

                    setPipelinesBlocksNames(prevState => [...prevState, []]);
                    setTabsName(prevState => [...prevState, tabName]);
                    setTabs(prevComponents => [...prevComponents, <Tab key={counter} label={tabName} icon={<ClearIcon onClick={() => handleTabClose(counter, tabName)} />} iconPosition="end" {...a11yProps(counter)}/>]);
                    setCounter(counter + 1);
                    setOpen(false);
                }).catch((error) => {
                    handleToast("Error creating pipeline!", "error")
                    setOpen(false);
                })
            }
        } else {
            if (!checking) {
                handleToast("Only lowercase letters and underscores are allowed!", "error");
            } else {
                handleToast("Name must be 10 characters maximum!", "error");
            }
        }
    }
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleTabClose = (index, tabName) => {
        const name = tabName + "_" + Cookies.get("userID").split("-").join("_");
        axios({
            method: "DELETE",
            url: DELETE_PIPELINE(name)
        }).then((_) => {
            setCounter(counter - 1);
            setTabs(prevComponents => {
                const updatedComponents = [...prevComponents];
                updatedComponents.splice(index, 1);
                return updatedComponents;
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
            const allKeys = Object.keys(localStorage);

            allKeys.forEach(key => {
                if(key.includes(tabName)) {
                    localStorage.removeItem(key);
                }
            });
        }).catch((_) => {
            handleToast("Error deleting pipeline!", "error");
        })
    }
    const handleMainChange = (panel) => (event, isExpanded) => {
            setExpanded(isExpanded ? panel : false);
    };

    const handleBatchChange = (panel) => (event, isExpanded) => {
        setBatchExpanded(isExpanded ? panel : false);
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

    const handleStreamChange = (panel) => (event, isExpanded) => {
        setStreamExpanded(isExpanded ? panel : false);
    }

    const handleStreamLoaderChange = (panel) => (event, isExpanded) => {
        setStreamLoaderExpanded(isExpanded ? panel : false);
    }

    const handleStreamTransformerChange = (panel) => (event, isExpanded) => {
        setStreamTransformerExpanded(isExpanded ? panel : false);
    }

    const handleStreamExporterChange = (panel) => (event, isExpanded) => {
        setStreamExporterExpanded(isExpanded ? panel : false);
    }

    const handleClose = () => {
        if (open) setOpen(false);
        if (streamingOpen) setStreamingOpen(false);
        if (batchOpen) setBatchOpen(false);
    }

    const handleStreamAdder = (type, name) => {
        if (tabs.length > 0) {
                if ("stream" in pipelines[tabsName[value]]) {
                    if (tabsName[value] in pipelines && !pipelines[tabsName[value]].stream.created) {
                        const checking = /^[a-z_]+$/.test(streamingName);
                        const label = type === "data_loader" ? " Loader" : type === "data_exporter" ? " Exporter" : " Transformer";
                        const insideType = type === "data_loader" ? "loader" : type === "data_exporter" ? "exporter" : "transformer";
                        const color = type === "data_loader" ? "#4877ff" : type === "data_exporter" ? "#ffcc19" : "#7d55ec";
                        const language = ["data_loader", "data_exporter"].includes(type) ? "yaml" : "python"
                        if (checking && streamingName.length < 10) {
                            if (pipelines[tabsName[value]]["stream"]["exporter"] === "") {
                                if (!checkIfBlockNameExists(streamingName)) {
                                    axios({
                                        method: "GET",
                                        url: BLOCK_MODEL(name)
                                    }).then((response) => {
                                        const newNode = {
                                            id: streamingName,
                                            type: 'textUpdater',
                                            position: {x: pipelines[tabsName[value]].stream.blockPosition, y: 0},
                                            data: {
                                                params: {},
                                                type: insideType,
                                                name: streamingName,
                                                pipeline_name: tabsName[value],
                                                label: CAPS(streamingName + label),
                                                language: language,
                                                background: color,
                                                content: response.data.content,
                                                editable: true,
                                                created: false
                                            },
                                        };

                                        const prevPos = pipelines[tabsName[value]].stream.blockPosition + 300;

                                        setPipelines((prevPipelines) => ({
                                            ...prevPipelines,
                                            [tabsName[value]]: {
                                                ...prevPipelines[tabsName[value]],
                                                stream: {
                                                    ...prevPipelines[tabsName[value]].stream,
                                                    loader: insideType === "loader" ? newNode : prevPipelines[tabsName[value]].stream.loader,
                                                    transformers: insideType === "transformer" ? [...prevPipelines[tabsName[value]].stream.transformers, newNode] : prevPipelines[tabsName[value]].stream.transformers,
                                                    edges: prevPipelines[tabsName[value]].stream.edges,
                                                    created: prevPipelines[tabsName[value]].stream.created,
                                                    exporter: insideType === "exporter" ? newNode : prevPipelines[tabsName[value]].stream.exporter,
                                                    blockPosition: prevPos
                                                },
                                            },
                                        }));
                                        setStreamingOpen(false);
                                    }).catch((_) => {
                                        setStreamingOpen(false);
                                        handleToast("Error loading block model!", "error");
                                    })
                                } else {
                                    handleToast("There is already a block with that name!", "error");
                                }
                            } else {
                                handleToast("Only one exporter", "warning"); // de modificat
                            }

                        } else {
                            if (!checking) {
                                handleToast("Only lowercase letters and underscores are allowed!", "error");
                            } else {
                                handleToast("Name must be 10 characters maximum!", "error");
                            }
                        }
                    } else {
                        if (pipelines[tabsName[value]].stream.created) {
                            handleToast("Pipeline already created!", "error");
                        } else {
                            handleToast("There is non pipeline with that name!", "error");
                        }
                        setStreamingOpen(false);
                    }
                } else {
                    handleToast("Only batch blocks can be added to a batch pipeline!", "error");
                }
        } else {
            setStreamingOpen(false);
            handleToast("There are no currently opened tabs!", "error");
        }
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
                                        axios({
                                            method: "GET",
                                            url: BLOCK_MODEL(name)
                                        }).then((response) => {
                                            const newNode = {
                                                id: batchName,
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
                                            setBatchOpen(false);
                                        }).catch((_) => {
                                            setBatchOpen(false);
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

        axios({
            method: "GET",
            url: GET_TEMPLATES("stream")
        }).then((response) => {
            const streamTemp = {
                "loaders": [],
                "transformers": [],
                "exporters": []
            };

            for (let i of response.data) {
                switch (i.type) {
                    case "data_loader":
                        streamTemp.loaders.push(i);
                        break;
                    case "transformer":
                        streamTemp.transformers.push(i);
                        break;
                    case "data_exporter":
                        streamTemp.exporters.push(i);
                        break;
                    default:
                        break;
                }
            }

            setStreamTemplates(streamTemp);
        }).catch((_) => {
            handleToast("Could not get stream templates!", "error");
        })
    })

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        setLoading(true);
        axios({
            method: "GET",
            url: PIPELINES(Cookies.get("userID").split("-").join("_"))
        }).then((response) => {
            for (let i of response.data) {
                const name = i.name.replace("_" + Cookies.get("userID").split("-").join("_"), "");
                const type = i.type === "streaming" ? "stream" : "batch";
                const nodesInStorage = localStorage.getItem(`pipeline-${name}`);
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

                setTabsName(prevState => [...prevState, name]);
                setTabs(prevComponents => [...prevComponents, <Tab key={counter} label={name} icon={<ClearIcon onClick={() => handleTabClose(counter, name)} />} iconPosition="end" {...a11yProps(counter)}/>]);
                setCounter(counter + 1);
            }
            setLoading(false);
        }).catch((error) => {
            handleToast("Error getting pipelines!", "error");
            setLoading(false);
        })
    }, [tabs, tabsName, counter, pipelines])

    React.useEffect(() => {
        const creation = pipelines[tabsName[value]] ? "stream" in pipelines[tabsName[value]] ? pipelines[tabsName[value]].stream.created : pipelines[tabsName[value]].batch.created : null;
        if (
            Object.keys(pipelines).length > 0 &&
            (creation !== null) &&
            tabs.length > 0
        ) {
            if (!creation) {
                localStorage.setItem(`pipeline-${tabsName[value]}`, JSON.stringify(pipelines[tabsName[value]]));
            }
        }
    }, [value, tabsName, pipelines]);

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
    }, [pipelinesBlocksNames, tabsName, value]);

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
            <Backdrop
                sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleBackdropClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Dialog open={open} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    PIPELINE DETAILS
                </DialogTitle>
                    <FormControl>
                        <FormLabel id="demo-controlled-radio-buttons-group" sx={{ fontWeight: "bold" }}>PIPELINE TYPE</FormLabel>
                        <RadioGroup
                            row
                            required
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={pipelineType}
                            onChange={(event) => setPipelineType(event.target.value)}
                        >
                            <FormControlLabel value="stream" control={<Radio />} label="Streaming" />
                            <FormControlLabel value="batch" control={<Radio />} label="Batch" />
                        </RadioGroup>
                        <TextField required variant="outlined" onChange={(event) => setTabName(event.target.value)} label="Pipeline Name"/>
                        <Button variant="filled" sx={{ marginTop: 2, backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleTabAdd}>
                            Add Tab
                        </Button>
                    </FormControl>
                </Box>
            </Dialog>
            <Dialog open={streamingOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setStreamingName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => handleStreamAdder(streamBlockType, streamBlockName)}>
                        Add Block
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={batchOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setBatchName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => {handleBatchAdder(batchBlockType, batchBlockName)}}>
                        Add Block
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
                    <Accordion expanded={expanded.toString() === 'panel1'} onChange={handleMainChange('panel1')}>
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
                                <Accordion expanded={batchExpanded.toString() === 'loaders'} onChange={handleBatchChange('loaders')}><AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                        {"loaders".toUpperCase()}
                                    </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.loaders && (
                                            batchTemplates.loaders.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={batchLoaderExpanded.toString() === `batch_panel${index}`} onChange={handleBatchLoaderChange(`batch_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={batchExpanded.toString() === 'transformers'} onChange={handleBatchChange('transformers')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"transformers".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.transformers && (
                                            batchTemplates.transformers.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={batchTransformerExpanded.toString() === `batch_panel${index}`} onChange={handleBatchTransformerChange(`batch_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={batchExpanded.toString() === 'exporters'} onChange={handleBatchChange('exporters')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"exporters".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {batchTemplates.exporters && (
                                            batchTemplates.exporters.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={batchExporterExpanded.toString() === `batch_panel${index}`} onChange={handleBatchExporterChange(`batch_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setBatchOpen(true); setBatchBlockName(value.name); setBatchBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded.toString() === 'panel2'} onChange={handleMainChange('panel2')}>
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
                                <Accordion expanded={streamExpanded.toString() === 'loaders'} onChange={handleStreamChange('loaders')}><AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                        {"loaders".toUpperCase()}
                                    </Typography>
                                </AccordionSummary>
                                    <AccordionDetails>
                                        {streamTemplates.loaders && (
                                            streamTemplates.loaders.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={streamLoaderExpanded.toString() === `stream_panel${index}`} onChange={handleStreamLoaderChange(`stream_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setStreamingOpen(true); setStreamBlockName(value.name); setStreamBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={streamExpanded.toString() === 'transformers'} onChange={handleStreamChange('transformers')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"transformers".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {streamTemplates.transformers && (
                                            streamTemplates.transformers.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={streamTransformerExpanded.toString() === `stream_panel${index}`} onChange={handleStreamTransformerChange(`stream_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setStreamingOpen(true); setStreamBlockName(value.name); setStreamBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion expanded={streamExpanded.toString() === 'exporters'} onChange={handleStreamChange('exporters')}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                            {"exporters".toUpperCase()}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {streamTemplates.exporters && (
                                            streamTemplates.exporters.map((value, index) => {
                                                return (
                                                    <Accordion key={index} sx={{ backgroundColor: "black", color: "white" }} expanded={streamExporterExpanded.toString() === `stream_panel${index}`} onChange={handleStreamExporterChange(`stream_panel${index}`)}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon sx={{ color: "white"}} />}
                                                        >
                                                            <Typography sx={{ width: '100%', flexShrink: 0, fontWeight: "bold" }}>
                                                                {value.name.split("_").join(" ").toUpperCase()}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                                            <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { backgroundColor: "#36454F", color: "white" } }} onClick={() => {setStreamingOpen(true); setStreamBlockName(value.name); setStreamBlockType(value.type)}}>
                                                                Add
                                                            </Button>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )})
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
            <Box sx={{ marginLeft: 30 }}>
                <Box sx={{ borderBottom: 2, borderColor: 'black', marginTop: -82.2 }}>
                    <Tabs value={value} onChange={handleChange}>
                        {tabs.map((entry, index) => (
                            React.cloneElement(entry, { key: index })
                        ))}
                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black" }} onClick={() => setOpen(true)}>
                            <AddBoxIcon />
                        </Button>
                    </Tabs>
                </Box>
                {tabs && (tabs.map((_, index) => {
                        return (
                            <ReactFlowPanel
                                key={index}
                                index={index}
                                value={value}
                                {...{
                                    componentNodes: pipelines[tabsName[value]] !== undefined ? (Object.keys(pipelines[tabsName[value]]).length > 0 && "stream" in pipelines[tabsName[value]])
                                        ? pipelines[tabsName[value]]["stream"]
                                        : pipelines[tabsName[value]] && pipelines[tabsName[value]]["batch"] : [],
                                    componentEdges: pipelines[tabsName[value]] !== undefined ? (Object.keys(pipelines[tabsName[value]]).length > 0 && "stream" in pipelines[tabsName[value]])
                                        ? pipelines[tabsName[value]]["stream"]["edges"]
                                        : pipelines[tabsName[value]]["batch"]["edges"] : [],
                                    drawerWidth: drawerWidth,
                                    created: pipelines[tabsName[value]] !== undefined ? "stream" in pipelines[tabsName[value]] ? pipelines[tabsName[value]].stream.created : pipelines[tabsName[value]].batch.created : null,
                                    setPipes: setPipelines,
                                    pipeline_name: value !== undefined ? tabsName[value] !== undefined ? tabsName[value] : "" : "",
                                    type: value !== undefined ? tabsName[value] !== undefined ? Object.keys(pipelines[tabsName[value]])[0] : "" : "",
                                    orderBlockNames: value !== undefined ? pipelinesBlocksNames[value] !== undefined ? pipelinesBlocksNames[value] : "" : ""
                                }}
                            />
                        )
                    }

                ))}
            </Box>
        </div>
    );
}

export default Orchestrator;