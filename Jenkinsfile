pipeline {
  agent any
  options { 
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    skipDefaultCheckout()
  }
  
  environment {
    NODE_VERSION = '23.3.0'
    WORKSPACE_TOOLS = "${WORKSPACE}/.tools"
    PATH = "${WORKSPACE_TOOLS}/node/bin:${WORKSPACE_TOOLS}/aws:${PATH}"
  }
  
  stages {
    stage('Setup') {
      parallel {
        stage('Checkout') {
          steps { 
            checkout scm 
          }
        }
        stage('Install Tools') {
          steps {
            script {
              def needsNode = !fileExists("${WORKSPACE_TOOLS}/node/bin/node")
              def needsAws = !fileExists("${WORKSPACE_TOOLS}/aws/aws")
              
              if (needsNode || needsAws) {
                sh """
                  mkdir -p ${WORKSPACE_TOOLS}
                  cd ${WORKSPACE_TOOLS}
                """
                
                if (needsNode) {
                  sh """
                    echo "[INFO] Installing Node.js ${NODE_VERSION}"
                    curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar -xz --strip-components=1 -C .
                    mkdir -p node && mv bin lib share node/
                  """
                }
                
                if (needsAws) {
                  sh """
                    echo "[INFO] Installing AWS CLI"
                    curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o aws.zip
                    python3 -c "import zipfile; zipfile.ZipFile('aws.zip').extractall('.')"
                    ./aws/install -i . -b aws --update
                    rm -rf aws.zip aws
                  """
                }
              }
            }
          }
        }
      }
    }
    
    stage('Build') {
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            node -v && npm -v
            cp "$ENV_FILE" .env.production
            
            # 캐시 활용한 빠른 설치
            if [ -f package-lock.json ]; then
              npm ci --prefer-offline --no-audit
            else
              npm install --prefer-offline --no-audit
            fi
            
            npm run build
          '''
        }
      }
    }
    
    stage('Deploy') {
      when { 
        anyOf {
          branch 'main'
          branch 'deploy'
        }
      }
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            set -a; . "$ENV_FILE"; set +a
            
            aws --version
            
            # 병렬 업로드 및 CloudFront 무효화
            aws s3 sync dist "s3://$BUCKET_NAME" --delete --region "$AWS_REGION" &
            SYNC_PID=$!
            
            wait $SYNC_PID
            echo "[INFO] S3 sync complete"
            
            aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*" --no-cli-pager
            echo "[INFO] CloudFront invalidation started"
          '''
        }
      }
    }
  }
  
  post {
    always {
      cleanWs(patterns: [[pattern: 'node_modules/**', type: 'EXCLUDE']])
    }
    failure {
      echo "Build failed! Check the logs above."
    }
  }
}
