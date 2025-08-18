pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build (Node via nvm)') {
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            set -euxo pipefail

            # nvm 설치 (재실행시 캐시됨)
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            . "$NVM_DIR/nvm.sh"

            # Node 23 설치/사용
            nvm install 23
            nvm use 23
            node -v
            npm -v

            # 프론트 빌드용 환경파일 주입
            cp "$ENV_FILE" .env.production

            npm ci || npm install
            npm run build
          '''
        }
      }
    }

    stage('Deploy (awscli)') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'aws-creds',
                           usernameVariable: 'AWS_ACCESS_KEY_ID',
                           passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            set -euxo pipefail

            # env 파일을 환경변수로 export
            set -a
            . "$ENV_FILE"
            set +a

            # awscli 설치 (없으면)
            if ! command -v aws >/dev/null 2>&1; then
              python3 -m pip install --user --upgrade awscli
              export PATH="$HOME/.local/bin:$PATH"
            fi

            aws --version
            test -d dist

            echo "[INFO] Sync to s3://$BUCKET_NAME (region=$AWS_REGION)"
            aws s3 sync dist "s3://$BUCKET_NAME" --delete --region "$AWS_REGION"

            echo "[INFO] Invalidate CloudFront: $CLOUDFRONT_ID"
            aws cloudfront create-invalidation \
              --distribution-id "$CLOUDFRONT_ID" \
              --paths "/*"
          '''
        }
      }
    }
  }
}
