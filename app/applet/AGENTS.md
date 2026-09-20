# Custom Instructions for William Kreese Project

## GitHub .bin & Firmware Integration Workflow
When the user provides a GitHub `.bin` link (direct download URL, raw link, or release asset link):
1. **Analyze Repository**: Extract the repository owner and name (`owner/repo`) from the URL.
2. **Inspect About & README**:
   - Query or inspect the repository's description ("About") and `README.md`.
   - Identify any foreign languages (Spanish, Vietnamese, Portuguese, French, Latin, etc.).
3. **Automatic Translation**:
   - Automatically translate both the **About (description)** and **README** into natural, professional **American English**.
   - If the original text is already in English, refine and optimize it for clarity.
4. **Deploy to Website**:
   - Register the firmware into `src/EspBoards.tsx` in the `firmwares` list with:
     - `name`: Clean, recognizable firmware title
     - `repoPath`: `'owner/repo'`
     - `target`: Detected or standard ESP chip target (e.g., ESP32, ESP32-S3, ESP32-C3)
     - `size`: Estimated or extracted size
     - `date`: Release or current month/year
     - `url`: The `.bin` download link provided by the user
     - `description`: The translated American English description
   - If needed, provide the translated README in `src/RepoDetails.tsx` or translations helper so visitors see the American English version when viewing repository details.
5. **Build & Sync to GitHub Pages**:
   - Run `npm run build`.
   - Ensure `.nojekyll` exists in `dist/`.
   - Commit and push to `origin main` on `williamkreese21.github.io`.
