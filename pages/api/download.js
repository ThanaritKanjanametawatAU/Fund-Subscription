import fs from 'fs';
import path from 'path';
import os from 'os';

export default async function handler(req, res) {
  try {
    const { file } = req.query;
    
    if (!file) {
      return res.status(400).json({ error: 'File parameter is required' });
    }
    
    // Validate filename (basic security check)
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // First check the serverless-compatible location
    const tempPublicDir = path.join(os.tmpdir(), 'fund-subscription-public');
    const tempPath = path.join(tempPublicDir, file);
    
    if (fs.existsSync(tempPath)) {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="ProgramFundsubscription.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Stream the file
      const fileStream = fs.createReadStream(tempPath);
      return fileStream.pipe(res);
    }
    
    // For backwards compatibility, check if file exists in public/downloads
    const publicPath = path.join(process.cwd(), 'public', 'downloads', file);
    
    if (fs.existsSync(publicPath)) {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="ProgramFundsubscription.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Stream the file
      const fileStream = fs.createReadStream(publicPath);
      return fileStream.pipe(res);
    }
    
    // If not in public, check temp directory (for legacy compatibility)
    const tmpPath = path.join('/tmp', file);
    
    if (fs.existsSync(tmpPath)) {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="ProgramFundsubscription.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Stream the file
      const fileStream = fs.createReadStream(tmpPath);
      return fileStream.pipe(res);
    }
    
    // File not found in any location
    return res.status(404).json({ error: 'File not found' });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return res.status(500).json({ error: 'Error serving file' });
  }
} 