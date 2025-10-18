# FYNDAK Swish QR Code

## Instructions for Replacing the Placeholder QR Code

The current file `fyndak-swish-qr.svg` is a placeholder. To use the actual FYNDAK Swish QR code:

1. **Save the QR Code Image**:

   - Save the QR code image from the "Betala med Swish" design as `fyndak-swish-qr.png` or `fyndak-swish-qr.svg`
   - The image should be approximately 300x300 pixels for optimal display

2. **Replace the Placeholder**:

   - Delete the current `public/fyndak-swish-qr.svg` file
   - Place your actual QR code image in `public/` directory
   - Name it `fyndak-swish-qr.png`, `fyndak-swish-qr.svg`, or `fyndak-swish-qr.jpg`

3. **Update File Extension** (if needed):
   - If you use a different file extension, update the image source in `/src/components/Dashboard/Dashboard.tsx`
   - Change `src="/fyndak-swish-qr.svg"` to match your file extension

## QR Code Details

- **Swish Number**: 123-170 17 39
- **Purpose**: Payment processing for FYNDAK auction winners
- **Display Context**: Payment modal for winning bidders

## File Location

- **Static Image**: `/public/fyndak-swish-qr.svg` (or your image format)
- **Component Usage**: `/src/components/Dashboard/Dashboard.tsx` (line ~533)

The QR code will be displayed when users need to pay for their winning bids through the FYNDAK auction system.
