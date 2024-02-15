import * as React from 'react';

const RunHistory = (pipelineCreated, handleToast) => {



    return (
        <Box sx={{
            display: pipelineCreated ? "flex" : "none",
            flexDirection: "column",
            position: "absolute",
            zIndex: 2,
            marginLeft: "35vw",
            marginTop: "2vh",
            alignItems: "center",
        }}>
            
        </Box>
    );
}

export default RunHistory;