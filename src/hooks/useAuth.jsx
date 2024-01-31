import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";
import Cookies from 'js-cookie';

const roles = ['data-scientist', 'data-producer'] // The roles in the platform

const useAuth = () => {
    const isRun = useRef(false);
    const isPut = useRef(false);
    const [isLogin, setLogin] = useState(false);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userID, setUserID] = useState(null);
    const [username, setUsername] = useState(null);
    const [keycloakInstance, setKeycloakInstance] = useState(null);
    const {REACT_APP_KEYCLOAK_URL, REACT_APP_KEYCLOAK_REALM, REACT_APP_KEYCLOAK_CLIENT} = process.env

    useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        const client = new Keycloak({
            url: REACT_APP_KEYCLOAK_URL,
            realm: REACT_APP_KEYCLOAK_REALM,
            clientId: REACT_APP_KEYCLOAK_CLIENT,
        })

        client.init({onLoad: "login-required"}).then((res) => {
            setLogin(res);
            setToken(client.token);
            Cookies.set('token', client.token, { expires: 1 });
            for (let i = 0; i < roles.length; i++) {
                if (client.hasRealmRole(roles[i])) {
                    setUserRole(roles[i]);
                    break;
                }
            }
            client.loadUserInfo().then((profile) => {
                if (!isPut.current) {
                    window.sessionStorage.setItem("user_id", profile.sub);
                    isPut.current = true;
                }
                setUserID(profile.sub);
                Cookies.set('userID', profile.sub, { expires: 1 });
                setUsername(profile.email);
            }).catch((error) => {
                console.error("Error:", error);
            })
            setKeycloakInstance(client);
            setInterval(() => {
                client.updateToken(1).then((refreshed) => {
                    if (refreshed) {
                        console.log('Token was refreshed!');
                        Cookies.set('token', client.token, { expires: 1 });
                    } else {
                        console.log('Token is still valid!');
                    }}).catch(() => {
                        console.log("An error occurred when refreshing the token")
                })
            }, 1000*60);
            setInterval(() => {
                if (!res) {
                    window.location.reload();
                } else {
                    console.log("Still logged in!");
                }
            }, 1000*60*10);
        });
    });

    return { isLogin, token, userRole, userID, username, keycloakInstance };
}
export default useAuth;