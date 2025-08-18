pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args '''
        -v /var/run/docker.sock:/var/run/docker.sock
        --user 0:0
      '''
    }
  }
  
  options { 
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
  }
  
  stages {
    stage('Setup') {
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
            
            echo "[INFO] Build complete!"
            ls -la dist/
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
          usernamePassword(credentialsId: 'aws-creds', 
                           usernameVariable: 'AWS_ACCESS_KEY_ID', 
                           passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            # Load environment variables
            set -a
            . "$ENV_FILE"
            set +a
            
            echo "[INFO] Deploying to S3..."
            aws s3 sync dist/ "s3://$BUCKET_NAME" \
              --delete \
              --region "$AWS_REGION" \
              --cache-control "public, max-age=31536000" \
              --exclude "*.html" \
              --exclude "*.json"
            
            # HTML과 JSON은 캐시 없이
            aws s3 sync dist/ "s3://$BUCKET_NAME" \
              --region "$AWS_REGION" \
              --cache-control "no-cache" \
              --include "*.html" \
              --include "*.json"
            
            echo "[INFO] Creating CloudFront invalidation..."
            INVALIDATION_ID=$(aws cloudfront create-invalidation \
              --distribution-id "$CLOUDFRONT_ID" \
              --paths "/*" \
              --query 'Invalidation.Id' \
              --output text)
            
            echo "[INFO] Invalidation created: $INVALIDATION_ID"
            echo "[INFO] Deployment complete!"
          '''
        }
      }
    }
  }
  
  post {
    always {
      echo "Pipeline finished!"
    }
    success {
      echo "🎉 Build and deployment successful!"
    }
    failure {
      echo "❌ Build failed! Check the logs above."
    }
  }
}
