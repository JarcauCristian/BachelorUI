import * as React from 'react';
import Editor from "@monaco-editor/react"
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Alert, Backdrop, CircularProgress,
    Dialog,
    DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup,
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
    CREATE_PIPELINE,
    DELETE_PIPELINE, MODIFY_DESCRIPTION,
    PIPELINE_DESCRIPTION,
    PIPELINES, READ_PIPELINE
} from "../components/utils/apiEndpoints";
import {nodeTypes} from "../components/utils/nodeTypes";
import {useEffect} from "react";
import {CAPS} from "../components/utils/utliFunctions";
import Cookies from "js-cookie";
import {json} from "react-router-dom";

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
    const [streamingLoaderName, setStreamingLoaderName] = React.useState("");
    const [streamingTransformerName, setStreamingTransformerName] = React.useState("");
    const [streamingExporterName, setStreamingExporterName] = React.useState("");
    const [batchLoaderName, setBatchLoaderName] = React.useState("");
    const [batchTransformerName, setBatchTransformerName] = React.useState("");
    const [batchExporterName, setBatchExporterName] = React.useState("");
    const [counter, setCounter] = React.useState(0);
    const [pipelines, setPipelines] = React.useState({});
    const [toastMessage, setToastMessage] = React.useState("");
    const [toastSeverity, setToastSeverity] = React.useState("error");
    const [toastOpen, setToastOpen] = React.useState(false);
    const [tabsName, setTabsName] = React.useState([]);
    const [pipelineType, setPipelineType] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [streamingLoaderOpen, setStreamingLoaderOpen] = React.useState(false);
    const [streamingTransformerOpen, setStreamingTransformerOpen] = React.useState(false);
    const [streamingExporterOpen, setStreamingExporterOpen] = React.useState(false);
    const [batchLoaderOpen, setBatchLoaderOpen] = React.useState(false);
    const [batchTransformerOpen, setBatchTransformerOpen] = React.useState(false);
    const [batchExporterOpen, setBatchExporterOpen] = React.useState(false);
    const [blocksPosition, setBlocksPosition] = React.useState([]);
    const [pipelineCreated, setPipelineCreated] = React.useState([]);
    const [pipelinesBlocksNames, setPipelinesBlocksNames] = React.useState([]);
    const {vertical, horizontal} = {vertical: "top", horizontal: "right"};
    const isRun = React.useRef(false);

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
        if (checking) {
            if (pipelineType === "stream") {
                const name = `${tabName}_${Cookies.get("userID").split("-").join("_")}`
                const type = "streaming"
                axios({
                    method: "POST",
                    url: CREATE_PIPELINE(name, type)
                }).then((response) => {
                    setPipelines((prevState) => ({
                        ...prevState,
                        [tabName]: {
                            stream: {
                                loader: "",
                                transformers: [],
                                exporter: "",
                                edges: []
                            }
                        }
                    }))

                    setPipelineCreated(prevState => [...prevState, false]);
                    setPipelinesBlocksNames(prevState => [...prevState, []]);
                    setBlocksPosition(prevState => [...prevState, 0]);
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
                }).then((response) => {
                    setPipelines((prevState) => ({
                        ...prevState,
                        [tabName]: {
                            batch: {
                                loader: "",
                                transformers: [],
                                exporter: "",
                                edges: []
                            }
                        }
                    }))

                    setPipelineCreated(prevState => [...prevState, false]);
                    setBlocksPosition(prevState => [...prevState, 0]);
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
            handleToast("Only lowercase letters and underscores are allowed!", "error");
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
            if (!pipelineCreated[index]) {
                setBlocksPosition(prevState => {
                    const updatedComponents = [...prevState];
                    updatedComponents.splice(index, 1);
                    return updatedComponents;
                })
            }
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
            setPipelineCreated(prevState => {
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

    const handleStreamChange = (panel) => (event, isExpanded) => {
        setStreamExpanded(isExpanded ? panel : false);
    }

    const handleClose = () => {
        if (open) setOpen(false);
        if (streamingLoaderOpen) setStreamingLoaderOpen(false);
        if (streamingTransformerOpen) setStreamingTransformerOpen(false);
        if (streamingExporterOpen) setStreamingExporterOpen(false);
        if (batchLoaderOpen) setBatchLoaderOpen(false);
        if (batchTransformerOpen) setBatchTransformerOpen(false);
        if (batchExporterOpen) setBatchExporterOpen(false);
    }

    const handleStreamingLoader = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("stream", "loader")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(streamingLoaderName);
                    if (checking) {
                        if ("stream" in pipelines[tabsName[value]]) {
                            if (pipelines[tabsName[value]]["stream"]["loader"] === "") {
                                if (!checkIfBlockNameExists(streamingLoaderName)) {
                                    const newNode = {
                                        id: streamingLoaderName,
                                        type: 'textUpdater',
                                        position: {x: blocksPosition[value] + 300, y: 0},
                                        data: {
                                            params: {},
                                            type: "loader",
                                            name: streamingLoaderName,
                                            pipeline_name: tabsName[value],
                                            label: CAPS(streamingLoaderName),
                                            language: "yaml",
                                            background: "#4877ff",
                                            content: response.data,
                                            editable: true,
                                            created: false
                                        },
                                    };

                                    setBlocksPosition((prevState) => {
                                        return prevState.map((item, index) => {
                                            if (index === value) {
                                                return item + 300;
                                            }
                                            return item;
                                        });
                                    });

                                    setPipelines((prevPipelines) => ({
                                        ...prevPipelines,
                                        [tabsName[value]]: {
                                            ...prevPipelines[tabsName[value]],
                                            stream: {
                                                ...prevPipelines[tabsName[value]].stream,
                                                loader: newNode,
                                            },
                                        },
                                    }));
                                    setStreamingLoaderOpen(false);
                                } else {
                                    handleToast("There is already a block with that name!", "error");
                                }
                            } else {
                                handleToast("Only one loader", "warning"); // de modificat
                            }
                        } else {
                            handleToast("Only batch blocks can be added to a batch pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setStreamingLoaderOpen(false);
                }
            }).catch((error) => {
                handleToast("Error loading block model!", "error");
                setStreamingLoaderOpen(false);
            })
        } else {
            handleToast("There are no currently opened tabs!", "error");
            setStreamingLoaderOpen(false);
        }
    }

    const handleStreamingTransformer = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("stream", "transformer")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(streamingTransformerName);
                    if (checking) {
                        if ("stream" in pipelines[tabsName[value]]) {
                            if (!checkIfBlockNameExists(streamingTransformerName)) {
                                const newNode = {
                                    id: streamingTransformerName,
                                    type: 'textUpdater',
                                    position: {x: blocksPosition[value] + 300, y: 0},
                                    data: {
                                        params: {},
                                        type: "transformer",
                                        name: streamingTransformerName,
                                        pipeline_name: tabsName[value],
                                        label: CAPS(streamingTransformerName),
                                        language: "python",
                                        background: "#7d55ec",
                                        content: response.data,
                                        editable: true,
                                        created: false
                                    },
                                };

                                setBlocksPosition((prevState) => {
                                    return prevState.map((item, index) => {
                                        if (index === value) {
                                            return item + 300;
                                        }
                                        return item;
                                    });
                                });

                                setPipelines((prevPipelines) => ({
                                    ...prevPipelines,
                                    [tabsName[value]]: {
                                        ...prevPipelines[tabsName[value]],
                                        stream: {
                                            ...prevPipelines[tabsName[value]].stream,
                                            loader: prevPipelines[tabsName[value]].stream.loader,
                                            transformers: [...prevPipelines[tabsName[value]].stream.transformers, newNode],
                                            exporter: prevPipelines[tabsName[value]].stream.exporter,
                                            edges: prevPipelines[tabsName[value]].stream.edges
                                        },
                                    },
                                }));
                                setStreamingTransformerOpen(false);
                            } else {
                                handleToast("There is already a block with that name!", "error");
                            }
                        } else {
                            handleToast("Only batch blocks can be added to a batch pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setStreamingTransformerOpen(false);
                }
            }).catch((error) => {
                handleToast("Error loading block model!", "error");
                setStreamingTransformerOpen(false);
            })
        } else {
            handleToast("There are no currently opened tabs!", "error");
            setStreamingTransformerOpen(false);
        }
    }

    const handleStreamingExporter = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("stream", "exporter")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(streamingExporterName);
                    if (checking) {
                        if ("stream" in pipelines[tabsName[value]]) {
                            if (pipelines[tabsName[value]]["stream"]["exporter"] === "") {
                                if (!checkIfBlockNameExists(streamingExporterName)) {
                                    const newNode = {
                                        id: streamingExporterName,
                                        type: 'textUpdater',
                                        position: { x: blocksPosition[value] + 300, y: 0 },
                                        data: {
                                            params: {},
                                            type: "exporter",
                                            name: streamingExporterName,
                                            pipeline_name: tabsName[value],
                                            label: CAPS(streamingExporterName),
                                            language: "yaml",
                                            background: "#ffcc19",
                                            content: response.data,
                                            editable: true,
                                            created: false
                                        },
                                    };

                                    setBlocksPosition((prevState) => {
                                        return prevState.map((item, index) => {
                                            if (index === value) {
                                                return item + 300;
                                            }
                                            return item;
                                        });
                                    });

                                    setPipelines((prevPipelines) => ({
                                        ...prevPipelines,
                                        [tabsName[value]]: {
                                            ...prevPipelines[tabsName[value]],
                                            stream: {
                                                ...prevPipelines[tabsName[value]].stream,
                                                exporter: newNode,
                                            },
                                        },
                                    }));
                                    setStreamingExporterOpen(false);
                                } else {
                                    handleToast("There is already a block with that name!", "error");
                                }
                            } else {
                                handleToast("Only one exporter", "warning"); // de modificat
                            }
                        } else {
                            handleToast("Only batch blocks can be added to a batch pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setStreamingExporterOpen(false);
                }
            }).catch((error) => {
                setStreamingExporterOpen(false);
                handleToast("Error loading block model!", "error");
            })
        } else {
            setStreamingExporterOpen(false);
            handleToast("There are no currently opened tabs!", "error");
        }
    }

    const handleBatchLoader = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("batch", "loader")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(batchLoaderName);
                    if (checking) {
                        if ("batch" in pipelines[tabsName[value]]) {
                            if (pipelines[tabsName[value]]["batch"]["loader"] === "") {
                                if (!checkIfBlockNameExists(batchLoaderName)) {
                                    const newNode = {
                                        id: batchLoaderName,
                                        type: 'textUpdater',
                                        position: {x: blocksPosition[value] + 300, y: 0},
                                        data: {
                                            params: {},
                                            type: "loader",
                                            name: batchLoaderName,
                                            pipeline_name: tabsName[value],
                                            label: CAPS(batchLoaderName),
                                            language: "python",
                                            background: "#4877ff",
                                            content: response.data,
                                            editable: true,
                                            created: false
                                        },
                                    };

                                    setBlocksPosition((prevState) => {
                                        return prevState.map((item, index) => {
                                            if (index === value) {
                                                return item + 300;
                                            }
                                            return item;
                                        });
                                    });

                                    setPipelines((prevPipelines) => ({
                                        ...prevPipelines,
                                        [tabsName[value]]: {
                                            ...prevPipelines[tabsName[value]],
                                            batch: {
                                                ...prevPipelines[tabsName[value]].batch,
                                                loader: newNode,
                                            },
                                        },
                                    }));
                                    setBatchLoaderOpen(false);
                                } else {
                                    handleToast("There is already a block with that name!", "error");
                                }
                            } else {
                                handleToast("Only one loader", "warning"); // de modificat
                            }
                        } else {
                            handleToast("Only stream blocks can be added to a stream pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setBatchLoaderOpen(false);
                }
            }).catch((error) => {
                console.log(error);
                handleToast("Error loading block model!", "error");
                setBatchLoaderOpen(false);
            })
        } else {
            handleToast("There are no currently opened tabs!", "error");
            setBatchLoaderOpen(false);
        }
    }

    const handleBatchTransformer = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("batch", "transformer")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(batchTransformerName);
                    if (checking) {
                        if ("batch" in pipelines[tabsName[value]]) {
                            if (!checkIfBlockNameExists(batchTransformerName)) {
                                const newNode = {
                                    id: batchTransformerName,
                                    type: 'textUpdater',
                                    position: {x: blocksPosition[value] + 300, y: 0},
                                    data: {
                                        params: {},
                                        type: "transformer",
                                        name: batchTransformerName,
                                        pipeline_name: tabsName[value],
                                        label: CAPS(batchTransformerName),
                                        language: "python",
                                        background: "#7d55ec",
                                        content: response.data,
                                        editable: true,
                                        created: false
                                    },
                                };

                                setBlocksPosition((prevState) => {
                                    return prevState.map((item, index) => {
                                        if (index === value) {
                                            return item + 300;
                                        }
                                        return item;
                                    });
                                });

                                setPipelines((prevPipelines) => ({
                                    ...prevPipelines,
                                    [tabsName[value]]: {
                                        ...prevPipelines[tabsName[value]],
                                        batch: {
                                            ...prevPipelines[tabsName[value]].batch,
                                            loader: prevPipelines[tabsName[value]].batch.loader,
                                            transformers: [...prevPipelines[tabsName[value]].batch.transformers, newNode],
                                            exporter: prevPipelines[tabsName[value]].batch.exporter,
                                            edges: prevPipelines[tabsName[value]].batch.edges
                                        },
                                    },
                                }));
                                setBatchTransformerOpen(false);
                            } else {
                                handleToast("There is already a block with that name!", "error");
                            }
                        } else {
                            handleToast("Only stream blocks can be added to a stream pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setBatchTransformerOpen(false);
                }
            }).catch((error) => {
                handleToast("Error loading block model!", "error");
                setBatchTransformerOpen(false);
            })
        } else {
            handleToast("There are no currently opened tabs!", "error");
            setBatchTransformerOpen(false);
        }
    }

    const handleBatchExporter = () => {
        if (tabs.length > 0) {
            axios({
                method: "GET",
                url: BLOCK_MODEL("batch", "exporter")
            }).then((response) => {
                if (tabsName[value] in pipelines && !pipelineCreated[value]) {
                    const checking = /^[a-z_]+$/.test(batchExporterName);
                    if (checking) {
                        if ("batch" in pipelines[tabsName[value]]) {
                            if (pipelines[tabsName[value]]["batch"]["exporter"] === "") {
                                if (!checkIfBlockNameExists(batchExporterName)) {
                                    const newNode = {
                                        id: batchExporterName,
                                        type: 'textUpdater',
                                        position: { x: blocksPosition[value] + 300, y: 0 },
                                        data: {
                                            params: {},
                                            type: "exporter",
                                            name: batchExporterName,
                                            pipeline_name: tabsName[value],
                                            label: CAPS(batchExporterName),
                                            language: "python",
                                            background: "#ffcc19",
                                            content: response.data,
                                            editable: false,
                                            created: false
                                        },
                                    };

                                    setBlocksPosition((prevState) => {
                                        return prevState.map((item, index) => {
                                            if (index === value) {
                                                return item + 300;
                                            }
                                            return item;
                                        });
                                    });

                                    setPipelines((prevPipelines) => ({
                                        ...prevPipelines,
                                        [tabsName[value]]: {
                                            ...prevPipelines[tabsName[value]],
                                            batch: {
                                                ...prevPipelines[tabsName[value]].batch,
                                                exporter: newNode,
                                            },
                                        },
                                    }));
                                    setBatchExporterOpen(false);
                                } else {
                                    handleToast("There is already a block with that name!", "error");
                                }
                            } else {
                                handleToast("Only one exporter", "warning"); // de modificat
                            }
                        } else {
                            handleToast("Only stream blocks can be added to a stream pipeline!", "error");
                        }
                    } else {
                        handleToast("Only lowercase letters and underscores are allowed!", "error");
                    }
                } else {
                    if (pipelineCreated[value]) {
                        handleToast("Pipeline already created!", "error");
                    } else {
                        handleToast("There is non pipeline with that name!", "error");
                    }
                    setBatchExporterOpen(false);
                }
            }).catch((error) => {
                setBatchExporterOpen(false);
                handleToast("Error loading block model!", "error");
            })
        } else {
            setBatchExporterOpen(false);
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
                if (i.description === "created") {
                    setPipelineCreated(prevState => [...prevState, true]);
                } else {
                    setPipelineCreated(prevState => [...prevState, false]);
                }
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
                                    label: CAPS(block.name),
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
                                    label: CAPS(block.name),
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
                                    label: CAPS(block.name),
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
                                edges: edges
                            }
                        }
                    }))
                    setPipelinesBlocksNames(prevState => [...prevState, nodesNames]);
                    setBlocksPosition(prevState => [...prevState, positions[orderedBlocks[orderedBlocks.length - 1].name]][0]);
                } else {
                    setPipelinesBlocksNames(prevState => [...prevState, []]);
                    if (!nodesInStorage) {
                        setBlocksPosition(prevState => [...prevState, 0]);
                        setPipelines((prevState) => ({
                            ...prevState,
                            [name]: {
                                [type] : {
                                    loader: "",
                                    transformers: [],
                                    exporter: "",
                                    edges: []
                                }
                            }
                        }))
                    } else {
                        let maxX = -1;
                        let maxIndex = 0;
                        const nodeType = "stream" in JSON.parse(nodesInStorage) ? "stream" : "batch";
                        let modifiedNodes = {[nodeType]: {}};
                        if ("stream" in JSON.parse(nodesInStorage)) {
                            Object.entries(JSON.parse(nodesInStorage).stream).forEach(([key, value]) => {
                                if (key !== "edges") {
                                    if (key === "transformers") {
                                        for (let i = 0; i < value.length; i++) {
                                            if (value[i].position.x > maxX) {
                                                maxX = value[i].position.x;
                                                maxIndex = [key, i];
                                            }
                                        }
                                    } else if ((key === "loader" || key === "exporter") && value !== ""){
                                        if (value.position.x > maxX) {
                                            maxX = value.position.x;
                                            maxIndex = key;
                                        }
                                    }
                                }
                            });
                            if (maxX !== -1) {
                                if (maxIndex.length > 1 && typeof(maxIndex) === "object") {
                                    setBlocksPosition(prevState => [...prevState, JSON.parse(nodesInStorage).stream[maxIndex[0]][maxIndex[1]].position.x]);
                                } else {
                                    setBlocksPosition(prevState => [...prevState, JSON.parse(nodesInStorage).stream[maxIndex].position.x]);
                                }
                            } else {
                                setBlocksPosition(prevState => [...prevState, 0]);
                            }
                        } else {
                            Object.entries(JSON.parse(nodesInStorage).batch).forEach(([key, value]) => {
                                if (key === "transformers") {
                                    for (let i = 0; i < value.length; i++) {
                                        if (value[i].position.x > maxX) {
                                            maxX = value[i].position.x;
                                            maxIndex = key;
                                        }
                                    }
                                } else if ((key === "loader" || key === "exporter") && value !== ""){
                                    if (value.position.x > maxX) {
                                        maxX = value.position.x;
                                        maxIndex = key;
                                    }
                                }
                            });
                            if (maxX !== -1) {
                                if (maxIndex.length > 1  && typeof(maxIndex) === "object") {
                                    setBlocksPosition(prevState => [...prevState, JSON.parse(nodesInStorage).batch[maxIndex[0]][maxIndex[1]].position.x]);
                                } else {
                                    setBlocksPosition(prevState => [...prevState, JSON.parse(nodesInStorage).batch[maxIndex].position.x]);
                                }
                            } else {
                                setBlocksPosition(prevState => [...prevState, 0]);
                            }
                        }

                        Object.entries(JSON.parse(nodesInStorage)[nodeType]).forEach(([key, value]) => {
                            if (key !== "edges") {
                                if (key === "transformers") {
                                    const newTransformers = [];
                                    for (let i of value) {
                                        const isContentInStorage = localStorage.getItem(`${name}-${i.id}-block-content`);

                                        if (isContentInStorage) {
                                            const newNode = {};
                                            Object.entries(i).forEach(([k, v]) => {
                                                if (k === "data"){
                                                    newNode[k] = {...v, content: isContentInStorage};
                                                } else {
                                                    newNode[k] = v;
                                                }
                                            })
                                            newTransformers.push(newNode);
                                        } else {
                                            newTransformers.push(i);
                                        }
                                    }
                                    modifiedNodes[nodeType]["transformers"] = newTransformers;
                                } else {
                                    const isContentInStorage = localStorage.getItem(`${name}-${value.id}-block-content`);

                                    if (isContentInStorage) {
                                        const newNode = {};
                                        Object.entries(value).forEach(([key, value]) => {
                                            if (key === "data"){
                                                newNode[key] = {...value, content: isContentInStorage};
                                            } else {
                                                newNode[key] = value;
                                            }
                                        })
                                        if (key === "loader") {
                                            modifiedNodes[nodeType]["loader"] = newNode;
                                        } else {
                                            modifiedNodes[nodeType]["exporter"] = newNode;
                                        }
                                    } else {
                                        if (key === "loader") {
                                            modifiedNodes[nodeType]["loader"] = value;
                                        } else {
                                            modifiedNodes[nodeType]["exporter"] = value;
                                        }
                                    }
                                }
                            } else {
                                modifiedNodes[nodeType]["edges"] = value;
                            }
                        })

                        setPipelines((prevState) => ({
                            ...prevState,
                            [name]: modifiedNodes
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
        if (!pipelineCreated[value] && tabs.length > 0) {
            localStorage.setItem(`pipeline-${tabsName[value]}`, JSON.stringify(pipelines[tabsName[value]]));
        }
    }, [pipelineCreated, value, tabsName, pipelines]);

    React.useEffect(() => {
       if (pipelineCreated[value] && pipelinesBlocksNames.length === 0) {
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
    }, [pipelinesBlocksNames, tabsName, value, pipelineCreated]);

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
            <Dialog open={streamingLoaderOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setStreamingLoaderName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleStreamingLoader}>
                        Add Loader
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={streamingTransformerOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setStreamingTransformerName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleStreamingTransformer}>
                        Add Transformer
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={streamingExporterOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setStreamingExporterName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleStreamingExporter}>
                        Add Exporter
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={batchLoaderOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setBatchLoaderName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleBatchLoader}>
                        Add Loader
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={batchTransformerOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setBatchTransformerName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleBatchTransformer}>
                        Add Transformer
                    </Button>
                </Box>
            </Dialog>
            <Dialog open={batchExporterOpen} onClose={handleClose}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", height: 250, width: 250 }}>
                    <DialogTitle sx={{ fontWeight: "bold" }}>
                        BLOCK NAME
                    </DialogTitle>
                    <TextField variant="outlined" onChange={(event) => setBatchExporterName(event.target.value)} label="Block Name"/>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={handleBatchExporter}>
                        Add Exporter
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setBatchLoaderOpen(true)}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setBatchTransformerOpen(true)}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setBatchExporterOpen(true)}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setStreamingLoaderOpen(true)}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setStreamingTransformerOpen(true)}>
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
                                        <Button variant="filled" sx={{ backgroundColor: "white", color: "black", '&:hover': { bgcolor: "#36454F", color: "white" } }} onClick={() => setStreamingExporterOpen(true)}>
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
                {tabs && (tabs.map((entry, index) => (
                    <ReactFlowPanel
                        key={index}
                        index={index}
                        value={value}
                        {...{
                            componentNodes: pipelines[tabsName[value]] && "stream" in pipelines[tabsName[value]]
                                ? pipelines[tabsName[value]]["stream"]
                                : pipelines[tabsName[value]] && pipelines[tabsName[value]]["batch"],
                            componentEdges: pipelines[tabsName[value]]
                                ? "stream" in pipelines[tabsName[value]]
                                    ? pipelines[tabsName[value]]["stream"]["edges"]
                                    : pipelines[tabsName[value]]["batch"]["edges"] : [],
                            drawerWidth: drawerWidth,
                            created: pipelineCreated[value],
                            setPipes: setPipelines,
                            pipeline_name: tabsName[value] ? tabsName[value] : "",
                            type: tabsName[value] ? Object.keys(pipelines[tabsName[value]])[0] : "",
                            orderBlockNames: pipelinesBlocksNames[value] ? pipelinesBlocksNames[value] : ""
                        }}
                    />
                )))}
            </Box>
        </div>
    );
}

export default PythonEditor;