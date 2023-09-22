import * as React from "react";
import { useEffect } from "react";
import {useNavigate} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";

const pages = ["Landing Page", "Data Upload", "Data Orchestrator"];
const settings = ["Account", "Logout"];

function ResponsiveAppBar({logout, role}) {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [hoverEffet, setHoverEffet] = React.useState([false, false, false]);
  const isRun = React.useRef(false);
  const navigate = useNavigate()

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;

    let newArr = [];

    for (let i = 0; i < pages.length; i++) {
      newArr.push(false);
    }
    setHoverEffet(newArr);
    console.log(hoverEffet);
  }, [pages]);

  const handleLogout = () => {
    logout.logout();
    navigate("/landing");
  };

  const getWhatToHandle = (text) => {
    if (text === "Logout") {
      return handleLogout;
    } else {
      return () => {};
    }
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMouseEnter = (index) => {
    let newArray = [];
    for (var i = 0; i < hoverEffet.length; i++) {
      if (index === i) {
        newArray.push(true);
      } else {
        newArray.push(false);
      }
    }
    setHoverEffet(newArray);
  };

  const handleMouseLeave = (index) => {
    let newArray = [];
    for (var i = 0; i < hoverEffet.length; i++) {
      if (index === i) {
        newArray.push(false);
      } else {
        newArray.push(false);
      }
    }
    setHoverEffet(newArray);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: "#000" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page, index) => (
              <Button
                key={index}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                sx={{
                  my: 2,
                  border: hoverEffet[index] ? "2px solid white" : "0px",
                  color: "white",
                  display: "block",
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton sx={{ p: 0 }} onClick={handleOpenUserMenu}>
                <AccountBoxIcon
                  style={{ color: "white", width: "50px", height: "50px" }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting}>
                  <Typography textAlign="center" onClick={getWhatToHandle(setting)}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
