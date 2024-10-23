import * as Sentry from '@sentry/vue';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import { ref } from 'vue';


export const getUserPool = () => {
    const poolData = {
        UserPoolId: import.meta.env.VITE_USERSERVICE__USERPOOLID,
        ClientId: import.meta.env.VITE_USERSERVICE__USERPOOLCLIENTID,
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    return userPool;
};

export const onLoad = async (): Promise<AmazonCognitoIdentity.CognitoUserSession | null> => {
    const userPool = getUserPool();
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser === null) {
        return null;
    }

    return new Promise((resolve, reject) => {
        cognitoUser.getSession((err: Error | null, session: AmazonCognitoIdentity.CognitoUserSession) => {
            if (err) {
                console.log(err.name);

                if (err.name === "PasswordResetRequiredException") {
                    return null;
                } else {
                    reject(err);
                }
            }

            resolve(session);
        });
    });
};

export const authFlow = async (
    username: string,
    password: string,
    onNewPasswordRequired: () => Promise<string>,
): Promise<AmazonCognitoIdentity.CognitoUserSession> => {
    return Sentry.startSpan({ name: "Authentication via Cognito" }, () => {
        const userPool = getUserPool();

        const authenticationData = {
            Username: username,
            Password: password,
        };

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
            authenticationData,
        );

        const userData = {
            Username: authenticationData.Username,
            Pool: userPool,
        };

        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        return new Promise<AmazonCognitoIdentity.CognitoUserSession>((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: resolve,
                onFailure: reject,

                newPasswordRequired: function (userAttributes, _requiredAttributes) {
                    delete userAttributes.email_verified;
                    delete userAttributes.email;

                    return onNewPasswordRequired().then((newPassword) => {
                        return cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                            onSuccess: resolve,
                            onFailure: reject,
                        });
                    });
                },
            });
        });
    });
};

export const authenticatedUser = ref<AmazonCognitoIdentity.CognitoUserSession | null>(null);
const userCredentials = ref<{ username: string | undefined; password: string | undefined }>({ username: undefined, password: undefined });

export const useCredentials = () => {
    return userCredentials;
};

export const useAuth = async (): Promise<AmazonCognitoIdentity.CognitoUserSession> => {
    if (!authenticatedUser.value) {
        throw new Error("User not authenticated");
    }

    return authenticatedUser.value;
};

export interface UserSettings {
    OPENAI_API_KEY: string;
}

export const useUserSettings = () => {
    const updateUserSettings = async (settings: Partial<UserSettings>) => {
        Object.assign(userSettings.value, settings);
        localStorage.setItem("userSettings", JSON.stringify(userSettings.value));
    };

    return { userSettings, updateUserSettings };
};

export const userSettings = ref<UserSettings>({
    OPENAI_API_KEY: "",
    ...JSON.parse(localStorage.getItem("userSettings") || "{}"),
});
