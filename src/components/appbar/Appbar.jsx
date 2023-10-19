import * as React from "react";
import { useEffect } from "react";
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
import {Divider} from "@mui/material";
import useAppBarHeight from "../utils/appBarHeight";
import {useNavigate} from "react-router-dom";

const pages = ["Landing Page", "Data Upload", "Data Orchestration"];
const settings = ["Account", "Logout"];

function getWindowDimensions() {
  const { innerWidth: width } = window;
  return width;
}

function ResponsiveAppBar({logout, role}) {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [hoverEffet, setHoverEffet] = React.useState([false, false, false]);
  const [logoHover, setLogoHover] = React.useState(false);
  const [windowDimensions, setWindowDimensions] = React.useState(getWindowDimensions());
  const isRun = React.useRef(false);
  const navigate = useNavigate();
  const [appBarRef] = useAppBarHeight();


  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    window.sessionStorage.setItem("appBarHeight", JSON.stringify(appBarRef.current.clientHeight));

    let newArr = [];

    for (let i = 0; i < pages.length; i++) {
      newArr.push(false);
    }
    setHoverEffet(newArr);
  }, [appBarRef]);

  const handleLogout = () => {
    logout.logout();
  };

  const getWhatToHandle = (text) => {
    if (text === "Logout") {
      return handleLogout;
    } else {
      return () => {};
    }
  };

  const goToHome = () => {
    navigate("");
  }

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogoEnter = () => {
      setLogoHover(true);
  }

  const handleLogoLeave = () => {
      setLogoHover(false);
  }

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

  const handleRedirect = (whereTo) => {
    navigate(`/${whereTo.toLowerCase().replaceAll(" ", "_")}`)
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppBar ref={appBarRef} position="static" style={{ backgroundColor: "#000"}} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ fontSize: logoHover ? 45 : 40, cursor: "pointer" }}
                   onMouseLeave={handleLogoLeave}
                   onMouseEnter={handleLogoEnter}
                   onClick={windowDimensions > 600 ? goToHome : handleOpenMenu} />
          {windowDimensions > 600 ?
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page, index) => (
              <Button
                key={index}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                onClick={() => handleRedirect(page)}
                sx={{
                  my: 2,
                  border: hoverEffet[index] ? "2px solid white" : "0px",
                  color: "white",
                  display: "block",
                  fontFamily: "monospace",
                  fontWeight: "bold"
                }}
              >
                {page}
              </Button>
            ))}
          </Box> :
              <Box>
            <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
              {pages.map((page) => (
                  <MenuItem key={page}>
                    <Typography textAlign="center" >
                      {page}
                      <Divider sx={{ color: "black", backgroundColor: "black" }}/>
                    </Typography>
                  </MenuItem>
              ))}
            </Menu>
          </Box>
            }

          <Box sx={{ flexGrow: 0, marginLeft: windowDimensions > 1000 ? 0 : windowDimensions/10 - 3}}>
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
