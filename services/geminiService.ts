import { GoogleGenAI } from "@google/genai";

const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      return "Error: API key is not configured. Please set the API_KEY environment variable.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `An error occurred while communicating with the AI. Details: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const getProjectSetup = (projectType: string, commitMessage: string) => {
  const prompt = `
    Act as an AI DevOps Engineer setting up a CI/CD pipeline.
    The user has selected a "${projectType}" project type and provided the commit message: "${commitMessage}".

    Based on this, perform the following actions:
    1.  **Project Detection**: Briefly confirm the detected project type and its typical stack (e.g., Node.js with Express, React with Vite).
    2.  **Pipeline Configuration**: Generate a simple, generic pipeline configuration file in YAML format (like a GitHub Actions workflow or cloudbuild.yaml). This should include placeholder steps for 'build', 'test', and 'deploy'.

    Format the entire output as markdown.
  `;
  return getAIResponse(prompt);
};

export const getSecurityScan = (commitMessage: string) => {
  const prompt = `
    Act as an AI Security Analyst integrated into a CI/CD pipeline.
    For a commit with the message "${commitMessage}", perform a focused security scan.

    Your report, formatted in markdown, should identify:
    1.  **Vulnerability Check**: Identify one potential security vulnerability (e.g., dependency vulnerability (like a CVE in a library), hardcoded secret, or insecure API endpoint).
    2.  **Best Practice Recommendation**: Suggest one security best practice relevant to the commit.

    Keep the analysis concise and actionable.
  `;
  return getAIResponse(prompt);
};


export const getCodeAnalysis = (commitMessage: string) => {
  const prompt = `
    Act as an expert AI code reviewer integrated into a CI/CD pipeline. 
    A separate security scan has already been performed.
    For a commit with the message "${commitMessage}", provide a brief, markdown-formatted report focusing on non-security aspects.
    The report should have two sections:
    1.  **Maintainability**: Suggest one improvement for code clarity, readability, or structure.
    2.  **Performance**: Point out one potential performance bottleneck or optimization.
    
    Keep the analysis concise and actionable.
  `;
  return getAIResponse(prompt);
};

export const getTestCases = (commitMessage: string) => {
  const prompt = `
    Act as an AI QA engineer in a CI/CD pipeline. 
    For a commit with the message "${commitMessage}", generate a list of 3 to 4 critical, high-level test cases to validate the changes.
    Format the output as a markdown bulleted list. Prioritize end-to-end and integration tests over simple unit tests.
  `;
  return getAIResponse(prompt);
};

export const getFailureAnalysis = (commitMessage: string, errorLog: string, userContext: string) => {
  const userContextPrompt = userContext
    ? `The user has provided the following additional context to focus on: "${userContext}"`
    : '';

  const prompt = `
    Act as an AI Site Reliability Engineer (SRE) diagnosing a CI/CD pipeline failure.
    The commit message was: "${commitMessage}".
    The build failed with the following error log:
    \`\`\`
    ${errorLog}
    \`\`\`
    ${userContextPrompt}
    Provide a brief, markdown-formatted root cause analysis with two sections:
    1.  **Likely Cause**: What is the most probable reason for the failure?
    2.  **Suggested Fix**: What is the recommended action to resolve this issue?
  `;
  return getAIResponse(prompt);
};

export const getDeploymentStrategy = (commitMessage: string) => {
  const prompt = `
    Act as an AI DevOps specialist advising on a deployment.
    The upcoming deployment includes the change: "${commitMessage}".
    Recommend a suitable gradual rollout strategy (e.g., Canary, Blue-Green, Rolling Update).
    Provide a brief, markdown-formatted response with two sections:
    1.  **Recommendation**: The name of the recommended strategy.
    2.  **Rationale**: A short explanation for why this strategy is a good fit for this type of change.
  `;
  return getAIResponse(prompt);
};

export const getReleaseNotes = (commitMessage: string) => {
  const prompt = `
    Act as an AI Technical Writer generating release notes.
    The commit for the new release is: "${commitMessage}".
    Generate concise, user-friendly release notes in markdown format.
    Include three sections:
    1.  **Summary**: A one-sentence overview of the change.
    2.  **Key Changes**: A bulleted list of 2-3 specific updates.
    3.  **Potential Risks**: A brief note on any potential risks or areas to monitor post-deployment.
  `;
  return getAIResponse(prompt);
};

export const getRollbackAnalysis = (commitMessage: string, deploymentError: string) => {
    const prompt = `
    Act as an expert AI Site Reliability Engineer (SRE) performing an emergency rollback and providing a clear, actionable root cause analysis hint for the on-call engineer.

    The deployment for commit "${commitMessage}" has failed in production with the following critical error:
    \`\`\`
    ${deploymentError}
    \`\`\`

    Your task is to provide a brief, markdown-formatted report with two sections:

    1.  **Action Taken**: State clearly and confidently that the previous stable version has been automatically redeployed to restore service. This is the top priority.

    2.  **Post-Rollback Triage**: This is the most critical part of your response. Based *specifically* on the deployment error provided, suggest 1-2 immediate, targeted, and easy-to-understand actions for the on-call engineer to begin their investigation. Your suggestions should be diagnostic, not just a restatement of the error. Guide them on *where* to look and *what* to check.

    ---

    **Crucial Guidelines for Triage Suggestions:**

    *   **Be Specific:** Don't just say "check the logs." Say "Examine the application startup logs from the failed container/pod just before the rollback was initiated. Look for stack traces or database connection errors."
    *   **Be Context-Aware:** Your advice must directly relate to the error message.
    *   **Format for Clarity:** Use bullet points or numbered lists for the triage steps.

    **Examples of High-Quality Triage Suggestions:**

    *   **If the error is \`Invalid credentials\` or \`Authentication Failed\`:**
        *   "**Check Secret Management:** Verify that the correct database/API credentials are set and have been successfully mounted in the production environment variables or secret manager (e.g., AWS Secrets Manager, HashiCorp Vault)."
        *   "**Review Recent Changes:** Check for any recent credential rotations or IAM policy changes that might have affected the application's access."

    *   **If the error is \`CrashLoopBackOff\`:**
        *   "**Examine Application Logs:** The primary suspect is a fatal application error on startup. Check the logs from the failed pod (\`kubectl logs <pod-name-previous>\`) to identify the exact stack trace or error message that caused the crash."
        *   "**Verify Configuration:** Ensure all required environment variables and configuration maps are present and correctly formatted for the production environment."

    *   **If the error is \`ImagePullBackOff\` or \`ErrImagePull\`:**
        *   "**Confirm Image Tag and Registry:** Double-check that the container image tag specified in the deployment manifest exists in the container registry (e.g., GCR, Docker Hub, ECR)."
        *   "**Check Cluster Permissions:** Ensure the production cluster's service account or node IAM role has the necessary permissions to pull images from the specified registry."

    *   **If the error is \`502 Bad Gateway\` or a failed health check:**
        *   "**Inspect Health Check Endpoint:** Review the application's health check endpoint (\`/health\`, \`/ping\`, etc.). It might be failing due to a downstream dependency issue."
        *   "**Test Dependencies:** Check for connectivity issues to critical dependencies like databases, caches, or external APIs that might be failing during the application's startup sequence."
  `;
  return getAIResponse(prompt);
};
