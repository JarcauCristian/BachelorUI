import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
const DataTable = ({data}) => {
    const [columns, setColumns] = React.useState(null);
    const [rows, setRows] = React.useState(null);

    React.useEffect(() => {
        console.log(Object.keys(data[0]))
        const cols = []
        if (data.length > 0) {
            Object.keys(data[0]).map( (key) => {
                    cols.push({
                        field: key,
                        headerName: key.charAt(0).toUpperCase() + key.slice(1),
                        width: 70
                    })
                }
            )
            setColumns(cols)
            setRows(data)
        }
    }, [data])
    console.log(columns)
    return (
        // <TableContainer component={Paper}>
        //     <Table sx={{ minWidth: 650 }} aria-label="simple table">
        //         <TableHead>
        //             <TableRow>
        //                 {data.length > 0 &&
        //                     Object.keys(data[0]).map((header, index) => (
        //                         <TableCell key={index}>{header}</TableCell>
        //                     ))}
        //             </TableRow>
        //         </TableHead>
        //         <TableBody>
        //             {data.map((row, rowIndex) => (
        //                 <TableRow key={rowIndex}>
        //                     {Object.keys(row).map((cell, cellIndex) => (
        //                         <TableCell key={cellIndex}>{row[cell]}</TableCell>
        //                     ))}
        //                 </TableRow>
        //             ))}
        //         </TableBody>
        //     </Table>
        // </TableContainer>
        <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                },
            }}
            component={Paper}
            pageSizeOptions={[5, 10]}
        />
    );
}

export default DataTable;