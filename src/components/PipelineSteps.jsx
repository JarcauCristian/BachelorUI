import * as React from 'react';
import Box from "@mui/material/Box";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import {
    CircularProgress,
    createTheme,
    Step,
    StepLabel,
    Stepper,
    ThemeProvider
} from "@mui/material";
import {CAPS} from "./utils/utliFunctions";
import {
    BATCH_STATUS,
    PIPELINE_RUN_DATA,
    RUN_PIPELINE
} from "./utils/apiEndpoints";
import axios from "axios";
import Cookies from "js-cookie";

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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const steps = ["start", "running", "finished"];

const PipelineSteps = ({createPipeline, pipelineCreated, loading, nodesName, pipelineName, toast, pipelineType, openDialog}) => {

    const [activeStep, setActiveStep] = React.useState(-1);
    const [completed, setCompleted] = React.useState({});
    const [failed, setFailed] = React.useState({});
    const isRun = React.useRef(false);
    const isRunSteps = React.useRef(false);
    const [isLoading, setIsLoading] = React.useState(false);


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
                    localStorage.setItem(`${pipelineName}-runData`, JSON.stringify(response.data));
                }).catch((_) => {
                    toast("Error loading pipeline run data!", "error");
                })
            }
        }
    }, [pipelineType, pipelineCreated, nodesName, failed, completed, setCompleted, setFailed, pipelineName, toast])

    const runStep = React.useCallback( async () => {
        let counter = 0;
        let isResolved = false;
        return new Promise((resolve) => {
            const retry = async () => {
                if (isResolved) return;
                if (counter === 10) {
                    isResolved = true;
                    resolve("failed");
                    return;
                }
                try {
                    const response = await axios({
                        method: 'GET',
                        url: BATCH_STATUS(JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).id),
                    });

                    const data = response.data;

                    if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                        console.log('Satisfactory response received:', data);
                        isResolved = true;
                        resolve(data);
                    } else {
                        toast("Pipeline Still running!", "info");
                        console.log('Unsatisfactory response:', data);
                        counter += 1;
                        setTimeout(retry, 25000);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setTimeout(retry, 25000);
                }
            };
            retry();
        });
    }, [pipelineName, toast]);

    const startPipeline = React.useCallback(async () => {
        const complete = {};
        const fail = {}

        steps.forEach((value) => {
            complete[value] = false;
            fail[value] = false;
        })

        setCompleted(complete);
        setFailed(fail);

        if (nodesName.length < 2) {
            toast("The pipeline does not meet the requirements!", "error");
        } else {
            setIsLoading(true);
            setActiveStep(steps.indexOf("start"));
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
                        "variables": {
                            "KEYCLOAK_TOKEN": Cookies.get("token")
                        }
                    },
                    timeout: 10000
                })

                complete[steps[0]] = true;
                setCompleted(complete);

                const toSave = {
                    "completed": complete,
                    "failed": fail,
                    "activeStep": 0,
                    "isLoading": true,
                }

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                return true;
            } catch (e) {
                setIsLoading(false);
                toast("Error starting the pipeline!", "error");
                return false;
            }
        }
    }, [toast, pipelineName, nodesName.length]);

    const callStep = React.useCallback(async () => {
        const result = await runStep();

        setActiveStep(-1);
        setIsLoading(false);

        const complete = completed;
        const fail = failed;

        if (result === "completed") {
            steps.forEach((value) => {
                complete[value] = true;
                fail[value] = false;
            })
        } else {
            steps.forEach((value) => {
                complete[value] = false;
                fail[value] = true;
            })
        }

        setCompleted(complete);
        setFailed(fail);

        const toSave = {
            "completed": complete,
            "failed": fail,
            "activeStep": -1,
            "isLoading": false
        }

        localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
    }, [completed, failed, runStep, pipelineName]);

    const runPipeline = React.useCallback(async (source) => {
        if (source === "button") {
            const startResult = await startPipeline();

            if (startResult) {
                setActiveStep(steps.indexOf("running"));

                const complete = completed;

                complete[steps[0]] = true;

                setCompleted(complete);

                const toSave = {...JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)), "activeStep": steps.indexOf("running"), "completed": complete}

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));

                await delay(10000);

                callStep().then((_) => {});

            } else {
                const complete = completed;
                const fail = failed;

                steps.forEach((value) => {
                    complete[value] = false;
                    fail[value] = true;
                });

                setActiveStep(-1);
                setIsLoading(false);
                setCompleted(complete);
                setFailed(fail);

                const  toSave = {
                    "completed": complete,
                    "failed": fail,
                    "activeStep": -1,
                    "isLoading": false
                }

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
            }
        } else {
            callStep().then((_) => {});
        }
    }, [completed, failed, pipelineName, startPipeline, callStep]);

    React.useEffect(() => {
        if (isRunSteps.current) return;

        isRunSteps.current = true;

        const savedState = JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`));
        if (savedState) {
            setCompleted(savedState.completed);
            setFailed(savedState.failed);
            setActiveStep(savedState.activeStep);
            setIsLoading(savedState.isLoading);
            if (savedState.isLoading) {
                setTimeout(() => {
                    runPipeline("useEffect").then((_) => {});
                }, 5000);
            }
        } else {
            const complete = {};
            const fail = {}

            steps.forEach((value) => {
                complete[value] = false;
                fail[value] = false;
            })

            setCompleted(complete);
            setFailed(fail);
        }
    }, [runPipeline, pipelineName]);

    return (
        <div>
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
                        {!isLoading ? <PlayCircleIcon sx={{color: "white", fontSize: 40, cursor: "pointer"}} onClick={() => runPipeline("button")}/> : <CircularProgress color="inherit" />}
                        {!isLoading ? <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Run
                            Pipeline</Typography> : <Typography sx={{color: "white", fontWeight: "bold", fontSize: 25}}>Running...</Typography>}
                    </Box>
                    <Box sx={{ marginTop: 2 }}>
                        <ThemeProvider theme={theme}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((label) => {
                                    const labelProps = {};
                                    if (failed[label]) {
                                        labelProps.error = true;
                                    }
                                    return (
                                        <Step key={label} completed={completed[label]}>
                                            <StepLabel {...labelProps}>{CAPS(label)}</StepLabel>
                                        </Step>
                                    );
                                })}
                            </Stepper>
                        </ThemeProvider>
                    </Box>
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