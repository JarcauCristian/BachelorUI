import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
const DataTable = ({data}) => {
    return (
        <div style={{ padding: 20 }}>
            <DataGrid
                rows={data.map((row, index) => {
                    row["ID"] = index;
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
                sx={{ backgroundColor: "white", color: "black" }}
            />
        </div>
    );
}

export default DataTable;