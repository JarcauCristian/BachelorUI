import MiniDrawer from "../sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return <div style={{ display: "flex", flexDirection: "row"}}>
        <MiniDrawer sx={{ positionSticky: true }} />
        <Outlet />
    </div>
}

export default Layout