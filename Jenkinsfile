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

  stages {   // 👈 반드시 stages 블록 안에 넣어야 함
    stage('Setup') {
      steps {
        sh '''
          echo "[INFO] Tool versions:"
          java -version
          docker --version
          aws --version || echo "Installing AWS CLI..."
        '''
      }
    }

    stage('Build') {
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
        expression { return env.GIT_BRANCH == 'origin/deploy' }
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
