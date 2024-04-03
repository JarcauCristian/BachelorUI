import {styled} from "@mui/material/styles";
import {Tooltip, tooltipClasses} from "@mui/material";
import * as React from "react";

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        color: 'white',
        boxShadow: theme.shadows[1],
        fontSize: 16, // Custom font size
        padding: '10px 20px', // Custom padding for larger tooltip
    },
}));

export default CustomTooltip;