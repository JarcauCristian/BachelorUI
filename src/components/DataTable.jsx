import React from 'react';
import Paper from '@mui/material/Paper';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow, Tooltip,
} from "@mui/material";
import Typography from "@mui/material/Typography";
const DataTable = ({data, descriptions}) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [paginatedData, setPaginatedData] = React.useState(data.slice(0, 5));
    const [width, setWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = Object.keys(data[0]).map((key) => ({
        field: key,
        headerName: typeof key === 'string' ? key.charAt(0).toUpperCase() + key.slice(1) : key,
        description: descriptions[key]
    }));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    React.useEffect(() => {
        setPaginatedData(data.slice(page * rowsPerPage, (page + 1) * rowsPerPage));
    }, [data, page, rowsPerPage]);

    return (
        <div style={{ padding: 20 }}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: width < 1200 ? 0 : 650 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.field} align="center">
                                    <Typography variant="subtitle2">{column.headerName}</Typography>
                                    <Typography variant="body2" color="textSecondary">{column.description}</Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index}>
                                {columns.map((column) => (
                                    <TableCell key={column.field} align="center">
                                        {row[column.field].length > 50 ?
                                            <Tooltip title={row[column.field]}>
                                                {row[column.field].slice(0, 50) + "..."}
                                            </Tooltip>
                                            :
                                            row[column.field]
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    );
}

export default DataTable;