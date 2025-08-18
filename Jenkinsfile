pipeline {
  agent any
  options { timestamps() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build (Node tarball)') {
      steps {
        withCredentials([file(credentialsId: 'env', variable: 'ENV_FILE')]) {
          sh '''
            set -eu

            # ==== Node 설치 (tarball) ====
            NODE_VERSION="23.3.0"
            NODE_DIR="$WORKSPACE/.node"
            if [ ! -x "$NODE_DIR/bin/node" ]; then
              mkdir -p "$NODE_DIR"
              echo "[INFO] Download Node $NODE_VERSION"
              curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o node.tar.xz
              tar -xJf node.tar.xz --strip-components=1 -C "$NODE_DIR"
              rm -f node.tar.xz
            fi
            export PATH="$NODE_DIR/bin:$PATH"
            node -v
            npm -v

            # ==== 환경파일 주입 ====
            cp "$ENV_FILE" .env.production
            echo "[INFO] .env.production created"

            # ==== 의존성 & 빌드 ====
            if [ -f package-lock.json ]; then
              npm ci || npm install
            else
              npm install
            fi
            npm run build
            test -d dist
          '''
        }
      }
    }

    stage('Deploy (awscli v2 - user install)') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'aws-creds',
                           usernameVariable: 'AWS_ACCESS_KEY_ID',
                           passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
          file(credentialsId: 'env', variable: 'ENV_FILE')
        ]) {
          sh '''
            set -eu

            # env 파일을 환경변수로 export
            set -a
            . "$ENV_FILE"
            set +a

            # ==== AWS CLI v2 사용자 경로 설치 (sudo 불필요) ====
            AWS_BIN="$WORKSPACE/.aws-bin"
            if [ ! -x "$AWS_BIN/aws" ]; then
              echo "[INFO] Installing AWS CLI v2 under $AWS_BIN"
              mkdir -p "$WORKSPACE/.aws-tmp" "$AWS_BIN"
              curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "$WORKSPACE/.aws-tmp/awscliv2.zip"
              # unzip 대체: python으로 압축 해제 (unzip 없을 수 있어)
              if command -v python3 >/dev/null 2>&1; then
                python3 - <<'PY'
import zipfile, sys, os
zf = zipfile.ZipFile(os.environ['WORKSPACE'] + '/.aws-tmp/awscliv2.zip')
zf.extractall(os.environ['WORKSPACE'] + '/.aws-tmp')
PY
              else
                # python 없으면 간단히 unzip 설치 시도(있으면 통과)
                which unzip >/dev/null 2>&1 || true
                unzip "$WORKSPACE/.aws-tmp/awscliv2.zip" -d "$WORKSPACE/.aws-tmp" || { echo "Need python3 or unzip"; exit 1; }
              fi
              "$WORKSPACE/.aws-tmp/aws/install" -i "$WORKSPACE/.aws-cli" -b "$AWS_BIN"
              rm -rf "$WORKSPACE/.aws-tmp"
            fi
            export PATH="$AWS_BIN:$PATH"
            aws --version

            echo "[INFO] Sync to s3://$BUCKET_NAME (region=$AWS_REGION)"
            aws s3 sync dist "s3://$BUCKET_NAME" --delete --region "$AWS_REGION"

            echo "[INFO] Invalidate CloudFront: $CLOUDFRONT_ID"
            aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*"
          '''
        }
      }
    }
  }
}
