import MiniDrawer from "../sidebar/Sidebar";
import {Outlet} from "react-router-dom";

const Layout = ({logout}) => {
    return <div style={{ display: "flex", flexDirection: "row"}}>
        <MiniDrawer sx={{ positionSticky: true }} logout={logout} />
        <Outlet />
    </div>
}

export default Layout