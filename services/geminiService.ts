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

    Perform the following actions and output in Markdown:
    1.  **Architecture Visualization**: Create a text-based ASCII diagram illustrating the proposed pipeline architecture (e.g., Commit -> Build -> Test -> Deploy).
    2.  **Stack Summary**: Create a Markdown Table summarizing the detected languages, frameworks, and recommended tools.
    3.  **Pipeline Config**: Generate a brief YAML snippet for the build step.
  `;
  return getAIResponse(prompt);
};

export const getMergeConflictAnalysis = (commitMessage: string) => {
    const prompt = `
      Act as an AI Version Control Specialist.
      Analyze the commit "${commitMessage}" for potential merge conflicts against a hypothetical 'main' branch.
      
      Since this is a simulation, assume the merge is CLEAN but requires a check.
      
      Output a Markdown report:
      1.  **Status**: "✅ No Merge Conflicts Detected" (Use a Heading 3).
      2.  **Impact Analysis**: A Markdown Table showing files likely modified and the risk level (Low/Medium/High).
      3.  **Branch State**: A small ASCII tree diagram showing where this commit sits relative to main.
    `;
    return getAIResponse(prompt);
};

export const getSecurityScan = (commitMessage: string) => {
  const prompt = `
    Act as an AI Security Analyst.
    For a commit with the message "${commitMessage}", perform a security scan.

    Your report (Markdown):
    1.  **Vulnerability Table**: Create a Markdown Table with columns: ID, Severity, Description, and Status (Fixed/Open).
    2.  **Specific Findings**: Identify one hypothetical vulnerability relevant to the commit message (e.g., SQLi, XSS, or Secret Exposure).
    3.  **Remediation**: Provide a code snippet showing the insecure code vs. the secure code using "Before" and "After" comments.
  `;
  return getAIResponse(prompt);
};


export const getCodeAnalysis = (commitMessage: string) => {
  const prompt = `
    Act as an expert AI Code Reviewer (similar to CodeRabbit).
    Review the hypothetical changes for commit: "${commitMessage}".
    
    Provide the response in Markdown:
    
    ### 🐰 AI Walkthrough
    Provide a high-level summary of the changes in a bulleted list.
    
    ### 💡 Suggested Improvements
    Find a specific piece of code that could be improved (based on the commit context).
    Present it exactly in this format:
    
    **File:** \`src/relevant_file.ts\`
    
    **Suggestion:** Explain *why* this change is better (e.g., performance, readability).
    
    \`\`\`typescript
    // 🔴 Current Code
    const oldWay = () => { 
      // ... implementation
    }
    
    // 🟢 Suggested Fix
    const newWay = () => { 
      // ... optimized implementation
    }
    \`\`\`
    
    ### 📊 Stats
    A small Markdown table summarizing: Files Changed, Additions, Deletions.
  `;
  return getAIResponse(prompt);
};

export const getTestCases = (commitMessage: string) => {
  const prompt = `
    Act as an AI QA Engineer.
    For commit "${commitMessage}", generate a Test Plan.
    
    Output in Markdown:
    1.  **Test Coverage Table**: A Markdown table with columns: Component, Test Case, Type (Unit/Integration), Priority.
    2.  **Mock Data**: A JSON snippet of mock data you would use for these tests.
  `;
  return getAIResponse(prompt);
};

export const getFailureAnalysis = (commitMessage: string, errorLog: string, userContext: string) => {
  const userContextPrompt = userContext
    ? `The user has provided the following additional context to focus on: "${userContext}"`
    : '';

  const prompt = `
    Act as an AI Site Reliability Engineer (SRE).
    The commit "${commitMessage}" failed build/test.
    Error Log:
    \`\`\`
    ${errorLog}
    \`\`\`
    ${userContextPrompt}
    
    Output in Markdown:
    1.  **Root Cause Diagnosis**: A clear explanation of what broke.
    2.  **Visual Trace**: A simple ASCII diagram showing the flow where the error occurred (e.g., Request -> Service A -> DB Error).
    3.  **Fix Proposal**: A code block showing exactly how to fix the error.
  `;
  return getAIResponse(prompt);
};

export const getDeploymentStrategy = (commitMessage: string) => {
  const prompt = `
    Act as an AI DevOps Specialist.
    Recommend a deployment strategy for "${commitMessage}".
    
    Output in Markdown:
    1.  **Strategy Visual**: An ASCII representation of how traffic will shift (e.g., Blue/Green or Canary split graph).
    2.  **Rollout Plan Table**: A table with columns: Step, Traffic %, Verification Method, Estimated Time.
    3.  **Rationale**: Why this strategy fits this specific change.
  `;
  return getAIResponse(prompt);
};

export const getReleaseNotes = (commitMessage: string) => {
  const prompt = `
    Act as an AI Technical Writer.
    Generate Release Notes for "${commitMessage}".
    
    Output in Markdown:
    1.  **Changelog Table**: Columns: Type (Feat/Fix), Description, Author.
    2.  **Summary**: A paragraph suitable for a public blog post.
    3.  **Impact Assessment**: A checklist of systems affected.
  `;
  return getAIResponse(prompt);
};

export const getRollbackAnalysis = (commitMessage: string, deploymentError: string) => {
    const prompt = `
    Act as an AI SRE performing an emergency rollback.
    Deployment of "${commitMessage}" failed with:
    \`\`\`
    ${deploymentError}
    \`\`\`

    Output in Markdown:
    1.  **Timeline**: A Markdown table showing: Time, Event (Deploy Start, Error Detected, Rollback Triggered, Service Restored).
    2.  **Incident Command**: A bold instruction block for the on-call engineer on what to investigate next.
    3.  **Investigation Queries**: 2-3 specific command-line queries (kubectl, SQL, or grep) to run immediately.
  `;
  return getAIResponse(prompt);
};