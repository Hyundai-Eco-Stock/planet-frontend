pipeline {
  agent {
    docker {
      image 'node:23-alpine'
      args '--user root'
    }
  }

  options { 
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
  }

  stages {
    stage('Setup') {
      when {
        anyOf {
          expression { return env.GIT_BRANCH == 'origin/deploy' }
          allOf {
            expression { return env.GIT_BRANCH == 'origin/deploy' }
            expression { return env.CHANGE_ID == null }
          }
        }
      }
      steps {
        sh '''
          echo "[INFO] Installing dependencies..."
          apk add --no-cache python3 py3-pip curl unzip
          
          echo "[INFO] Installing AWS CLI..."
          pip3 install awscli --break-system-packages
          
          echo "[INFO] Tool versions:"
          node -v
          npm -v
          aws --version
        '''
      }
    }

    stage('Build') {
      when {
        anyOf {
          expression { return env.GIT_BRANCH == 'origin/deploy' }
          allOf {
            expression { return env.GIT_BRANCH == 'origin/deploy' }
            expression { return env.CHANGE_ID == null }
          }
        }
      }
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            echo "[INFO] Setting up environment..."
            cp "$ENV_FILE" .env.production

            echo "[INFO] Installing dependencies..."
            if [ -f package-lock.json ]; then
              npm ci --prefer-offline --no-audit
            else
              npm install --prefer-offline --no-audit
            fi

            echo "[INFO] Building project..."
            npm run build
            ls -la dist/
          '''
        }
      }
    }

    stage('Deploy') {
      when {
        anyOf {
          expression { return env.GIT_BRANCH == 'origin/deploy' }
          allOf {
            expression { return env.GIT_BRANCH == 'origin/deploy' }
            expression { return env.CHANGE_ID == null }
          }
        }
      }
      steps {
        withCredentials([
          string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            set -a; . "$ENV_FILE"; set +a

            echo "[INFO] Deploying to S3: s3://$BUCKET_NAME"
            aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --region "$AWS_REGION"

            echo "[INFO] CloudFront invalidation: $CLOUDFRONT_ID"
            aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*"

            echo "[INFO] ✅ Deploy complete!"
          '''
        }
      }
    }
  }

  post {
    success {
      echo "🎉 Success!"
    }
    failure {
      echo "❌ Failed!"
    }
  }
}
