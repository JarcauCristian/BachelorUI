import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const useAuth = () => {
    const isRun = useRef(false);
    const [isLogin, setLogin] = useState(false);
    const [token, setToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
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
            setUserInfo(client.hasRealmRole("clinician"));
            setKeycloakInstance(client);
        });
    }, [REACT_APP_KEYCLOAK_URL, REACT_APP_KEYCLOAK_REALM, REACT_APP_KEYCLOAK_CLIENT]);

    return { isLogin, token, userInfo, keycloakInstance };
}
export default useAuth;