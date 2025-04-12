import fs from 'fs';
import path from 'path';
import { createLog } from "../utils/createLog.js"; // Assuming createLog is your custom logger function

const projectRoot = process.cwd();
const docsDirectory = path.join(projectRoot, 'uploads', 'docs');

const getFiles = (directory) => {
    let fileStructure = [];
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (file === 'assets' && stats.isDirectory()) {
            return;
        }

        if (stats.isDirectory()) {
            const subDirectoryStructure = getFiles(filePath);
            if (subDirectoryStructure.length > 0) {
                fileStructure.push({
                    title: file,
                    path: `/docs/${file}`,
                    children: subDirectoryStructure,
                });
            }
        } else if (stats.isFile() && file.endsWith('.md')) {
            fileStructure.push({
                title: file.replace('.md', ''),
                path: `/docs/${file}`,
                children: [], // No children for individual .md files
            });
        }
    });

    return fileStructure;
};

export const getDocsStructure = async (req, res) => {
    try {
        if (!fs.existsSync(docsDirectory)) {
            await createLog(null, null, null, null, 'Documentation directory does not exist', false);
            return res.status(500).send('Directory does not exist');
        }

        const structure = getFiles(docsDirectory); // Get the whole documentation structure
        await createLog(null, null, null, null, 'Documentation structure fetched successfully', true);
        res.json({ docStructure: structure });
    } catch (error) {
        await createLog(null, null, null, null, `Failed to fetch documentation structure: ${error.message}`, false);
        res.status(500).send('Failed to fetch documentation structure');
    }
};

// Serve individual documentation files
export const getDocContent = async (req, res) => {
    const relativePath = req.params[0];  // Capture the full sub-path (e.g., chapter1/Introduction1.md)

    if (!relativePath) {
        await createLog(null, null, null, null, 'No file path provided', false);
        return res.status(400).send('No file path provided');
    }

    const filePath = path.join(docsDirectory, relativePath);  // Join with the base docs directory
    const normalizedPath = path.resolve(filePath);  // Resolve to an absolute path

    // Security check: Prevent accessing files outside the docs directory
    if (!normalizedPath.startsWith(docsDirectory)) {
        await createLog(null, null, null, null, `Access denied for file path: ${relativePath}`, false);
        return res.status(403).send('Access denied');
    }

    if (fs.existsSync(normalizedPath)) {
        const content = fs.readFileSync(normalizedPath, 'utf8');
        await createLog(null, null, null, null, `Document accessed: ${relativePath}`, true);
        res.send(content);
    } else {
        await createLog(null, null, null, null, `File not found: ${relativePath}`, false);
        res.status(404).send('File not found');
    }
};
