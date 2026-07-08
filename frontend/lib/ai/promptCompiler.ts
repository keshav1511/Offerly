import fs from "fs";
import path from "path";

/**
 * Dynamic Prompt Loading and Compilation Utility
 */
export class PromptCompiler {
  /**
   * Compiles a template prompt by replacing variables in the form {{key}}
   *
   * @param templateName - The filename of the template (excluding the .txt extension)
   * @param variables - Key-value map for variable substitutions
   */
  static compile(templateName: string, variables: Record<string, string>): string {
    // 1. Resolve search path order:
    //    - process.cwd()/prompts (frontend prompts directory)
    //    - process.cwd()/../prompts (root level prompts directory)
    let filePath = path.join(process.cwd(), "prompts", `${templateName}.txt`);
    
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "..", "prompts", `${templateName}.txt`);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt template not found: ${templateName}. Searched in process.cwd()/prompts and ../prompts.`);
    }

    // 2. Read file contents
    let template = fs.readFileSync(filePath, "utf-8");

    // 3. Compile variables (replace {{variable}} with value)
    for (const [key, value] of Object.entries(variables)) {
      // Replaces all occurrences of {{key}}
      template = template.split(`{{${key}}}`).join(value);
    }

    return template;
  }
}
