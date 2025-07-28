# Testing the Measure Distance Feature

## Quick Test Steps

1. **Start your development server**
   ```bash
   npm start
   # or
   yarn start
   ```

2. **Navigate to the map view**
   - Open your app in the browser
   - Go to the main map interface

3. **Access the measurement tool**
   - Look for the "Map Tools" panel on the right side of the screen
   - Click the panel to expand it if it's collapsed
   - Click on the "Measure" tab

4. **Start measuring**
   - Click the "Measure Distance" button (blue button with ruler icon)
   - You should see the cursor change to a crosshair
   - A measurement panel should appear at the bottom of the screen

5. **Place measurement points**
   - Click anywhere on the map to place your first point
   - Click again at a different location to place the second point
   - You should see:
     - Markers appear at each click location
     - A line connecting the points
     - Distance calculation displayed in the bottom panel

6. **Continue measuring**
   - Keep clicking to add more points
   - Each click extends the measurement line
   - The total distance updates in real-time

7. **Toggle units**
   - Click the "Metric"/"Imperial" button in the measurement panel
   - Distance should switch between meters/kilometers and feet/miles

8. **Clear measurements**
   - Click the "X" button in the measurement panel
   - All markers and lines should disappear
   - Cursor should return to normal
   - Measurement panel should close

## Expected Behavior

### ✅ What Should Work
- Clicking "Measure Distance" activates measurement mode
- Map cursor changes to crosshair
- Measurement panel appears
- Each map click places a marker
- Lines connect the markers
- Distance calculation is accurate and updates in real-time
- Unit toggling works (metric ↔ imperial)
- Clear function removes everything and exits measurement mode

### ❌ Common Issues and Solutions

**Issue: Nothing happens when clicking "Measure Distance"**
- Check browser console for errors
- Verify that the measurement button is calling the handler correctly

**Issue: Markers don't appear on the map**
- For Google Maps: Ensure map instance is properly loaded
- For Mapbox: Check that map style has finished loading

**Issue: Distance calculations seem wrong**
- Verify coordinates are in correct order (latitude, longitude)
- Check that the Haversine formula is being used correctly

**Issue: Can't exit measurement mode**
- Try clicking the "X" in the measurement panel
- Check that event listeners are being properly cleaned up

## Debug Information

To debug issues, check the browser console for:
- "Starting distance measurement" when clicking the button
- Map click events being registered
- Distance calculations being performed
- Any JavaScript errors

The measurement feature supports both Google Maps and Mapbox providers automatically.
