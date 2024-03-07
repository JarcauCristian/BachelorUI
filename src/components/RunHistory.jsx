import * as React from 'react';
import Box from "@mui/material/Box";
import HistoryIcon from '@mui/icons-material/History';
import axios from "axios";
import {PIPELINE_HISTORY} from "./utils/apiEndpoints";
import {
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle, FormControl,
    Select,
    Table,
    TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow, TablePagination,
} from "@mui/material";
import Transition from './utils/transition';
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Tooltip from '@mui/material/Tooltip';
import Button from "@mui/material/Button";
import Cookies from "js-cookie";
import CircularProgress from '@mui/material/CircularProgress';

function VariablesForm({ variables }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(variables).map(([key, value]) => (
                <Typography key={key} component="div" variant="body2">
                    <strong>{key}:</strong> {value ? (value.length > 10 ? (
                        <Tooltip title={value}>
                            {`${value.slice(0, 11)}...`}
                        </Tooltip>
                    ) : value) : "None"}
                </Typography>
            ))}
        </Box>
    );
}

const RunHistory = ({pipelineCreated, toast, pipelineName}) => {

    const [historyData, setHistoryData] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState(10);

    const handleClose = () => {
        setOpen(false);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChange = async (e) => {
        setValue(e.target.value);
        setLoading(true);
        try {
            const response = await axios({
                method: "GET",
                url: PIPELINE_HISTORY(pipelineName + "_" + Cookies.get("userID").split("-").join("_"), e.target.value)
            })

            const result = [];

            for (let entry of response.data) {
                const variables = {}
                Object.entries(entry.variables).forEach(([key, value]) => {
                    if (key !== "execution_partition" && key !== "KEYCLOAK_TOKEN") {
                        variables[key] = value
                    }
                })
                result.push({...entry, "variables": variables});
            }
            setLoading(false);
            setHistoryData(result);
        } catch (_) {
            setLoading(false);
            setOpen(false);
            toast("Error getting the run history!", "error");
        }
    }

    return (
        <Box sx={{
            display: pipelineCreated ? "flex" : "none",
            flexDirection: "column",
            position: "absolute",
            zIndex: 2,
            marginLeft: "75vw",
            marginTop: "3vh",
            alignItems: "center",
            backgroundColor: "#36454f",
            borderRadius: 2,
            maxWidth: 50
        }}>
            <Dialog 
            TransitionComponent={Transition}
            keepMounted
            fullWidth
            maxWidth="xll"
            open={open} 
            onClose={handleClose} 
            sx={{ display: "flex", flexDirection: "column", alignItems: "space-between", justifyContent: "space-between", color: "white", textAlign:"center", backgroundColor:""}} >
                <DialogTitle>
                    RUN HISTORY
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                    <FormControl fullWidth>
                        <Typography variant="p" sx={{ color: "black", fontWeight: "bold" }}>{`History Limit`.toUpperCase()}</Typography>
                        <Select
                            labelId="demo-simple-select-label"
                            value={value}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={15}>15</MenuItem>
                            <MenuItem value={30}>30</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                        </Select>
                    </FormControl>
                    <CircularProgress sx={{ color: "black", display: loading ? "block" : "none", mt: 2 }}/>
                    {historyData ?
                        <TableContainer component={Paper} sx={{ display: loading ? "none" : "block", mt: 2, border: "0.5px solid gray" }}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Run Date</TableCell>
                                        <TableCell align="right">Last Completed Block</TableCell>
                                        <TableCell align="right">Last Failed Block</TableCell>
                                        <TableCell align="right">Error message (If the run failed!)</TableCell>
                                        <TableCell align="right">Variables (JSON)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(rowsPerPage > 0
                                            ? historyData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            : historyData
                                    ).map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.status.toUpperCase()}
                                            </TableCell>
                                            <TableCell align="right">{row["running_date"]}</TableCell>
                                            <TableCell align="right">{row["last_completed_block"]}</TableCell>
                                            <TableCell align="right">{row["last_failed_block"]}</TableCell>
                                            <TableCell align="right">{row["error_message"]}</TableCell>
                                            <TableCell align="right">
                                                <VariablesForm variables={row.variables} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                component="div"
                                count={historyData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </TableContainer>
                    : undefined}
                </DialogContent>
                <DialogActions>
                    <Button variant="filled" sx={{ backgroundColor: "black", color: "white", '&:hover': { color: "black" } }} onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <Tooltip title="RUN HISTORY">
                <HistoryIcon sx={{ cursor: "pointer", fontSize: 50, color: "white" }} onClick={() => setOpen(true)}/>
            </Tooltip>
        </Box>
    );
}

export default RunHistory;