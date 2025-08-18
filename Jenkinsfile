pipeline {
  // Docker-based agent so we don't rely on NodeJS plugin/tool config
  agent {
    docker {
      image 'node:23-bullseye'   // debian 기반 node 이미지 - apt / pip 사용 가능
      args '--network host'      // 필요시 네트워크 설정 (선택)
    }
  }

  triggers {
    githubPush()
  }

  environment {
    // Non-secret build-time value from Jenkins Credentials (secret text)
    VITE_API_URL = credentials('vite-api-url')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Create .env.production') {
      steps {
        sh "printf 'VITE_API_URL=%s' \"${VITE_API_URL}\" > .env.production"
      }
    }

    stage('Build React app') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Prepare AWS CLI & Verify creds') {
      steps {
        // bind AWS keys only inside this block
        withCredentials([
          string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'aws-region', variable: 'AWS_REGION')
        ]) {
          sh '''
            set -euxo pipefail

            # Ensure aws CLI available. Try multiple installation strategies.
            if ! command -v aws >/dev/null 2>&1; then
              echo "aws CLI not found. Attempting installation..."

              if command -v pip3 >/dev/null 2>&1; then
                pip3 install --user --upgrade awscli
                export PATH="$HOME/.local/bin:$PATH"
              else
                # try apt (node:*-bullseye should have apt)
                if command -v apt-get >/dev/null 2>&1; then
                  apt-get update -y
                  apt-get install -y python3-pip
                  pip3 install --upgrade awscli
                else
                  echo "No pip3 or apt-get available. Install awscli on the agent image."
                  exit 1
                fi
              fi
            fi

            echo "aws version: $(aws --version || true)"

            # minimal AWS configuration
            aws configure set region "${AWS_REGION}" --profile jenkins-temp || true

            # quick check to ensure credentials are valid
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
              echo "dist not found, trying build/"
              BUILD_DIR="build"
            fi
            if [ ! -d "${BUILD_DIR}" ]; then
              echo "No build output found (dist/ or build/)."
              exit 1
            fi

            echo "Syncing ${BUILD_DIR} -> s3://${BUCKET_NAME}"
            aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}" --delete --region "${AWS_REGION}"
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

            echo "Creating CloudFront invalidation for distribution ${CLOUDFRONT_ID}"
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
      // deleteDir() executed inside agent (docker) context => safe
      script {
        deleteDir()
      }
    }
  }
}
