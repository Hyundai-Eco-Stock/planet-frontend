import axios from 'axios';
import Swal from 'sweetalert2';
import useAuthStore from '@/store/authStore'
import { regenerateAccessToken } from '../auth/auth.api';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API_BASE_URL, // .env에 설정 가능
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

const logout = async() => {
    await apiClient.get('/auth/logout')
        .then(() => { })
        .catch((err) => {
            console.error("로그아웃 요청 실패:", err);
            // window.location.href = "/logout/callback";
        });
}

// 요청 인터셉터
apiClient.interceptors.request.use(
    config => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// 응답 인터셉터 (옵션)
apiClient.interceptors.response.use(
    response => {
        // 토큰 재발급 성공 응답 처리
        if (response.config.url === '/auth/access-token/regenerate' && response.headers['x-error-code'] === 'REFRESH_TOKEN_REGENERATE_SUCCESS') {
            const newAccessToken = response.headers['authorization']?.split(' ')[1]; // Assuming Bearer token
            if (newAccessToken) {
                useAuthStore.getState().setAccessToken(newAccessToken);
                processQueue(null, newAccessToken); // Resolve all pending requests
            }
            console.log("Access Token Regeneration SUCCESS. New Access Token:", newAccessToken);
            return response; // Continue with the original successful response
        }
        return response;
    },
    async (error) => {
        const { response, config } = error;
        const originalRequest = config;

        // 글로벌 에러 처리를 스킵하는 요청인지 확인
        const skipGlobalError = config.headers?.['X-Skip-Global-Error'] === 'true';

        // 네트워크/응답 없음
        if (!response) return Promise.reject(error);

        // 400 BAD_REQUEST (예시. 잘못된 파라미터)
        if (error.response?.status === 400) {
            if (!skipGlobalError) {
                Swal.fire({
                    icon: "error",
                    title: "잘못된 접근",
                    text: error.response.data.message,
                    confirmButtonText: "확인",
                }).then(() => {
                });
            }
            return Promise.reject(error);
        }

        // 401 UNAUTHORIZED (만료된 access token | access token 갱신)
        if (response?.status === 401) {
            console.log("401 Error Response:", response);
            const errorCode = response.headers['x-error-code'];
            console.log("X-Error-Code:", errorCode);

            if (errorCode === 'ACCESS_TOKEN_EXPIRED' || errorCode === 'ACCESS_TOKEN_NOT_VALID') {
                if (isRefreshing) {
                    return new Promise(function(resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    })
                    .then(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
                }

                isRefreshing = true;
                // useAuthStore.getState().clearAuth();
                // console.log("After clearAuth - Access Token:", useAuthStore.getState().accessToken);

                try {
                    const regenResponse = await regenerateAccessToken();
                    console.log("regenerateAccessToken resolved. Response:", regenResponse);
                    console.log("After regenerateAccessToken - Access Token:", useAuthStore.getState().accessToken);
                    // The success of regenerateAccessToken will be handled by the success interceptor
                    // The original request will be retried via processQueue
                    return apiClient(originalRequest); // This will be retried by processQueue
                } catch (regenError) {
                    console.log("regenerateAccessToken rejected. Error:", regenError);
                    processQueue(regenError, null); // Reject all pending requests
                    useAuthStore.getState().clearAuth();
                    window.location.href = "/login";
                    return Promise.reject(regenError); // Propagate the error
                } finally {
                    isRefreshing = false;
                }
            } else if (errorCode === 'REFRESH_TOKEN_EXPIRED' || errorCode === 'REFRESH_TOKEN_NOT_VALID') {
                useAuthStore.getState().clearAuth();
                deleteCookie('REFRESH_TOKEN'); // Clear refresh token cookie
                window.location.href = "/login";
                return Promise.reject(error);
            } else if (error.config?.url?.includes('/auth/login')) {
                if (!skipGlobalError) {
                    Swal.fire({
                        icon: "error",
                        title: "로그인 실패",
                        text: "소셜 로그인을 다시 수행하고, 회원가입을 시도해주세요",
                        confirmButtonText: "로그인 페이지로 이동",
                    }).then(() => {
                        window.location.href = "/login";
                    });
                }
                return Promise.reject(error);
            } else {
                if (!skipGlobalError) {
                    console.warn("Unauthorized, redirecting to login.");
                    const currentPath = window.location.pathname + window.location.search;
                    Swal.fire({
                        icon: "error",
                        title: "미로그인 상태 접근",
                        text: "로그인 후 이용 가능합니다",
                        confirmButtonText: "로그인 페이지로 이동",
                    }).then(() => {
                        window.location.href = "/login";
                    });
                }
                return Promise.reject(error);
            }
        }

        // 403 FORBIDDEN (예시. 유저가 관리자 페이지 접근 시)
        if (error.response?.status === 403) {
            if (!skipGlobalError) {
                console.warn("Forbidden, you do not have permission to access this resource.");
                Swal.fire({
                    icon: "error",
                    title: "잘못된 접근",
                    text: "접근 권한이 없습니다.",
                    confirmButtonText: "이전 페이지로 이동",
                }).then(()=> {
                    window.history.back(); // 이전 페이지로 이동
                });
            }
            return Promise.reject(error);
        }

        // 404 NOT_FOUND (존재하지 않는 에러)
        if (error.response?.status === 404) {
            if (!skipGlobalError) {
                Swal.fire({
                    icon: "404 Error",
                    title: "해당 요청이 존재하지 않습니다",
                    text: "해당 요청이 존재하지 않습니다",
                    confirmButtonText: "홈 화면으로 이동",
                }).then(() => {
                    console.warn("Resource not found.");
                });
            }
            return Promise.reject(error);
        }

        // 500 서버 내부 에러
        if (error.response?.status >= 500) {
            if (!skipGlobalError) {
                console.error("Server error, please try again later.");
                Swal.fire({
                    icon: "error",
                    title: "서버 에러 발생",
                    text: "서버 에러가 발생했습니다. 나중에 다시 시도해주세요.",
                    confirmButtonText: "확인",
                });
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default apiClient;