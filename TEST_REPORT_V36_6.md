# Test Report v36.6

## Automated
- `node --check sceneWeather.js` ✅
- `npm test` ✅ (24 / 24 passing)

## Focus of this pass
- Solar/lunar top-right celestial treatment added.
- Day/night text no longer shows scene counts.
- Night palette pivots the Act III gold accents toward silver.
- Weather overlays now render across the UI layer stack and remain active in TV mode.
- Rain rendering upgraded.
- Boston background set replaced with uploaded source imagery.

## Manual follow-up recommended
- Verify the new top-right celestial motif placement in both local preview and TV mode.
- Verify rain/snow/leaves readability over dense views like Combat and DM Control.
- Confirm the uploaded Boston photos feel right for the final rotation order.
