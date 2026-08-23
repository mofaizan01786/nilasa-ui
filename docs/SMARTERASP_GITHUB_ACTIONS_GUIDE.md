# SmarterASP.NET Auto-Deployment with GitHub Actions (Complete Guide)

This guide provides step-by-step instructions to configure automatic publishing to SmarterASP.NET on every `git push`.

---

## 1. Workflows Implemented

We have created two production-grade GitHub Actions workflows:

1. **.NET Backend Web API** (`mofaizan01786/nilasa-api`):
   - **Path**: `.github/workflows/deploy.yml`
   - **Engine**: Microsoft Web Deploy (MSDeploy) with automated .NET 8.0 SDK restore, build, and publish.
   - **Trigger**: Pushes to `main` branch or manual trigger (`workflow_dispatch`).

2. **Next.js Frontend Storefront** (`mofaizan01786/nilasa-ui`):
   - **Path**: `.github/workflows/deploy.yml`
   - **Engine**: Node.js 20 build + IIS/iisnode packaging (`scripts/package-iis.js`) + FTP synchronization.
   - **Trigger**: Pushes to `main` or `v2-theme` branch or manual trigger (`workflow_dispatch`).

---

## 2. GitHub Secrets Setup (Required)

Go to your repository on GitHub:
👉 **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**

### For `.NET API` Repository (`nilasa-api`):

| Secret Name | Value | Example |
|:---|:---|:---|
| `SMARTERASP_SITE_NAME` | Your SmarterASP website/subsite name | `faizanansari-001-subsite3` |
| `SMARTERASP_PUBLISH_URL` | SmarterASP Web Deploy URL | `https://win6030.site4now.net:8172/msdeploy.axd?site=faizanansari-001-subsite3` |
| `SMARTERASP_USERNAME` | SmarterASP account username | `faizanansari-001` |
| `SMARTERASP_PASSWORD` | SmarterASP account password | *(your SmarterASP password)* |

---

### For `Next.js Frontend` Repository (`nilasa-ui`):

| Secret Name | Value | Example |
|:---|:---|:---|
| `FTP_SERVER` | SmarterASP FTP hostname | `win6030.site4now.net` |
| `FTP_USERNAME` | SmarterASP FTP username | `faizanansari-001` |
| `FTP_PASSWORD` | SmarterASP FTP password | *(your SmarterASP password)* |
| `FTP_SERVER_DIR` | SmarterASP destination folder | `/nilasa/` (or `/` for root site) |
| `NEXT_PUBLIC_API_URL` | Live backend API URL | `http://win6030.site4now.net/api/v1` |

---

## 3. How to Deploy

Whenever you push new changes to GitHub:
```bash
git add .
git commit -m "Auto deploy via GitHub Actions"
git push origin main
```
GitHub Actions will automatically spin up the build runner, compile the project, and upload the build directly to your SmarterASP server!

You can track live deployment progress in GitHub under the **"Actions"** tab.
