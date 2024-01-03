import * as React from 'react';
import Box from "@mui/material/Box";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import StopCircleIcon from '@mui/icons-material/StopCircle';
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { intervalToDuration, formatDuration } from 'date-fns';
import {
    CircularProgress,
    createTheme,
    Dialog,
    DialogTitle,
    Divider,
    Step,
    StepLabel,
    Stepper,
    ThemeProvider
} from "@mui/material";
import {CAPS} from "./utils/utliFunctions";
import {
    BLOCK_STATUS,
    CHANGE_PIPELINE_STATUS,
    PIPELINE_RUN_DATA,
    PIPELINE_STATUS, PIPELINE_TRIGGER_STATUS,
    RUN_PIPELINE
} from "./utils/apiEndpoints";
import axios from "axios";
import Cookies from "js-cookie";
import Button from "@mui/material/Button";

const theme = createTheme({
    components: {
        MuiStepper: {
            styleOverrides: {
                root: {
                    color: 'black',
                },
            },
        },
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: 'black',
                    '&.Mui-completed': {
                        color: 'green',
                    },
                    '&.Mui-error': {
                        color: 'red',
                    },
                },
            },
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    color: 'black',
                    '&.Mui-active': {
                        color: 'black',
                    },
                },
            },
        },
    },
});

