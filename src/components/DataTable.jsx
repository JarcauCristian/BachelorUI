import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Typography from "@mui/material/Typography";
const DataTable = ({data, name, ids}) => {
    return (
        <div>
            <Typography variant="h4">{name.toUpperCase()}</Typography>
            <DataGrid
                rows={data.map((row, index) => {
                    if (ids !== null){
                        row["ID"] = ids[index];
                    } else {
                        row["ID"] = index;
                    }

                    return row;
                })}
                columns={Object.keys(data[0]).map((key) => {
                    return  { field: key, headerName: typeof key === "string" ? key.charAt(0).toUpperCase() + key.slice(1) : key, width: 90 };
                })}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                getRowId={(row) => row.ID}
                component={Paper}
                pageSizeOptions={[5, 10]}
            />
        </div>
    );
}

export default DataTable;