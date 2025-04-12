import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    realm: "testing",
    url: "https://sso2.kpi.fei.tuke.sk",
    clientId: "testing-client",
});

const initKeycloak = () => {
    return new Promise((resolve, reject) => {
        keycloak.init({
            onLoad: 'login-required', // This means the user will be redirected to login if not authenticated
            checkLoginIframe: false, // Disable the iframe to avoid unwanted redirects
        })
        .then(authenticated => {
            if (authenticated) {
                console.log("Authenticated!");
                resolve(true);
            } else {
                console.log("Not authenticated!");
                reject(new Error("Authentication failed"));
            }
        })
        .catch(error => {
            console.error("Keycloak init failed", error);
            reject(error);
        });
    });
};

export { keycloak, initKeycloak };
