pipeline {
    agent any 

    tools {
        nodejs 'node18'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', credentialsId: 'git', url: 'https://github.com/echuwok12/SplitPayment'
            }
        }

        stage('Install Dependecies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs-- format table -o fs-report.html'
            }
        }

        stage('SonarQube') {
            steps {
                withSonarQubeEnv(credentialsId: 'sonar-token') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner
                            -Dsonar.projectName=projectname \
                            -Dsonar.projectKey=projectname \
                            -Dsonar.sources=. '''
                }
            }
        }

        stage('Quality Gate SonarQube') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run dev'
            }
        }

        stage('Publish Artifact') {
            steps {
                archiveArtifacts artifacts: 'build/**', 
                fingerprint: true
            }
        }

        stage('Docker Image Build Tag &') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred') {
                        sh "docker build -t credetialname/projectname:$IMAGE_TAG"
                    }
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh 'trivy image --format table -o 
                    image-report.html credetialname/projectname:$IMAGE_TAG'
            }
        }

        stage('Push Docker Image') {
            steps {
                script   {
                    withDockerRegistry(credentialsId: 'docker-cred') {
                        sh 'docker push credetialname/projectname:$IMAGE_TAG'
                    }
                }
            }
        }

        stage('Update Manifest File') {
            steps {
                script {
                    cleanWs()

                    withCredentials([usernamePassword(
                        credentialsId: 'git-cred',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_PASSWORD'
                    )]) {
                        sh '''
                            # Clone CD repo (where manifest files are stored)
                            git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/myorg/my-node-cd-repo.git

                            cd my-node-cd-repo

                            # Update Docker image tag in manifest.yaml
                            cd SplitPayment-CD
                            sed -i "s|myorg/my-node-app:.*|myorg/my-node-app:${IMAGE_TAG}|" k8s/manifest.yaml

                            # Show updated manifest
                            echo "Updated manifest file:"
                            cat k8s/manifest.yaml

                            # Commit and push changes
                            git config user.email "jenkins@ci.com"
                            git config user.name "Jenkins"
                            git add k8s/manifest.yaml
                            git commit -m "Update image tag to ${IMAGE_TAG}"
                            git push origin main
                        '''
                    }
                }
            }
        }

        post {
            always {
                script {
                    def jobName = env.JOB_NAME
                    def buildNumber = env.BUILD_NUMBER
                    def pipelineStatus = currentBuild.result ?: 'UNKNOWN'
                    def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'

                    def body = """
                        <html>
                        <body>
                            <div style="border: 4px solid ${bannerColor}; padding: 10px;">
                                <h2>${jobName} - Build ${buildNumber}</h2>
                                <div style="background-color: ${bannerColor}; color: white; padding: 5px;">
                                    <h3>Status: ${pipelineStatus.toUpperCase()}</h3>
                                </div>

                                <p> Check the Jenkins <a href="${BULD_URL}"> console output for more details:
                            </div>
                        </body>
                        </html>
                    """

                    emailext (
                        subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus}",
                        body: body,
                        to: "bachtalapro@gmail.com"
                        from: "",
                        replyTo: "",
                        mimeType: 'text/html'
                    )
                }
            }
        }
    }
}