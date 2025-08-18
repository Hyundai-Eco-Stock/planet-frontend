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
            set -a; . "$ENV_FILE"; set +a
            
            if [ ! -f /tmp/aws ]; then
              curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscli.zip
              cd /tmp && unzip -q awscli.zip && ./aws/install -b /tmp && rm -rf awscli.zip aws
            fi
            
            export PATH="/tmp:$PATH"
            aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --region "$AWS_REGION"
            aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*"
          '''
        }
      }
    }
  }
}
