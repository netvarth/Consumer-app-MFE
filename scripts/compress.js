const { gzip } = require('node-gzip');
const fs = require('fs/promises');
const path = require('path');
const pathLib = require('path');

// --- Configuration ---
// !! IMPORTANT: Adjust this path to the EXACT output directory of your SHELL (HOST) project !!
// 1.  Inspect your 'dist/ROOT' folder and find where 'index.html', 'main.js', etc. are located.
// 2.  Based on the output, the files ARE located directly in dist/ROOT
const distRoot = path.resolve(__dirname, '../dist/HOME/browser');

const fileExtensionsToCompress = [
  '.js',
  '.css',
  '.html',
  '.json',
  '.svg',
  '.txt',
  '.webmanifest',
];

const compressionLevel = 9;
const minRatio = 0.99;
const deleteOriginalAssets = false;
// --- End Configuration ---

// --- Helper Functions ---
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function compressFile(filePath) {
  try {
    const originalContent = await fs.readFile(filePath);
    const originalSize = originalContent.length;

    if (originalSize === 0) {
      console.log(`Skipped (empty file): ${path.basename(filePath)}`);
      return;
    }

    const compressedContent = await gzip(originalContent, { level: compressionLevel });
    const compressedSize = compressedContent.length;
    const ratio = compressedSize / originalSize;

    if (ratio <= minRatio) {
      const gzippedPath = `${filePath}.gz`;
      await fs.writeFile(gzippedPath, compressedContent);

      console.log(
        `Compressed: ${path.relative(distRoot, filePath)} ` +
        `(${formatBytes(originalSize)} -> ${formatBytes(compressedSize)}, Ratio: ${ratio.toFixed(2)})`
      );

      if (deleteOriginalAssets) {
        await fs.unlink(filePath);
        console.log(`Deleted original: ${path.relative(distRoot, filePath)}`);
      }
    } else {
      console.log(
        `Skipped (minRatio not met): ${path.relative(distRoot, filePath)} ` +
        `(${formatBytes(originalSize)} -> ${formatBytes(compressedSize)}, Ratio: ${ratio.toFixed(2)})`
      );
    }
  } catch (error) {
    console.error(`Error compressing ${path.relative(distRoot, filePath)}:`, error);
  }
}

// --- Main Compression Logic ---
async function runCompression() {
  console.log(`\n--- Starting Post-Build Gzip Compression for SHELL APP ---`);

  // 1. Debugging the distRoot - VERY IMPORTANT
  console.log(`Initial distRoot: ${distRoot}`);
  try {
    await fs.access(distRoot);
    console.log(`distRoot is a valid directory.`);
  } catch (err) {
    console.error(`ERROR: distRoot is NOT a valid directory.  Please check your path!`);
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  }

  // 2.  READ THE CONTENTS OF distRoot
  console.log(`Contents of distRoot (${distRoot}):`);
  let filesAndDirs;
  try {
    filesAndDirs = await fs.readdir(distRoot);
    filesAndDirs.forEach(item => console.log(`  - ${item}`)); // List each item
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
    process.exit(1);
  }

  // 3.  FILTER FILES MANUALLY
  const filesToProcess = filesAndDirs
    .filter(file => {
      const ext = pathLib.extname(file).toLowerCase();
      return fileExtensionsToCompress.includes(ext);
    })
    .map(file => path.join(distRoot, file))
    .filter(file => !file.endsWith('.gz') && !file.endsWith('.br')); // Exclude .gz and .br

  // 4. Debugging: List the files to process
  console.log(`Files to process:`);
  if (filesToProcess.length > 0) {
    filesToProcess.forEach(file => console.log(file));
  } else {
    console.log(`No files found matching the criteria.`);
  }

  if (filesToProcess.length === 0) {
    console.log('No files found matching criteria.  Check paths and extensions.');
  } else {
    await Promise.all(filesToProcess.map(compressFile));
  }

  console.log(`\n--- Shell App Compression Process Complete ---`);
}

// --- Execute ---
runCompression().catch(err => {
  console.error('\nOverall compression error for shell app:', err);
  process.exit(1);
});

