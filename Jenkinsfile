pipeline {
  agent any
  
  options { 
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
  }
  
  stages {
    stage('Setup & Build') {
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            echo "[INFO] Installing Node.js 20 LTS..."
            if [ ! -f /tmp/node ]; then
              curl -fsSL https://nodejs.org/dist/v20.18.1/node-v20.18.1-linux-x64.tar.gz | tar -xz -C /tmp --strip-components=1
            fi
            export PATH="/tmp/bin:$PATH"
            
            node -v && npm -v
            cp "$ENV_FILE" .env.production
            
            if [ -f package-lock.json ]; then
              npm ci --prefer-offline --no-audit
            else
              npm install --prefer-offline --no-audit
            fi
            
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
            
            echo "[INFO] Using existing AWS CLI..."
            export PATH="/usr/local/aws-cli/v2/current/bin:$PATH"
            aws --version
            
            export PATH="/usr/local/aws-cli/v2/current/bin:$PATH"
            
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
