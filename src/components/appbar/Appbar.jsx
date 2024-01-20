import * as React from "react";
import { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import AdjustIcon from '@mui/icons-material/Adjust';
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {Divider} from "@mui/material";
import useAppBarHeight from "../utils/appBarHeight";
import Chip from '@mui/material/Chip';
import {useNavigate} from "react-router-dom";

function getWindowDimensions() {
  const { innerWidth: width } = window;
  return width;
}

function ResponsiveAppBar({logout, role, username}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [hoverEffect, setHoverEffect] = React.useState([]);
  const [logoutHover, setLogoutHover] = React.useState(false);
  const [logoHover, setLogoHover] = React.useState(false);
  const [windowDimensions, setWindowDimensions] = React.useState(getWindowDimensions());
  const isRun = React.useRef(false);
  const navigate = useNavigate();
  const [appBarRef] = useAppBarHeight();
  const [pages, setPages] = React.useState([]);


  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    window.sessionStorage.setItem("appBarHeight", JSON.stringify(appBarRef.current.clientHeight));

    if (role === "") {
      setPages(["Home", "About"]);
      setHoverEffect([false, false]);
    } else if (role === "data-producer") {
      setPages(["Home", "Orchestration", "My Datasets", "Models"]);
      setHoverEffect([false, false, false, false, false]);
    } else if (role === "data-scientist") {
      setPages(["Home", "Datasets", "Notebooks", "Models"]);
      setHoverEffect([false, false, false, false]);
    }
  }, [appBarRef]);

  const handleLogout = () => {
    logout.logout();
  };

  const goToHome = () => {
    navigate("");
  }

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
    for (var i = 0; i < hoverEffect.length; i++) {
      if (index === i) {
        newArray.push(true);
      } else {
        newArray.push(false);
      }
    }
    setHoverEffect(newArray);
  };

  const handleMouseLeave = (index) => {
    let newArray = [];
    for (var i = 0; i < hoverEffect.length; i++) {
      if (index === i) {
        newArray.push(false);
      } else {
        newArray.push(false);
      }
    }
    setHoverEffect(newArray);
  };

  const handleLogoutEnter = () => {
    setLogoutHover(true);
  }
  const handleLogoutLeave = () => {
    setLogoutHover (false);
  }


  const handleRedirect = (whereTo) => {
    if (whereTo.toLowerCase() === "home") {
      navigate(`/`);
    } else {
      navigate(`/${whereTo.toLowerCase().replaceAll(" ", "_")}`);
    }
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppBar ref={appBarRef} position="fixed" style={{ backgroundColor: "#000"}} sx={{ height: 84, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Button sx={{ fontSize: logoHover ? 45 : 40, cursor: "pointer" }}
                   onMouseLeave={handleLogoLeave}
                   onMouseEnter={handleLogoEnter}
                   onClick={windowDimensions > 1000 ? goToHome : handleOpenMenu} >
            <AdjustIcon sx={{fontSize: 40, color: "white", marginRight: 1}} />
            <Typography variant="p" sx={{color: "white", marginRight: 2}}>
              AI1
            </Typography>
          </Button>
          {windowDimensions > 1000 ?
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page, index) => (
              <Button
                key={index}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                onClick={() => handleRedirect(page)}
                sx={{
                  my: 2,
                  border: hoverEffect[index] ? "2px solid white" : "0px",
                  color: "white",
                  display: "block",
                  fontSize: 20,
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

          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", flexGrow: 0, marginLeft: windowDimensions > 1000 ? 0 : windowDimensions/10 - 3}}>
            <Chip label={username} sx={{backgroundColor: "white", color: "black", fontWeight: "bold", marginRight: 2}}/>
            <Button
                sx={{
                  color: "white",
                  display: "block",
                  fontSize: 20,
                  border: logoutHover ? "2px solid white" : "0px",
                  fontFamily: "monospace",
                  fontWeight: "bold"
                }}
                onMouseEnter={handleLogoutEnter}
                onMouseLeave={handleLogoutLeave}
                onClick={handleLogout}
            >Logout</Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
