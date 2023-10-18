import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const roles = ['clinician', 'data_scientist', 'data_orchestrator']

const useAuth = () => {
    const isRun = useRef(false);
    const [isLogin, setLogin] = useState(false);
    const [token, setToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
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
            for (var i = 0; i < roles.length; i++) {
                if (client.hasRealmRole(roles[i])) {
                    setUserRole(roles[i]);
                    break;
                }
            }
            setKeycloakInstance(client);
            setInterval(() => {
                client.updateToken(1).then((refreshed) => {
                    if (refreshed) {
                        console.log('Token was refreshed!');
                    } else {
                        console.log('Token is still valid!');
                    }}).catch(() => {
                        console.log("An error occurred when refreshing the token")
                })
            }, 1000*60);
        });
    });

    return { isLogin, token, userRole, keycloakInstance };
}
export default useAuth;