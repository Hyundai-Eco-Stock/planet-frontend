pipeline {
    agent { label 'built-in' }

    options {
        skipDefaultCheckout(false)
        timestamps()
    }

    tools {
        nodejs 'NodeJS 22 LTS'  // Jenkins에 등록한 Node 22
    }

    environment {
        APP_NAME     = 'planet-frontend-artifacts'
        BUILD_DIR    = 'dist'                         // Vite 기본 산출물
        DEPLOY_ROOT  = "/var/www/${APP_NAME}"        // /var/www/<app>
        RELEASES_DIR = "${DEPLOY_ROOT}/releases"     // /releases/<timestamp>
        CURRENT_LINK = "${DEPLOY_ROOT}/current"      // 현재 활성 심볼릭 링크
        SHARED_DIR   = "${DEPLOY_ROOT}/shared"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install deps') {
            steps {
                sh '''
                    set -e
                    corepack enable || true
                    if [ -f package-lock.json ]; then
                        npm ci --no-audit --no-fund
                    else
                        npm install --no-audit --no-fund
                    fi
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -e
                    [ -f package.json ] || { echo "package.json 없음"; exit 1; }
                    npm run build
                    [ -d "${BUILD_DIR}" ] || { echo "빌드 산출물(${BUILD_DIR}) 없음"; ls -al; exit 1; }
                '''
            }
        }

        stage('Prepare artifact') {
            steps {
                sh '''
                    set -e
                    tar -C ${BUILD_DIR} -czf ${APP_NAME}.tar.gz .
                    ls -lh ${APP_NAME}.tar.gz
                '''
                archiveArtifacts artifacts: "${APP_NAME}.tar.gz", fingerprint: true
            }
        }

        stage('Deploy (Local)') {
            steps {
                sh '''
                    set -eu

                    # 릴리즈 경로 만들기 (공유 볼륨으로 바로 씀)
                    TS="$(date +%Y%m%d%H%M%S)"
                    RELEASE_PATH="${RELEASES_DIR}/${TS}"
                    mkdir -p "${RELEASES_DIR}" "${SHARED_DIR}" "${RELEASE_PATH}"

                    # 산출물 풀기
                    tar -C "${RELEASE_PATH}" -xzf "${APP_NAME}.tar.gz"

                    # 상대경로 심볼릭 링크
                    REL_TARGET="$(realpath --relative-to="$(dirname "${CURRENT_LINK}")" "${RELEASE_PATH}")"
                    ln -sfn "${REL_TARGET}" "${CURRENT_LINK}"

                    echo "Deployed to ${CURRENT_LINK} -> ${REL_TARGET}"
                '''
            }
        }

        stage('Clean Deploy History') {
            steps {
                sh '''
                    set -eu
                    cd "${RELEASES_DIR}"
                    # 최신 10개를 제외하고 삭제
                    ls -1dt */ | sed -e '1,10d' | xargs -r -I{} rm -rf "{}"
                '''
            }
        }
    }

    post {
        success { echo "✅ 배포 성공: ${CURRENT_LINK} 갱신 완료" }
        failure { echo '❌ 배포 실패. 콘솔 로그 확인 바랍니다.' }
    }
}
