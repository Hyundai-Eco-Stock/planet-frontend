pipeline {
  agent any

  options {
    timeout(time: 45, unit: 'MINUTES')
    ansiColor('xterm')
  }

  environment {
    VITE_API_URL = credentials('vite-api-url')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Ensure Node.js') {
      steps {
        sh '''
          set -euxo pipefail
          if command -v node >/dev/null 2>&1; then
            echo "node found: $(node --version)"
          else
            echo "node not found. Attempting install via NodeSource (Node 18 LTS)."
            if command -v curl >/dev/null 2>&1 && command -v apt-get >/dev/null 2>&1; then
              curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
              apt-get update -y
              apt-get install -y nodejs build-essential
              echo "node installed: $(node --version)"
            else
              echo "Cannot install node: apt-get or curl not available. Please provide node on agent or enable Docker agent."
              exit 1
            fi
          fi
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Create .env.production') {
      steps {
        sh "printf 'VITE_API_URL=%s\\n' \"${VITE_API_URL}\" > .env.production"
      }
    }

    stage('Build React app') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Prepare AWS CLI & Verify creds') {
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws-region', variable: 'AWS_REGION')
        ]) {
          sh '''
            set -euxo pipefail

            # aws CLI 설치(없을 때)
            if ! command -v aws >/dev/null 2>&1; then
              echo "aws not found; attempting to install"
              if command -v pip3 >/dev/null 2>&1; then
                pip3 install --user --upgrade awscli
                export PATH="$HOME/.local/bin:$PATH"
              elif command -v apt-get >/dev/null 2>&1; then
                apt-get update -y
                apt-get install -y python3-pip
                pip3 install --user --upgrade awscli
                export PATH="$HOME/.local/bin:$PATH"
              else
                echo "No pip3/apt-get available to install aws. Please provide awscli on the agent."
                exit 1
              fi
            fi

            echo "aws version: $(aws --version || true)"
            aws configure set region "${AWS_REGION}" --profile jenkins-temp || true

            echo "Verifying AWS credentials..."
            aws sts get-caller-identity --output json
          '''
        }
      }
    }

    stage('Deploy to S3') {
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'bucket-name', variable: 'BUCKET_NAME'),
          string(credentialsId: 'aws-region', variable: 'AWS_REGION')
        ]) {
          sh '''
            set -euxo pipefail

            BUILD_DIR="dist"
            if [ ! -d "${BUILD_DIR}" ]; then
              BUILD_DIR="build"
            fi
            if [ ! -d "${BUILD_DIR}" ]; then
              echo "No build output found (dist/ or build/)."
              exit 1
            fi

            # 간단한 재시도 루프 (3번)
            n=0
            until [ $n -ge 3 ]
            do
              aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}" --delete --region "${AWS_REGION}" && break
              n=$((n+1))
              echo "s3 sync failed; retry $n/3..."
              sleep 2
            done
            if [ $n -ge 3 ]; then
              echo "s3 sync failed after retries"
              exit 1
            fi
          '''
        }
      }
    }

    stage('CloudFront Invalidate') {
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'cloudfront-id', variable: 'CLOUDFRONT_ID'),
          string(credentialsId: 'aws-region', variable: 'AWS_REGION')
        ]) {
          sh '''
            set -euxo pipefail
            aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_ID}" --paths "/*"
          '''
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
      deleteDir()
    }
  }
}
