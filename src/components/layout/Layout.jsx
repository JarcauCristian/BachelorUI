import {Outlet} from "react-router-dom";
import ResponsiveAppBar from "../appbar/Appbar";

const Layout = ({logout, role}) => {
    return <div style={{ display: "flex", flexDirection: "column"}}>
        <ResponsiveAppBar logout={logout} role={role} />
        <Outlet />
    </div>
}

export default Layout