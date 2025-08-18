pipeline {
  agent any

  triggers {
    githubPush()
  }

  environment {
    NODE_VERSION = '23'
    // VITE API URL은 빌드 시 파일에 삽입하므로 environment로만 둠(Secret text 가능)
    VITE_API_URL = credentials('vite-api-url')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node.js') {
      steps {
        script {
          nodejs(nodeJSInstallationName: 'nodejs-23') {
            sh 'node --version; npm --version'
          }
        }
      }
    }

    stage('Install dependencies') {
      steps {
        nodejs(nodeJSInstallationName: 'nodejs-23') {
          sh 'npm ci'
        }
      }
    }

    stage('Create .env.production') {
      steps {
        script {
          writeFile file: '.env.production', text: "VITE_API_URL=${VITE_API_URL}"
        }
      }
    }

    stage('Build React app') {
      steps {
        nodejs(nodeJSInstallationName: 'nodejs-23') {
          sh 'npm run build'
        }
      }
    }

    // === AWS 관련 스테이지들 ===
    // 민감 정보(키)와 환경값은 withCredentials로 바인딩하여 사용 (scope 최소화)
    stage('Deploy to S3') {
      steps {
        script {
          // 필요한 credential들만 이 블록 내에서 활성화
          withCredentials([
            string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: 'bucket-name', variable: 'BUCKET_NAME'),
            string(credentialsId: 'aws-region', variable: 'AWS_REGION')
          ]) {
            sh '''
              set -euo pipefail
              # aws CLI가 없다면 간단히 설치(다른 환경에서는 관리자 이미지로 awscli 포함 권장)
              if ! command -v aws >/dev/null 2>&1; then
                echo "aws cli not found — attempting pip install (may require python3/pip)"
                if command -v pip3 >/dev/null 2>&1; then
                  pip3 install --user awscli
                  export PATH="$HOME/.local/bin:$PATH"
                else
                  echo "pip3 not found. Please ensure aws cli is available on agent."
                  exit 1
                fi
              fi

              echo "Using AWS region: ${AWS_REGION}"
              aws configure set region "${AWS_REGION}"

              # 파일 위치: 빌드 출력이 dist/ 인지 확인. Vite 기본은 dist/
              BUILD_DIR="dist"
              if [ ! -d "${BUILD_DIR}" ]; then
                echo "Build directory ${BUILD_DIR} not found — trying 'build'..."
                BUILD_DIR="build"
              fi
              if [ ! -d "${BUILD_DIR}" ]; then
                echo "No build directory found. Aborting."
                exit 1
              fi

              echo "Syncing ${BUILD_DIR} -> s3://${BUCKET_NAME}"
              aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}" --delete --region "${AWS_REGION}"
            '''
          } // withCredentials
        }
      }
    }

    stage('CloudFront Invalidate') {
      steps {
        script {
          withCredentials([
            string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: 'cloudfront-id', variable: 'CLOUDFRONT_ID'),
            string(credentialsId: 'aws-region', variable: 'AWS_REGION')
          ]) {
            sh '''
              set -euo pipefail
              if ! command -v aws >/dev/null 2>&1; then
                echo "aws cli not found. Please ensure aws cli is available on agent."
                exit 1
              fi

              echo "Creating CloudFront invalidation for distribution ${CLOUDFRONT_ID}"
              aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_ID}" --paths "/*"
            '''
          }
        }
      }
    }

  } // stages

  post {
    success {
      echo 'Deploy to CloudFront completed successfully!'
    }
    failure {
      echo 'Deploy to CloudFront failed!'
    }
    always {
      // 안전한 워크스페이스 정리: cleanWs는 Declarative에서 node context 문제를 피함
      cleanWs()
    }
  }
}
