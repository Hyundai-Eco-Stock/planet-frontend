pipeline {
    agent any
    
    triggers {
        // GitHub 웹훅을 통해 push 이벤트 감지
        githubPush()
        // Pull Request 이벤트는 GitHub 플러그인을 통해 처리
    }
    
    environment {
        NODE_VERSION = '23'
        AWS_DEFAULT_REGION = ('aws-region')
        // Jenkins에서 Credentials로 관리되는 환경 변수들
        AWS_ACCESS_KEY_ID = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        VITE_API_URL = credentials('vite-api-url')
        BUCKET_NAME = credentials('bucket-name')
        AWS_REGION = credentials('aws-region')
        CLOUDFRONT_ID = credentials('cloudfront-id')
    }
    
    stages {
        stage('Github Repository 파일 불러오기') {
            steps {
                // Jenkins는 기본적으로 소스코드를 체크아웃함
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    // Node.js 설치 (NodeJS Plugin 사용)
                    nodejs(nodeJSInstallationName: 'nodejs-23') {
                        sh 'node --version'
                        sh 'npm --version'
                    }
                }
            }
        }
        
        stage('Install dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'nodejs-23') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Create .env.production') {
            steps {
                script {
                    writeFile file: '.env.production', text: "VITE_API_URL=${VITE_API_URL}"
                }
            }
        }
        
        stage('Build React app') {
            steps {
                nodejs(nodeJSInstallationName: 'nodejs-23') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy to S3') {
            steps {
                script {
                    // AWS CLI를 사용한 S3 동기화
                    sh """
                        aws s3 sync dist/ s3://${BUCKET_NAME} --delete --region ${AWS_REGION}
                    """
                }
            }
        }
        
        stage('CloudFront 캐시 무효화') {
            steps {
                script {
                    sh """
                        aws cloudfront create-invalidation \\
                            --distribution-id ${CLOUDFRONT_ID} \\
                            --paths "/*"
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deploy to CloudFront completed successfully!'
        }
        failure {
            echo 'Deploy to CloudFront failed!'
        }
        cleanup {
            // 빌드 후 정리 작업
            deleteDir()
        }
    }
}