const PipelineSteps = ({createPipeline, pipelineCreated, loading, nodesName, pipelineName, handleToast, pipelineType, openDialog}) => {

    const [activeStep, setActiveStep] = React.useState(-1);
    const [completed, setCompleted] = React.useState({});
    const [failed, setFailed] = React.useState({});
    const isRun = React.useRef(false);
    const [runData, setRunData] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isPipelineRunning, setIsPipelineRunning] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [webSocket, setWebSocket] = React.useState(false);
    const [streamPipelineData, setStreamPipelineData] = React.useState({
        "last_status": null,
        "next_run": null
    });

    const calculateAndFormatDuration = (date_time) => {
        const now = new Date();
        if (date_time > now) {
            const duration = intervalToDuration({ start: now, end: date_time });
            return formatDuration(duration);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        if (pipelineCreated) {
            const isPresent = localStorage.getItem(`${pipelineName}-runData`);
            if (!isPresent) {
                axios({
                    method: "GET",
                    url: PIPELINE_RUN_DATA(pipelineName + "_" + Cookies.get("userID").split("-").join("_"))
                }).then((response) => {
                    setRunData(response.data);
                    localStorage.setItem(`${pipelineName}-runData`, JSON.stringify(response.data));
                }).catch((_) => {
                    handleToast("Error loading pipeline run data!", "error");
                })
            }

            if (pipelineType === "stream") {
                axios({
                    method: "GET",
                    url: PIPELINE_TRIGGER_STATUS(pipelineName + "_" + Cookies.get("userID").split("-").join("_"))
                }).then((response) => {
                    if (response.data === "active") {
                        setIsPipelineRunning(true);
                    } else {
                        setIsPipelineRunning(false);
                    }
                }).catch((_) => {
                    handleToast("Error getting pipeline status!", "error");
                })
            }
        }
    }, [pipelineType, pipelineCreated, nodesName, failed, completed, setCompleted, setFailed, pipelineName, setRunData, handleToast])

    const startPipeline = async (index) => {
        const isPresent = localStorage.getItem(`${pipelineName}-running-steps`)
        if (!isPresent || JSON.parse(isPresent).lastRunStep === -1) {
            const complete = {};
            const fail = {}

            nodesName.forEach((value) => {
                complete[value] = false;
                fail[value] = false;
            })

            setCompleted(complete);
            setFailed(fail);

            if (nodesName.length < 2) {
                handleToast("The pipeline does not meet the requirements!", "error");
                return;
            }

            setIsLoading(true);
            try {
                await axios({
                    method: "POST",
                    url: RUN_PIPELINE,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: {
                        "run_id": JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).id,
                        "token": JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).token,
                        "variables": {}
                    },
                    timeout: 10000
                })
                const toSave = {
                    "completed": complete,
                    "failed": fail,
                    "activeStep": -1,
                    "lastRunStep": 0,
                    "isLoading": true,
                }

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
            } catch (e) {
                setIsLoading(false);
                handleToast("Error starting the pipeline!", "error");
                return;
            }
        }

        setIsLoading(true);

        for (let i = index; i < nodesName.length; i++) {
            setActiveStep(i);
            const result = await runStep(nodesName[i]);

            if (result === "completed") {
                const newCompleted = completed;
                newCompleted[nodesName[i]] = true;
                setCompleted(newCompleted);

                const toSave = {
                    "completed": newCompleted,
                    "failed": failed,
                    "activeStep": i + 1,
                    "lastRunStep": i,
                    "isLoading": true
                }

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
            } else {
                const newFailed = failed;

                for (let j = i; j < nodesName.length; j++) {
                    newFailed[nodesName[j]] = true;
                }
                setFailed(newFailed);
                const toSave = {
                    "completed": completed,
                    "failed": newFailed,
                    "activeStep": -1,
                    "lastRunStep": -1,
                    "isLoading": false
                }

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                handleToast("Pipeline failed to finish!", "error");
                setIsLoading(false);
                setActiveStep(-1);
                break;
            }
        }

        if (JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)).activeStep === nodesName.length - 1) {
            handleToast("Pipeline Completed Successfully! Items were saved!", "error");
            const toSave = {
                "completed": completed,
                "failed": failed,
                "activeStep": -1,
                "lastRunStep": -1,
                "isLoading": false
            }

            localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
            setIsLoading(false);
            setActiveStep(-1);
        }

        // for (let i = index; i < nodesName.length; i++) {
        //     const result = await webSocketSend(i);
        //
        //     if (result) {
        //         setIsLoading(false);
        //         setActiveStep(-1);
        //         break;
        //     }
        // }
    }

    const webSocketSend = async (index) => {
        return new Promise((resolve, reject) => {
            if (!JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)).webSocket) {
                const toSave = {...JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)), activeStep: index, webSocket: true};
                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                setActiveStep(index);
                let outerStatus = false;
                const ws = new WebSocket("ws://localhost:8000/block/status");
                setWebSocket(true);

                ws.onopen = function (event) {
                    console.log("Connected to WebSocket");
                    const data = {
                        pipeline_id: JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).id,
                        block_name: nodesName[index]
                    };
                    ws.send(JSON.stringify(data));
                };

                ws.onerror = function (event) {
                    console.error("WebSocket error observed:", event);
                    handleToast("Error connecting to pipeline!", "error");
                    reject(event);
                };

                ws.onmessage = function (event) {
                    const message = JSON.parse(event.data);
                    const status = message.status;
                    const node = message.node;

                    if (status === "completed") {
                        const newCompleted = {...completed, [node]: true};
                        setCompleted(newCompleted);

                        if (index === nodesName.length - 1) {
                            outerStatus = true;
                            const toSave = {
                                "completed": completed,
                                "failed": failed,
                                "activeStep": -1,
                                "lastRunStep": -1,
                                "isLoading": false,
                                "webSocket": false
                            }

                            localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                            handleToast("Pipeline Completed Successfully! Items were saved!", "success");
                            setIsLoading(false);
                            setActiveStep(-1);
                            ws.close();
                        } else {
                            outerStatus = false;
                            const toSave = {
                                "completed": newCompleted,
                                "failed": failed,
                                "activeStep": nodesName.indexOf(node) + 1,
                                "lastRunStep": index,
                                "isLoading": true,
                                "webSocket": true
                            }

                            localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                            ws.close();
                        }
                    } else if (status === "failed") {
                        outerStatus = true;
                        const newFailed = {...failed, [node]: true};

                        for (let i = nodesName.indexOf(node) + 1; i < nodesName.length; i++) {
                            newFailed[nodesName[i]] = true;
                        }

                        console.log("New Failed: ", newFailed);
                        console.log("Index: ", nodesName.indexOf(node) + 1);
                        setFailed(newFailed);
                        const toSave = {
                            "completed": completed,
                            "failed": newFailed,
                            "activeStep": -1,
                            "lastRunStep": -1,
                            "isLoading": false,
                            "webSocket": false
                        }

                        localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                        handleToast("Pipeline failed to finish!", "error");
                        setIsLoading(false);
                        setActiveStep(-1);
                        ws.close();
                    }
                };

                ws.onclose = function (event) {
                    console.log("WebSocket closed: ", event, outerStatus);
                    setWebSocket(false);
                    if (outerStatus) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                };
            }
        })
    }

    const runStep = async (node) => {
        return new Promise((resolve) => {
            let counter = 0;
            const retry = async () => {
                if (counter === 5) {
                    console.log("Failed");
                    resolve("failed");
                }
                try {
                    const response = await axios({
                        method: 'GET',
                        url: BLOCK_STATUS(JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).id, node),
                    });

                    const data = response.data;

                    if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                        //console.log('Satisfactory response received:', data);
                        resolve(data);
                    } else {
                        //console.log('Unsatisfactory response:', data);
                        setTimeout(retry, 10000);
                        console.log(counter);
                        counter += 1;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setTimeout(retry, 10000);
                }
            };
            retry();
        });
    }
    const enablePipeline = () => {
        axios({
            method: "PUT",
            url: CHANGE_PIPELINE_STATUS,
            data: {
                "trigger_id": runData.id,
                "status": "active"
            }
        }).then((_) => {
            axios({
                method: "GET",
                url: PIPELINE_STATUS(pipelineName + "_" + Cookies.get("userID").split("-").join("_"))
            }).then((response) => {
                setStreamPipelineData(response.data);
                setIsPipelineRunning(true);
            }).catch((_) => {
                handleToast("Error getting last run status!", "error");
            })
        }).catch((_) => {
            handleToast("Error starting pipeline!", "error");
        })
    }

    const getPipelineStatus = () => {
        axios({
            method: "GET",
            url: PIPELINE_STATUS(pipelineName + "_" + Cookies.get("userID").split("-").join("_"))
        }).then((response) => {
            setStreamPipelineData(response.data);
            setTimeout(() => {
                setDialogOpen(true);
            }, 200)
        }).catch((_) => {
            handleToast("Error getting last run status!", "error");
        })
    }

    const disablePipeline = () => {
        axios({
            method: "PUT",
            url: CHANGE_PIPELINE_STATUS,
            data: {
                "trigger_id": runData.id,
                "status": "inactive"
            }
        }).then((_) => {
            setTimeout(() => {
                setIsPipelineRunning(false);
                }, 1000)
        }).catch((_) => {
            handleToast("Error stopping pipeline!", "error");
        })
    }

    React.useEffect(() => {
        const savedState = JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`));
        if (savedState) {
            if (savedState.lastRunStep !== -1) {
                setCompleted(savedState.completed);
                setFailed(savedState.failed);
                setActiveStep(savedState.activeStep);
                setIsLoading(savedState.isLoading);
                setWebSocket(savedState.webSocket);
                setTimeout(() => {
                    startPipeline(savedState.lastRunStep + 1).then((_) => {});
                }, 1000);
            } else {
                setCompleted(savedState.completed);
                setFailed(savedState.failed);
                setActiveStep(savedState.activeStep);
                setIsLoading(savedState.isLoading);
                setWebSocket(savedState.webSocket);
            }
        } else {
            const complete = {};
            const fail = {}

            nodesName.forEach((value) => {
                complete[value] = false;
                fail[value] = false;
            })

            setCompleted(complete);
            setFailed(fail);
        }
    }, []);

    return (
        <div>
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", mb: 3 }}>
                    {"Pipeline Status".toUpperCase()}
                </DialogTitle>
                <Box sx={{ marginTop: 2, backgroundColor: "#36454f", borderRadius: 2, padding: 2, color: "white" }}>
                    <Typography sx={{ fontWeight: "bold" }}>NEXT RUN IN: {calculateAndFormatDuration(new Date(streamPipelineData.next_run))} </Typography>
                    <Divider fullWidth sx={{ backgroundColor: "white", marginTop: 2, marginBottom: 2}}/>
                    <Typography sx={{ fontWeight: "bold" }}>LAST STATUS: {streamPipelineData.last_status === null ? "FIRST RUN" : streamPipelineData.last_status}</Typography>
                </Box>
            </Dialog>
            {pipelineCreated ?
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    position: "absolute",
                    zIndex: 2,
                    marginLeft: "35vw",
                    marginTop: "2vh",
                    alignItems: "center",
                }}>
                    {pipelineType === "stream" ?
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            width: 400,
                            height: 70,
                            borderRadius: 2,
                            backgroundColor: "#36454f",
                        }}>
                            {!isPipelineRunning ? <PlayCircleIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={enablePipeline}/> : <StopCircleIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={disablePipeline} />}
                            {!isPipelineRunning ? <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Run
                                Pipeline</Typography> : <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Running...</Typography>}
                        </Box>
                        :
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            width: 400,
                            height: 70,
                            borderRadius: 2,
                            backgroundColor: "#36454f",
                        }}>
                            {!isLoading ? <PlayCircleIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={() => startPipeline(0)}/> : <CircularProgress color="inherit" />}
                            {!isLoading ? <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Run
                                Pipeline</Typography> : <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Running...</Typography>}
                        </Box>
                    }
                    { pipelineType === "stream" ?
                        isPipelineRunning && (
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    '&:hover': { backgroundColor: "gray", color: "black" },
                                    mt: 2,
                                }}
                                onClick={getPipelineStatus}
                            >
                                Check Pipeline Status
                            </Button>
                        )
                        :
                        nodesName && (
                            <Box sx={{ marginTop: 2 }}>
                                <ThemeProvider theme={theme}>
                                    <Stepper activeStep={activeStep} alternativeLabel>
                                        {nodesName.map((label) => {
                                            const labelProps = {};
                                            if (failed[label]) {
                                                labelProps.error = true;
                                            }
                                            return (
                                                <Step key={label}  completed={completed[label]}>
                                                    <StepLabel {...labelProps}>{CAPS(label)}</StepLabel>
                                                </Step>
                                            );
                                        })}
                                    </Stepper>
                                </ThemeProvider>
                            </Box>
                        )
                    }
                </Box>:
              <Box sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  width: 400,
                  height: 70,
                  borderRadius: 2,
                  backgroundColor: "#36454f",
                  position: "absolute",
                  zIndex: 2,
                  marginLeft: "35vw",
                  marginTop: "2vh"
              }}>
                  {!loading ? <AddIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={() => pipelineType === "stream" ? openDialog() : createPipeline()}/> : <CircularProgress color="inherit" />}
                  {!loading ? <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Create
                      Pipeline</Typography> :<Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Creating...</Typography>}
              </Box>
            }
        </div>
    );
}

export default PipelineSteps;