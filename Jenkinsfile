pipeline {
    agent any

    environment {
        GIT_CREDENTIALS_ID = 'PAT'
        SSH_CREDENTIALS_ID = 'Jenkins_SSH'
        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = 'k11a204.p.ssafy.io'
        REMOTE_PROJECT_PATH = '/home/ubuntu/modumotu'
        BRANCH_NAME = 'master'
        ENV_FILE_PATH = '/home/ubuntu/.env'
        DOCKER_COMPOSE_PATH = '/home/ubuntu/modumotu/docker-compose.yml'
        DOCKER_NETWORK = 'modumotu_app_app_network'
        DOCKER_PROJECT_NAME = 'modumotu_app'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitLab...'
                git branch: "$BRANCH_NAME", credentialsId: "$GIT_CREDENTIALS_ID", url: 'https://lab.ssafy.com/s11-final/S11P31A204.git'
            }
        }

        stage('Build and Deploy to EC2 Server') {
            steps {
                echo 'Starting deployment to EC2 server...'
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_USER@$REMOTE_HOST <<EOF
                        set -e
                        echo 'Connected to EC2 instance.'
                        
                        echo 'Navigating to project directory...'
                        cd $REMOTE_PROJECT_PATH || exit 1

                        echo 'Updating codebase...'
                        git fetch origin || exit 1
                        git reset --hard origin/$BRANCH_NAME || exit 1

                        echo 'Linking environment file...'
                        ln -sf $ENV_FILE_PATH django_back/.env || exit 1

                        echo 'Starting Docker containers...'
                        docker-compose -p $DOCKER_PROJECT_NAME down --remove-orphans || exit 1
                        docker-compose -p $DOCKER_PROJECT_NAME up -d --build --remove-orphans || exit 1

                        echo 'Verifying Docker network...'
                        docker network inspect $DOCKER_NETWORK || exit 1

                        echo 'Deployment completed successfully.'
EOF
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Deployment was successful!'
        }
        failure {
            echo 'Deployment failed. Please check the logs for details.'
        }
    }
}
