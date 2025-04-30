import fs from 'fs';
import path from 'path';

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
    
    // Check if file exists in public/downloads first
    const publicPath = path.join(process.cwd(), 'public', 'downloads', file);
    
    if (fs.existsSync(publicPath)) {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="ProgramFundsubscription.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Stream the file
      const fileStream = fs.createReadStream(publicPath);
      return fileStream.pipe(res);
    }
    
    // If not in public, check temp directory
    const tmpPath = path.join('/tmp', file);
    
    if (fs.existsSync(tmpPath)) {
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="ProgramFundsubscription.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Stream the file
      const fileStream = fs.createReadStream(tmpPath);
      return fileStream.pipe(res);
    }
    
    // File not found in either location
    return res.status(404).json({ error: 'File not found' });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return res.status(500).json({ error: 'Error serving file' });
  }
} 