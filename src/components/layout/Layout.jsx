import {Outlet} from "react-router-dom";
import ResponsiveAppBar from "../appbar/Appbar";
import {Divider} from "@mui/material";

const Layout = ({logout, role}) => {
    return <div style={{ display: "flex", flexDirection: "column", overflow: "hidden"}}>
        <ResponsiveAppBar logout={logout} role={role} />
        <Divider style={{ backgroundColor: 'white', height: 2 }} variant="fullWidth"/>
        <Outlet/>
    </div>
}

export default Layout