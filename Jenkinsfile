pipeline {
  agent none
  options { timestamps() }

  stages {
    stage('Checkout') {
      agent any
      steps {
        checkout scm   // 멀티브랜치면 이대로, 단일잡이면 git url/cred로 체크아웃
      }
    }

    stage('Build (Node 23)') {
      agent { docker { image 'node:23' } }
      environment {
        // 파일 크리덴셜(.env)을 워크스페이스에 복사
      }
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            echo "[INFO] bring secret env file"
            cp "$ENV_FILE" .env.production

            echo "[INFO] Node version"
            node -v
            npm -v

            npm ci || npm install
            npm run build
          '''
        }
      }
    }

    stage('Deploy to S3') {
      // AWS CLI가 들어있는 공식 이미지 사용
      agent { docker { image 'amazon/aws-cli:2' } }
      environment {
        // env 파일을 쉘 환경변수로 export
      }
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'aws-creds',
                           usernameVariable: 'AWS_ACCESS_KEY_ID',
                           passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            set -eu
            # .env.production 에서 변수들을 export
            set -a
            . "$ENV_FILE"
            set +a

            echo "[INFO] Deploy dist -> s3://$BUCKET_NAME (region=$AWS_REGION)"
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
