import React from 'react';
import { Link } from 'react-router-dom';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const NotFoundPage = () => {
    return (
        <Box style={{ width: "100vw", height: "100vh", padding: '50px', textAlign: 'center' }}>
            <Typography variant="h1">404 - Page Not Found</Typography>
            <Typography variant="p">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</Typography>
            <Link to="/">Go to Homepage</Link>
        </Box>
    );
}

export default NotFoundPage;
