#!/bin/bash

# FYNDAK Deployment Script
# Replace these with your actual FTP credentials
FTP_HOST="your-ftp-host.inleed.se"
FTP_USER="your-username"
FTP_PASS="your-password"
FTP_PATH="/public_html"  # or wherever your web root is

echo "🚀 Starting FYNDAK deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Upload dist folder contents via FTP
    echo "📤 Uploading files..."
    
    # Using lftp for FTP upload (install with: brew install lftp)
    lftp -c "
    set ftp:ssl-allow no;
    open -u $FTP_USER,$FTP_PASS $FTP_HOST;
    lcd dist;
    cd $FTP_PATH;
    mirror --reverse --delete --verbose;
    "
    
    # Upload .htaccess separately
    lftp -c "
    set ftp:ssl-allow no;
    open -u $FTP_USER,$FTP_PASS $FTP_HOST;
    cd $FTP_PATH;
    put .htaccess;
    "
    
    echo "🎉 Deployment complete!"
    echo "🌐 Visit: https://fyndak.se"
else
    echo "❌ Build failed! Please fix errors before deploying."
fi