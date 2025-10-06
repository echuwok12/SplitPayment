# TripSplitter

# TripSplitter – End-to-End CI/CD on Azure with Jenkins, AKS, and Harbor

**TripSplitter** is a full-stack NodeJS application deployed on **Microsoft Azure** using a complete **DevOps toolchain**.
It demonstrates how to design and automate an end-to-end **CI/CD workflow** with security scanning, containerization, infrastructure-as-code, and automated deployment to Kubernetes.

---

## 🏗️ Project Overview

TripSplitter is a **web application** that allows users to split trip expenses among group members.
It is a combined **frontend + backend** Node.js app that connects to a **PostgreSQL** database running inside an **Azure Kubernetes Service (AKS)** cluster.

The system is designed with **four repositories**, each serving a dedicated function in the CI/CD and IaC workflow:

| Repository                 | Purpose                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| **TripSplitter-App**       | Contains the full-stack JavaScript source code and `Dockerfile` for building the runtime image.       |
| **TripSplitter-CI**        | Jenkins CI pipeline responsible for building, scanning, and publishing the Docker image.                  |
| **TripSplitter-CD**        | Jenkins CD pipeline that updates Kubernetes manifests and deploys to AKS.                                 |
| **TripSplitter-Terraform** | Infrastructure-as-Code repository used to provision Azure resources such as AKS, networking, and storage. |

---

## ☁️ Azure Infrastructure

All cloud resources are provisioned and managed on **Azure**, using the **Terraform** repository.

### **Azure Services Used**

| Service                             | Purpose                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| **Azure Kubernetes Service (AKS)**  | Hosts the TripSplitter app and PostgreSQL database.                               |
| **Azure Container Storage (CSI)**   | Provides persistent storage for PostgreSQL via a `StorageClass`.                  |
| **Azure Virtual Network + Subnets** | Connects AKS nodes securely to other Azure services.                              |
| **Azure Resource Group**            | Logical grouping for all project components.                                      |
| **Azure VM (DevOps Server)**        | Central server hosting Jenkins, Harbor, SonarQube, Trivy, and other DevOps tools. |
| **Azure DNS / DuckDNS**             | Provides external DNS records for Jenkins, Harbor, and TripSplitter ingress.      |

All infrastructure can be deployed automatically using Terraform commands:

```bash
terraform init
terraform plan
terraform apply
```

---

## ⚙️ DevOps Architecture

### **Overview Diagram**

```
                +----------------------+
                |  DevOps VM (Azure)   |
                |----------------------|
                | Jenkins (CI/CD)      |
                | Harbor (Registry)    |
                | SonarQube            |
                | Trivy                |
                +----------+-----------+
                           |
                           | Push/Pull Container Images
                           v
                +----------------------+
                |   Azure AKS Cluster  |
                |----------------------|
                | TripSplitter App     |
                | PostgreSQL Database  |
                | Cert-Manager + Ingress|
                +----------+-----------+
                           |
                           v
                  myapp.duckdns.org
```

---

## 🧩 CI/CD Workflow

### **Continuous Integration (CI)**

The CI pipeline (defined in `TripSplitter-CI` repo) automates:

1. **Git Checkout** from the main application repository.
2. **Dependency Installation** using `npm install`.
3. **Unit Testing** using Jest or Mocha.
4. **Static Code Analysis** via **SonarQube**.
5. **Filesystem Vulnerability Scan** using **Trivy**.
6. **Docker Image Build** using `Dockerfile`.
7. **Container Image Scan** (Trivy).
8. **Push to Harbor Registry**.
9. **Update Manifest in CD Repo** and trigger CD job.

🧱 **Image Naming Convention**

```
harbor.duckdns.org/tripsplitter/tripapp:v<BUILD_NUMBER>
```

---

### **Continuous Deployment (CD)**

The CD pipeline (in `TripSplitter-CD` repo):

1. Clones the CD repository.
2. Updates the image tag in `deploy/myapp/deployment.yaml` using `yq`.
3. Applies the updated manifests to the **AKS cluster** using `kubectl`.
4. Verifies rollout status.

Deployment components in AKS include:

* **TripSplitter App** Deployment & Service
* **PostgreSQL** Deployment, PVC, and ConfigMap
* **Ingress** managed by **Cert-Manager** for HTTPS
* **ClusterIssuer** (Let’s Encrypt) for automated TLS certificates

---

## 🐳 Containerization

Each component of the project is containerized using Docker.

### **TripSplitter Runtime Image**
* **Purpose**: Combines frontend and backend into a single container

### **PostgreSQL**

* Uses official `postgres:15` image
* Persistent data stored via Azure-managed PVC

---

## 🔐 Security & Quality

| Tool                           | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| **SonarQube**                  | Code quality, maintainability, and bug detection                   |
| **Trivy**                      | Container and filesystem vulnerability scanning                    |
| **HashiCorp Vault (optional)** | Centralized secret management for K8s secrets                      |
| **Cert-Manager**               | Automatic HTTPS/TLS certificate issuance via Let’s Encrypt         |
| **Harbor**                     | Private Docker image registry with vulnerability scanning and RBAC |

---

## 📦 Kubernetes Components

| Component                 | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| **Namespace**             | `tripapp`                                               |
| **StorageClass**          | Uses Azure CSI driver (`Standard_LRS`)                  |
| **PersistentVolumeClaim** | Binds PostgreSQL storage to AKS disk                    |
| **Service**               | Internal networking for PostgreSQL and TripSplitter app |
| **Ingress**               | External access via `tripapp.duckdns.org` with TLS        |
| **ClusterIssuer**         | Cert-Manager configuration for Let’s Encrypt            |

---

## 🧰 Jenkins Setup

The Jenkins master (on the DevOps VM) orchestrates both pipelines:

| Pipeline        | File                          | Key Tools                         |
| --------------- | ----------------------------- | --------------------------------- |
| **CI Pipeline** | `TripSplitter-CI/Jenkinsfile` | Node.js, Docker, SonarQube, Trivy |
| **CD Pipeline** | `TripSplitter-CD/Jenkinsfile` | yq, kubectl, Helm, Azure CLI      |

---

## 🔄 Repository Summary

| Repo                       | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| **TripSplitter-App**       | Full-stack Node.js app (frontend + backend) + `Dockerfile`     |
| **TripSplitter-CI**        | Jenkinsfile for CI build, scan, and push                           |
| **TripSplitter-CD**        | Jenkinsfile for deployment to AKS                                  |
| **TripSplitter-Terraform** | Terraform IaC for provisioning AKS, VNet, and supporting resources |

---

## 🚀 Deployment Process Summary

1. **Developer commits code** → triggers Jenkins CI pipeline.
2. Jenkins:

   * Builds and tests the app.
   * Scans source and Docker image.
   * Pushes built image to **Harbor**.
   * Updates deployment manifest in CD repo.
3. Jenkins CD pipeline:

   * Applies updated manifest to AKS.
   * Cert-Manager provisions HTTPS.
   * The new version of TripSplitter is live on `https://tripapp.duckdns.org`.

---

## 🧾 Author

**Bach Pham**
DevOps Engineer | Cloud Infrastructure | CI/CD Automation
📧 [bachtalapro@gmail.com](mailto:bachtalapro@gmail.com)

**Hoang Duy Linh Tran**
JavaScript Engineer | Cloud Infrastructure | CI/CD Automation
📧 [duylinh2904@gmail.com](mailto:duylinh2904@gmail.com)

---
